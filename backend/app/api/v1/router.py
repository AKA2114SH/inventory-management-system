from fastapi import APIRouter
from app.api.v1 import products, transactions, categories, auth

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(products.router)
api_router.include_router(transactions.router)
api_router.include_router(categories.router)
api_router.include_router(auth.router)
