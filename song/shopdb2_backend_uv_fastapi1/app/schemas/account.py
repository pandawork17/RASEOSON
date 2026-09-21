from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.auth import AuthResponse
from app.schemas.common import UserSummary


class BuyerSignupAddress(BaseModel):
    address_name: str = "Default"
    receiver_name: str
    receiver_phone: str
    zipcode: str | None = None
    address1: str
    address2: str | None = None
    default_yn: str = "Y"


class BuyerSignupRequest(BaseModel):
    login_id: str = Field(min_length=4, max_length=100)
    password: str = Field(min_length=4, max_length=100)
    user_name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=255)
    phone: str | None = Field(default=None, max_length=30)
    address: BuyerSignupAddress


class BuyerProfileUpdateRequest(BaseModel):
    user_name: str = Field(min_length=2, max_length=100)
    phone: str | None = Field(default=None, max_length=30)


class BuyerAddressCreateRequest(BuyerSignupAddress):
    pass


class BuyerAddressUpdateRequest(BuyerSignupAddress):
    pass


class BuyerAddressResponse(BuyerSignupAddress):
    address_id: int
    created_at: datetime | None = None


class BuyerSignupResponse(AuthResponse):
    pass


class BuyerProfileResponse(BaseModel):
    user: UserSummary
    addresses: list[BuyerAddressResponse]
