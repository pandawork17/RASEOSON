from __future__ import annotations

from decimal import Decimal

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from app.db.models import (
    Category,
    FileAsset,
    Inventory,
    OrgUnit,
    Product,
    ProductFile,
    ProductImage,
    ProductVariant,
    SellerProfile,
    User,
)
from app.schemas.common import (
    CategorySummary,
    ProductCard,
    ProductDetail,
    ProductFileItem,
    ProductImageItem,
    UserSummary,
    VariantInventoryItem,
)


def money(value: Decimal | None) -> float:
    return float(value or 0)


def discount_rate(regular_price: Decimal, sale_price: Decimal) -> int:
    if not regular_price:
        return 0
    return int(round(((regular_price - sale_price) / regular_price) * 100))


def list_product_cards(
    db: Session,
    *,
    search: str = "",
    category_id: int | None = None,
    product_status: str | None = None,
    seller_user_id: int | None = None,
    public_only: bool = False,
) -> list[ProductCard]:
    stmt = (
        select(
            Product,
            Category.category_name,
            User.user_name,
            SellerProfile.company_name,
            FileAsset.public_url,
            FileAsset.thumbnail_url,
        )
        .join(Category, Category.category_id == Product.category_id)
        .join(User, User.user_id == Product.seller_user_id)
        .outerjoin(SellerProfile, SellerProfile.user_id == User.user_id)
        .outerjoin(
            ProductImage,
            and_(
                ProductImage.product_id == Product.product_id,
                ProductImage.image_type == "MAIN",
                ProductImage.active_yn == "Y",
            ),
        )
        .outerjoin(FileAsset, FileAsset.file_id == ProductImage.file_id)
        .order_by(Product.created_at.desc(), Product.product_id.desc())
    )

    if public_only:
        stmt = stmt.where(Product.product_status.in_(("SALE", "READY")))
    elif product_status and product_status != "ALL":
        stmt = stmt.where(Product.product_status == product_status)

    if seller_user_id is not None:
        stmt = stmt.where(Product.seller_user_id == seller_user_id)

    if category_id is not None:
        stmt = stmt.where(Product.category_id == category_id)

    normalized = search.strip().lower()
    if normalized:
        pattern = f"%{normalized}%"
        stmt = stmt.where(
            or_(
                func.lower(Product.product_code).like(pattern),
                func.lower(Product.product_name).like(pattern),
                func.lower(Category.category_name).like(pattern),
                func.lower(User.user_name).like(pattern),
                func.lower(func.coalesce(SellerProfile.company_name, "")).like(pattern),
            )
        )

    items: list[ProductCard] = []
    for product, category_name, seller_name, company_name, public_url, thumbnail_url in db.execute(stmt).all():
        items.append(
            ProductCard(
                product_id=product.product_id,
                product_code=product.product_code,
                product_name=product.product_name,
                category_name=category_name,
                seller_name=seller_name,
                seller_company=company_name,
                regular_price=money(product.regular_price),
                sale_price=money(product.sale_price),
                discount_rate=discount_rate(product.regular_price, product.sale_price),
                image_url=public_url,
                thumbnail_url=thumbnail_url,
                product_status=product.product_status,
                created_at=product.created_at,
            )
        )
    return items


def list_catalog_products(db: Session, *, search: str = "", category_id: int | None = None) -> list[ProductCard]:
    return list_product_cards(db, search=search, category_id=category_id, public_only=True)


def get_product_detail(db: Session, product_id: int) -> ProductDetail | None:
    header_stmt = (
        select(
            Product,
            Category.category_name,
            User.user_name,
            SellerProfile.company_name,
        )
        .join(Category, Category.category_id == Product.category_id)
        .join(User, User.user_id == Product.seller_user_id)
        .outerjoin(SellerProfile, SellerProfile.user_id == User.user_id)
        .where(Product.product_id == product_id)
    )
    header = db.execute(header_stmt).first()
    if header is None:
        return None

    product, category_name, seller_name, company_name = header

    image_stmt = (
        select(ProductImage, FileAsset.public_url, FileAsset.thumbnail_url)
        .join(FileAsset, FileAsset.file_id == ProductImage.file_id)
        .where(ProductImage.product_id == product_id, ProductImage.active_yn == "Y")
        .order_by(ProductImage.display_order.asc(), ProductImage.product_image_id.asc())
    )
    images = [
        ProductImageItem(
            product_image_id=image.product_image_id,
            image_type=image.image_type,
            alt_text=image.alt_text,
            display_order=image.display_order,
            image_url=public_url,
            thumbnail_url=thumbnail_url,
        )
        for image, public_url, thumbnail_url in db.execute(image_stmt).all()
    ]

    file_stmt = (
        select(ProductFile, FileAsset)
        .join(FileAsset, FileAsset.file_id == ProductFile.file_id)
        .where(ProductFile.product_id == product_id)
        .order_by(ProductFile.display_order.asc(), ProductFile.product_file_id.asc())
    )
    files = [
        ProductFileItem(
            product_file_id=product_file.product_file_id,
            file_id=file_asset.file_id,
            file_category=product_file.file_category,
            file_description=product_file.file_description,
            display_order=product_file.display_order,
            original_file_name=file_asset.original_file_name,
            mime_type=file_asset.mime_type,
            public_url=file_asset.public_url,
            created_at=product_file.created_at,
        )
        for product_file, file_asset in db.execute(file_stmt).all()
    ]

    variant_stmt = (
        select(ProductVariant, Inventory, OrgUnit.org_name)
        .outerjoin(Inventory, Inventory.variant_id == ProductVariant.variant_id)
        .outerjoin(OrgUnit, OrgUnit.org_id == Inventory.org_id)
        .where(ProductVariant.product_id == product_id, ProductVariant.active_yn == "Y")
        .order_by(ProductVariant.variant_id.asc(), Inventory.org_id.asc())
    )
    variants = [
        VariantInventoryItem(
            variant_id=variant.variant_id,
            sku_code=variant.sku_code,
            option_name1=variant.option_name1,
            option_value1=variant.option_value1,
            option_name2=variant.option_name2,
            option_value2=variant.option_value2,
            additional_price=money(variant.additional_price),
            org_id=inventory.org_id if inventory else None,
            org_name=org_name,
            stock_quantity=inventory.stock_quantity if inventory else 0,
            reserved_quantity=inventory.reserved_quantity if inventory else 0,
            safety_stock=inventory.safety_stock if inventory else 0,
            available_quantity=(inventory.stock_quantity - inventory.reserved_quantity) if inventory else 0,
        )
        for variant, inventory, org_name in db.execute(variant_stmt).all()
    ]

    return ProductDetail(
        product_id=product.product_id,
        product_code=product.product_code,
        product_name=product.product_name,
        short_description=product.short_description,
        description=product.description,
        category_name=category_name,
        seller_name=seller_name,
        seller_company=company_name,
        regular_price=money(product.regular_price),
        sale_price=money(product.sale_price),
        discount_rate=discount_rate(product.regular_price, product.sale_price),
        product_status=product.product_status,
        images=images,
        files=files,
        variants=variants,
    )


def get_bootstrap_data(db: Session, current_user: UserSummary) -> dict:
    categories = [
        CategorySummary(
            category_id=item.category_id,
            category_name=item.category_name,
            category_level=item.category_level,
            parent_category_id=item.parent_category_id,
        )
        for item in db.scalars(select(Category).where(Category.active_yn == "Y").order_by(Category.display_order, Category.category_id))
    ]
    return {
        "user": current_user.model_dump(),
        "categories": [category.model_dump() for category in categories],
        "catalog": [item.model_dump() for item in list_catalog_products(db)],
    }
