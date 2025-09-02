#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shopfluence.settings')
django.setup()

from wishlist.models import Wishlist, WishlistItem
from accounts.models import User
from products.models import Product

def test_wishlist():
    print("=== Testing Wishlist Functionality ===")
    
    # Get user and product
    user = User.objects.get(email='221501110@rajalakshmi.edu.in')
    product = Product.objects.first()
    
    print(f"User: {user.email}")
    print(f"Product: {product.name}")
    
    # Get or create wishlist
    wishlist, created = Wishlist.objects.get_or_create(user=user)
    print(f"Wishlist created: {created}")
    print(f"Wishlist ID: {wishlist.id}")
    print(f"Before adding - Items count: {wishlist.items.count()}")
    
    # Try to add item
    try:
        wishlist_item = wishlist.add_item(product)
        print(f"Item added successfully: {wishlist_item}")
        print(f"After adding - Items count: {wishlist.items.count()}")
        
        # Check if item was actually saved
        all_items = WishlistItem.objects.filter(wishlist=wishlist)
        print(f"Direct query - Items count: {all_items.count()}")
        for item in all_items:
            print(f"  - {item.product.name} (added: {item.added_at})")
            
    except Exception as e:
        print(f"Error adding item: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_wishlist()
