from django.db import models
from django.conf import settings


class Wishlist(models.Model):
    """User wishlist model"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wishlist for {self.user.email}"

    @property
    def total_items(self):
        return self.items.count()

    def add_item(self, product):
        """Add product to wishlist"""
        wishlist_item, created = self.items.get_or_create(product=product)
        return wishlist_item

    def remove_item(self, product):
        """Remove product from wishlist"""
        try:
            wishlist_item = self.items.get(product=product)
            wishlist_item.delete()
            return True
        except WishlistItem.DoesNotExist:
            return False

    def clear(self):
        """Clear all items from wishlist"""
        self.items.all().delete()

    def has_item(self, product):
        """Check if product is in wishlist"""
        return self.items.filter(product=product).exists()


class WishlistItem(models.Model):
    """Wishlist item model"""
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['wishlist', 'product']
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.product.name} in {self.wishlist}"

    @property
    def is_available(self):
        return self.product.is_in_stock
