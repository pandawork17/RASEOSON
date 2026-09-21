from fastapi import APIRouter, Depends, File, Query, UploadFile

from app.api.deps import CurrentUser, DbSession, require_roles
from app.schemas.common import ProductCard
from app.schemas.file import FileUploadResponse
from app.schemas.seller import (
    SellerDashboard,
    SellerInventoryRow,
    SellerOrderRow,
    SellerProductCreate,
    SellerProductCreateResponse,
    SellerProductStatusUpdate,
)
from app.services.file_service import save_upload_file
from app.services.seller_service import (
    create_seller_product,
    get_seller_dashboard,
    get_seller_inventory,
    get_seller_orders,
    get_seller_products,
    update_seller_product_status,
)


router = APIRouter(dependencies=[Depends(require_roles("SELLER"))])


@router.get("/dashboard", response_model=SellerDashboard)
def dashboard(current_user: CurrentUser, db: DbSession) -> SellerDashboard:
    return get_seller_dashboard(db, current_user)


@router.get("/products", response_model=list[ProductCard])
def products(
    current_user: CurrentUser,
    db: DbSession,
    scope: str = Query(default="mine", pattern="^(mine|all)$"),
    search: str = Query(default="", max_length=200),
    product_status: str = Query(default="ALL", max_length=30),
    category_id: int | None = Query(default=None, ge=1),
) -> list[ProductCard]:
    return get_seller_products(
        db,
        current_user.user_id,
        scope=scope,
        search=search,
        product_status=product_status,
        category_id=category_id,
    )


@router.post("/products", response_model=SellerProductCreateResponse)
def create_product(payload: SellerProductCreate, current_user: CurrentUser, db: DbSession) -> SellerProductCreateResponse:
    return create_seller_product(db, current_user, payload)


@router.post("/files/upload", response_model=FileUploadResponse, status_code=201)
async def upload_file(
    current_user: CurrentUser,
    db: DbSession,
    file: UploadFile = File(...),
) -> FileUploadResponse:
    return await save_upload_file(db, current_user.org.org_id if current_user.org else None, file)


@router.patch("/products/{product_id}/status", response_model=dict)
def update_product_status(
    product_id: int,
    payload: SellerProductStatusUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    return update_seller_product_status(db, current_user.user_id, product_id, payload.product_status)


@router.get("/inventory", response_model=list[SellerInventoryRow])
def inventory(current_user: CurrentUser, db: DbSession) -> list[SellerInventoryRow]:
    return get_seller_inventory(db, current_user.user_id)


@router.get("/orders", response_model=list[SellerOrderRow])
def orders(current_user: CurrentUser, db: DbSession) -> list[SellerOrderRow]:
    return get_seller_orders(db, current_user.user_id)
