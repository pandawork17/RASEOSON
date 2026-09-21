# shopdb2 FastAPI backend

`shopdb2` MySQL schema를 사용하는 FastAPI 백엔드입니다.

## 실행 방법

1단계) MySQL이 실행 중인지 확인합니다.

- 기본 `.env` 기준 DB 정보: `127.0.0.1:3306 / shopdb2 / shopdbid2 / shopdbid2`

2단계) Toss 실결제를 사용할 경우 `.env`에 키를 입력합니다.

```env
FRONTEND_BASE_URL=http://127.0.0.1:4173
TOSS_PAYMENTS_CLIENT_KEY=test_gck_...
TOSS_PAYMENTS_SECRET_KEY=test_gsk_...
```

3단계) 백엔드를 실행합니다.

```powershell
cd C:\leehyoungyeol\05_shopdb2_front_back\shopdb2_backend_uv_fastapi1
.\run_backend.cmd
```

4단계) 아래 주소가 열리면 정상입니다.

- Swagger: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`

5단계) 구매자 결제 흐름 확인 API입니다.

- 주문 초안 생성: `POST /api/v1/buyer/orders`
- Toss 승인 완료 처리: `POST /api/v1/buyer/payments/toss/confirm`
- Toss 실패/취소 처리: `POST /api/v1/buyer/payments/toss/fail`

## Windows fallback

`uv sync`가 Windows application control policy 때문에 `.venv\Scripts\python.exe`에서 `os error 4551`로 실패하면 프로젝트 `.venv` 대신 신뢰된 Python 경로로 실행합니다.

```powershell
cd C:\leehyoungyeol\05_shopdb2_front_back\shopdb2_backend_uv_fastapi1
.\run_backend.cmd
```

직접 실행할 경우:

```powershell
& "C:\Users\PC\.pyenv\pyenv-win\versions\3.12.4\python.exe" -m pip install --upgrade pip
& "C:\Users\PC\.pyenv\pyenv-win\versions\3.12.4\python.exe" -m pip install -r requirements.txt
& "C:\Users\PC\.pyenv\pyenv-win\versions\3.12.4\python.exe" -m uvicorn app.main:app --reload
```

## Sample logins

- `admin01 / admin01`
- `seller01 / seller01`
- `seller02 / seller02`
- `buyer01 / buyer01`
- `buyer02 / buyer02`
- `buyer03 / buyer03`
