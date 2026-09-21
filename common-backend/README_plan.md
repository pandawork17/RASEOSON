# 📘 SHOPDB3JO 통합 공용 백엔드(common-backend) 개발 및 통합 정리 문서 (README1)

이 문서는 3개의 개별 프로젝트(`an`: 구매자 쇼핑몰, `park`: 지사 관리자, `song`: 본사 관리자)의 백엔드를 하나의 **단일 공용 백엔드(`common-backend`)**로 통합하면서 정리한 **아키텍처, 파일별 역할, 주요 수정 사항, 시행착오 해결 내역**을 담고 있습니다.

---

## 1. 프로젝트 통합 개요 및 역할 매핑

하나의 MySQL 데이터베이스(`shopdb3jo`)를 공유하며, 아래와 같이 3개 영역으로 분담 개발되었던 백엔드를 하나로 통합했습니다.

| 구분 | 팀원 / 폴더 | 프론트엔드 | 기존 백엔드 | 핵심 역할 및 페르소나 |
| :--- | :--- | :--- | :--- | :--- |
| **A** | **안 (an)** | `react-baseason-frontend` | `react-baseason-backend` | **쇼핑몰 고객(Buyer)**<br>- 상품 탐색/상세, 회원가입/로그인(JWT), 장바구니/주문/결제, 배송지 관리, 1:1 문의, 환불 신청 |
| **B** | **박 (park)** | `react-app-teamproject` | `backend` | **지사/지점 관리자 (Branch Admin)**<br>- 지사별 재고/안전재고 관리, 판매가 수정, 지사 접수 주문 상태 관리, 지사 배정 문의 응대, 본사 상품 발주 목록 확인 |
| **C** | **송 (song)** | `frontend` | `backend` | **본사/시스템 관리자 (HQ Admin)**<br>- 본사 대시보드(9대 요약 통계/주문 현황), 본사 공지사항 CRUD(이미지 업로드), 조직/지사 등록·수정·활성화, 회원 및 권한 관리 |

---

## 2. 통합 백엔드 디렉터리 및 파일별 역할

```
common-backend/
├── pyproject.toml              # uv 기반 34개 통합 의존성 정의 ([tool.uv] package = false 적용)
├── .python-version             # Python 3.12 고정
├── .env                        # shopdb3jo DB 설정 및 3000, 5173~5175 포트 CORS 허용
├── README1.md                  # 📖 본 통합 정리 문서
├── README2.md                  # 🚀 백엔드 및 3개 프론트엔드 실행 가이드 문서
├── INTEGRATION_MANUAL.md       # 📚 상세 기술 매뉴얼 (Before vs After 및 코드 분석)
├── uploads/                    # 공지사항(notices), 문의(inquiries) 이미지 통합 저장소
└── src/
    ├── main.py                 # FastAPI 진입점, CORS 미들웨어, /uploads 정적 서빙, 10개 라우터 등록
    ├── config.py               # pydantic-settings 기반 환경변수 검증 및 캐싱(@lru_cache)
    ├── database.py             # MySQL 커넥션 풀핑(pool_pre_ping), 30분 리사이클, get_db 세션
    ├── deps.py                 # JWT Bearer 토큰 검증 및 get_current_user 의존성 주입
    ├── security.py             # pbkdf2/bcrypt 다중 비밀번호 검증 및 JWT 발급/해독
    ├── models.py               # 현대적 Mapped[] 기반 20개 전체 테이블 통합 ORM 모델
    ├── schemas.py              # Pydantic v2 요청/응답 DTO 스키마 통합
    ├── images.py               # 상품 갤러리 이미지 5장 이상 자동 생성 보정 헬퍼
    └── routers/
        ├── auth.py             # 회원가입, 로그인, 마이페이지, 계정 삭제 (an)
        ├── categories.py       # 상품 카테고리 (다중 경로 지원) (an)
        ├── products.py         # 상품 목록/상세/검색 (가용재고 및 5장 갤러리 연동) (an)
        ├── addresses.py        # 회원 배송지 CRUD 및 기본배송지 승격 관리 (an)
        ├── orders.py           # 단일 트랜잭션 주문 생성, 재고 차감, 가상 결제 (an)
        ├── refunds.py          # 환불/반품 신청 및 내역 조회 (an)
        ├── inquiries.py        # 1:1 고객 문의, 비밀글 마스킹, Base64 이미지 업로드 (an)
        ├── notices.py          # 공지사항 목록/상세(조회수 증가) + 본사 CRUD + 이미지 업로드 (an + song)
        ├── branch.py           # 지사 재고(할인율 계산), 가격변경, 지사 주문/문의 현황 (park)
        └── admin.py            # 본사 대시보드 요약 통계(9개 지표), 지사 관리, 회원 권한 (song)
```

---

## 3. 주요 수정 사항 및 해결된 핵심 문제 (Why & How)

### 1) 지사 관리자(`park`) 프론트엔드 404 경로 불일치 완벽 해결
- **문제**: `park` 프론트엔드(`BranchAdmin.jsx`, `Home.jsx`)는 `/api/branch/branches`, `/api/branch/hq/products`, `/api/branch/branches/{id}/inventory` 등을 호출하는데, 기존 백엔드는 `/api/branches`, `/api/hq/products` 등으로 등록되어 있어 **전부 404 에러**가 발생했습니다.
- **해결**: `src/routers/branch.py`에 이중 라우트 데코레이터를 적용하여 `/api/branch/...`와 `/api/...` 양쪽 경로 모두 동일하게 200 OK로 응답하도록 처리했습니다. 프론트엔드 코드를 한 줄도 수정할 필요가 없습니다.

### 2) 본사 관리자(`song`) 대시보드 요약 통계(`/api/dashboard/summary`) 신규 구현
- **문제**: `song/frontend/src/Dashboard.jsx` 화면이 열릴 때 9가지 통계 카드를 위해 `/api/dashboard/summary`를 요청했으나 기존 백엔드에 해당 엔드포인트가 아예 없었습니다.
- **해결**: `src/routers/admin.py`에 `GET /api/dashboard/summary`를 신규 작성하여, 단일 SQL 서브쿼리로 9가지 핵심 지표(`org_count`, `user_count`, `seller_count`, `product_count`, `order_count`, `payment_count`, `refund_count`, `low_stock_count`, `unanswered_inquiry_count`)를 실시간 집계하여 반환하도록 완성했습니다.

### 3) 공지사항 기능 단일화 (`an` + `song`)
- **문제**: `an` 백엔드는 [고객용 조회수 증가 조회]만 있었고, `song` 백엔드는 [관리자용 이미지 업로드 + CRUD]가 분리되어 있었습니다.
- **해결**: `src/routers/notices.py`로 병합하여 조회 시 조회수가 1씩 증가하고, 본사 관리자 화면에서는 드래그앤드롭 이미지 업로드(`POST /api/notices/upload-image`) 및 공지 등록/수정/삭제가 한 번에 이루어지도록 통합했습니다.

### 4) CORS 다중 포트 충돌 방지
- **문제**: `an` 프론트엔드(5173), `park` 프론트엔드(3000), `song` 프론트엔드(5175)가 각기 다른 로컬 포트를 사용하여 CORS 차단 에러가 발생했습니다.
- **해결**: `.env` 및 `config.py`에서 `3000, 5173, 5174, 5175`를 기본 허용 목록으로 등록하여 3개 프론트엔드가 동시에 접속해도 에러가 발생하지 않도록 했습니다.

### 5) SQLAlchemy 2.0 현대적 ORM 모델 통일
- `models.py`에 `shopdb3jo`의 20개 전체 테이블을 현대적인 `Mapped[T] = mapped_column(...)` 타입 힌트 스타일로 통일하여 타입 안정성과 관계 매핑(`relationship`)의 완결성을 높였습니다.

---

## 4. 발생했던 시행착오 및 해결 내역 (Troubleshooting)

1. **`uv_build` 패키징 빌드 에러**:
   - `pyproject.toml`에 프로젝트 이름을 적고 `uv sync`를 실행했을 때, `src/common_backend/__init__.py`가 없다는 에러 발생.
   - ➜ `[tool.uv] package = false` 설정을 추가하여 wheel 패키징을 생략하고 순수 웹 애플리케이션으로 실행되도록 해결.
2. **`starlette.testclient` 실행 시 `httpx` 패키지 누락**:
   - 단위 테스트 실행 시 `httpx`가 필요하다는 런타임 에러 발생.
   - ➜ `uv add httpx` 명령으로 최신 버전을 의존성에 추가하여 자동화 테스트를 완료.
3. **지사 관리자 프론트엔드의 카멜케이스(camelCase) 요구**:
   - `park` 프론트엔드가 `regularPrice`, `salePrice`, `discountRate`, `orderNo` 프로퍼티를 직접 사용.
   - ➜ `routers/branch.py`에서 응답 딕셔너리를 카멜케이스 규격으로 직접 가공하여 기존 프론트엔드 화면과의 100% 호환성 유지.

---

## 5. API 엔드포인트 검증 결과표

| 엔드포인트 | 역할 | 상태 |
| :--- | :--- | :---: |
| `GET /` | 공용 백엔드 서버 구동 확인 | **200 OK** |
| `GET /health/db` | MySQL `shopdb3jo` 데이터베이스 연결 확인 | **200 OK** |
| `GET /api/categories` | 전체 상품 카테고리 6건 조회 | **200 OK** |
| `GET /api/products` | 쇼핑몰 상품 목록 6건 조회 (페이징) | **200 OK** |
| `POST /api/auth/login` | 구매자 계정(`buyer01`) 로그인 및 JWT 발급 | **200 OK** |
| `GET /api/branch/branches` | 지사 목록 2건 조회 | **200 OK** |
| `GET /api/branch/branches/2/inventory` | 지사 재고 및 할인율(13%) 자동 계산 | **200 OK** |
| `GET /api/branch/hq/products` | 본사 상품 및 가맹점 도매가(60%) 계산 | **200 OK** |
| `GET /api/dashboard/summary` | 대시보드 9개 카드 통계 정상 집계 | **200 OK** |
| `GET /api/dashboard/recent-orders` | 최근 주문 5건 통합 조인 조회 | **200 OK** |
| `GET /api/org-units` | 조직 계층 3건 조회 | **200 OK** |
| `GET /api/notices` | 공지사항 7건 정렬 조회 | **200 OK** |
