#!/usr/bin/env python3
"""
Script to populate Firestore with the three required license categories:
1. Application Service Provider
2. Network Infrastructure 
3. Network Service Provider
"""

import os
from firebase_admin import credentials, firestore, initialize_app
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    # Initialize Firebase Admin SDK
    GOOGLE_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not GOOGLE_CREDENTIALS or not os.path.isfile(GOOGLE_CREDENTIALS):
        print("Error: Set GOOGLE_APPLICATION_CREDENTIALS in .env and place your service account JSON there.")
        return
    
    try:
        cred = credentials.Certificate(GOOGLE_CREDENTIALS)
        initialize_app(cred)
        db = firestore.client()
        print("✅ Firebase initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Firebase: {e}")
        return

    # Define the three required categories with sample services
    services_data = [
        # Application Service Provider category
        {
            "name": "VoIP Service License",
            "category": "Application Service Provider",
            "first_time_application_fee": 500,
            "first_time_license_fee": 2000,
            "renewal_application_fee": 300,
            "renewal_license_fee": 1500,
            "validity": 3,
            "processing_time": 45,
            "application_requirements": [
                "Business Plan",
                "Technical Architecture Document",
                "Financial Statements",
                "Company Registration Certificate"
            ],
            "renewal_requirements": [
                "Updated Business Plan",
                "Financial Statements",
                "Compliance Report"
            ]
        },
        {
            "name": "Video Conferencing Service License",
            "category": "Application Service Provider", 
            "first_time_application_fee": 400,
            "first_time_license_fee": 1800,
            "renewal_application_fee": 250,
            "renewal_license_fee": 1300,
            "validity": 3,
            "processing_time": 40,
            "application_requirements": [
                "Business Plan",
                "Technical Specifications",
                "Security Plan",
                "Company Registration Certificate"
            ],
            "renewal_requirements": [
                "Updated Business Plan",
                "Security Audit Report",
                "Financial Statements"
            ]
        },
        
        # Network Infrastructure category
        {
            "name": "Data Center License Tier 1",
            "category": "Network Infrastructure",
            "first_time_application_fee": 1000,
            "first_time_license_fee": 5000,
            "renewal_application_fee": 600,
            "renewal_license_fee": 3500,
            "validity": 5,
            "processing_time": 60,
            "application_requirements": [
                "Business Plan",
                "Infrastructure Design Plans",
                "Environmental Impact Assessment",
                "Financial Capacity Certificate",
                "Site Ownership/Lease Documents"
            ],
            "renewal_requirements": [
                "Infrastructure Maintenance Records",
                "Financial Statements",
                "Compliance Report",
                "Updated Environmental Assessment"
            ]
        },
        {
            "name": "Data Center License Tier 2",
            "category": "Network Infrastructure",
            "first_time_application_fee": 1500,
            "first_time_license_fee": 8000,
            "renewal_application_fee": 800,
            "renewal_license_fee": 5500,
            "validity": 5,
            "processing_time": 75,
            "application_requirements": [
                "Business Plan",
                "Advanced Infrastructure Design Plans",
                "Redundancy Systems Documentation",
                "Environmental Impact Assessment",
                "Financial Capacity Certificate",
                "Site Ownership/Lease Documents"
            ],
            "renewal_requirements": [
                "Infrastructure Maintenance Records",
                "Financial Statements",
                "Compliance Report",
                "Updated Environmental Assessment",
                "Redundancy Testing Reports"
            ]
        },
        
        # Network Service Provider category
        {
            "name": "Internet Service Provider License",
            "category": "Network Service Provider",
            "first_time_application_fee": 800,
            "first_time_license_fee": 4000,
            "renewal_application_fee": 500,
            "renewal_license_fee": 2800,
            "validity": 4,
            "processing_time": 55,
            "application_requirements": [
                "Business Plan",
                "Network Topology Diagram",
                "Peering Agreements",
                "Financial Statements",
                "Technical Team Qualifications"
            ],
            "renewal_requirements": [
                "Network Performance Reports",
                "Updated Business Plan",
                "Financial Statements",
                "Customer Satisfaction Reports"
            ]
        },
        {
            "name": "International Gateway License",
            "category": "Network Service Provider",
            "first_time_application_fee": 2000,
            "first_time_license_fee": 10000,
            "renewal_application_fee": 1200,
            "renewal_license_fee": 7000,
            "validity": 5,
            "processing_time": 90,
            "application_requirements": [
                "Business Plan",
                "International Connectivity Plans",
                "Security Framework",
                "Financial Capacity Certificate",
                "Landing Rights Documentation",
                "Regulatory Compliance Plan"
            ],
            "renewal_requirements": [
                "Traffic Statistics Reports",
                "Updated Business Plan",
                "Financial Statements",
                "Security Audit Report",
                "Compliance Report"
            ]
        }
    ]

    # Add services to Firestore
    print(f"Adding {len(services_data)} services to Firestore...")
    
    for service in services_data:
        try:
            # Check if service already exists by name
            existing = db.collection('services').where('name', '==', service['name']).limit(1).get()
            if len(existing) > 0:
                print(f"⚠️  Service '{service['name']}' already exists, skipping...")
                continue
            
            # Add new service
            doc_ref = db.collection('services').document()
            doc_ref.set(service)
            print(f"✅ Added: {service['name']} ({service['category']})")
            
        except Exception as e:
            print(f"❌ Failed to add {service['name']}: {e}")

    print("\n🎉 Service population completed!")
    
    # Verify categories
    print("\nVerifying categories in database:")
    docs = db.collection('services').stream()
    categories = set()
    total_services = 0
    
    for doc in docs:
        data = doc.to_dict()
        categories.add(data.get('category', 'Unknown'))
        total_services += 1
    
    print(f"Total services: {total_services}")
    print(f"Categories found: {sorted(list(categories))}")

if __name__ == "__main__":
    main()
