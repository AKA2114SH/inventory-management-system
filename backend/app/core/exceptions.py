from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Dict, Any
import structlog

logger = structlog.get_logger()

class BusinessException(Exception):
    """Base exception for business logic errors"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class InsufficientStockException(BusinessException):
    """Exception for insufficient stock"""
    def __init__(self, product_name: str, requested: int, available: int):
        message = f"Insufficient stock for '{product_name}'. Requested: {requested}, Available: {available}"
        super().__init__(message, status_code=400)

class ResourceNotFoundException(BusinessException):
    """Exception for resource not found"""
    def __init__(self, resource: str, resource_id: int):
        message = f"{resource} with id {resource_id} not found"
        super().__init__(message, status_code=404)

async def business_exception_handler(request: Request, exc: BusinessException) -> JSONResponse:
    """Handle business exceptions"""
    logger.error(
        "Business exception occurred",
        path=request.url.path,
        error=exc.message,
        status_code=exc.status_code
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.message,
            "error_code": exc.__class__.__name__
        }
    )

async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle generic exceptions"""
    logger.error(
        "Unhandled exception",
        path=request.url.path,
        error=str(exc),
        exc_info=True
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )