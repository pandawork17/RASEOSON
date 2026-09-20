from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
import models
from database import get_db, engine

# DB 테이블 동기화
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SHOPDB 3조 API",
    version="1.0.0",
    description="판매자 프로필, 카테고리, 상품 마스터, 상품 옵션 및 이미지, 지점별 재고 API"
)

# CORS 설정
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PriceUpdateRequest(BaseModel):
    sale_price: float

@app.get("/", tags=["default"])
def root():
    return {"message": "SHOPDB 3조 API Server is running!"}

@app.get("/health/db", tags=["default"])
def database_health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

@app.get("/api/products/categories", tags=["상품 및 카테고리"])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@app.get("/api/products", tags=["상품 및 카테고리"])
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

@app.get("/api/products/{product_id}", tags=["상품 및 카테고리"])
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    variants = db.query(models.ProductVariant).filter(models.ProductVariant.product_id == product_id).all()
    return {"product": product, "variants": variants}

@app.get("/api/branches", tags=["조직"])
def get_branches(db: Session = Depends(get_db)):
    branches = db.query(models.OrgUnit).filter(models.OrgUnit.org_type == 'BRANCH').all()
    return branches

@app.get("/api/branches/{org_id}/inventory", tags=["지점별 재고"])
def get_branch_inventory(org_id: int, db: Session = Depends(get_db)):
    results = (
        db.query(
            models.Product.product_id,
            models.Product.product_code,
            models.Product.product_name,
            models.Product.regular_price,
            models.Product.sale_price,
            models.Product.created_at,
            models.Inventory.stock_quantity,
            models.Inventory.safety_stock
        )
        .join(models.ProductVariant, models.Product.product_id == models.ProductVariant.product_id)
        .join(models.Inventory, models.Inventory.variant_id == models.ProductVariant.variant_id)
        .filter(models.Inventory.org_id == org_id)
        .all()
    )

    items = []
    for r in results:
        # 💡 추가: 정상가와 판매가를 가져와 할인율(%) 자동 계산 로직
        reg_price = float(r.regular_price) if r.regular_price else 0
        sale_price = float(r.sale_price) if r.sale_price else 0
        discount_rate = 0
        
        if reg_price > 0 and sale_price > 0:
            discount_rate = round(((reg_price - sale_price) / reg_price) * 100)

        items.append({
            "id": r.product_id,
            "productCode": r.product_code,
            "name": r.product_name,
            "regularPrice": reg_price,
            "salePrice": sale_price,
            "discountRate": discount_rate, # 💡 프론트엔드로 전달될 할인율 데이터
            "stock": r.stock_quantity,
            "safetyStock": r.safety_stock,
            "uploadDate": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else ""
        })
    return items

@app.put("/api/products/{product_id}/price", tags=["상품 및 카테고리"])
def update_product_price(product_id: int, req: PriceUpdateRequest, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
    
    product.sale_price = req.sale_price
    db.commit()
    db.refresh(product)
    return {"message": "판매가가 성공적으로 변경되었습니다.", "sale_price": float(product.sale_price)}

@app.get("/api/notices", tags=["본사 공지사항"])
def get_notices(db: Session = Depends(get_db)):
    sql = text("""
        SELECT n.notice_id, n.title, n.content, n.is_pinned, 
               DATE_FORMAT(n.created_at, '%Y-%m-%d %H:%i') as created_at, 
               n.view_count, u.user_name as author_name, n.image
        FROM notices n
        JOIN users u ON n.author_id = u.user_id
        ORDER BY n.is_pinned DESC, n.created_at DESC
    """)
    return db.execute(sql).mappings().all()

@app.get("/api/branches/{org_id}/orders", tags=["고객 주문 관리"])
def get_branch_orders(org_id: int, db: Session = Depends(get_db)):
    sql = text("""
        SELECT 
            o.order_no as orderNo, 
            (SELECT p.product_name FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_id = o.order_id LIMIT 1) as product,
            (SELECT SUM(quantity) FROM order_items WHERE order_id = o.order_id) as qty,
            u.user_name as buyer,
            o.receiver_phone, o.zipcode, o.shipping_address1, o.shipping_address2,
            DATE_FORMAT(o.ordered_at, '%Y-%m-%d %H:%i') as ordered_at,
            CASE o.process_status 
                WHEN '1)결제대기' THEN '결제대기'
                WHEN '2)결제완료' THEN '결제 완료'
                WHEN '3)배송전' THEN '배송준비중'
                WHEN '7)배송중' THEN '배송중'
                WHEN '10)반품환불완료' THEN '환불 처리 완료'
                ELSE o.process_status END as status
        FROM orders o
        JOIN users u ON o.buyer_user_id = u.user_id
        WHERE o.org_id = :org_id
        ORDER BY o.ordered_at DESC
    """)
    return db.execute(sql, {"org_id": org_id}).mappings().all()

@app.get("/api/branches/{org_id}/inquiries", tags=["고객 문의 관리"])
def get_branch_inquiries(org_id: int, db: Session = Depends(get_db)):
    sql = text("""
        SELECT i.inquiry_id as id, u.user_name as author, u.login_id as userId, 
               i.category_code as type, 
               i.title, i.content, 
               CASE WHEN i.inquiry_status = 'ANSWERED' THEN '답변완료' ELSE '미답변' END as status,
               DATE_FORMAT(i.created_at, '%Y-%m-%d') as date,
               IFNULL(i.answer_content, '') as reply
        FROM buyer_inquiries i
        JOIN users u ON i.user_id = u.user_id
        WHERE i.org_id = :org_id
        ORDER BY i.created_at DESC
    """)
    return db.execute(sql, {"org_id": org_id}).mappings().all()

@app.get("/api/hq/products", tags=["본사 상품 발주"])
def get_hq_products(db: Session = Depends(get_db)):
    sql = text("""
        SELECT p.product_id as id, p.product_code as code, 
               CONCAT('[본사] ', p.product_name) as name, 
               p.regular_price * 0.6 as wholesalePrice, 
               DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i') as uploadDate
        FROM products p
        WHERE p.org_id = 1
        ORDER BY p.created_at DESC
    """)
    return db.execute(sql).mappings().all()