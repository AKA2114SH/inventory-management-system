from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import datetime
from app.core.database import get_db
from app.services.transaction_service import TransactionService
from app.models.transaction import Transaction
from app.models.product import Product
from app.schemas.transaction import (
    TransactionCreate, 
    TransactionResponse, 
    StockAdjustmentResponse
)
from app.schemas.common import PaginatedResponse
from app.core.exceptions import InsufficientStockException, ResourceNotFoundException

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post(
    "/",
    response_model=StockAdjustmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create transaction (IN/OUT)",
    description="Create a stock transaction. IN increases stock, OUT decreases stock with validation."
)
async def create_transaction(
    transaction_data: TransactionCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new transaction with automatic stock update"""
    try:
        service = TransactionService(db)
        transaction, stock_info = await service.create_transaction(transaction_data)
        await db.commit()
        return stock_info
    except InsufficientStockException as e:
        await db.rollback()
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except ResourceNotFoundException as e:
        await db.rollback()
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/",
    response_model=PaginatedResponse[TransactionResponse],
    summary="Get all transactions",
    description="Retrieve paginated transaction history with filters"
)
async def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    product_id: Optional[int] = Query(None),
    transaction_type: Optional[str] = Query(None, regex="^(IN|OUT)$"),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all transactions with filters"""
    try:
        service = TransactionService(db)
        transactions, total = await service.get_transactions(
            skip, limit, product_id, transaction_type, start_date, end_date
        )
        
        # Build response items with product data
        items = []
        for transaction in transactions:
            # Get product with category
            product_result = await db.execute(
                select(Product)
                .where(Product.id == transaction.product_id)
                .options(selectinload(Product.category))
            )
            product = product_result.scalar_one_or_none()
            
            # Create response item
            item = TransactionResponse(
                id=transaction.id,
                product_id=transaction.product_id,
                type=transaction.type,
                quantity=transaction.quantity,
                total_price=transaction.total_price,
                timestamp=transaction.timestamp,
                created_at=transaction.timestamp,
                updated_at=None,
                product=product
            )
            items.append(item)
        
        return PaginatedResponse(
            items=items,
            total=total,
            page=skip // limit + 1 if limit > 0 else 1,
            page_size=limit,
            total_pages=(total + limit - 1) // limit if limit > 0 else 0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get(
    "/product/{product_id}/history",
    response_model=list[TransactionResponse],
    summary="Get product transaction history",
    description="Get all transactions for a specific product"
)
async def get_product_history(
    product_id: int,
    limit: int = Query(50, ge=1, le=500),
    db: AsyncSession = Depends(get_db)
):
    """Get transaction history for a product"""
    try:
        service = TransactionService(db)
        transactions = await service.get_product_transaction_history(product_id, limit)
        
        # Build response items with product data
        items = []
        for transaction in transactions:
            # Get product with category
            product_result = await db.execute(
                select(Product)
                .where(Product.id == transaction.product_id)
                .options(selectinload(Product.category))
            )
            product = product_result.scalar_one_or_none()
            
            # Create response item
            item = TransactionResponse(
                id=transaction.id,
                product_id=transaction.product_id,
                type=transaction.type,
                quantity=transaction.quantity,
                total_price=transaction.total_price,
                timestamp=transaction.timestamp,
                created_at=transaction.timestamp,
                updated_at=None,
                product=product
            )
            items.append(item)
        
        return items
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")