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
        data = request.get_json()
        token = data.get('token')
        
        # In a real app, you would verify the Firebase token
        # For now, we'll just return a mock response
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": "mock_user_id",
                "email": "demo@example.com",
                "firstName": "Demo",
                "lastName": "User",
                "company": "Demo Company",
                "phone": "+250123456789",
                "role": "client"
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/signup', methods=['POST'])
def signup():
    """Handle Firebase user role assignment"""
    try:
        data = request.get_json()
        uid = data.get('uid')
        role = data.get('role', 'client')
        
        # In a real app, you would store the user role in Firestore
        # For now, we'll just return a success response
        return jsonify({
            "message": "User role assigned successfully",
            "uid": uid,
            "role": role
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

@app.route("/applications", methods=["POST"])
def submit_application():
    try:
        # Get form data
        license_type = request.form.get("license_type")
        description = request.form.get("description")
        applicant_name = request.form.get("applicant_name")
        applicant_email = request.form.get("applicant_email")
        applicant_phone = request.form.get("applicant_phone")
        company = request.form.get("company")
        
        # Validate required fields
        if not license_type or not description:
            return jsonify({"error": "License type and description are required"}), 400
        
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
            return jsonify({"error": "At least one file is required"}), 400

        # Process file uploads
        for file_type, file in uploaded_files:
            if not allowed_file(file.filename):
                return jsonify({"error": f"Invalid file type for {file.filename}. Allowed: pdf, png, jpg, jpeg"}), 400

            # Check file size (5MB limit)
            file.seek(0, 2)  # Seek to end to get file size
            file_size = file.tell()
            file.seek(0)  # Reset file pointer
            
            if file_size > MAX_CONTENT_LENGTH:
                return jsonify({"error": f"File {file.filename} is too large. Maximum size is 5MB."}), 400

            filename = secure_filename(file.filename)
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_filename = f"{timestamp}_{filename}"
            
            # For demo purposes, simulate file storage
            # In production, you would save to actual storage like Firebase Storage, AWS S3, etc.
            storage_path = f"uploads/{unique_filename}"
            
            files_info.append({
                "type": file_type,
                "filename": unique_filename,
                "original_filename": filename,
                "url": f"http://127.0.0.1:5000/files/{unique_filename}",
                "size": file_size,
                "uploaded_at": datetime.datetime.now().isoformat()
            })

        # Create application record
        app_data = {
            "id": len(applications) + 1,
            "applicant_name": applicant_name,
            "applicant_email": applicant_email,
            "applicant_phone": applicant_phone,
            "company": company,
            "license_type": license_type,
            "description": description,
            "files": files_info,
            "status": "pending",
            "submitted_at": datetime.datetime.now().isoformat(),
            "updated_at": datetime.datetime.now().isoformat(),
            "processing_notes": [],
            "fees": {
                "application_fee": 50,  # You could calculate this based on license type
                "license_fee": 250,
                "total": 300,
                "paid": False
            }
        }
        
        applications.append(app_data)
        
        # Save client profile information for admin view
        client_profile = {
            "name": applicant_name,
            "email": applicant_email,
            "phone": applicant_phone,
            "company": company,
            "role": "client",
            "registration_date": datetime.datetime.now().isoformat(),
            "applications_count": len([app for app in applications if app.get("applicant_email") == applicant_email]),
            "last_application_date": datetime.datetime.now().isoformat(),
            "status": "active"
        }
        
        # Check if client already exists in users list
        existing_client = next((u for u in users if u.get('email') == applicant_email), None)
        if not existing_client:
            # Add new client profile
            users.append(client_profile)
            print(f"New client profile created: {applicant_name}")
        else:
            # Update existing client profile
            existing_client["applications_count"] = len([app for app in applications if app.get("applicant_email") == applicant_email])
            existing_client["last_application_date"] = datetime.datetime.now().isoformat()
            print(f"Client profile updated: {applicant_name}")
        
        # If using Firestore, you would save to database here
        # try:
        #     # Save application
        #     db.collection('applications').add(app_data)
        #     
        #     # Save or update client profile
        #     client_doc = db.collection('clients').document(applicant_email)
        #     client_doc.set(client_profile, merge=True)
        # except Exception as e:
        #     print(f"Error saving to Firestore: {e}")
        
        return jsonify({
            "message": "Application submitted successfully",
            "data": app_data,
            "application_id": application_id,
            "next_step": "payment"
        }), 201
        
    except Exception as e:
        print(f"Error in submit_application: {e}")
        return jsonify({"error": "Internal server error"}), 500

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
    app.run(debug=True, port=5000)
