from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from app.models.transaction import Transaction, TransactionType
from app.models.product import Product
from app.schemas.transaction import TransactionCreate
from app.core.exceptions import InsufficientStockException, ResourceNotFoundException
from app.services.product_service import ProductService
from datetime import datetime

class TransactionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.product_service = ProductService(db)
    
    async def create_transaction(self, transaction_data: TransactionCreate) -> tuple[Transaction, dict]:
        """Create a transaction and update stock accordingly"""
        # Get product
        product = await self.product_service.get_product(transaction_data.product_id)
        previous_stock = product.stock_quantity
        
        # Calculate stock change
        if transaction_data.type == TransactionType.IN:
            stock_change = transaction_data.quantity
            # For IN transactions, total_price should be cost price
            if transaction_data.total_price <= 0 and transaction_data.quantity > 0:
                # Auto-calculate total price if not provided properly
                transaction_data.total_price = transaction_data.quantity * product.price
        else:  # OUT
            stock_change = -transaction_data.quantity
            # Check sufficient stock
            if product.stock_quantity < transaction_data.quantity:
                raise InsufficientStockException(
                    product.name, 
                    transaction_data.quantity, 
                    product.stock_quantity
                )
            # For OUT transactions, total_price should be selling price
            if transaction_data.total_price <= 0 and transaction_data.quantity > 0:
                transaction_data.total_price = transaction_data.quantity * product.price
        
        # Create transaction
        transaction = Transaction(**transaction_data.model_dump())
        self.db.add(transaction)
        
        # Update stock
        await self.product_service.update_stock(
            transaction_data.product_id, 
            stock_change
        )
        
        await self.db.flush()
        
        # Get updated product for response
        updated_product = await self.product_service.get_product(transaction_data.product_id)
        
        stock_info = {
            "product_id": product.id,
            "product_name": product.name,
            "previous_stock": previous_stock,
            "new_stock": updated_product.stock_quantity,
            "transaction_id": transaction.id
        }
        
        return transaction, stock_info
    
    async def get_transaction(self, transaction_id: int) -> Transaction:
        """Get transaction by ID"""
        query = select(Transaction).where(Transaction.id == transaction_id)
        result = await self.db.execute(query)
        transaction = result.scalar_one_or_none()
        if not transaction:
            raise ResourceNotFoundException("Transaction", transaction_id)
        return transaction
    
    async def get_transactions(
        self,
        skip: int = 0,
        limit: int = 100,
        product_id: Optional[int] = None,
        transaction_type: Optional[TransactionType] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> tuple[List[Transaction], int]:
        """Get transactions with filters"""
        query = select(Transaction)
        
        # Apply filters
        if product_id:
            query = query.where(Transaction.product_id == product_id)
        if transaction_type:
            query = query.where(Transaction.type == transaction_type)
        if start_date:
            query = query.where(Transaction.timestamp >= start_date)
        if end_date:
            query = query.where(Transaction.timestamp <= end_date)
        
        # Get total count
        count_query = select(func.count()).select_from(Transaction)
        if product_id:
            count_query = count_query.where(Transaction.product_id == product_id)
        if transaction_type:
            count_query = count_query.where(Transaction.type == transaction_type)
        if start_date:
            count_query = count_query.where(Transaction.timestamp >= start_date)
        if end_date:
            count_query = count_query.where(Transaction.timestamp <= end_date)
        
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        # Get paginated results
        query = query.offset(skip).limit(limit).order_by(Transaction.timestamp.desc())
        result = await self.db.execute(query)
        transactions = result.scalars().all()
        
        return transactions, total
    
    async def get_product_transaction_history(self, product_id: int, limit: int = 50) -> List[Transaction]:
        """Get transaction history for a specific product"""
        # Verify product exists
        await self.product_service.get_product(product_id)
        
        query = select(Transaction).where(
            Transaction.product_id == product_id
        ).order_by(Transaction.timestamp.desc()).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()