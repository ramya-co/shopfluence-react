from django.contrib import admin
from .models import Category, Brand, Product, ProductImage, ProductSpecification, Review


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductSpecificationInline(admin.TabularInline):
    model = ProductSpecification
    extra = 1


class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0
    readonly_fields = ['user', 'created_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'parent', 'created_at']
    list_filter = ['is_active', 'parent', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'category', 'brand', 'price', 'stock_quantity', 
        'is_active', 'is_featured', 'is_new_arrival', 'is_bestseller'
    ]
    list_filter = [
        'is_active', 'is_featured', 'is_new_arrival', 'is_bestseller',
        'category', 'brand', 'created_at'
    ]
    search_fields = ['name', 'description', 'sku', 'brand__name', 'category__name']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['-created_at']
    inlines = [ProductImageInline, ProductSpecificationInline, ReviewInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'short_description', 'category', 'brand')
        }),
        ('Pricing', {
            'fields': ('price', 'original_price', 'discount_percentage')
        }),
        ('Inventory', {
            'fields': ('sku', 'stock_quantity', 'low_stock_threshold')
        }),
        ('Features', {
            'fields': ('is_active', 'is_featured', 'is_new_arrival', 'is_bestseller')
        }),
        ('Dimensions', {
            'fields': ('weight', 'length', 'width', 'height'),
            'classes': ('collapse',)
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'image', 'is_primary', 'order', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['product__name']
    ordering = ['product', 'order']


@admin.register(ProductSpecification)
class ProductSpecificationAdmin(admin.ModelAdmin):
    list_display = ['product', 'name', 'value', 'order']
    list_filter = ['order']
    search_fields = ['product__name', 'name', 'value']
    ordering = ['product', 'order']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'is_approved', 'created_at']
    list_filter = ['rating', 'is_approved', 'created_at']
    search_fields = ['product__name', 'user__email', 'title', 'comment']
    ordering = ['-created_at']
    readonly_fields = ['user', 'product', 'created_at']
    
    actions = ['approve_reviews', 'disapprove_reviews']
    
    def approve_reviews(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} reviews have been approved.')
    approve_reviews.short_description = "Approve selected reviews"
    
    def disapprove_reviews(self, request, queryset):
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'{updated} reviews have been disapproved.')
    disapprove_reviews.short_description = "Disapprove selected reviews"
