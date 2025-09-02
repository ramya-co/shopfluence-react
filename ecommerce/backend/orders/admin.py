from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem, OrderHistory


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['created_at']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_items', 'total_price', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['total_items', 'total_price']
    inlines = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'product', 'quantity', 'total_price', 'is_available']
    list_filter = ['created_at']
    search_fields = ['cart__user__email', 'product__name']
    readonly_fields = ['total_price', 'is_available']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['total_price']


class OrderHistoryInline(admin.TabularInline):
    model = OrderHistory
    extra = 0
    readonly_fields = ['created_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number', 'user', 'status', 'payment_status', 'total_amount', 
        'total_items', 'created_at'
    ]
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['order_number', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['order_number', 'total_items', 'created_at', 'updated_at']
    inlines = [OrderItemInline, OrderHistoryInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'status', 'payment_status')
        }),
        ('Addresses', {
            'fields': ('billing_address', 'shipping_address')
        }),
        ('Pricing', {
            'fields': ('subtotal', 'tax_amount', 'shipping_amount', 'discount_amount', 'total_amount')
        }),
        ('Payment', {
            'fields': ('payment_method', 'transaction_id')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'paid_at', 'shipped_at', 'delivered_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_confirmed', 'mark_as_processing', 'mark_as_shipped', 'mark_as_delivered']
    
    def mark_as_confirmed(self, request, queryset):
        updated = queryset.update(status='confirmed')
        self.message_user(request, f'{updated} orders have been marked as confirmed.')
    mark_as_confirmed.short_description = "Mark selected orders as confirmed"
    
    def mark_as_processing(self, request, queryset):
        updated = queryset.update(status='processing')
        self.message_user(request, f'{updated} orders have been marked as processing.')
    mark_as_processing.short_description = "Mark selected orders as processing"
    
    def mark_as_shipped(self, request, queryset):
        updated = queryset.update(status='shipped')
        self.message_user(request, f'{updated} orders have been marked as shipped.')
    mark_as_shipped.short_description = "Mark selected orders as shipped"
    
    def mark_as_delivered(self, request, queryset):
        updated = queryset.update(status='delivered')
        self.message_user(request, f'{updated} orders have been marked as delivered.')
    mark_as_delivered.short_description = "Mark selected orders as delivered"


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'quantity', 'unit_price', 'total_price']
    # Remove 'created_at' from list_filter since OrderItem doesn't have this field
    list_filter = []  # or remove this line entirely
    search_fields = ['order__order_number', 'product__name', 'product_name']
    readonly_fields = ['total_price']


@admin.register(OrderHistory)
class OrderHistoryAdmin(admin.ModelAdmin):
    list_display = ['order', 'status', 'message', 'created_at', 'created_by']
    list_filter = ['status', 'created_at']
    search_fields = ['order__order_number', 'message']
    readonly_fields = ['created_at']
