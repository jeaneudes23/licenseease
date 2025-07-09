#app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth, storage
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import os
import datetime

# Load env vars from ../.env.local
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

# Construct Firebase credentials from env
firebase_creds = {
    "type": os.getenv("FIREBASE_TYPE"),
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL"),
}

cred = credentials.Certificate(firebase_creds)
firebase_admin.initialize_app(cred, {
    "storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET")
})
bucket = storage.bucket()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Limits
ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}
MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

applications = []  # Temporary storage

# ──────────────────────────────────────────────
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def require_role(allowed_roles):
    def decorator(f):
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return jsonify({"error": "Unauthorized"}), 401
            token = auth_header.split(" ")[1]
            try:
                decoded_token = auth.verify_id_token(token)
                role = decoded_token.get("custom_claims", {}).get("role", "client")
                if role not in allowed_roles:
                    return jsonify({"error": f"Forbidden for role '{role}'"}), 403
                request.user = decoded_token
                return f(*args, **kwargs)
            except Exception as e:
                return jsonify({"error": str(e)}), 401
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator

# ──────────────────────────────────────────────
@app.route("/applications", methods=["POST"])
@require_role(["client"])
def submit_application():
    uid = request.user.get("uid")
    license_type = request.form.get("license_type")
    description = request.form.get("description")
    file = request.files.get("file")

    if not file or file.filename == "":
        return jsonify({"error": "No file uploaded"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Allowed: pdf, png, jpg, jpeg"}), 400

    filename = secure_filename(file.filename)
    blob = bucket.blob(f"applications/{uid}/{filename}")
    blob.upload_from_file(file.stream, content_type=file.content_type)
    blob.make_public()

    app_data = {
        "id": len(applications) + 1,
        "uid": uid,
        "license_type": license_type,
        "description": description,
        "file": filename,
        "file_url": blob.public_url,
        "status": "pending",
        "submitted_at": datetime.datetime.now().strftime("%Y-%m-%d")
    }
    applications.append(app_data)
    return jsonify({"message": "Application submitted.", "data": app_data}), 201

# ──────────────────────────────────────────────
@app.route("/applications", methods=["GET"])
@require_role(["client"])
def get_applications():
    uid = request.user.get("uid")
    user_apps = [a for a in applications if a["uid"] == uid]
    return jsonify(user_apps)

@app.route("/set-role", methods=["POST"])
def set_role():
    data = request.get_json()
    uid = data.get("uid")
    role = data.get("role")
    if not uid or not role:
        return jsonify({"error": "UID and role are required"}), 400
    try:
        auth.set_custom_user_claims(uid, {"role": role})
        return jsonify({"message": f"Role '{role}' set for user {uid}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/signin", methods=["POST"])
def signin():
    data = request.get_json()
    token = data.get("token")
    if not token:
        return jsonify({"error": "Token is required"}), 400
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        role = decoded_token.get("custom_claims", {}).get("role", "client")
        return jsonify({"token": token, "user": {"uid": uid, "role": role}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "LicenseEase backend running."})

# ──────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True)
import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app, auth as admin_auth
from dotenv import load_dotenv
from functools import wraps
from collections import defaultdict

from transformers import pipeline

import fitz  #

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
CORS(app, origins="*")

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
@app.route('/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        # Handle preflight request for CORS
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json(force=False)
    print(data)
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    try:
        # Create user in Firebase Auth
        user_record = admin_auth.create_user(email=email, password=password)
        print(f"Created user: {user_record.uid}")
        # Optionally store user profile in Firestore
        profile = data.get('profile', {'name': data['name'], 'role':"user", 'email': email, 'uid': user_record.uid})
        if profile:
            db.collection('users').document(user_record.uid).set(profile)

        # Create a custom token for client to exchange
        custom_token = admin_auth.create_custom_token(user_record.uid)
        return jsonify({
            'uid': user_record.uid,
            'customToken': custom_token.decode('utf-8')
        }), 201
    except Exception as e:
        print(f"Error creating user: {e}")
        return jsonify({'error': str(e)}), 400

# ─── Endpoint: Sign in existing users ───────────────────────────────────────
@app.route('/signin', methods=['POST'])
def signin():
    if request.method == 'OPTIONS':
        # Handle preflight request for CORS
        return jsonify({'message': 'CORS preflight response'}), 200
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
        data = resp.json()
        # print(data)
        data['authToken'] = data.get('idToken', None)
        profile = db.collection('users').document(data['localId']).get()
        if profile.exists:
            data['profile'] = profile.to_dict()
        else:
            data['profile'] = {'uid': data['localId'], 'email': email, 'role': 'user', 'name': email.split('@')[0]}
        print(data)
        return jsonify(data), 200
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
@app.route('/services', methods=['GET'])
def get_services():
    print("Fetching services from Firestore")
    docs = db.collection('services').stream()

    # 1) Read all docs and flatten requirements
    raw_items = []
    for doc in docs:
        item = doc.to_dict()
        item['id'] = doc.id

        # Flatten nested { "documents": [...] } into a plain list
        app_reqs = item.get('application_requirements', {})
        if isinstance(app_reqs, dict) and 'documents' in app_reqs:
            item['application_requirements'] = app_reqs['documents']
        else:
            # If the Firestore structure is already a list or missing, fall back gracefully
            item['application_requirements'] = app_reqs if isinstance(app_reqs, list) else []

        renew_reqs = item.get('renewal_requirements', {})
        if isinstance(renew_reqs, dict) and 'documents' in renew_reqs:
            item['renewal_requirements'] = renew_reqs['documents']
        else:
            item['renewal_requirements'] = renew_reqs if isinstance(renew_reqs, list) else []

        # Ensure numeric fields stay numeric; you can convert to strings here if you prefer
        # item['validity'] = str(item.get('validity', ''))
        # item['first_time_license_fee'] = f"{item.get('first_time_license_fee', '')} USD"
        # …etc., if you need string formatting

        raw_items.append(item)

    print("Raw items:", raw_items)

    # 2) Group by category field (each document must have a 'category' key)
    categories_dict: dict[str, list[dict]] = defaultdict(list)
    for svc in raw_items:
        cat_name = svc.get('category', 'Uncategorized')
        # Build the license‐object exactly as the frontend expects
        license_obj = {
            "id": svc["id"],
            "name": svc.get("name", ""),
            "application_requirements": svc.get("application_requirements", []),
            "renewal_requirements": svc.get("renewal_requirements", []),
            "first_time_application_fee": svc.get("first_time_application_fee", 0),
            "renewal_application_fee": svc.get("renewal_application_fee", 0),
            "first_time_license_fee": svc.get("first_time_license_fee", 0),
            "renewal_license_fee": svc.get("renewal_license_fee", 0),
            "validity": svc.get("validity", 0),
            "processing_time": svc.get("processing_time", 0),
        }
        categories_dict[cat_name].append(license_obj)

    # 3) Transform dict into a list of { name, licenses }
    categories = []
    for name, licenses in categories_dict.items():
        categories.append({
            "name": name,
            "licenses": licenses
        })

    print("Grouped categories:", categories)
    return jsonify(categories), 200


@app.route('/get_applications', methods=['POST', 'GET'])
def get_applications():
    print("Fetching Applications from Firestore")
    docs = db.collection('applications').stream()
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