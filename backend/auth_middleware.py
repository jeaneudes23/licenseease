

from flask import request, jsonify
from functools import wraps
from firebase_admin import auth

def verify_firebase_token(required_roles=[]):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Missing or invalid token'}), 401

            id_token = auth_header.split('Bearer ')[1]
            try:
                decoded_token = auth.verify_id_token(id_token)
                role = decoded_token.get('role') or decoded_token.get('custom_claims', {}).get('role')
                if required_roles and role not in required_roles:
                    return jsonify({'error': 'Unauthorized - insufficient role'}), 403

                request.user = decoded_token
                return func(*args, **kwargs)
            except Exception as e:
                return jsonify({'error': 'Token verification failed', 'details': str(e)}), 401
        return wrapper
    return decorator
