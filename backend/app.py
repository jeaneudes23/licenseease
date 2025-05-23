import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app, auth as admin_auth
from dotenv import load_dotenv
from functools import wraps

from transformers import pipeline

import fitz  #
nlp = spacy.load("en_core_web_sm")
# ─── Load environment variables ─────────────────────────────────────────────
load_dotenv()
GOOGLE_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
FIREBASE_API_KEY   = os.getenv("FIREBASE_API_KEY")
if not GOOGLE_CREDENTIALS or not os.path.isfile(GOOGLE_CREDENTIALS):
    raise RuntimeError("Set GOOGLE_APPLICATION_CREDENTIALS in .env and place your service account JSON there.")
if not FIREBASE_API_KEY:
    raise RuntimeError("Set FIREBASE_API_KEY in .env (from your Web app config in Firebase console)")

# ─── Initialize Firebase Admin SDK ─────────────────────────────────────────
cred = credentials.Certificate(GOOGLE_CREDENTIALS)
initialize_app(cred)
db = firestore.client()

# ─── Flask setup ───────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

validator = pipeline(
    "text2text-generation",
    model="google/flan-t5-small",
    tokenizer="google/flan-t5-small"
)

# ─── Auth decorator to protect routes ───────────────────────────────────────
def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Missing Authorization header"}), 401
        parts = auth_header.split()
        if parts[0].lower() != "bearer" or len(parts) != 2:
            return jsonify({"error": "Invalid Authorization header format"}), 401
        id_token = parts[1]
        try:
            user = admin_auth.verify_id_token(id_token)
            request.user = user
        except Exception as e:
            return jsonify({"error": "Invalid or expired token", "details": str(e)}), 401
        return f(*args, **kwargs)
    return wrapper

# ─── Endpoint: Sign up new users ───────────────────────────────────────────
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json(force=True)
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    try:
        # Create user in Firebase Auth
        user_record = admin_auth.create_user(email=email, password=password)

        # Optionally store user profile in Firestore
        profile = data.get('profile', {})
        if profile:
            db.collection('users').document(user_record.uid).set(profile)

        # Create a custom token for client to exchange
        custom_token = admin_auth.create_custom_token(user_record.uid)
        return jsonify({
            'uid': user_record.uid,
            'customToken': custom_token.decode('utf-8')
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ─── Endpoint: Sign in existing users ───────────────────────────────────────
@app.route('/signin', methods=['POST'])
def signin():
    data = request.get_json(force=True)
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    # Use Firebase Auth REST API to sign in and retrieve idToken
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"
    payload = {
        'email': email,
        'password': password,
        'returnSecureToken': True
    }
    resp = requests.post(url, json=payload)
    if resp.ok:
        return jsonify(resp.json()), 200
    else:
        return jsonify(resp.json()), resp.status_code

# ─── Example protected route ───────────────────────────────────────────────
@app.route('/profile', methods=['GET'])
@login_required
def profile():
    uid = request.user.get('uid')
    doc = db.collection('users').document(uid).get()
    if not doc.exists:
        return jsonify({'error': 'User profile not found'}), 404
    data = doc.to_dict()
    data['uid'] = uid
    return jsonify(data), 200



# ─── Endpoint: Create a new service ────────────────────────────────────────
@app.route('/create_service', methods=['POST'])
def create_service():
    data = request.get_json(force=True)
    # Validate required fields
    required_fields = [
        'name',
        'first_time_application_fee',
        'first_time_license_fee',
        'renewal_application_fee',
        'renewal_license_fee',
        'validity',
        'processing_time',
        'application_requirements',
        'renewal_requirements'
    ]
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({
            'error': f"Missing required fields: {', '.join(missing)}"
        }), 400
    try:
        # Auto-generate a document ID
        new_ref = db.collection('services').document()
        new_ref.set(data)
        return jsonify({'id': new_ref.id}), 201
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 400
# ─── Endpoint: List all services ────────────────────────────────────────────
@app.route('/get_services', methods=['POST', 'GET'])
def get_services():
    print("Fetching services from Firestore")
    docs = db.collection('services').stream()
    services = []
    for doc in docs:
        item = doc.to_dict()
        item['id'] = doc.id
        services.append(item)
    return jsonify(services), 200


@app.route('/get_services', methods=['POST', 'GET'])
def get_services():
    print("Fetching services from Firestore")
    docs = db.collection('services').stream()
    services = []
    for doc in docs:
        item = doc.to_dict()
        item['id'] = doc.id
        services.append(item)
    return jsonify(services), 200


def extract_text_from_pdf(file_stream) -> str:
    """
    Extracts raw text from an uploaded PDF file stream.
    """
    # PyMuPDF can open from binary stream
    doc = fitz.open(stream=file_stream.read(), filetype="pdf")
    text = "".join(page.get_text() for page in doc)
    return text


# ─── Endpoint: Validate uploaded document ──────────────────────────────────
@app.route('/validate_document', methods=['POST'])

def validate_document():
    # Expect multipart/form-data with 'file' and 'document_type'
    file = request.files.get('file')
    doc_type = request.form.get('document_type')
    if not file:
        return jsonify({'error': 'No file provided'}), 400
    if not doc_type:
        return jsonify({'error': 'No document_type provided'}), 400

    try:
        text = extract_text_from_pdf(file)
        # Truncate to first 2000 chars to keep prompt size reasonable
        snippet = text[:2000]
        prompt = (
            f"Does the following text represent a {doc_type} document? Answer 'yes' or 'no'.\n\n"
            f"{snippet}"
        )
        out = validator(
            prompt,
            max_new_tokens=10,
            do_sample=False
        )
        answer = out[0]['generated_text'].strip()
        match = answer.lower().startswith('yes')
        return jsonify({'match': match, 'answer': answer}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ─── Main entrypoint ────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
