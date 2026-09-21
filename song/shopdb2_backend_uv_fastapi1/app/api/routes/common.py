from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.schemas.common import CategorySummary, ProductDetail, ProductCard
from app.services.common_service import get_bootstrap_data, get_product_detail, list_catalog_products


router = APIRouter()


@router.get("/bootstrap")
def bootstrap(current_user: CurrentUser, db: DbSession) -> dict:
    return get_bootstrap_data(db, current_user)


@router.get("/catalog", response_model=list[ProductCard])
def catalog(current_user: CurrentUser, db: DbSession) -> list[ProductCard]:
    return list_catalog_products(db)


@router.get("/categories", response_model=list[CategorySummary])
def categories(current_user: CurrentUser, db: DbSession) -> list[CategorySummary]:
    return get_bootstrap_data(db, current_user)["categories"]


@router.get("/products/{product_id}", response_model=ProductDetail)
def product_detail(product_id: int, current_user: CurrentUser, db: DbSession) -> ProductDetail:
    product = get_product_detail(db, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found.")
    return product
