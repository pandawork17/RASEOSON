"""
[images.py - 상품 갤러리 이미지 보정 및 썸네일 생성 헬퍼]

■ 역할:
  - shopdb3jo DB의 시드 데이터 중 일부 상품은 대표 이미지가 1장뿐이거나 누락된 경우가 있습니다.
  - 고객 쇼핑몰(`react-baseason-frontend`)의 상품 상세 페이지에서는 캐러셀(슬라이드)에 최소 5장 이상의 이미지를 요구합니다.
  - 실제 DB에 등록된 이미지를 우선 사용하고, 5장이 되지 않는 경우 상품 코드를 시드(seed)로 삼아
    Lorem Picsum(https://picsum.photos)의 고화질 이미지를 고유하게 생성하여 5장을 채워줍니다.
"""

from urllib.parse import quote
from . import models

# 상품 상세 페이지에서 요구하는 최소 갤러리 이미지 개수
MIN_GALLERY_IMAGES = 5


def _placeholder_url(seed: str, size: int = 900) -> str:
    """
    상품 코드 기반 고유 시드를 이용해 Lorem Picsum에서 동일한 사진을 안정적으로 불러옵니다.
    """
    return f"https://picsum.photos/seed/{quote(seed)}/{size}/{size}"


def build_gallery(product: models.Product) -> list[str]:
    """
    상품의 전체 갤러리 이미지 URL 리스트를 구성합니다.
    1. DB에 저장된 실제 이미지 파일 URL 추출
    2. 5장 미만인 경우 나머지 슬롯을 Picsum 시드 이미지로 채움
    """
    urls: list[str] = []

    # 1. DB에 등록된 이미지 검사
    if hasattr(product, "images") and product.images:
        for image in product.images:
            if getattr(image, "active_yn", "Y") != "Y":
                continue
            file = getattr(image, "file", None)
            url = (file.public_url if file else None) or (file.thumbnail_url if file else None)
            if url and url not in urls:
                urls.append(url)

    # 2. 5장 미만일 때 시드 기반 보정 이미지 추가
    index = len(urls)
    code = getattr(product, "product_code", str(getattr(product, "product_id", "default")))
    while len(urls) < MIN_GALLERY_IMAGES:
        urls.append(_placeholder_url(f"{code}-{index}"))
        index += 1

    return urls


def build_thumbnail(product: models.Product) -> str:
    """
    상품 목록 카드 등에서 사용할 대표 썸네일 이미지 URL을 반환합니다.
    """
    gallery = build_gallery(product)
    return gallery[0] if gallery else _placeholder_url("product-default", 600)

