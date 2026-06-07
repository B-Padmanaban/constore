# Constore — Construction Chemicals E-Commerce

Full-stack MERN + Python e-commerce platform for construction chemicals.

## Tech Stack
- **Frontend**: React 18, Vite, React Router v6, TanStack Query, Zustand, CSS Modules
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Auth
- **Payments**: Razorpay
- **Media**: Cloudinary
- **Python Services**: FastAPI (Analytics, Image Optimization)

## Project Structure
```
constore/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── common/      # ProtectedRoute, AdminRoute
│       │   ├── layout/      # Navbar, Footer
│       │   └── products/    # ProductCard
│       ├── pages/           # All route-level pages
│       │   └── admin/       # Admin Dashboard, Products, Orders
│       ├── store/           # Zustand stores (auth, cart)
│       ├── styles/          # Global CSS
│       └── utils/           # Axios API instance
│
├── server/                  # Express backend
│   ├── config/              # DB, Cloudinary config
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth middleware
│   ├── models/              # Mongoose schemas
│   └── routes/              # Express routers
│
└── python-services/         # FastAPI microservice
    └── routers/             # analytics, image_processor
```

## Getting Started

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure environment variables
```bash
cp .env.example .env          # root
cp server/.env.example server/.env    # fill in your values
cp python-services/.env.example python-services/.env
```

### 3. Run development servers
```bash
# Node (frontend + backend concurrently)
npm run dev

# Python service (separate terminal)
cd python-services
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/products | List products (filters, search, pagination) |
| GET | /api/products/:slug | Product detail |
| POST | /api/cart | Add to cart |
| POST | /api/orders | Place order |
| POST | /api/payment/create-order | Razorpay order |
| POST | /api/payment/verify | Verify payment |
| GET | /analytics/sales-summary | Sales stats (Python) |
| GET | /analytics/top-products | Best sellers (Python) |
| POST | /images/optimize | Optimize product image (Python) |

## Admin Access
Set `role: "admin"` on a user document in MongoDB to grant admin access.
