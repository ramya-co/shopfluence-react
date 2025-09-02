# Shopfluence Django Backend

A robust Django backend for the Shopfluence ecommerce platform, providing RESTful APIs for user management, product catalog, shopping cart, wishlist, and order processing.

## 🏗️ Project Structure

```
backend/
├── shopfluence/           # Django project settings
│   ├── settings.py       # Main Django settings
│   ├── urls.py          # Main URL configuration
│   ├── wsgi.py          # WSGI configuration
│   └── asgi.py          # ASGI configuration
├── accounts/             # User authentication app
│   ├── models.py        # Custom User and Address models
│   ├── serializers.py   # API serializers
│   ├── views.py         # API views
│   └── urls.py          # URL patterns
├── products/             # Product management app
│   ├── models.py        # Product, Category, Brand models
│   ├── serializers.py   # Product serializers
│   ├── views.py         # Product views
│   └── urls.py          # URL patterns
├── orders/               # Cart and order management
│   ├── models.py        # Cart, Order models
│   ├── serializers.py   # Order serializers
│   ├── views.py         # Order views
│   └── urls.py          # URL patterns
├── wishlist/             # Wishlist functionality
│   ├── models.py        # Wishlist models
│   ├── serializers.py   # Wishlist serializers
│   ├── views.py         # Wishlist views
│   └── urls.py          # URL patterns
├── management/           # Custom management commands
│   └── commands/
│       └── setup_sample_data.py
├── requirements.txt      # Python dependencies
└── manage.py            # Django management script
```

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based authentication with custom user model
- **Product Management**: Categories, brands, products with specifications
- **Shopping Cart**: Persistent cart with real-time inventory checks
- **Order Processing**: Complete order lifecycle management
- **Wishlist System**: User wishlist management
- **Address Management**: Multiple addresses per user
- **Admin Interface**: Comprehensive Django admin

### API Features
- **RESTful Design**: Clean, consistent API endpoints
- **Advanced Filtering**: Price, category, brand, rating filters
- **Search Functionality**: Product search with multiple criteria
- **Pagination**: Efficient data pagination
- **CORS Support**: Cross-origin resource sharing enabled
- **JWT Authentication**: Secure token-based auth

## 🛠️ Technology Stack

- **Django 5.0** - High-level Python web framework
- **Django REST Framework** - Powerful REST API toolkit
- **Django CORS Headers** - Cross-origin resource sharing
- **JWT Authentication** - Secure token-based authentication
- **SQLite** - Lightweight database (easily switchable)
- **Pillow** - Image processing
- **Django Filters** - Advanced filtering capabilities

## 📋 Prerequisites

- **Python 3.8+**
- **pip** (Python package installer)
- **Virtual environment** (recommended)

## 🚀 Installation & Setup

### 1. Clone and Navigate
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Setup
Create a `.env` file in the backend directory (optional):
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
```

### 5. Database Setup
```bash
# Create database tables
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

### 6. Load Sample Data
```bash
# Set up sample categories, brands, products, and test user
python manage.py setup_sample_data
```

### 7. Run Development Server
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

## 🧪 Testing the Backend

### 1. Check Admin Interface
- Visit `http://localhost:8000/admin/`
- Login with superuser credentials
- Explore the admin interface

### 2. Test API Endpoints
Use tools like Postman, Insomnia, or curl to test the API:

#### Authentication
```bash
# Register a new user
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "first_name": "Test",
    "last_name": "User",
    "password": "testpass123",
    "password_confirm": "testpass123"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "testpass123"
  }'
```

#### Products
```bash
# Get all products
curl http://localhost:8000/api/products/

# Search products
curl "http://localhost:8000/api/products/search/?q=iphone"

# Get product details
curl http://localhost:8000/api/products/iphone-15-pro-max/
```

#### Cart (requires authentication)
```bash
# Get cart (include JWT token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/cart/

# Add to cart
curl -X POST http://localhost:8000/api/cart/add/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
```

### 3. Sample Data
The `setup_sample_data` command creates:
- **Categories**: Electronics, Fashion, Home & Garden, Books, Sports, Beauty
- **Brands**: Apple, Samsung, Nike, Adidas, Sony
- **Products**: iPhone 15 Pro Max, Samsung Galaxy S24, MacBook Pro, etc.
- **Test User**: `test@example.com` / `testpass123`

## 🔧 Configuration

### Database Configuration
The project uses SQLite by default. To switch to PostgreSQL or MySQL:

1. Install database adapter:
```bash
# For PostgreSQL
pip install psycopg2-binary

# For MySQL
pip install mysqlclient
```

2. Update `settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',  # or mysql
        'NAME': 'your_db_name',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',  # or 3306 for MySQL
    }
}
```

### JWT Configuration
JWT settings are configured in `settings.py`:
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### CORS Configuration
CORS is configured for development. Update `CORS_ALLOWED_ORIGINS` in production:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8080",
    "https://yourdomain.com",
]
```

## 📚 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | User registration |
| POST | `/api/auth/login/` | User login |
| POST | `/api/auth/logout/` | User logout |
| GET | `/api/auth/profile/` | Get user profile |
| PUT | `/api/auth/profile/` | Update user profile |
| PUT | `/api/auth/change-password/` | Change password |

### Product Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/` | List all products |
| GET | `/api/products/search/` | Search products |
| GET | `/api/products/<slug>/` | Get product details |
| GET | `/api/categories/` | List categories |
| GET | `/api/brands/` | List brands |
| GET | `/api/products/featured/` | Get featured products |
| GET | `/api/products/new-arrivals/` | Get new arrivals |
| GET | `/api/products/bestsellers/` | Get bestsellers |

### Cart Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart/` | Get user cart |
| POST | `/api/cart/add/` | Add item to cart |
| PUT | `/api/cart/items/<id>/` | Update cart item |
| DELETE | `/api/cart/items/<id>/` | Remove from cart |
| DELETE | `/api/cart/clear/` | Clear cart |

### Order Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/` | List user orders |
| POST | `/api/orders/create/` | Create order |
| GET | `/api/orders/<id>/` | Get order details |
| POST | `/api/checkout/` | Checkout process |
| POST | `/api/orders/<id>/cancel/` | Cancel order |

### Wishlist Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wishlist/` | Get user wishlist |
| POST | `/api/wishlist/add/` | Add to wishlist |
| DELETE | `/api/wishlist/items/<id>/` | Remove from wishlist |
| DELETE | `/api/wishlist/clear/` | Clear wishlist |
| GET | `/api/wishlist/check/<id>/` | Check wishlist status |
| POST | `/api/wishlist/toggle/<id>/` | Toggle wishlist status |

## 🧪 Running Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test accounts
python manage.py test products
python manage.py test orders
python manage.py test wishlist

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

## 🚀 Production Deployment

### 1. Environment Variables
Set production environment variables:
```env
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

### 2. Static Files
```bash
python manage.py collectstatic
```

### 3. Database
```bash
python manage.py migrate
```

### 4. WSGI Server
Use Gunicorn for production:
```bash
pip install gunicorn
gunicorn shopfluence.wsgi:application
```

### 5. Web Server
Configure Nginx or Apache to serve static files and proxy to Django.

## 🔍 Troubleshooting

### Common Issues

1. **Migration Errors**
   ```bash
   python manage.py makemigrations --empty app_name
   python manage.py migrate --fake-initial
   ```

2. **Static Files Not Loading**
   ```bash
   python manage.py collectstatic
   ```

3. **Database Connection Issues**
   - Check database settings in `settings.py`
   - Ensure database server is running
   - Verify credentials

4. **CORS Issues**
   - Check `CORS_ALLOWED_ORIGINS` in settings
   - Ensure frontend URL is included

5. **JWT Token Issues**
   - Check token expiration settings
   - Verify token format in Authorization header

### Debug Mode
Enable debug mode for detailed error messages:
```python
DEBUG = True
```

## 📖 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework Documentation](https://www.django-rest-framework.org/)
- [JWT Documentation](https://django-rest-framework-simplejwt.readthedocs.io/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Happy coding! 🚀**
