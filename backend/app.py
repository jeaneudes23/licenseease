# app.py

from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, auth

app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate("firebase_credentials.json")  # update with your actual service account key filename
firebase_admin.initialize_app(cred)

# Middleware-like function to check token + role
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
        wrapper.__name__ = f.__name__  # preserve function name
        return wrapper
    return decorator

@app.route("/")
def home():
    return jsonify({"message": "LicenseEase backend is running."})

# route to set a user's role (for admin use)
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

# route restricted to admin
@app.route("/admin", methods=["GET"])
@require_role(["admin"])
def admin_dashboard():
    return jsonify({"message": "Hello Admin!"})

# route accessible by any authenticated user
@app.route("/dashboard", methods=["GET"])
@require_role(["admin", "client", "officer"])
def user_dashboard():
    return jsonify({"message": "Welcome to your dashboard!"})

if __name__ == "__main__":
    app.run(debug=True)
