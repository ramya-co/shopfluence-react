# Shopfluence - Full-Stack Ecommerce Platform

A modern, feature-rich ecommerce platform built with React frontend and Django backend, featuring user authentication, product management, shopping cart, wishlist, and order processing.

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Product Catalog**: Browse products by category, brand, and search
- **Product Details**: Comprehensive product information with images and reviews
- **Shopping Cart**: Add, remove, and manage cart items
- **Wishlist**: Save products for later
- **User Authentication**: Login, registration, and profile management
- **Advanced Filtering**: Price range, brand, rating, and availability filters
- **Sorting Options**: Multiple sorting criteria for products

### Backend (Django + Django REST Framework)
- **RESTful API**: Complete REST API for all ecommerce operations
- **User Management**: Custom user model with JWT authentication
- **Product Management**: Categories, brands, products with specifications
- **Inventory Management**: Stock tracking and availability
- **Order Processing**: Complete order lifecycle management
- **Shopping Cart**: Persistent cart with real-time updates
- **Wishlist System**: User wishlist management
- **Address Management**: Multiple addresses per user
- **Admin Interface**: Comprehensive Django admin for content management

## 🏗️ Architecture

```
shopfluence-react-main/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   └── data/              # Sample data and types
└── backend/               # Django backend
    ├── shopfluence/        # Django project settings
    ├── accounts/          # User authentication app
    ├── products/          # Product management app
    ├── orders/            # Cart and order management
    └── wishlist/          # Wishlist functionality
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Lucide React** - Beautiful icons

### Backend
- **Django 5.0** - High-level Python web framework
- **Django REST Framework** - Powerful REST API toolkit
- **Django CORS Headers** - Cross-origin resource sharing
- **JWT Authentication** - Secure token-based authentication
- **SQLite** - Lightweight database (easily switchable to PostgreSQL/MySQL)
- **Pillow** - Image processing
- **Django Filters** - Advanced filtering capabilities

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd shopfluence-react-main
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend will be available at `http://localhost:8080`

### 3. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Set up sample data
python manage.py setup_sample_data

# Start development server
python manage.py runserver
```
Backend will be available at `http://localhost:8000`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile

### Product Endpoints
- `GET /api/products/` - List all products
- `GET /api/products/search/` - Search products
- `GET /api/products/<slug>/` - Get product details
- `GET /api/categories/` - List categories
- `GET /api/brands/` - List brands

### Cart Endpoints
- `GET /api/cart/` - Get user cart
- `POST /api/cart/add/` - Add item to cart
- `PUT /api/cart/items/<id>/` - Update cart item
- `DELETE /api/cart/items/<id>/` - Remove from cart

### Order Endpoints
- `GET /api/orders/` - List user orders
- `POST /api/orders/create/` - Create order
- `GET /api/orders/<id>/` - Get order details
- `POST /api/checkout/` - Checkout process

### Wishlist Endpoints
- `GET /api/wishlist/` - Get user wishlist
- `POST /api/wishlist/add/` - Add to wishlist
- `DELETE /api/wishlist/items/<id>/` - Remove from wishlist
- `POST /api/wishlist/toggle/<id>/` - Toggle wishlist status

## 🔧 Configuration

### Frontend Configuration
- Edit `vite.config.ts` for build settings
- Modify `tailwind.config.ts` for styling
- Update API base URL in API calls

### Backend Configuration
- Edit `backend/shopfluence/settings.py` for Django settings
- Configure database settings
- Set up environment variables for production

## 🧪 Testing

### Frontend Testing
```bash
npm run test
```

### Backend Testing
```bash
cd backend
python manage.py test
```

## 📦 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
- Set `DEBUG = False` in production
- Configure production database
- Set up static file serving
- Use production WSGI server (Gunicorn)
- Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔮 Roadmap

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Advanced search with Elasticsearch
- [ ] Real-time chat support
- [ ] Advanced inventory management
- [ ] Bulk import/export
- [ ] API rate limiting
- [ ] Caching layer (Redis)
- [ ] Docker containerization

---

**Built with ❤️ using modern web technologies**
