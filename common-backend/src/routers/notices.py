"""
[notices.py - 공지사항 통합 라우터 (조회, 등록, 수정, 삭제, 이미지 업로드)]

■ 역할:
  - an(고객몰), park(지사관리), song(본사관리) 3개 프로젝트의 공지사항 기능을 하나로 통합했습니다.
  - 공개 조회: 상단 고정(is_pinned='Y') 우선 정렬, 조회수(view_count) 1 증가 상세 조회.
  - 본사 관리(song): 공지 첨부 이미지 드래그앤드롭 업로드(/api/notices/upload-image) 및 공지 CRUD(등록/수정/삭제).
  - 지사 관리(park) 호환: 프론트엔드가 `/api/branch/notices`를 호출해도 정상 응답하도록 별칭 라우트 등록.
"""

from pathlib import Path
from typing import Optional, List
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["notices"])

# 공지사항 이미지 저장소
UPLOAD_DIR = Path("uploads/notices")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# =========================================================
# 1. 공지사항 목록 조회 (다중 라우트 지원)
# =========================================================
@router.get("/api/notices", summary="공지사항 목록 조회 (표준)")
@router.get("/api/branch/notices", summary="지사 공지사항 목록 조회 (호환용)")
def get_notices(db: Session = Depends(get_db)):
    """
    공지사항 목록 조회
    - 상단 고정(is_pinned='Y') 우선, 최신 등록일 순 정렬
    - 작성자 이름(author_name) 및 조직명(org_name) 함께 조인
    """
    sql = text("""
        SELECT
            n.notice_id,
            n.title,
            n.content,
            n.is_pinned,
            DATE_FORMAT(n.created_at, '%Y-%m-%d %H:%i') as created_at,
            DATE_FORMAT(n.updated_at, '%Y-%m-%d %H:%i') as updated_at,
            n.view_count,
            n.image,
            n.author_id,
            u.user_name as author_name,
            COALESCE(ou.org_name, '본사') as org_name
        FROM notices n
        LEFT JOIN users u ON n.author_id = u.user_id
        LEFT JOIN org_units ou ON n.org_id = ou.org_id
        ORDER BY n.is_pinned DESC, n.created_at DESC, n.notice_id DESC
    """)
    result = db.execute(sql)
    return [dict(row) for row in result.mappings().all()]


# =========================================================
# 2. 공지사항 상세 조회 (조회수 1 증가)
# =========================================================
@router.get("/api/notices/{notice_id}", summary="공지사항 상세 조회")
def get_notice_detail(notice_id: int, db: Session = Depends(get_db)):
    """
    공지사항 상세 조회 시 조회수(view_count)를 1 증가시키고 상세 정보를 반환합니다.
    """
    # 1. 조회수 1 증가
    increase_sql = text("UPDATE notices SET view_count = view_count + 1 WHERE notice_id = :notice_id")
    update_res = db.execute(increase_sql, {"notice_id": notice_id})
    if update_res.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="해당 공지사항을 찾을 수 없습니다.")

    # 2. 상세 정보 조회
    detail_sql = text("""
        SELECT
            n.notice_id,
            n.title,
            n.content,
            n.is_pinned,
            DATE_FORMAT(n.created_at, '%Y-%m-%d %H:%i') as created_at,
            DATE_FORMAT(n.updated_at, '%Y-%m-%d %H:%i') as updated_at,
            n.view_count,
            n.image,
            n.author_id,
            u.user_name as author_name,
            COALESCE(ou.org_name, '본사') as org_name
        FROM notices n
        LEFT JOIN users u ON n.author_id = u.user_id
        LEFT JOIN org_units ou ON n.org_id = ou.org_id
        WHERE n.notice_id = :notice_id
    """)
    row = db.execute(detail_sql, {"notice_id": notice_id}).mappings().first()
    db.commit()
    return dict(row)


# =========================================================
# 3. 공지사항 이미지 업로드 (song)
# =========================================================
@router.post("/api/notices/upload-image", summary="공지사항 이미지 파일 업로드")
async def upload_notice_image(image: UploadFile = File(...)):
    """
    본사 관리자 화면에서 드래그/선택한 이미지를 uploads/notices/ 에 저장하고 정적 접근 URL을 반환합니다.
    """
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    extension = Path(image.filename or "").suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="JPG, PNG, GIF, WEBP 이미지만 업로드할 수 있습니다.")

    contents = await image.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="이미지 파일은 5MB 이하만 업로드할 수 있습니다.")

    filename = f"notice_{uuid4().hex}{extension}"
    save_path = UPLOAD_DIR / filename
    save_path.write_bytes(contents)

    # 정적 서빙 경로 반환
    return {
        "message": "이미지가 업로드되었습니다.",
        "image_url": f"/uploads/notices/{filename}",
    }


# =========================================================
# 4. 공지사항 등록 (song)
# =========================================================
@router.post("/api/notices", status_code=status.HTTP_201_CREATED, summary="공지사항 등록")
def create_notice(notice: schemas.NoticeCreate, db: Session = Depends(get_db)):
    is_pinned = notice.is_pinned.upper()
    if is_pinned not in ["Y", "N"]:
        raise HTTPException(status_code=400, detail="상단 고정 값은 Y 또는 N만 입력할 수 있습니다.")

    sql = text("""
        INSERT INTO notices (title, content, author_id, org_id, is_pinned, image)
        VALUES (:title, :content, :author_id, :org_id, :is_pinned, :image)
    """)
    result = db.execute(
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
    db.commit()
    return {"message": "공지사항이 등록되었습니다.", "notice_id": result.lastrowid}


# =========================================================
# 5. 공지사항 수정 (song)
# =========================================================
@router.put("/api/notices/{notice_id}", summary="공지사항 수정")
def update_notice(notice_id: int, notice: schemas.NoticeUpdate, db: Session = Depends(get_db)):
    is_pinned = notice.is_pinned.upper()
    if is_pinned not in ["Y", "N"]:
        raise HTTPException(status_code=400, detail="상단 고정 값은 Y 또는 N만 입력할 수 있습니다.")

    sql = text("""
        UPDATE notices
        SET
            title = :title,
            content = :content,
            is_pinned = :is_pinned,
            image = :image
        WHERE notice_id = :notice_id
    """)
    result = db.execute(
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
        raise HTTPException(status_code=404, detail="수정할 공지사항을 찾을 수 없습니다.")
    db.commit()
    return {"message": "공지사항이 수정되었습니다."}


# =========================================================
# 6. 공지사항 삭제 (song)
# =========================================================
@router.delete("/api/notices/{notice_id}", summary="공지사항 삭제")
def delete_notice(notice_id: int, db: Session = Depends(get_db)):
    sql = text("DELETE FROM notices WHERE notice_id = :notice_id")
    result = db.execute(sql, {"notice_id": notice_id})
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="삭제할 공지사항을 찾을 수 없습니다.")
    db.commit()
    return {"message": "공지사항이 삭제되었습니다."}

