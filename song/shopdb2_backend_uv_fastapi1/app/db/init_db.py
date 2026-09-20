from pathlib import Path

from app.core.config import settings
from app.db.base import Base
from app.db.models import BuyerInquiry, FileAsset, InquiryFile
from app.db.session import engine


def ensure_runtime_schema() -> None:
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine, tables=[FileAsset.__table__, BuyerInquiry.__table__, InquiryFile.__table__])
