from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import addresses, auth, categories, orders, products, refunds

settings = get_settings()

app = FastAPI(title="React Baseason Shop API")

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


@app.get("/")
def read_root():
    return {"message": "백엔드 서버가 성공적으로 작동 중입니다!"}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
