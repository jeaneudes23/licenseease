#app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth, storage
from werkzeug.utils import secure_filename
import datetime

app = Flask(__name__)
CORS(app)

cred = credentials.Certificate("firebase.json")
firebase_admin.initialize_app(cred, {
    "storageBucket": "licenseease-b9a1b.appspot.com"
})
bucket = storage.bucket()

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
