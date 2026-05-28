from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from typing import Optional, List
from app.models.product import Product
from app.models.category import Category
from app.schemas.product import ProductCreate, ProductUpdate
from app.core.exceptions import ResourceNotFoundException

class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_product(self, product_data: ProductCreate) -> Product:
        """Create a new product"""
        # Check if category exists
        category = await self.db.execute(
            select(Category).where(Category.id == product_data.category_id)
        )
        if not category.scalar_one_or_none():
            raise ResourceNotFoundException("Category", product_data.category_id)
        
        # Check if SKU already exists
        existing = await self.db.execute(
            select(Product).where(Product.sku == product_data.sku)
        )
        if existing.scalar_one_or_none():
            raise ValueError(f"Product with SKU '{product_data.sku}' already exists")
        
        product = Product(**product_data.model_dump())
        self.db.add(product)
        await self.db.flush()
        return product
    
    async def get_product(self, product_id: int) -> Product:
        """Get product by ID"""
        query = select(Product).where(Product.id == product_id).options(selectinload(Product.category))
        result = await self.db.execute(query)
        product = result.scalar_one_or_none()
        if not product:
            raise ResourceNotFoundException("Product", product_id)
        return product
    
    async def get_products(
        self, 
        skip: int = 0, 
        limit: int = 100,
        category_id: Optional[int] = None,
        search: Optional[str] = None
    ) -> tuple[List[Product], int]:
        """Get products with pagination and filters"""
        query = select(Product).options(selectinload(Product.category))
        
        # Apply filters
        if category_id:
            query = query.where(Product.category_id == category_id)
        if search:
            query = query.where(
                Product.name.ilike(f"%{search}%") | Product.sku.ilike(f"%{search}%")
            )
        
        # Get total count
        count_query = select(Product).with_only_columns(Product.id).order_by(None)
        if category_id:
            count_query = count_query.where(Product.category_id == category_id)
        if search:
            count_query = count_query.where(
                Product.name.ilike(f"%{search}%") | Product.sku.ilike(f"%{search}%")
            )
        total_result = await self.db.execute(count_query)
        total = len(total_result.all())
        
        # Get paginated results
        query = query.offset(skip).limit(limit).order_by(Product.id)
        result = await self.db.execute(query)
        products = result.scalars().all()
        
        return products, total
    
    async def update_product(self, product_id: int, product_data: ProductUpdate) -> Product:
        """Update product"""
        product = await self.get_product(product_id)
        
        update_data = product_data.model_dump(exclude_unset=True)
        if update_data:
            for field, value in update_data.items():
                setattr(product, field, value)
            await self.db.flush()
        
        return product
    
    async def delete_product(self, product_id: int) -> None:
        """Delete product"""
        product = await self.get_product(product_id)
        await self.db.delete(product)
        await self.db.flush()
    
    async def update_stock(self, product_id: int, quantity_change: int) -> Product:
        """Update product stock (internal use)"""
        product = await self.get_product(product_id)
        product.stock_quantity += quantity_change
        await self.db.flush()
        return product