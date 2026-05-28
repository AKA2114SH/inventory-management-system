#!/bin/bash

echo "========================================="
echo "  Inventory Billing System"
echo "========================================="

# Activate virtual environment
if [ -d "venv" ]; then
    echo ""
    echo "Activating virtual environment..."
    source venv/bin/activate
else
    echo ""
    echo "Virtual environment not found. Please create it first:"
    echo "python3 -m venv venv"
    echo "source venv/bin/activate"
    echo "pip install -r requirements.txt"
    exit 1
fi

# Kill any process using port 5433
echo ""
echo "[1/6] Checking for processes on port 5433..."
lsof -ti:5433 | xargs kill -9 2>/dev/null && echo "      Killed process on port 5433" || echo "      Port 5433 is free"

# Kill any process using port 8000
echo "[2/6] Checking for processes on port 8000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo "      Killed process on port 8000" || echo "      Port 8000 is free"

# Stop any existing containers
echo "[3/6] Stopping existing Docker containers..."
docker-compose down 2>/dev/null && echo "      Stopped existing containers" || echo "      No containers to stop"

# Install psycopg2-binary if not already installed
echo "[4/6] Checking required packages..."
pip install psycopg2-binary -q 2>/dev/null
echo "      Required packages installed"

# Start PostgreSQL container
echo "[5/6] Starting PostgreSQL container..."
docker-compose up -d db

# Wait for PostgreSQL to be ready
echo "      Waiting for PostgreSQL to be ready..."
sleep 10

# Test database connection
echo "      Testing database connection..."
for i in {1..5}; do
    if docker exec inventory_billing_system-db-1 pg_isready -U postgres > /dev/null 2>&1; then
        echo "      ✅ Database is ready!"
        break
    fi
    if [ $i -eq 5 ]; then
        echo "      ❌ Database failed to start"
        docker logs inventory_billing_system-db-1
        exit 1
    fi
    sleep 2
done

# Run database initialization
echo "[6/6] Initializing database..."
python init_db.py

# Check if initialization was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ Database is ready!"
    echo "========================================="
    echo ""
    echo "🚀 Starting FastAPI application..."
    echo "📚 Swagger UI: http://localhost:8000/docs"
    echo "📖 ReDoc: http://localhost:8000/redoc"
    echo "❤️  Health Check: http://localhost:8000/health"
    echo ""
    echo "Press Ctrl+C to stop the application"
    echo "========================================="
    echo ""
    
    # Start the FastAPI application
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
else
    echo ""
    echo "❌ Database initialization failed!"
    echo "Please check the error messages above"
    exit 1
fi