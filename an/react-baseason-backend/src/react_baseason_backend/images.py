"""Product gallery helpers.

Several seed products only have a single main image in the database.
The storefront must show at least MIN_GALLERY_IMAGES pictures per product,
so we pad out the gallery with deterministic, real photos from Lorem Picsum
(https://picsum.photos) keyed off the product code. Real DB images always
come first; generated ones only fill the remaining slots.
"""

from urllib.parse import quote

from . import models

MIN_GALLERY_IMAGES = 5


def _placeholder_url(seed: str, size: int = 900) -> str:
    return f"https://picsum.photos/seed/{quote(seed)}/{size}/{size}"


def build_gallery(product: models.Product) -> list[str]:
    urls: list[str] = []
    for image in product.images:
        if image.active_yn != "Y":
            continue
        file = image.file
        url = (file.public_url if file else None) or (file.thumbnail_url if file else None)
        if url and url not in urls:
            urls.append(url)

    index = len(urls)
    while len(urls) < MIN_GALLERY_IMAGES:
        urls.append(_placeholder_url(f"{product.product_code}-{index}"))
        index += 1

    return urls


def build_thumbnail(product: models.Product) -> str:
    gallery = build_gallery(product)
    return gallery[0]
