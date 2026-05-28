from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
from enum import Enum
from app.schemas.product import ProductResponse

class TransactionType(str, Enum):
    IN = "IN"
    OUT = "OUT"

class TransactionCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    type: TransactionType
    quantity: int = Field(..., gt=0)
    total_price: float = Field(..., ge=0)

class TransactionResponse(BaseModel):
    id: int
    product_id: int
    type: TransactionType
    quantity: int
    total_price: float
    timestamp: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    product: Optional[ProductResponse] = None
    
    model_config = ConfigDict(from_attributes=True)

class StockAdjustmentResponse(BaseModel):
    product_id: int
    product_name: str
    previous_stock: int
    new_stock: int
    transaction_id: int