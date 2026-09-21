from pathlib import Path
from typing import Optional
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import text

from app.branch_routes import add_branch_routes
from app.database import engine
from app import admin_a


# ---------------------------------------------------------
# 공지사항 등록·수정에 사용할 입력 양식
# ---------------------------------------------------------
class NoticeCreate(BaseModel):
    title: str
    content: str
    author_id: int
    org_id: int
    is_pinned: str = "N"
    image: Optional[str] = None


class NoticeUpdate(BaseModel):
    title: str
    content: str
    is_pinned: str = "N"
    image: Optional[str] = None


app = FastAPI(title="SHOPDB3JO API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 서버 안에 업로드되는 공지 이미지를 저장할 폴더입니다.
UPLOAD_DIR = Path("uploads/notices")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# /uploads/... 주소로 이미지를 브라우저에서 볼 수 있게 합니다.
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

add_branch_routes(app)
app.include_router(admin_a.router)


@app.get("/")
def root():
    return {"message": "SHOPDB3JO FastAPI 서버가 실행 중입니다."}


@app.get("/api/dashboard/recent-orders")
def get_dashboard_recent_orders():
    sql = text("""
        SELECT
            o.order_id,
            o.order_no,
            u.user_name AS buyer_name,
            ou.org_name,
            o.order_status,
            o.total_amount,
            o.ordered_at,
            p.payment_method,
            p.payment_status,
            p.approved_amount
        FROM orders AS o
        LEFT JOIN users AS u ON o.buyer_user_id = u.user_id
        LEFT JOIN org_units AS ou ON o.org_id = ou.org_id
        LEFT JOIN payments AS p ON o.order_id = p.order_id
        ORDER BY o.ordered_at DESC, o.order_id DESC
        LIMIT 5
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(500, f"최근 주문·결제 현황 조회 중 오류가 발생했습니다: {error}")


# ---------------------------------------------------------
# 공지사항 목록 조회
# ---------------------------------------------------------
@app.get("/api/notices")
def get_notices():
    sql = text("""
        SELECT
            n.notice_id, n.title, n.created_at, n.updated_at,
            n.view_count, n.is_pinned, n.image,
            u.user_name AS author_name, o.org_name
        FROM notices AS n
        JOIN users AS u ON n.author_id = u.user_id
        JOIN org_units AS o ON n.org_id = o.org_id
        ORDER BY n.is_pinned DESC, n.created_at DESC, n.notice_id DESC
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(500, f"공지사항 목록 조회 중 오류가 발생했습니다: {error}")


# ---------------------------------------------------------
# 공지사항 상세 조회 + 조회수 1 증가
# ---------------------------------------------------------
@app.get("/api/notices/{notice_id}")
def get_notice_detail(notice_id: int):
    increase_sql = text("""
        UPDATE notices
        SET view_count = view_count + 1
        WHERE notice_id = :notice_id
    """)
    detail_sql = text("""
        SELECT
            n.notice_id, n.title, n.content, n.created_at, n.updated_at,
            n.view_count, n.is_pinned, n.image,
            u.user_name AS author_name, o.org_name
        FROM notices AS n
        JOIN users AS u ON n.author_id = u.user_id
        JOIN org_units AS o ON n.org_id = o.org_id
        WHERE n.notice_id = :notice_id
    """)

    try:
        with engine.begin() as connection:
            update_result = connection.execute(increase_sql, {"notice_id": notice_id})
            if update_result.rowcount == 0:
                raise HTTPException(404, "해당 공지사항을 찾을 수 없습니다.")

            result = connection.execute(detail_sql, {"notice_id": notice_id})
            return dict(result.mappings().first())
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(500, f"공지사항 상세 조회 중 오류가 발생했습니다: {error}")


# ---------------------------------------------------------
# 공지사항 이미지 파일 업로드
# 프론트에서 드래그한 이미지 파일을 받아 uploads/notices에 저장합니다.
# ---------------------------------------------------------
@app.post("/api/notices/upload-image")
async def upload_notice_image(image: UploadFile = File(...)):
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    extension = Path(image.filename or "").suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(400, "JPG, PNG, GIF, WEBP 이미지만 업로드할 수 있습니다.")

    contents = await image.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(400, "이미지 파일은 5MB 이하만 업로드할 수 있습니다.")

    filename = f"notice_{uuid4().hex}{extension}"
    save_path = UPLOAD_DIR / filename
    save_path.write_bytes(contents)

    return {
        "message": "이미지가 업로드되었습니다.",
        "image_url": f"http://127.0.0.1:8000/uploads/notices/{filename}",
    }


# ---------------------------------------------------------
# 공지사항 등록
# ---------------------------------------------------------
@app.post("/api/notices", status_code=201)
def create_notice(notice: NoticeCreate):
    is_pinned = notice.is_pinned.upper()
    if is_pinned not in ["Y", "N"]:
        raise HTTPException(400, "상단 고정 값은 Y 또는 N만 입력할 수 있습니다.")

    sql = text("""
        INSERT INTO notices (title, content, author_id, org_id, is_pinned, image)
        VALUES (:title, :content, :author_id, :org_id, :is_pinned, :image)
    """)

    try:
        with engine.begin() as connection:
            result = connection.execute(
                sql,
                {
                    "title": notice.title,
                    "content": notice.content,
                    "author_id": notice.author_id,
                    "org_id": notice.org_id,
                    "is_pinned": is_pinned,
                    "image": notice.image,
                },
            )
            return {"message": "공지사항이 등록되었습니다.", "notice_id": result.lastrowid}
    except Exception as error:
        raise HTTPException(500, f"공지사항 등록 중 오류가 발생했습니다: {error}")


# ---------------------------------------------------------
# 공지사항 수정
# ---------------------------------------------------------
@app.put("/api/notices/{notice_id}")
def update_notice(notice_id: int, notice: NoticeUpdate):
    is_pinned = notice.is_pinned.upper()
    if is_pinned not in ["Y", "N"]:
        raise HTTPException(400, "상단 고정 값은 Y 또는 N만 입력할 수 있습니다.")

    sql = text("""
        UPDATE notices
        SET
            title = :title,
            content = :content,
            is_pinned = :is_pinned,
            image = :image
        WHERE notice_id = :notice_id
    """)

    try:
        with engine.begin() as connection:
            result = connection.execute(
                sql,
                {
                    "notice_id": notice_id,
                    "title": notice.title,
                    "content": notice.content,
                    "is_pinned": is_pinned,
                    "image": notice.image,
                },
            )
            if result.rowcount == 0:
                raise HTTPException(404, "수정할 공지사항을 찾을 수 없습니다.")
            return {"message": "공지사항이 수정되었습니다."}
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(500, f"공지사항 수정 중 오류가 발생했습니다: {error}")


# ---------------------------------------------------------
# 공지사항 삭제
# ---------------------------------------------------------
@app.delete("/api/notices/{notice_id}")
def delete_notice(notice_id: int):
    sql = text("DELETE FROM notices WHERE notice_id = :notice_id")
    try:
        with engine.begin() as connection:
            result = connection.execute(sql, {"notice_id": notice_id})
            if result.rowcount == 0:
                raise HTTPException(404, "삭제할 공지사항을 찾을 수 없습니다.")
            return {"message": "공지사항이 삭제되었습니다."}
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(500, f"공지사항 삭제 중 오류가 발생했습니다: {error}")


# ---------------------------------------------------------
# 상품 목록 조회
# shopdb3jo의 products 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/products")
def get_products():
    sql = text("""
        SELECT *
        FROM products
        ORDER BY product_id
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"상품 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 주문 목록 조회
# shopdb3jo의 orders 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/orders")
def get_orders():
    sql = text("""
        SELECT *
        FROM orders
        ORDER BY order_id
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"주문 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 주문 상세 목록 조회
# shopdb3jo의 order_items 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/order-items")
def get_order_items():
    sql = text("""
        SELECT *
        FROM order_items
        ORDER BY order_item_id
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"주문 상세 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 결제 목록 조회
# shopdb3jo의 payments 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/payments")
def get_payments():
    sql = text("""
        SELECT *
        FROM payments
        ORDER BY payment_id
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"결제 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 결제 거래 내역 조회
# shopdb3jo의 payment_transactions 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/payment-transactions")
def get_payment_transactions():
    sql = text("""
        SELECT *
        FROM payment_transactions
        ORDER BY transaction_id
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"결제 거래 내역 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 결제 웹훅 이벤트 목록 조회
# shopdb3jo의 payment_webhook_events 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/payment-webhook-events")
def get_payment_webhook_events():
    sql = text("""
        SELECT *
        FROM payment_webhook_events
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"결제 웹훅 이벤트 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 환불 정책 목록 조회
# shopdb3jo의 refund_policies 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/refund-policies")
def get_refund_policies():
    sql = text("""
        SELECT *
        FROM refund_policies
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"환불 정책 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 환불 요청 목록 조회
# shopdb3jo의 refund_requests 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/refund-requests")
def get_refund_requests():
    sql = text("""
        SELECT *
        FROM refund_requests
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"환불 요청 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 환불 상품 상세 목록 조회
# shopdb3jo의 refund_items 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/refund-items")
def get_refund_items():
    sql = text("""
        SELECT *
        FROM refund_items
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"환불 상품 상세 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 구매자 문의 목록 조회
# shopdb3jo의 buyer_inquiries 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/buyer-inquiries")
def get_buyer_inquiries():
    sql = text("""
        SELECT *
        FROM buyer_inquiries
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"구매자 문의 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 구매자 문의 첨부파일 목록 조회
# shopdb3jo의 inquiry_files 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/inquiry-files")
def get_inquiry_files():
    sql = text("""
        SELECT *
        FROM inquiry_files
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"문의 첨부파일 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 회사 정책 목록 조회
# shopdb3jo의 company_policies 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/company-policies")
def get_company_policies():
    sql = text("""
        SELECT *
        FROM company_policies
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"회사 정책 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 회사 정책 첨부파일 목록 조회
# shopdb3jo의 policy_files 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/policy-files")
def get_policy_files():
    sql = text("""
        SELECT *
        FROM policy_files
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"회사 정책 첨부파일 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 카테고리 목록 조회
# shopdb3jo의 categories 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/categories")
def get_categories():
    sql = text("""
        SELECT *
        FROM categories
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"카테고리 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 상품 옵션(Variant) 목록 조회
# shopdb3jo의 product_variants 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/product-variants")
def get_product_variants():
    sql = text("""
        SELECT *
        FROM product_variants
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"상품 옵션 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 재고 목록 조회
# shopdb3jo의 inventories 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/inventories")
def get_inventories():
    sql = text("""
        SELECT *
        FROM inventories
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"재고 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 파일 자산 목록 조회
# shopdb3jo의 file_assets 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/file-assets")
def get_file_assets():
    sql = text("""
        SELECT *
        FROM file_assets
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"파일 자산 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 상품 이미지 목록 조회
# shopdb3jo의 product_images 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/product-images")
def get_product_images():
    sql = text("""
        SELECT *
        FROM product_images
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"상품 이미지 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# 상품 첨부파일 목록 조회
# shopdb3jo의 product_files 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/product-files")
def get_product_files():
    sql = text("""
        SELECT *
        FROM product_files
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"상품 첨부파일 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# AI 제공자 목록 조회
# shopdb3jo의 ai_providers 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/ai-providers")
def get_ai_providers():
    sql = text("""
        SELECT *
        FROM ai_providers
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"AI 제공자 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# RAG 문서 목록 조회
# shopdb3jo의 rag_documents 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/rag-documents")
def get_rag_documents():
    sql = text("""
        SELECT *
        FROM rag_documents
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"RAG 문서 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# RAG 문서 첨부파일 목록 조회
# shopdb3jo의 rag_document_files 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/rag-document-files")
def get_rag_document_files():
    sql = text("""
        SELECT *
        FROM rag_document_files
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"RAG 문서 첨부파일 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# RAG 청크 목록 조회
# shopdb3jo의 rag_chunks 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/rag-chunks")
def get_rag_chunks():
    sql = text("""
        SELECT *
        FROM rag_chunks
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"RAG 청크 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# RAG 임베딩 목록 조회
# shopdb3jo의 rag_embeddings 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/rag-embeddings")
def get_rag_embeddings():
    sql = text("""
        SELECT *
        FROM rag_embeddings
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"RAG 임베딩 목록 조회 중 오류가 발생했습니다: {error}"
        )
    # ---------------------------------------------------------
# RAG 질의 로그 목록 조회
# shopdb3jo의 rag_query_logs 테이블 실제 데이터를 조회합니다.
# ---------------------------------------------------------
@app.get("/api/rag-query-logs")
def get_rag_query_logs():
    sql = text("""
        SELECT *
        FROM rag_query_logs
    """)

    try:
        with engine.connect() as connection:
            result = connection.execute(sql)
            return [dict(row) for row in result.mappings().all()]
    except Exception as error:
        raise HTTPException(
            500,
            f"RAG 질의 로그 목록 조회 중 오류가 발생했습니다: {error}"
        )