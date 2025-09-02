from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from django.urls import reverse


class Category(models.Model):
    """Product category model"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('products:category-detail', kwargs={'slug': self.slug})


class Brand(models.Model):
    """Product brand model"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    website = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    """Product model"""
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField()
    short_description = models.CharField(max_length=300, blank=True)
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_percentage = models.PositiveIntegerField(default=0, validators=[MaxValueValidator(100)])
    
    # Inventory
    sku = models.CharField(max_length=50, unique=True, blank=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)
    
    # Categorization
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='products')
    
    # Features
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    
    # Dimensions and weight
    weight = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    length = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    width = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    height = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    
    # SEO
    meta_title = models.CharField(max_length=60, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        
        # Calculate discount percentage if original price is set
        if self.original_price and self.original_price > self.price:
            self.discount_percentage = int(((self.original_price - self.price) / self.original_price) * 100)
        
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('products:product-detail', kwargs={'slug': self.slug})

    @property
    def is_in_stock(self):
        return self.stock_quantity > 0

    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.low_stock_threshold

    @property
    def average_rating(self):
        reviews = self.reviews.filter(is_approved=True)
        if reviews.exists():
            return sum(review.rating for review in reviews) / reviews.count()
        return 0

    @property
    def review_count(self):
        return self.reviews.filter(is_approved=True).count()


class ProductImage(models.Model):
    """Product image model"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.product.name} - Image {self.order}"

    def save(self, *args, **kwargs):
        if self.is_primary:
            # Set all other images for this product to non-primary
            ProductImage.objects.filter(product=self.product, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)


class ProductSpecification(models.Model):
    """Product specification model"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='specifications')
    name = models.CharField(max_length=100)
    value = models.CharField(max_length=500)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']
        unique_together = ['product', 'name']

    def __str__(self):
        return f"{self.product.name} - {self.name}: {self.value}"


class Review(models.Model):
    """Product review model"""
    RATING_CHOICES = [
        (1, '1 Star'),
        (2, '2 Stars'),
        (3, '3 Stars'),
        (4, '4 Stars'),
        (5, '5 Stars'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(choices=RATING_CHOICES)
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField()
    is_approved = models.BooleanField(default=True)  # Auto-approve for better UX
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['product', 'user']

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.email} - {self.product.name} - {self.rating} stars"
