# 🚀 Quick Start Guide - Shopfluence Ecommerce Platform

Get your full-stack ecommerce platform running in minutes!

## ⚡ Super Quick Start (5 minutes)

### 1. Frontend (React)
```bash
# Install and start frontend
npm install
npm run dev
# Frontend: http://localhost:8080
```

### 2. Backend (Django)
```bash
cd backend

# Option A: Automated setup (recommended)
python setup.py

# Option B: Manual setup
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py setup_sample_data
python manage.py runserver
# Backend: http://localhost:8000
```

## 🎯 What You Get

### Frontend Features ✅
- **Homepage** with hero slider and featured products
- **Product catalog** with advanced filtering
- **Product details** with images, specs, and reviews
- **Shopping cart** with quantity management
- **Wishlist** functionality
- **User authentication** (login/register)
- **Responsive design** for all devices

### Backend Features ✅
- **RESTful API** for all operations
- **JWT authentication** with secure tokens
- **Product management** with categories and brands
- **Cart & order processing** with inventory tracking
- **Wishlist system** for saved items
- **Admin interface** for content management
- **Sample data** ready for testing

## 🧪 Test the Platform

### 1. Browse Products
- Visit `http://localhost:8080/products`
- Use filters: price, brand, rating, availability
- Search for products

### 2. Test User Features
- Register: `http://localhost:8080/register`
- Login: `http://localhost:8080/login`
- Add items to cart and wishlist

### 3. Explore API
- API Base: `http://localhost:8000/api/`
- Products: `http://localhost:8000/api/products/`
- Categories: `http://localhost:8000/api/categories/`
- Admin: `http://localhost:8000/admin/`

## 👤 Sample Data

The setup creates:
- **6 Categories**: Electronics, Fashion, Home & Garden, Books, Sports, Beauty
- **5 Brands**: Apple, Samsung, Nike, Adidas, Sony
- **6 Products**: iPhone 15 Pro Max, Samsung Galaxy S24, MacBook Pro, etc.
- **Test User**: `test@example.com` / `testpass123`

## 🔧 Customization

### Frontend
- Edit `src/data/sampleData.ts` for sample data
- Modify `tailwind.config.ts` for styling
- Update components in `src/components/`

### Backend
- Edit `backend/shopfluence/settings.py` for Django config
- Modify models in `backend/*/models.py`
- Update API views in `backend/*/views.py`

## 🚨 Troubleshooting

### Frontend Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Backend Issues
```bash
# Reset database
rm backend/db.sqlite3
cd backend
python manage.py migrate
python manage.py setup_sample_data
```

### Port Conflicts
- Frontend: Change port in `vite.config.ts`
- Backend: Change port in `python manage.py runserver 8001`

## 📱 Test on Mobile

- Frontend is fully responsive
- Test cart and wishlist on mobile
- Check product filtering on small screens

## 🔐 Security Notes

- JWT tokens expire in 1 day (configurable)
- CORS enabled for development
- SQLite database (switch to PostgreSQL for production)

## 🚀 Next Steps

1. **Customize Products**: Add your own products via admin
2. **Styling**: Modify Tailwind classes and shadcn/ui themes
3. **Features**: Add payment gateway, email notifications
4. **Deployment**: Deploy to Vercel (frontend) and Heroku/DigitalOcean (backend)

## 📚 Learn More

- [Frontend README](README.md)
- [Backend README](backend/README.md)
- [API Documentation](backend/README.md#api-documentation)

---

**🎉 You're all set! Happy coding!**
