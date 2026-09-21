from __future__ import annotations

from datetime import UTC, datetime
from decimal import Decimal
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import (
    Category,
    FileAsset,
    Inventory,
    Order,
    OrderItem,
    OrgUnit,
    Product,
    ProductFile,
    ProductImage,
    ProductVariant,
    SellerProfile,
    User,
)
from app.schemas.common import ProductCard, UserSummary
from app.schemas.seller import (
    SellerDashboard,
    SellerProductFileCreate,
    SellerInventoryRow,
    SellerProductImageCreate,
    SellerOrderRow,
    SellerProductCreate,
    SellerProductCreateResponse,
)
from app.services.common_service import list_product_cards, money


def get_seller_products(
    db: Session,
    seller_user_id: int,
    *,
    scope: str = "mine",
    search: str = "",
    product_status: str | None = None,
    category_id: int | None = None,
) -> list[ProductCard]:
    return list_product_cards(
        db,
        search=search,
        category_id=category_id,
        product_status=product_status,
        seller_user_id=seller_user_id if scope != "all" else None,
        public_only=False,
    )


def get_seller_inventory(db: Session, seller_user_id: int) -> list[SellerInventoryRow]:
    stmt = (
        select(Inventory, OrgUnit.org_name, Product.product_name, ProductVariant.sku_code)
        .join(ProductVariant, ProductVariant.variant_id == Inventory.variant_id)
        .join(Product, Product.product_id == ProductVariant.product_id)
        .join(OrgUnit, OrgUnit.org_id == Inventory.org_id)
        .where(Product.seller_user_id == seller_user_id)
        .order_by(Inventory.updated_at.desc(), Inventory.inventory_id.desc())
    )
    return [
        SellerInventoryRow(
            inventory_id=inventory.inventory_id,
            org_name=org_name,
            product_name=product_name,
            sku_code=sku_code,
            available_quantity=inventory.stock_quantity - inventory.reserved_quantity,
            stock_quantity=inventory.stock_quantity,
            reserved_quantity=inventory.reserved_quantity,
            safety_stock=inventory.safety_stock,
            updated_at=inventory.updated_at,
        )
        for inventory, org_name, product_name, sku_code in db.execute(stmt).all()
    ]


def get_seller_orders(db: Session, seller_user_id: int) -> list[SellerOrderRow]:
    stmt = (
        select(Order.order_no, User.user_name, OrderItem, Order.order_status, Order.ordered_at)
        .join(OrderItem, OrderItem.order_id == Order.order_id)
        .join(Product, Product.product_id == OrderItem.product_id)
        .join(User, User.user_id == Order.buyer_user_id)
        .where(Product.seller_user_id == seller_user_id)
        .order_by(Order.ordered_at.desc(), OrderItem.order_item_id.desc())
    )
    return [
        SellerOrderRow(
            order_no=order_no,
            buyer_name=buyer_name,
            product_name=item.product_name_snapshot,
            sku_code=item.sku_snapshot,
            quantity=item.quantity,
            item_amount=money(item.item_amount),
            order_status=order_status,
            ordered_at=ordered_at,
        )
        for order_no, buyer_name, item, order_status, ordered_at in db.execute(stmt).all()
    ]


def get_seller_dashboard(db: Session, current_user: UserSummary) -> SellerDashboard:
    product_count = db.scalar(select(func.count(Product.product_id)).where(Product.seller_user_id == current_user.user_id)) or 0
    sale_product_count = db.scalar(
        select(func.count(Product.product_id)).where(Product.seller_user_id == current_user.user_id, Product.product_status == "SALE")
    ) or 0
    order_amount = db.scalar(
        select(func.coalesce(func.sum(OrderItem.item_amount), 0))
        .join(Product, Product.product_id == OrderItem.product_id)
        .where(Product.seller_user_id == current_user.user_id)
    ) or 0
    low_stock_count = db.scalar(
        select(func.count(Inventory.inventory_id))
        .join(ProductVariant, ProductVariant.variant_id == Inventory.variant_id)
        .join(Product, Product.product_id == ProductVariant.product_id)
        .where(Product.seller_user_id == current_user.user_id, Inventory.stock_quantity - Inventory.reserved_quantity <= Inventory.safety_stock)
    ) or 0

    return SellerDashboard(
        stats={
            "product_count": int(product_count),
            "sale_product_count": int(sale_product_count),
            "sales_amount": money(order_amount),
            "low_stock_count": int(low_stock_count),
        },
        top_products=get_seller_products(db, current_user.user_id, scope="mine")[:4],
        latest_orders=[row.model_dump() for row in get_seller_orders(db, current_user.user_id)[:5]],
    )


def _resolve_product_file(db: Session, file_id: int) -> FileAsset:
    file_asset = db.scalar(select(FileAsset).where(FileAsset.file_id == file_id))
    if file_asset is None:
        raise HTTPException(status_code=404, detail=f"Uploaded file not found: {file_id}")
    return file_asset


def _create_product_image(
    db: Session,
    *,
    product_id: int,
    payload: SellerProductImageCreate,
) -> None:
    _resolve_product_file(db, payload.file_id)
    db.add(
        ProductImage(
            product_id=product_id,
            file_id=payload.file_id,
            image_type="MAIN" if payload.is_main else payload.image_type,
            alt_text=payload.alt_text,
            display_order=payload.display_order,
            active_yn="Y",
        )
    )


def _create_product_file(
    db: Session,
    *,
    product_id: int,
    payload: SellerProductFileCreate,
) -> None:
    _resolve_product_file(db, payload.file_id)
    db.add(
        ProductFile(
            product_id=product_id,
            file_id=payload.file_id,
            file_category=payload.file_category,
            file_description=payload.file_description,
            display_order=payload.display_order,
        )
    )


def create_seller_product(db: Session, current_user: UserSummary, payload: SellerProductCreate) -> SellerProductCreateResponse:
    if not payload.variants:
        raise HTTPException(status_code=400, detail="At least one product variant is required.")

    category = db.scalar(select(Category).where(Category.category_id == payload.category_id, Category.active_yn == "Y"))
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found.")

    product_code = payload.product_code or f"P{datetime.now(UTC):%Y%m%d}{uuid4().hex[:4].upper()}"
    product = Product(
        seller_user_id=current_user.user_id,
        category_id=payload.category_id,
        product_code=product_code,
        product_name=payload.product_name,
        short_description=payload.short_description,
        description=payload.description,
        regular_price=Decimal(str(payload.regular_price)),
        sale_price=Decimal(str(payload.sale_price)),
        product_status=payload.product_status,
    )
    db.add(product)
    db.flush()

    created_image_count = 0
    created_file_count = 0

    image_payloads = list(payload.images)
    if image_payloads and not any(item.is_main or item.image_type == "MAIN" for item in image_payloads):
        first_image = image_payloads[0].model_copy(update={"is_main": True, "image_type": "MAIN"})
        image_payloads[0] = first_image

    for image_input in image_payloads:
        _create_product_image(db, product_id=product.product_id, payload=image_input)
        created_image_count += 1

    if payload.image_url:
        file_asset = FileAsset(
            org_id=current_user.org.org_id if current_user.org else None,
            file_type="IMAGE",
            storage_type="URL",
            original_file_name=f"{product_code}.jpg",
            public_url=payload.image_url,
            thumbnail_url=payload.thumbnail_url or payload.image_url,
        )
        db.add(file_asset)
        db.flush()
        db.add(
            ProductImage(
                product_id=product.product_id,
                file_id=file_asset.file_id,
                image_type="MAIN",
                alt_text=payload.product_name,
                display_order=1,
                active_yn="Y",
            )
        )
        created_image_count += 1

    for file_input in payload.files:
        _create_product_file(db, product_id=product.product_id, payload=file_input)
        created_file_count += 1

    is_admin = "ADMIN" in current_user.roles
    created_variant_count = 0
    for variant_input in payload.variants:
        if variant_input.org_id and not is_admin:
            if not current_user.org or variant_input.org_id != current_user.org.org_id:
                raise HTTPException(status_code=403, detail="지점 판매자는 본인 지점 재고만 등록할 수 있습니다.")

        target_org_id = variant_input.org_id or (current_user.org.org_id if current_user.org else None)
        if target_org_id is None:
            raise HTTPException(status_code=400, detail="Inventory org_id is required for each variant.")

        variant = ProductVariant(
            product_id=product.product_id,
            sku_code=variant_input.sku_code,
            option_name1=variant_input.option_name1,
            option_value1=variant_input.option_value1,
            option_name2=variant_input.option_name2,
            option_value2=variant_input.option_value2,
            additional_price=Decimal(str(variant_input.additional_price)),
            active_yn="Y",
        )
        db.add(variant)
        db.flush()

        inventory = Inventory(
            org_id=target_org_id,
            variant_id=variant.variant_id,
            stock_quantity=variant_input.initial_stock,
            reserved_quantity=0,
            safety_stock=variant_input.safety_stock,
        )
        db.add(inventory)
        created_variant_count += 1

    db.commit()
    return SellerProductCreateResponse(
        product_id=product.product_id,
        product_code=product.product_code,
        created_variant_count=created_variant_count,
        created_image_count=created_image_count,
        created_file_count=created_file_count,
    )


def update_seller_product_status(db: Session, seller_user_id: int, product_id: int, product_status: str) -> dict:
    product = db.scalar(select(Product).where(Product.product_id == product_id, Product.seller_user_id == seller_user_id))
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found.")
    product.product_status = product_status
    db.commit()
    return {"product_id": product.product_id, "product_status": product.product_status}
