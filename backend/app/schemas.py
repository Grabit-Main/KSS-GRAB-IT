from pydantic import BaseModel, Field
from typing import Literal

class PhoneRequest(BaseModel): phone: str = Field(pattern=r"^\+?[1-9]\d{7,14}$")
class RegistrationRequest(PhoneRequest): full_name: str = Field(min_length=2, max_length=100); email: str | None = None
class VerifyOtpRequest(PhoneRequest): otp: str = Field(pattern=r"^\d{6}$"); full_name: str | None = None; email: str | None = None
class CartItemRequest(BaseModel): product_id: str; quantity: int = Field(ge=1, le=50)
class OrderRequest(BaseModel): store_id: str; delivery_address: str = Field(min_length=5); latitude: float; longitude: float
class ProductRequest(BaseModel): name: str; price: float = Field(gt=0); stock: int = Field(ge=0); category_id: str | None = None; image_url: str | None = None
class StatusRequest(BaseModel): status: str
class ManagedUser(BaseModel): full_name: str; phone: str; role: Literal["seller", "delivery_agent"]
class ProfileUpdate(BaseModel): full_name: str | None = Field(default=None, min_length=2, max_length=100); email: str | None = None
