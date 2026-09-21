from pydantic import BaseModel

from app.schemas.common import UserSummary


class LoginRequest(BaseModel):
    login_id: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserSummary
