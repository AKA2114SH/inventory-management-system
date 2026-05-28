from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from datetime import datetime
from app.schemas.category import CategoryResponse

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    sku: str = Field(..., min_length=1, max_length=50)
    category_id: int = Field(..., gt=0)
    price: float = Field(..., gt=0)
    stock_quantity: int = Field(0, ge=0)
    unit: str = Field("pcs", min_length=1, max_length=20)
    
    @field_validator("sku")
    @classmethod
    def validate_sku(cls, v: str) -> str:
        v = v.upper().strip()
        if " " in v:
            raise ValueError("SKU cannot contain spaces")
        return v

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    category_id: Optional[int] = Field(None, gt=0)
    price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    unit: Optional[str] = Field(None, min_length=1, max_length=20)

class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    category_id: int
    price: float
    stock_quantity: int
    unit: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    category: Optional[CategoryResponse] = None
    
    model_config = ConfigDict(from_attributes=True)