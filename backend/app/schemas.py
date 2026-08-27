from pydantic import BaseModel, Field
from typing import Literal

class PhoneRequest(BaseModel): phone: str = Field(pattern=r"^\+?[1-9]\d{7,14}$")
class RegistrationRequest(PhoneRequest): full_name: str = Field(min_length=2, max_length=100); email: str | None = None
class VerifyOtpRequest(PhoneRequest): otp: str = Field(pattern=r"^\d{6}$"); full_name: str | None = None; email: str | None = None
class CartSyncRequest(BaseModel): phone: str; items: list
class CartItemRequest(BaseModel): product_id: str; quantity: int = Field(ge=1, le=50)
class OrderRequest(BaseModel):
    store_id: str | None = None
    delivery_address: str | None = "Delivery Address"
    latitude: float | None = 12.9716
    longitude: float | None = 77.5946
    items: list | None = []
    total_amount: float | None = 0.0
    customer_name: str | None = None
    customer_phone: str | None = None
    payment_method: str | None = "UPI"
    status: str | None = "placed"
class ProductRequest(BaseModel):
    name: str
    price: float = Field(gt=0)
    stock: int = Field(default=0, ge=0)
    category_id: str | None = None
    image_url: str | None = None

class ProductUpdateRequest(BaseModel):
    name: str | None = None
    price: float | None = Field(default=None, gt=0)
    stock: int | None = Field(default=None, ge=0)
    category_id: str | None = None
    image_url: str | None = None

class CategoryRequest(BaseModel):
    name: str
    image_url: str | None = None

class StatusRequest(BaseModel):
    status: str
    delivery_agent_id: str | None = None
class ManagedUser(BaseModel): full_name: str; phone: str; role: Literal["seller", "delivery_agent"]
class ProfileUpdate(BaseModel): full_name: str | None = Field(default=None, min_length=2, max_length=100); email: str | None = None
