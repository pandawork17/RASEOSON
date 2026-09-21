# 📘 SHOPDB3JO 통합 공용 백엔드(common-backend) 학습 및 통합 매뉴얼

이 문서는 3개의 서로 다른 프로젝트(`an`: 구매자 쇼핑몰, `park`: 지사 관리자, `song`: 본사 관리자)의 백엔드를 하나의 **단일 공용 백엔드(`common-backend`)**로 통합하는 과정에서 **어떤 코드를 왜 수정했고, 어떤 문제를 겪었으며, 어떻게 해결했는지**를 공부하고 복습할 수 있도록 기록한 상세 기술 문서입니다.

---

## 1. 프로젝트 개요 및 통합 배경

### 1-1. 기존 상황 (Before)
- 3명의 팀원이 동일한 MySQL 데이터베이스(`shopdb3jo`)를 공유하여 작업했으나, 각자 담당한 화면에 맞춰 개별적으로 백엔드를 구현했습니다.
  - **`an` (구매자 쇼핑몰)**: FastAPI + SQLAlchemy 2.0 + Pydantic + JWT로 가장 완성도가 높았으나, 쇼핑몰 고객 관점의 API만 존재.
  - **`park` (지사 관리자)**: 지사별 재고 확인, 가격 변경, 지사 주문/문의 확인 기능이 있었으나, 단일 파일(`main.py`)에 구현되어 있었고 프론트엔드가 호출하는 URL과 백엔드 URL이 일치하지 않는 버그가 있었음.
  - **`song` (본사 관리자)**: 본사 대시보드, 지사 등록/수정, 공지사항 CRUD, 이미지 업로드 등이 구현되어 있었으나, 대시보드 통계 API(`/api/dashboard/summary`)가 누락되어 프론트엔드 카드가 정상 동작하지 않았음.

### 1-2. 통합 목표 (After)
1. **단일 서버(포트 8000)**만 띄우면 3개의 프론트엔드(`an`, `park`, `song`)가 코드 수정 없이 100% 정상 작동하도록 통합.
2. 모든 소스 코드에 **친절한 한글 주석**을 추가하여 유지보수 및 학습 용이성 확보.
3. 코드 구조를 계층형(Config $\rightarrow$ Database $\rightarrow$ Models $\rightarrow$ Schemas $\rightarrow$ Routers)으로 깔끔하게 정리.

---

## 2. 파일별 수정/통합 내역 및 이유 (Why & How)

### ① `pyproject.toml` (패키지 및 가상환경 관리)
- **왜 수정했는가?**
  - `an`과 `song`은 `uv` 패키지 매니저를 사용했고, `park`는 Node.js `package.json`이 백엔드 폴더에 잘못 들어있었습니다.
  - 3개 백엔드가 사용하던 필수 라이브러리(`fastapi`, `uvicorn`, `sqlalchemy`, `pymysql`, `cryptography`, `pydantic-settings`, `passlib[bcrypt]`, `pyjwt`, `python-multipart`, `httpx`)를 누락 없이 최신 호환 버전으로 통합해야 했습니다.
- **적용 결과**:
  - `uv sync` 명령 하나로 1초 만에 전체 가상환경과 34개 의존성이 완벽하게 설치되도록 설정했습니다.

---

### ② `src/config.py` (CORS 및 통합 환경 변수)
- **왜 수정했는가?**
  - 기존에는 `an`의 `.env`에 포트 5173/5174만 CORS 허용되어 있어, `park` 프론트엔드(포트 3000)나 `song` 프론트엔드(포트 5175)에서 접속 시 **CORS 차단 에러**가 발생했습니다.
- **어떻게 고쳤는가?**
  - `CORS_ORIGINS` 기본값에 `3000`, `5173`, `5174`, `5175` 등 개발에 사용되는 모든 로컬 포트를 포함시켰습니다.
  - `pydantic-settings`의 `BaseSettings`를 통해 `.env` 파일 값이 안전하게 로드되고 캐싱(`@lru_cache`)되도록 개선했습니다.

---

### ③ `src/database.py` (커넥션 풀 및 MySQL 세션 관리)
- **왜 수정했는가?**
  - 장시간 서버를 켜둘 경우 MySQL이 유휴 커넥션을 일방적으로 끊어버려 `MySQL server has gone away` 에러가 발생할 수 있습니다.
- **어떻게 고쳤는가?**
  - `song`에서 적용했던 `pool_pre_ping=True`와 `pool_recycle=1800`(30분 주기 커넥션 리사이클)을 엔진에 적용했습니다.
  - SQLAlchemy 2.0 표준 `DeclarativeBase`를 상속한 `Base` 클래스를 제공하여 전체 모델이 공유하도록 설계했습니다.

---

### ④ `src/models.py` (통합 ORM 모델)
- **왜 수정했는가?**
  - `an`은 현대적인 `Mapped[int] = mapped_column(...)` 스타일을 썼고, `park`와 `song`은 1.4 이전 스타일(`Column(BigInteger, ...)`)을 사용하여 스타일이 파편화되어 있었습니다.
  - 또한 `park`와 `song` 모델에는 관계 매핑(`relationship`)이 일부 누락되어 있었습니다.
- **어떻게 고쳤는가?**
  - `an`의 현대적 `Mapped[]` 모델링 방식을 기준으로 통일했습니다.
  - `shopdb3jo` DB의 20개 전체 테이블(`OrgUnit`, `User`, `Role`, `UserRole`, `SellerProfile`, `UserAddress`, `Category`, `Product`, `ProductVariant`, `ProductImage`, `Inventory`, `FileAsset`, `Order`, `OrderItem`, `Payment`, `RefundRequest`, `RefundPolicy`, `Notice`, `BuyerInquiry`, `InquiryFile`, `CompanyPolicy`)을 누락 없이 단일 파일에 정밀하게 매핑했습니다.

---

### ⑤ `src/schemas.py` (Pydantic v2 DTO 스키마 통합)
- **왜 수정했는가?**
  - API의 요청/응답 형식을 명확하게 정의하여 유효성 검증(Validation) 및 Swagger 문서 자동화를 구현하기 위함입니다.
- **어떻게 고쳤는가?**
  - `an`의 쇼핑몰 DTO에 더해, `park`의 가격 변경 DTO(`PriceUpdateRequest`), `song`의 지사 등록/수정 DTO(`OrgUnitCreate`, `OrgUnitUpdate`), 공지사항 등록 DTO(`NoticeCreate`, `NoticeUpdate`), 역할 변경 DTO(`RoleUpdate`)를 하나의 스키마 파일에 집대성했습니다.

---

### ⑥ `src/routers/notices.py` (공지사항 기능 단일화)
- **어떤 문제가 있었는가?**
  - `an` 백엔드는 [목록 조회 + 조회수 증가 상세 조회]만 있었음.
  - `park` 프론트엔드는 `/api/branch/notices`라는 경로로 공지를 호출함.
  - `song` 백엔드는 [이미지 파일 업로드 + 등록/수정/삭제]가 있었으나 SQL 조인 구조가 조금 달랐음.
- **어떻게 고쳤는가?**
  - 일반 조회와 관리자 CRUD, 이미지 업로드(`POST /api/notices/upload-image`)를 하나의 라우터로 통합했습니다.
  - `park` 프론트엔드가 호출하는 `/api/branch/notices`와 표준 경로 `/api/notices`를 모두 동일한 함수로 연결하여 프론트엔드 수정 없이 동작하도록 만들었습니다.

---

### ⑦ `src/routers/branch.py` (지사 관리자 라우터 구축 및 경로 불일치 버그 해결)
- **가장 큰 문제점 발견 및 해결 (중요!)**:
  - `park/react-app-teamproject` 프론트엔드(`BranchAdmin.jsx`, `Home.jsx`)는:
    - `fetch('/api/branch/branches')`
    - `fetch('/api/branch/hq/products')`
    - `fetch('/api/branch/branches/${selectedOrgId}/inventory')`
    - `fetch('/api/branch/branches/${selectedOrgId}/orders')`
    - `fetch('/api/branch/branches/${selectedOrgId}/inquiries')`
    - `fetch('/api/branch/products/${productId}/price')`
    - `fetch('/api/branch/products')`
    를 호출하고 있었습니다.
  - 그러나 기존 `park/backend/main.py`는:
    - `@app.get("/api/branches")`
    - `@app.get("/api/hq/products")`
    - `@app.get("/api/branches/{org_id}/inventory")`
    등으로 등록되어 있어 **실제 프론트엔드와 백엔드를 연결하면 전부 404 Not Found 에러**가 발생하는 상태였습니다.
- **해결 방식**:
  - `routers/branch.py`를 만들고, 모든 엔드포인트에 `/api/branch/...`와 `/api/...` 양쪽 데코레이터를 모두 달아주었습니다.
  - 지사 재고 응답 시 정상가와 판매가를 비교하여 할인율(`discountRate`)을 자동 계산하는 로직과 카멜케이스 응답 규격을 100% 보존했습니다.

---

### ⑧ `src/routers/admin.py` (본사 관리자 라우터 및 대시보드 통계 신규 구현)
- **어떤 문제가 있었는가?**
  - `song/frontend/src/Dashboard.jsx`에서는 화면이 열릴 때 `fetch("/api/dashboard/summary")`를 호출하여 9가지 통계 카드를 렌더링하려고 했으나, 기존 `song/backend`에는 이 엔드포인트가 아예 없었습니다. (대시보드가 항상 에러 메시지를 표시함)
- **어떻게 고쳤는가?**
  - `GET /api/dashboard/summary` 엔드포인트를 신규 구현했습니다.
  - 단일 SQL 서브쿼리로 9가지 지표(운영 조직 수, 전체 회원 수, 활성 판매자 수, 전체 상품 수, 전체 주문 수, 결제 내역 수, 환불 요청 건수, 안전재고 부족 품목 수, 미답변 문의 수)를 실시간 집계하여 반환하도록 만들었습니다.
  - `GET /api/org-units` (지사 등록/수정/활성화/비활성화)와 `GET /api/users` (회원 및 권한 관리)도 모듈화하여 이식했습니다.

---

### ⑨ `src/routers/auth.py`, `products.py`, `orders.py`, `inquiries.py`, `addresses.py`, `refunds.py` (쇼핑몰 구매자 기능)
- `an`의 고품질 구매자 쇼핑몰 비즈니스 로직을 그대로 이식했습니다.
- `images.py`를 통해 상품 상세 페이지에 5장 이상의 이미지가 안정적으로 렌더링되도록 보장했습니다.
- 1:1 고객 문의 작성 시 Base64 이미지 업로드가 `uploads/inquiries/`에 안정적으로 저장되도록 연동했습니다.

---

## 3. 통합 중 발생한 시행착오 (Troubleshooting Log)

### [시행착오 1] `uv sync` 실행 시 패키지 빌드 에러
- **문제 현상**:
  - `pyproject.toml`을 작성하고 `uv sync`를 실행했을 때 아래 에러 발생:
    ```
    Failed to build common-backend
    Error: Expected a Python module at: src\common_backend\__init__.py
    ```
- **원인 분석**:
  - `uv`의 기본 빌드 백엔드(`uv_build`)는 프로젝트 이름(`common-backend`)과 일치하는 Python 패키지 디렉터리(`src/common_backend/`)를 찾아 wheel로 패키징하려고 시도합니다.
  - 하지만 우리는 라이브러리 배포가 아니라 FastAPI 웹 서비스를 실행하는 것이 목적이었습니다.
- **해결 방법**:
  - `pyproject.toml`에 아래 설정을 추가하여 wheel 패키징 과정을 생략하도록 지정:
    ```toml
    [tool.uv]
    package = false
    ```
  - 설정 후 `uv sync`가 170ms만에 에러 없이 성공했습니다.

---

### [시행착오 2] `starlette.testclient` 실행 시 httpx 패키지 누락
- **문제 현상**:
  - API 자동 검증을 위해 `from fastapi.testclient import TestClient`를 실행했으나 `RuntimeError: The starlette.testclient module requires the httpx package to be installed` 에러 발생.
- **해결 방법**:
  - `uv add httpx` 명령을 실행하여 최신 `httpx` 패키지를 프로젝트 의존성에 추가.
  - 이후 TestClient를 통한 자동화 검증이 완벽하게 실행되었습니다.

---

### [시행착오 3] 지사(park) 프론트엔드의 카멜케이스(camelCase) 요구사항
- **문제 현상**:
  - 일반적인 Python 백엔드는 `regular_price`, `sale_price`처럼 스네이크 케이스를 반환하지만, `park`의 `BranchAdmin.jsx`는 `regularPrice`, `salePrice`, `discountRate`, `orderNo` 등 카멜케이스 프로퍼티를 직접 사용하고 있었습니다.
- **해결 방법**:
  - `routers/branch.py`에서는 프론트엔드의 기존 코드를 손대지 않아도 되도록 딕셔너리 키를 카멜케이스로 명시적으로 매핑하여 응답하도록 보존했습니다.

---

## 4. 공용 백엔드 실행 및 검증 방법

### 1) 의존성 설치
```powershell
cd "C:\Users\enjoy\Desktop\공용 백엔드 만들기\common-backend"
uv sync
```

### 2) 서버 실행
```powershell
uv run uvicorn src.main:app --reload --port 8000
```
- 서버 주소: http://127.0.0.1:8000
- 스웨거 API 문서: http://127.0.0.1:8000/docs
- ReDoc 문서: http://127.0.0.1:8000/redoc

### 3) 3개 프론트엔드 동시 연동 테스트
- **고객 쇼핑몰 (`an/react-baseason-frontend`)**:
  - 로그인 화면에서 테스트 계정(`buyer01` / `buyer1234`)으로 빠른 로그인 $\rightarrow$ 상품 목록/상세/주문 정상 작동
- **지사 관리자 (`park/react-app-teamproject`)**:
  - 지사 선택 $\rightarrow$ 지사별 재고 목록, 할인율(%), 주문 목록, 고객 문의 정상 로드
  - 판매가 변경(PUT) 정상 반영
- **본사 관리자 (`song/frontend`)**:
  - 대시보드 접속 $\rightarrow$ 9개 요약 카드 지표 및 최근 주문 5건 정상 노출
  - 지사 등록/수정/비활성화, 공지사항 작성 및 이미지 업로드 정상 작동

