import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app, auth as admin_auth
from dotenv import load_dotenv
from functools import wraps
from collections import defaultdict
import datetime
from werkzeug.utils import secure_filename

# ─── Load environment variables ─────────────────────────────────────────────
load_dotenv()

# ─── Flask setup ───────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins="*")

# Try to initialize Firebase, but continue without it if it fails
try:
    GOOGLE_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if GOOGLE_CREDENTIALS and os.path.isfile(GOOGLE_CREDENTIALS):
        cred = credentials.Certificate(GOOGLE_CREDENTIALS)
        initialize_app(cred)
        db = firestore.client()
        print("Firebase initialized successfully")
    else:
        db = None
        print("Firebase credentials not found, using mock data")
except Exception as e:
    print(f"Firebase initialization failed: {e}")
    db = None

# Limits
ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}
MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Mock data storage for demo
applications = []

def get_mock_license_data():
    """Return mock license data for testing when Firestore is unavailable"""
    return [
        {
            "name": "Business Licenses",
            "licenses": [
                {
                    "id": "bl_001",
                    "name": "Import/Export License",
                    "application_requirements": [
                        "Business registration certificate",
                        "Tax clearance certificate",
                        "Bank guarantee letter",
                        "Business plan"
                    ],
                    "renewal_requirements": [
                        "Updated financial statements",
                        "Tax compliance certificate"
                    ],
                    "first_time_application_fee": 50,
                    "renewal_application_fee": 30,
                    "first_time_license_fee": 200,
                    "renewal_license_fee": 150,
                    "validity": 2,
                    "processing_time": 14
                },
                {
                    "id": "bl_002", 
                    "name": "Trading License",
                    "application_requirements": [
                        "RDB certificate",
                        "Company constitution",
                        "Proof of premises",
                        "Financial statements"
                    ],
                    "renewal_requirements": [
                        "Updated RDB certificate",
                        "Annual financial report"
                    ],
                    "first_time_application_fee": 25,
                    "renewal_application_fee": 15,
                    "first_time_license_fee": 100,
                    "renewal_license_fee": 75,
                    "validity": 1,
                    "processing_time": 7
                }
            ]
        },
        {
            "name": "Professional Licenses", 
            "licenses": [
                {
                    "id": "pl_001",
                    "name": "Engineering License",
                    "application_requirements": [
                        "Academic credentials",
                        "Professional experience certificate",
                        "Character reference letters",
                        "Professional insurance"
                    ],
                    "renewal_requirements": [
                        "Continuing education certificates",
                        "Professional development record"
                    ],
                    "first_time_application_fee": 75,
                    "renewal_application_fee": 40,
                    "first_time_license_fee": 300,
                    "renewal_license_fee": 200,
                    "validity": 3,
                    "processing_time": 21
                }
            ]
        },
        {
            "name": "Transport Licenses",
            "licenses": [
                {
                    "id": "tl_001",
                    "name": "Commercial Transport License",
                    "application_requirements": [
                        "Valid driving license",
                        "Vehicle inspection certificate",
                        "Insurance documents",
                        "Route operation plan"
                    ],
                    "renewal_requirements": [
                        "Updated vehicle inspection",
                        "Insurance renewal documents"
                    ],
                    "first_time_application_fee": 40,
                    "renewal_application_fee": 20,
                    "first_time_license_fee": 120,
                    "renewal_license_fee": 80,
                    "validity": 1,
                    "processing_time": 10
                }
            ]
        }
    ]

@app.route('/')
def home():
    return jsonify({"message": "LicenseEase backend running."})

@app.route('/get_services', methods=['GET', 'POST'])
@app.route('/services', methods=['GET'])
def get_services():
    try:
        if db:
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
                    item['application_requirements'] = app_reqs if isinstance(app_reqs, list) else []

                renew_reqs = item.get('renewal_requirements', {})
                if isinstance(renew_reqs, dict) and 'documents' in renew_reqs:
                    item['renewal_requirements'] = renew_reqs['documents']
                else:
                    item['renewal_requirements'] = renew_reqs if isinstance(renew_reqs, list) else []

                raw_items.append(item)

            # 2) Group by category field
            categories_dict = defaultdict(list)
            for svc in raw_items:
                cat_name = svc.get('category', 'Uncategorized')
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

            # 3) Transform dict into a list
            categories = []
            for name, licenses in categories_dict.items():
                categories.append({
                    "name": name,
                    "licenses": licenses
                })

            if categories:
                print(f"Returning {len(categories)} categories from Firestore")
                return jsonify(categories), 200
            else:
                print("No Firestore data found, using mock data")
                return jsonify(get_mock_license_data()), 200
        else:
            print("Using mock data (no Firestore connection)")
            return jsonify(get_mock_license_data()), 200
            
    except Exception as e:
        print(f"Error in get_services: {e}")
        print("Falling back to mock data")
        return jsonify(get_mock_license_data()), 200

@app.route("/applications", methods=["GET"])
def get_applications():
    return jsonify(applications)

@app.route("/applications", methods=["POST"])
def submit_application():
    license_type = request.form.get("license_type")
    description = request.form.get("description")
    
    # Handle multiple file uploads
    uploaded_files = []
    files_info = []
    
    # Get all files from the request
    for key in request.files:
        files = request.files.getlist(key)
        for file in files:
            if file and file.filename != "":
                uploaded_files.append((key, file))
    
    if not uploaded_files:
        return jsonify({"error": "No files uploaded"}), 400

    # For demo purposes, just store file info without actually uploading
    for file_type, file in uploaded_files:
        if not allowed_file(file.filename):
            return jsonify({"error": f"Invalid file type for {file.filename}. Allowed: pdf, png, jpg, jpeg"}), 400

        filename = secure_filename(file.filename)
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        
        files_info.append({
            "type": file_type,
            "filename": unique_filename,
            "original_filename": filename,
            "url": f"demo://storage/{unique_filename}"  # Demo URL
        })

    app_data = {
        "id": len(applications) + 1,
        "uid": "demo_user",
        "license_type": license_type,
        "description": description,
        "files": files_info,
        "status": "pending",
        "submitted_at": datetime.datetime.now().strftime("%Y-%m-%d")
    }
    applications.append(app_data)
    return jsonify({"message": "Application submitted.", "data": app_data}), 201

if __name__ == "__main__":
    print(f"Starting server with Firebase: {'Yes' if db else 'No (using mock data)'}")
    app.run(debug=True, port=5000)
