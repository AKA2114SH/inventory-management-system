# 🚀 Inventory & Billing Management System

[![GitHub stars](https://img.shields.io/github/stars/AKA2114SH/inventory-management-system)](https://github.com/AKA2114SH/inventory-management-system/stargazers)
[![GitHub license](https://img.shields.io/github/license/AKA2114SH/inventory-management-system)](https://github.com/AKA2114SH/inventory-management-system/blob/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Made with FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Made with React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org)

A **production-ready** full-stack inventory management system with **FastAPI backend** and **React frontend**. Perfect for businesses needing real-time stock tracking, billing, and inventory management.

## ✨ Features

### Backend (FastAPI)
- ✅ **Complete CRUD Operations** - Products, Categories, Transactions
- ✅ **Real-time Stock Management** - Automatic updates on IN/OUT transactions
- ✅ **JWT Authentication** - Secure user authentication with bcrypt hashing
- ✅ **PostgreSQL Database** - ACID compliant, reliable data storage
- ✅ **Async Operations** - High performance with SQLAlchemy async
- ✅ **API Documentation** - Auto-generated Swagger UI and ReDoc
- ✅ **Docker Support** - Easy deployment with containers
- ✅ **CORS Configured** - Ready for frontend integration
- ✅ **Error Handling** - Global exception handling with proper responses

### Frontend (React)
- ✅ **Modern React 18** - With TypeScript for type safety
- ✅ **Cyberpunk UI** - Beautiful dark theme with neon cyan accents
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Real-time Dashboard** - Live metrics and analytics from backend
- ✅ **Billing System** - Point-of-sale style checkout with cart
- ✅ **Invoice Generation** - Print and download invoices as JSON/PDF
- ✅ **JWT Integration** - Secure token storage and management
- ✅ **Toast Notifications** - Real-time feedback for actions
- ✅ **Loading States** - Smooth UX with spinners and skeletons
- ✅ **Search & Filter** - Find products/categories quickly

## 🛠️ Tech Stack

| Backend | Frontend |
|---------|----------|
| FastAPI | React 18 |
| PostgreSQL | TypeScript |
| SQLAlchemy | Vite |
| JWT | Tailwind CSS |
| bcrypt | Axios |
| Docker | React Router |
| Alembic | Lucide Icons |

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (optional)
- PostgreSQL (or use Docker)

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/AKA2114SH/inventory-management-system.git
cd inventory-management-system

# Start all services
docker-compose up -d

# Wait for containers to start (30 seconds)

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docsManual Setup

Backend Setup
bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Initialize database
python init_db.py

# Run backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Frontend Setup
bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run frontend
npm run dev
📊 API Documentation
Once the backend is running, access:

Documentation	URL
Swagger UI	http://localhost:8000/docs
ReDoc	http://localhost:8000/redoc
OpenAPI JSON	http://localhost:8000/openapi.json
🔐 Default Credentials
After running init_db.py, you can login with:

Role	Username	Password
Admin	admin	admin123
Test User	testuser	test123
📁 Project Structure
text
inventory-management-system/
├── backend/                      # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/              # API endpoints
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── categories.py    # Category CRUD
│   │   │   ├── products.py      # Product CRUD
│   │   │   └── transactions.py  # Transaction endpoints
│   │   ├── core/                # Core configuration
│   │   │   ├── config.py        # Settings
│   │   │   ├── database.py      # Database connection
│   │   │   ├── security.py      # JWT & password hashing
│   │   │   └── exceptions.py    # Error handlers
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── category.py
│   │   │   ├── product.py
│   │   │   ├── transaction.py
│   │   │   └── user.py
│   │   ├── schemas/             # Pydantic schemas
│   │   └── services/            # Business logic
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── ui/              # UI components
│   │   │   └── layout/          # Layout components
│   │   ├── pages/               # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Categories.tsx
│   │   │   ├── Transactions.tsx
│   │   │   ├── Billing.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Invoices.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── services/            # API services
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── productService.ts
│   │   │   ├── categoryService.ts
│   │   │   └── transactionService.ts
│   │   ├── context/             # React context
│   │   ├── hooks/               # Custom hooks
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Utility functions
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
├── README.md
├── LICENSE
└── .gitignore
📈 API Endpoints
Authentication
Method	Endpoint	Description
POST	/api/v1/auth/register	Register new user
POST	/api/v1/auth/login	Login user
GET	/api/v1/auth/me	Get current user
Categories
Method	Endpoint	Description
POST	/api/v1/categories/	Create category
GET	/api/v1/categories/	Get all categories
GET	/api/v1/categories/{id}	Get category by ID
PUT	/api/v1/categories/{id}	Update category
DELETE	/api/v1/categories/{id}	Delete category
Products
Method	Endpoint	Description
POST	/api/v1/products/	Create product
GET	/api/v1/products/	Get all products
GET	/api/v1/products/{id}	Get product by ID
PUT	/api/v1/products/{id}	Update product
DELETE	/api/v1/products/{id}	Delete product
Transactions
Method	Endpoint	Description
POST	/api/v1/transactions/	Create IN/OUT transaction
GET	/api/v1/transactions/	Get all transactions
GET	/api/v1/transactions/product/{id}/history	Get product history
🚢 Deployment
Deploy Backend to Render (Free)
Create account on Render

Click "New +" → "Web Service"

Connect GitHub repository

Configure:

Name: inventory-api

Root Directory: backend

Environment: Python

Build Command: pip install -r requirements.txt

Start Command: uvicorn app.main:app --host 0.0.0.0 --port 10000

Add Environment Variables:

DATABASE_URL: Your PostgreSQL URL (from Supabase)

SECRET_KEY: Generate a secure key

DEBUG: false

Click "Create Web Service"

Deploy Frontend to Vercel (Free)
Create account on Vercel

Click "Import Project"

Connect GitHub repository

Configure:

Root Directory: frontend

Framework Preset: Vite

Build Command: npm run build

Output Directory: dist

Add Environment Variables:

VITE_API_URL: Your Render backend URL (e.g., https://inventory-api.onrender.com/api/v1)

Click "Deploy"

Deploy Database to Supabase (Free)
Create account on Supabase

Create new project

Get Database URL from Settings → Database

Use this URL in Render environment variables

🧪 Testing
Backend Tests
bash
cd backend
pytest tests/ -v --cov=app
Frontend Tests
bash
cd frontend
npm run test
🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📝 License
MIT © Akash Khatale

👨‍💻 Author
Akash Khatale

GitHub: @AKA2114SH

LinkedIn: Akash Khatale

🙏 Acknowledgments
FastAPI for amazing framework

React team for great frontend library

All contributors who help improve this project

⭐ Show Your Support
If this project helped you, please give it a ⭐️!

Built with ❤️ using FastAPI and React
