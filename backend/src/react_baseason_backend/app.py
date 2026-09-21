import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .routers import addresses, auth, branch, categories, inquiries, notices, orders, products, refunds

settings = get_settings()

app = FastAPI(title="React Baseason Shop API")

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(addresses.router)
app.include_router(orders.router)
app.include_router(refunds.router)
app.include_router(notices.router)
app.include_router(inquiries.router)
app.include_router(branch.router)



@app.get("/")
def read_root():
    return {"message": "백엔드 서버가 성공적으로 작동 중입니다!"}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
