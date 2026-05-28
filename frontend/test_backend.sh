#!/bin/bash

echo "Testing backend connectivity..."

# Test health
echo -e "\n1. Testing health endpoint..."
curl -s http://localhost:8000/health || echo "❌ Backend not reachable"

# Test categories
echo -e "\n2. Testing categories..."
curl -s http://localhost:8000/api/v1/categories/ | jq '.'

# Test products
echo -e "\n3. Testing products..."
curl -s http://localhost:8000/api/v1/products/ | jq '.'

# Create user
echo -e "\n4. Creating admin user..."
curl -s -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@inventory.com",
    "password": "admin123",
    "full_name": "System Administrator"
  }' | jq '.'

# Login
echo -e "\n5. Logging in..."
curl -s -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123" | jq '.'
