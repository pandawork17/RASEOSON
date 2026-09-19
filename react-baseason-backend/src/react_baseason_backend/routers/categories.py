from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    rows = db.execute(
        select(models.Category)
        .where(models.Category.active_yn == "Y")
        .order_by(models.Category.category_level, models.Category.display_order)
    ).scalars().all()
    return [schemas.CategoryOut.model_validate(row) for row in rows]
