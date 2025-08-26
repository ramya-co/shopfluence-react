#!/usr/bin/env python
import os
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shopfluence.settings')
django.setup()

from accounts.models import User
from rest_framework_simplejwt.tokens import RefreshToken

def test_wishlist_api():
    # Get user and generate token
    user = User.objects.get(email='221501110@rajalakshmi.edu.in')
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    
    print(f"Testing API for user: {user.email}")
    print(f"Access token: {access_token[:50]}...")
    
    # Test the wishlist API
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get('http://localhost:8000/api/wishlist/', headers=headers)
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print(f"\nResponse Data:")
            print(json.dumps(data, indent=2))
            
            # Check the structure
            if 'items' in data:
                print(f"\nItems count: {len(data['items'])}")
                if data['items']:
                    first_item = data['items'][0]
                    print(f"First item structure:")
                    print(json.dumps(first_item, indent=2))
                    
                    if 'product' in first_item:
                        product = first_item['product']
                        print(f"\nProduct price type: {type(product.get('price'))}")
                        print(f"Product price value: {product.get('price')}")
                else:
                    print("No items in wishlist")
            else:
                print("No 'items' field in response")
                
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Raw response: {response.text}")
    else:
        print(f"Error response: {response.text}")

if __name__ == "__main__":
    test_wishlist_api()
