from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DbSession
from app.core.security import create_access_token
from app.schemas.auth import AuthResponse, LoginRequest
from app.services.auth_service import authenticate_user


router = APIRouter()


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: DbSession) -> AuthResponse:
    user = authenticate_user(db, payload.login_id, payload.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    token = create_access_token(str(user.user_id), {"roles": user.roles})
    return AuthResponse(access_token=token, user=user)


@router.get("/me", response_model=AuthResponse)
def me(current_user: CurrentUser) -> AuthResponse:
    token = create_access_token(str(current_user.user_id), {"roles": current_user.roles})
    return AuthResponse(access_token=token, user=current_user)
