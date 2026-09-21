from fastapi import APIRouter

from app.api.routes import admin, auth, buyer, common, public, seller


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(public.router, prefix="/public", tags=["public"])
api_router.include_router(common.router, prefix="/common", tags=["common"])
api_router.include_router(buyer.router, prefix="/buyer", tags=["buyer"])
api_router.include_router(seller.router, prefix="/seller", tags=["seller"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
