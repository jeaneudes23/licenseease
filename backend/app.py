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
import hashlib
import uuid
import stripe
import random
import string

# ─── Load environment variables ─────────────────────────────────────────────
load_dotenv()

# ─── Flask setup ───────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins="*")

# ─── Stripe setup ──────────────────────────────────────────────────────────
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_51234567890")  # Use test key by default

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

def generate_app_id():
    """Generate a short random application ID (7 characters max)"""
    # Mix of uppercase letters and numbers for better readability
    chars = string.ascii_uppercase + string.digits
    # Generate 6 random characters
    random_part = ''.join(random.choices(chars, k=6))
    return f"A{random_part}"  # A prefix + 6 random chars = 7 total

# Mock data storage for demo
applications = []
users = [
    # Sample client profile for demo
    {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+250123456789",
        "company": "Tech Solutions Ltd",
        "role": "client",
        "registration_date": "2024-01-15T10:30:00",
        "applications_count": 2,
        "last_application_date": "2024-01-20T14:45:00",
        "status": "active"
    }
]  # Mock user storage

# Companies storage
companies = [
    {
        "id": "1",
        "companyName": "Tech Solutions Ltd",
        "nationality": "rwandan",
        "legalType": "limited_company",
        "identificationNumber": "REG123456",
        "address": "Kigali, Rwanda",
        "telephone": "+250123456789",
        "email": "info@techsolutions.rw",
        "creationDate": "2023-01-15",
        "representatives": [
            {
                "id": "1",
                "fullName": "John Doe",
                "idPassport": "ID123456789",
                "telephone": "+250123456789",
                "email": "john.doe@techsolutions.rw",
                "communicationLanguage": "English",
                "role": "CEO"
            }
        ],
        "registeredAt": "2024-01-15T10:30:00",
        "status": "active"
    }
]

def get_mock_license_data():
    """Return mock license data for testing when Firestore is unavailable"""
    return [
        {
            "name": "IT Service Licenses",
            "licenses": [
                {
                    "id": "asp_001",
                    "name": "Application Service Provider",
                    "description": "Provide software applications and services to customers over the internet, including SaaS, web applications, and cloud-based solutions.",
                    "application_requirements": [
                        "Valid business registration certificate",
                        "Technical infrastructure documentation",
                        "Data protection and privacy compliance certificate",
                        "Service level agreement (SLA) templates",
                        "Business continuity and disaster recovery plan",
                        "Professional liability insurance certificate",
                        "Technical team qualifications and certifications"
                    ],
                    "renewal_requirements": [
                        "Updated infrastructure documentation",
                        "Renewed data protection compliance certificate",
                        "Updated SLA templates",
                        "Current disaster recovery plan"
                    ],
                    "first_time_application_fee": 50,
                    "renewal_application_fee": 30,
                    "first_time_license_fee": 250,
                    "renewal_license_fee": 200,
                    "validity": 2,
                    "processing_time": 21
                },
                {
                    "id": "ni_001", 
                    "name": "Network Infrastructure",
                    "description": "Deploy, maintain, and operate network infrastructure including fiber optic cables, wireless towers, data centers, and telecommunications equipment.",
                    "application_requirements": [
                        "Environmental impact assessment report",
                        "Technical specifications and equipment documentation",
                        "Safety and health compliance certificates",
                        "Site acquisition agreements and permits",
                        "Engineering plans and network topology diagrams",
                        "Equipment supplier certifications",
                        "Installation and maintenance team qualifications"
                    ],
                    "renewal_requirements": [
                        "Updated environmental impact assessment",
                        "Current safety compliance certificates",
                        "Updated equipment documentation",
                        "Maintenance records and reports"
                    ],
                    "first_time_application_fee": 75,
                    "renewal_application_fee": 50,
                    "first_time_license_fee": 400,
                    "renewal_license_fee": 300,
                    "validity": 3,
                    "processing_time": 30
                },
                {
                    "id": "nsp_001",
                    "name": "Network Service Provider",
                    "description": "Provide internet connectivity, telecommunications services, and network access to end users including ISP services, mobile networks, and enterprise connectivity.",
                    "application_requirements": [
                        "Spectrum allocation request and documentation",
                        "Network coverage plans and service area maps",
                        "Quality of service (QoS) guarantees and metrics",
                        "Interconnection agreements with other providers",
                        "Customer service and support procedures",
                        "Billing and payment processing systems documentation",
                        "Network security and monitoring capabilities"
                    ],
                    "renewal_requirements": [
                        "Updated spectrum allocation documentation",
                        "Current network coverage and expansion plans",
                        "QoS performance reports",
                        "Updated interconnection agreements"
                    ],
                    "first_time_application_fee": 100,
                    "renewal_application_fee": 75,
                    "first_time_license_fee": 500,
                    "renewal_license_fee": 400,
                    "validity": 5,
                    "processing_time": 45
                }
            ]
        }
    ]

@app.route('/')
def home():
    return jsonify({"message": "LicenseEase backend running."})

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Extract user data
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        company = data.get('company')
        phone = data.get('phone')
        
        # Validate required fields
        if not all([email, password, first_name, last_name]):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Check if user already exists
        if any(user['email'] == email for user in users):
            return jsonify({"error": "User already exists"}), 409
        
        # Create user
        user_id = str(uuid.uuid4())
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        new_user = {
            "id": user_id,
            "email": email,
            "password": hashed_password,
            "firstName": first_name,
            "lastName": last_name,
            "company": company,
            "phone": phone,
            "role": "client",
            "createdAt": datetime.datetime.now().isoformat()
        }
        
        users.append(new_user)
        
        # Return user data without password
        user_response = {k: v for k, v in new_user.items() if k != 'password'}
        
        return jsonify({
            "message": "User registered successfully",
            "user": user_response,
            "token": f"mock_token_{user_id}"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        # Find user
        user = next((u for u in users if u['email'] == email), None)
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Verify password
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        if user['password'] != hashed_password:
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Return user data without password
        user_response = {k: v for k, v in user.items() if k != 'password'}
        
        return jsonify({
            "message": "Login successful",
            "user": user_response,
            "token": f"mock_token_{user['id']}"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/signin', methods=['POST'])
def signin():
    """Handle Firebase token-based signin"""
    try:
        print("=== SIGNIN REQUEST ===")
        data = request.get_json()
        token = data.get('token')
        
        print(f"Received token for signin: {token[:50] if token else 'None'}...")
        
        if not token:
            return jsonify({"error": "Token is required"}), 400
        
        # In a real app, you would verify the Firebase token here
        # For demo purposes, return a successful response
        user_data = {
            "id": "demo_user_" + str(hash(token))[-6:],
            "email": "demo@example.com",
            "firstName": "Demo",
            "lastName": "User",
            "company": "Demo Company",
            "phone": "+250123456789",
            "role": "client"
        }
        
        print(f"Signin successful for user: {user_data['email']}")
        
        return jsonify({
            "message": "Login successful",
            "user": user_data
        }), 200
        
    except Exception as e:
        print(f"Signin error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/signup', methods=['POST'])
def signup():
    """Handle Firebase user role assignment"""
    try:
        print("=== SIGNUP REQUEST ===")
        data = request.get_json()
        uid = data.get('uid')
        role = data.get('role', 'client')
        
        print(f"User signup: UID={uid}, Role={role}")
        
        if not uid:
            return jsonify({"error": "UID is required"}), 400
        
        # In a real app, you would store the user role in Firestore
        # For demo purposes, just return success
        print(f"Signup successful for UID: {uid}")
        
        return jsonify({
            "message": "User role assigned successfully",
            "uid": uid,
            "role": role
        }), 200
        
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/change-password', methods=['POST'])
def change_password():
    """Handle password change requests"""
    try:
        data = request.get_json()
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        
        # In a real app, you would:
        # 1. Verify the current password
        # 2. Update the password in Firebase Auth
        # 3. Return success/error response
        
        # For demo purposes, just return success
        return jsonify({
            "message": "Password changed successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/profile', methods=['GET'])
def get_profile():
    # Mock endpoint for getting user profile
    # In a real app, you'd verify the token
    return jsonify({
        "id": "mock_user_id",
        "email": "demo@example.com",
        "firstName": "Demo",
        "lastName": "User",
        "company": "Demo Company",
        "phone": "+250123456789",
        "role": "client"
    }), 200

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
    # In a real app, you would filter by user ID from token
    # For demo, return all applications
    return jsonify(applications)

@app.route("/applications/<int:app_id>", methods=["GET"])
def get_application(app_id):
    """Get a specific application by ID"""
    try:
        app = next((a for a in applications if a["id"] == app_id), None)
        if not app:
            return jsonify({"error": "Application not found"}), 404
        return jsonify(app), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/clients", methods=["GET"])
def get_clients():
    """Get all client profiles for admin dashboard"""
    try:
        # Filter users to only include clients
        clients = [user for user in users if user.get("role") == "client"]
        
        # Add additional statistics for each client
        for client in clients:
            client_email = client.get("email")
            client_applications = [app for app in applications if app.get("applicant_email") == client_email]
            
            client["applications_count"] = len(client_applications)
            client["pending_applications"] = len([app for app in client_applications if app.get("status") == "pending"])
            client["approved_applications"] = len([app for app in client_applications if app.get("status") == "approved"])
            client["rejected_applications"] = len([app for app in client_applications if app.get("status") == "rejected"])
            
            # Get latest application date
            if client_applications:
                latest_app = max(client_applications, key=lambda x: x.get("submitted_at", ""))
                client["last_application_date"] = latest_app.get("submitted_at")
                client["last_application_type"] = latest_app.get("license_type")
            else:
                client["last_application_date"] = None
                client["last_application_type"] = None
        
        return jsonify(clients), 200
    except Exception as e:
        print(f"Error fetching clients: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/clients/<client_email>", methods=["GET"])
def get_client_profile(client_email):
    """Get a specific client profile by email"""
    try:
        client = next((u for u in users if u.get("email") == client_email and u.get("role") == "client"), None)
        if not client:
            return jsonify({"error": "Client not found"}), 404
        
        # Add client's applications
        client_applications = [app for app in applications if app.get("applicant_email") == client_email]
        client["applications"] = client_applications
        
        return jsonify(client), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "ok", "message": "Server is running"}), 200

@app.route("/test-submit", methods=["POST"])
def test_submit():
    """Test endpoint to debug submission issues"""
    try:
        print("=== TEST SUBMIT REQUEST ===")
        print(f"Content-Type: {request.content_type}")
        print(f"Headers: {dict(request.headers)}")
        print(f"Form keys: {list(request.form.keys())}")
        print(f"Files keys: {list(request.files.keys())}")
        
        # Log form data
        for key in request.form.keys():
            print(f"Form field {key}: {request.form.get(key)}")
        
        return jsonify({
            "message": "Test endpoint working",
            "form_keys": list(request.form.keys()),
            "files_keys": list(request.files.keys()),
            "content_type": request.content_type
        }), 200
        
    except Exception as e:
        print(f"ERROR in test_submit: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": f"Test error: {str(e)}"}), 500

@app.route("/applications-minimal", methods=["POST"])
def submit_application_minimal():
    """Minimal version to test basic functionality"""
    try:
        print("=== MINIMAL SUBMIT APPLICATION ===")
        
        # Get basic form data
        license_type = request.form.get("license_type")
        description = request.form.get("description")
        applicant_name = request.form.get("applicant_name")
        applicant_email = request.form.get("applicant_email")
        
        print(f"Received: {license_type}, {description}, {applicant_name}, {applicant_email}")
        
        # Basic validation
        if not license_type or not description or not applicant_name or not applicant_email:
            return jsonify({"error": "Missing required fields"}), 400
        
        # Check for files
        if not request.files:
            return jsonify({"error": "At least one file required"}), 400
        
        # Create simple response
        app_id = len(applications) + 1
        return jsonify({
            "message": "Application submitted successfully",
            "application_id": app_id,
            "next_step": "payment"
        }), 201
        
    except Exception as e:
        print(f"MINIMAL ENDPOINT ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Minimal endpoint error: {str(e)}"}), 500

@app.route("/applications", methods=["POST"])
def submit_application():
    print("=== SUBMIT APPLICATION ===")
    print(f"Content-Type: {request.content_type}")
    print(f"Method: {request.method}")
    
    try:
        # Get basic form data
        license_type = request.form.get("license_type")
        description = request.form.get("description")
        applicant_name = request.form.get("applicant_name")
        applicant_email = request.form.get("applicant_email")
        applicant_phone = request.form.get("applicant_phone")
        company = request.form.get("company")
        
        print(f"License Type: {license_type}")
        print(f"Description: {description}")
        print(f"Applicant: {applicant_name} ({applicant_email})")
        
        # Basic validation
        if not license_type or not description or not applicant_name or not applicant_email:
            return jsonify({"error": "Missing required fields"}), 400
        
        # Check files
        files_count = len(request.files)
        print(f"Files uploaded: {files_count}")
        
        if files_count == 0:
            return jsonify({"error": "At least one file required"}), 400
        
        # Generate unique random application ID
        app_id = generate_app_id()
        
        # Ensure ID is unique
        while any(app.get("id") == app_id for app in applications):
            app_id = generate_app_id()
        
        # Process files info for storage
        files_info = []
        for key in request.files:
            files = request.files.getlist(key)
            for file in files:
                if file and file.filename != "":
                    files_info.append({
                        "type": key,
                        "filename": file.filename,
                        "original_filename": file.filename,
                        "url": f"http://127.0.0.1:5002/files/{file.filename}",
                        "size": 0,
                        "uploaded_at": datetime.datetime.now().isoformat()
                    })
        
        # Create application data
        app_data = {
            "id": app_id,
            "applicant_name": applicant_name,
            "applicant_email": applicant_email,
            "applicant_phone": applicant_phone or "",
            "company": company or "",
            "license_type": license_type,
            "description": description,
            "files": files_info,
            "status": "pending",
            "submitted_at": datetime.datetime.now().isoformat(),
            "updated_at": datetime.datetime.now().isoformat(),
            "processing_notes": [],
            "fees": {
                "application_fee": 50,
                "license_fee": 250,
                "total": 300,
                "paid": False
            }
        }
        
        # Store in memory
        applications.append(app_data)
        print(f"Application {app_id} created successfully")
        
        # Save to Firestore if available
        if db:
            try:
                db.collection('applications').document(app_id).set(app_data)
                print(f"Application {app_id} saved to Firestore")
                
                # Save client profile
                client_profile = {
                    "name": applicant_name,
                    "email": applicant_email,
                    "phone": applicant_phone or "",
                    "company": company or "",
                    "role": "client",
                    "registration_date": datetime.datetime.now().isoformat(),
                    "last_application_date": datetime.datetime.now().isoformat(),
                    "status": "active"
                }
                db.collection('clients').document(applicant_email).set(client_profile, merge=True)
                print(f"Client profile saved for {applicant_email}")
                
            except Exception as firestore_error:
                print(f"Warning: Firestore save failed: {firestore_error}")
        else:
            print("Using mock data storage (Firestore not available)")
        
        return jsonify({
            "message": "Application submitted successfully",
            "application_id": app_id,
            "next_step": "payment"
        }), 201
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500

# ─── Company Management Endpoints ──────────────────────────────────────────

@app.route("/companies", methods=["GET"])
def get_companies():
    """Get all companies for admin dashboard"""
    try:
        if db:
            # Try to get from Firestore
            companies_ref = db.collection('companies')
            companies_docs = companies_ref.stream()
            
            firestore_companies = []
            for doc in companies_docs:
                company_data = doc.to_dict()
                company_data['id'] = doc.id
                firestore_companies.append(company_data)
            
            if firestore_companies:
                return jsonify(firestore_companies), 200
        
        # Fallback to mock data
        return jsonify(companies), 200
        
    except Exception as e:
        print(f"Error fetching companies: {e}")
        # Return mock data as fallback
        return jsonify(companies), 200

@app.route("/companies", methods=["POST"])
def save_company():
    """Save or update company information from client dashboard"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        company_info = data.get('companyInfo', {})
        representatives = data.get('representatives', [])
        user_email = data.get('userEmail', '')
        
        print(f"Saving company data for user: {user_email}")
        print(f"Company: {company_info.get('companyName', 'Unknown')}")
        print(f"Representatives: {len(representatives)}")
        
        # Generate company ID
        company_id = generate_app_id()
        while any(comp.get("id") == company_id for comp in companies):
            company_id = generate_app_id()
        
        # Create company record
        company_data = {
            "id": company_id,
            **company_info,
            "representatives": representatives,
            "registeredAt": datetime.datetime.now().isoformat(),
            "status": "active",
            "submittedBy": user_email
        }
        
        # Check if company already exists for this user
        existing_company_index = None
        for i, comp in enumerate(companies):
            if comp.get('submittedBy') == user_email:
                existing_company_index = i
                break
        
        if existing_company_index is not None:
            # Update existing company
            companies[existing_company_index] = company_data
            print(f"Updated existing company for {user_email}")
        else:
            # Add new company
            companies.append(company_data)
            print(f"Added new company for {user_email}")
        
        # Save to Firestore if available
        if db:
            try:
                db.collection('companies').document(company_id).set(company_data)
                print(f"Company {company_id} saved to Firestore")
            except Exception as firestore_error:
                print(f"Warning: Firestore save failed: {firestore_error}")
        
        return jsonify({
            "message": "Company information saved successfully",
            "company_id": company_id
        }), 201
        
    except Exception as e:
        print(f"Error saving company: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500

# ─── Stripe Payment Endpoints ──────────────────────────────────────────────

@app.route("/create-payment-intent", methods=["POST"])
def create_payment_intent():
    """Create a Stripe Payment Intent for card payments"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['amount', 'currency', 'applicationId', 'userId']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Create payment intent with Stripe
        intent = stripe.PaymentIntent.create(
            amount=data['amount'],  # Amount in cents
            currency=data['currency'],
            automatic_payment_methods={
                'enabled': True,
            },
            metadata={
                'application_id': data['applicationId'],
                'user_id': data['userId'],
                'license_type': data.get('licenseType', ''),
            }
        )
        
        return jsonify({
            'clientSecret': intent.client_secret,
            'paymentIntentId': intent.id
        })
        
    except stripe.error.StripeError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error creating payment intent: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/process-mobile-payment", methods=["POST"])
def process_mobile_payment():
    """Process mobile money payment (MTN, Airtel)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['amount', 'phoneNumber', 'applicationId', 'userId', 'email']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        phone_number = data['phoneNumber']
        amount = data['amount']
        application_id = data['applicationId']
        currency = data.get('currency', 'USD')
        
        # Convert to RWF if needed (mobile money typically uses local currency)
        if currency != 'RWF':
            # Exchange rate: 1 USD = 1320 RWF
            amount_rwf = amount * 1320
        else:
            amount_rwf = amount
        
        # Simulate mobile money payment request
        # In a real implementation, you would integrate with MTN Mobile Money API or Airtel Money API
        payment_data = {
            "payment_id": f"mobile_{application_id}_{datetime.datetime.now().timestamp()}",
            "amount": amount_rwf,
            "currency": "RWF",
            "phone_number": phone_number,
            "application_id": application_id,
            "user_id": data['userId'],
            "status": "pending",
            "created_at": datetime.datetime.now().isoformat(),
            "payment_method": "mobile_money"
        }
        
        # Store payment record (in production, save to database)
        # Here we'll just simulate success
        print(f"Mobile payment initiated: {payment_data}")
        
        # Simulate sending SMS/USSD request to user's phone
        return jsonify({
            "message": "Payment request sent to your phone",
            "payment_id": payment_data["payment_id"],
            "amount": amount_rwf,
            "currency": "RWF",
            "status": "pending"
        }), 200
        
    except Exception as e:
        print(f"Error processing mobile payment: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/payment-webhook", methods=["POST"])
def payment_webhook():
    """Webhook to handle payment status updates from Stripe"""
    try:
        payload = request.get_data()
        sig_header = request.headers.get('stripe-signature')
        
        # Verify webhook signature (use your webhook secret)
        webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_test")
        
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except ValueError:
            return jsonify({"error": "Invalid payload"}), 400
        except stripe.error.SignatureVerificationError:
            return jsonify({"error": "Invalid signature"}), 400
        
        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            application_id = payment_intent['metadata'].get('application_id')
            
            # Update application status to "paid"
            app = next((a for a in applications if a.get('id') == application_id), None)
            if app:
                app['payment_status'] = 'paid'
                app['payment_date'] = datetime.datetime.now().isoformat()
                app['status'] = 'under_review'  # Move to next stage after payment
                print(f"Payment successful for application {application_id}")
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        print(f"Error in payment webhook: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    print(f"Starting server with Firebase: {'Yes' if db else 'No (using mock data)'}")
    print("Server starting on http://127.0.0.1:5002 (port 5000 has conflicts)")
    app.run(debug=True, port=5002, host='127.0.0.1')
