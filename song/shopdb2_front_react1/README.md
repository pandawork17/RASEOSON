# shopdb2 React frontend

`shopdb2` FastAPI 백엔드와 연결되는 역할별 React 프론트엔드입니다.

## 실행 방법

1단계) 백엔드를 먼저 실행합니다.

- 백엔드 경로: `C:\leehyoungyeol\05_shopdb2_front_back\shopdb2_backend_uv_fastapi1`
- 백엔드 문서: `http://127.0.0.1:8000/docs`

2단계) 프론트엔드를 실행합니다.

```powershell
cd C:\leehyoungyeol\05_shopdb2_front_back\shopdb2_front_react1
.\run_frontend.cmd
```

3단계) 아래 주소로 접속합니다.

- 메인: `http://127.0.0.1:4173`
- 구매자 쇼핑몰: `http://127.0.0.1:4173/buyershop`
- 본사 원본 데이터 관리: `http://127.0.0.1:4173/dbAdmin`

4단계) 구매자 실결제를 테스트하려면 백엔드 `.env`에 Toss 키를 넣습니다.

```env
FRONTEND_BASE_URL=http://127.0.0.1:4173
TOSS_PAYMENTS_CLIENT_KEY=test_gck_...
TOSS_PAYMENTS_SECRET_KEY=test_gsk_...
```

5단계) PowerShell에서 `npm` 실행 문제가 있으면 아래 명령을 사용합니다.

```powershell
npm.cmd install
npm.cmd run dev
```

## 화면 구성

- 본사관리자 화면
- 지점관리자 화면
- 구매자 쇼핑몰 화면
- 구매자 상세 주문/배송/결제 단계 화면
- 본사 `dbAdmin` 전체 테이블 CRUD 화면
