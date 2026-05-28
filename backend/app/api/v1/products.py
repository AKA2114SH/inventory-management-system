from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional
from app.core.database import get_db
from app.services.product_service import ProductService
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.common import PaginatedResponse, MessageResponse
from app.core.exceptions import BusinessException, ResourceNotFoundException

router = APIRouter(prefix="/products", tags=["Products"])

@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description="Create a product with the specified details. SKU must be unique."
)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new product"""
    try:
        service = ProductService(db)
        product = await service.create_product(product_data)
        await db.commit()
        
        # Refresh the product with category relationship loaded
        result = await db.execute(
            select(Product)
            .where(Product.id == product.id)
            .options(selectinload(Product.category))
        )
        product = result.scalar_one()
        
        return product
    except ValueError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except ResourceNotFoundException as e:
        await db.rollback()
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get(
    "/",
    response_model=PaginatedResponse[ProductResponse],
    summary="Get all products",
    description="Retrieve a paginated list of products with optional filtering"
)
async def get_products(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    search: Optional[str] = Query(None, description="Search by name or SKU"),
    db: AsyncSession = Depends(get_db)
):
    """Get all products with pagination"""
    try:
        service = ProductService(db)
        products, total = await service.get_products(skip, limit, category_id, search)
        
        # Ensure category relationship is loaded for all products
        for product in products:
            if product.category_id and not hasattr(product, 'category'):
                result = await db.execute(
                    select(Product)
                    .where(Product.id == product.id)
                    .options(selectinload(Product.category))
                )
                product = result.scalar_one()
        
        return PaginatedResponse(
            items=products,
            total=total,
            page=skip // limit + 1 if limit > 0 else 1,
            page_size=limit,
            total_pages=(total + limit - 1) // limit if limit > 0 else 0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get product by ID",
    description="Retrieve detailed information about a specific product"
)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific product by ID"""
    try:
        service = ProductService(db)
        product = await service.get_product(product_id)
        return product
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Update product",
    description="Update an existing product's information"
)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a product"""
    try:
        service = ProductService(db)
        product = await service.update_product(product_id, product_data)
        await db.commit()
        await db.refresh(product)
        
        # Load category relationship after update
        result = await db.execute(
            select(Product)
            .where(Product.id == product.id)
            .options(selectinload(Product.category))
        )
        product = result.scalar_one()
        
        return product
    except ResourceNotFoundException as e:
        await db.rollback()
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except ValueError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete(
    "/{product_id}",
    response_model=MessageResponse,
    summary="Delete product",
    description="Delete a product (only if it has no associated transactions)"
)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a product"""
    try:
        service = ProductService(db)
        await service.delete_product(product_id)
        await db.commit()
        return MessageResponse(message=f"Product {product_id} deleted successfully", success=True)
    except ResourceNotFoundException as e:
        await db.rollback()
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        await db.rollback()
        if "foreign key constraint" in str(e).lower():
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete product with existing transactions"
            )
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")