from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth

app = Flask(__name__)
CORS(app)  # Allow CORS for frontend requests

# Initialize Firebase Admin SDK
cred = credentials.Certificate("firebase.json")  # Make sure this matches your actual filename
firebase_admin.initialize_app(cred)

# ──────────────────────────────────────────────
# Role-Based Middleware
# ──────────────────────────────────────────────
def require_role(allowed_roles):
    def decorator(f):
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return jsonify({"error": "Unauthorized"}), 401

            token = auth_header.split(" ")[1]
            try:
                decoded_token = auth.verify_id_token(token)
                role = decoded_token.get("role") or decoded_token.get("custom_claims", {}).get("role")
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
@app.route("/")
def home():
    return jsonify({"message": "LicenseEase backend is running."})

# ──────────────────────────────────────────────
@app.route("/signup", methods=["POST"])
def signup():
    """
    Use this to set a default role for newly registered users (Firebase creates them from frontend).
    Frontend must send { uid: "...", role: "client" }
    """
    data = request.get_json()
    uid = data.get("uid")
    role = data.get("role", "client")

    if not uid:
        return jsonify({"error": "UID is required"}), 400
    try:
        auth.set_custom_user_claims(uid, {"role": role})
        return jsonify({"message": f"User {uid} registered with role '{role}'"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ──────────────────────────────────────────────
@app.route("/signin", methods=["POST"])
def signin():
    data = request.get_json()
    token = data.get("token")
    if not token:
        return jsonify({"error": "Token is required"}), 400
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        role = decoded_token.get("role") or decoded_token.get("custom_claims", {}).get("role", "client")

        return jsonify({
            "token": token,
            "user": {
                "uid": uid,
                "role": role
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401

# ──────────────────────────────────────────────
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

# ──────────────────────────────────────────────
@app.route("/admin", methods=["GET"])
@require_role(["admin"])
def admin_dashboard():
    return jsonify({"message": "Hello Admin!"})

@app.route("/dashboard", methods=["GET"])
@require_role(["admin", "client", "officer"])
def user_dashboard():
    return jsonify({"message": "Welcome to your dashboard!"})

# ──────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True)
