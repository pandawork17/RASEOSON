import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/notices", tags=["notices"])


@router.get("", response_model=list[schemas.NoticeOut])
def list_notices(db: Session = Depends(get_db)):
    rows = (
        db.execute(
            select(models.Notice)
            .options(joinedload(models.Notice.author))
            .order_by(models.Notice.is_pinned.desc(), models.Notice.notice_id.desc())
        )
        .scalars()
        .all()
    )

    result = []
    for r in rows:
        author_name = r.author.user_name if r.author else "관리자"
        result.append(
            schemas.NoticeOut(
                notice_id=r.notice_id,
                title=r.title,
                content=r.content,
                author_id=r.author_id,
                author_name=author_name,
                created_at=r.created_at,
                updated_at=r.updated_at,
                view_count=r.view_count or 0,
                is_pinned=r.is_pinned or "N",
                image=r.image,
            )
        )
    return result


@router.get("/{notice_id}", response_model=schemas.NoticeOut)
def get_notice(notice_id: int, db: Session = Depends(get_db)):
    notice = (
        db.execute(
            select(models.Notice)
            .options(joinedload(models.Notice.author))
            .where(models.Notice.notice_id == notice_id)
        )
        .scalars()
        .first()
    )
    if not notice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 공지사항을 찾을 수 없습니다.",
        )

    # 조회수 1 증가
    notice.view_count = (notice.view_count or 0) + 1
    db.commit()
    db.refresh(notice)

    author_name = notice.author.user_name if notice.author else "관리자"
    return schemas.NoticeOut(
        notice_id=notice.notice_id,
        title=notice.title,
        content=notice.content,
        author_id=notice.author_id,
        author_name=author_name,
        created_at=notice.created_at,
        updated_at=notice.updated_at,
        view_count=notice.view_count or 0,
        is_pinned=notice.is_pinned or "N",
        image=notice.image,
    )

