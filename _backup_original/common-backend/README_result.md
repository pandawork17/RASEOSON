# 🚀 SHOPDB3JO 통합 공용 백엔드 및 3개 프론트엔드 실행 가이드 (README2)

이 문서는 새로 구축된 **단일 공용 백엔드(`common-backend`)**를 실행하고, 3개의 프론트엔드(`an`: 고객몰, `park`: 지사관리, `song`: 본사관리)를 각각 실행하여 테스트하는 방법을 단계별로 안내합니다.

---

## 1. 사전 요구사항 (Prerequisites)

1. **MySQL 8.0**:
   - `shopdb3jo` 데이터베이스 및 계정(`shopdb3jo` / `shopdb3jo`, 포트 3306)이 로컬에서 실행 중이어야 합니다.
2. **Python 3.12** 및 **uv 패키지 매니저**:
   - `uv --version` (설치되어 있지 않다면 공식 가이드 참조)
3. **Node.js (v18 이상) & npm**:
   - 프론트엔드 실행용

---

## 2. 공용 백엔드(common-backend) 실행 방법

터미널(PowerShell 또는 CMD)을 열고 아래 명령어를 순서대로 실행합니다:

```powershell
# 1. 공용 백엔드 폴더로 이동
cd "C:\Users\enjoy\Desktop\공용 백엔드 만들기\common-backend"

# 2. 가상환경 생성 및 의존성 동기화 (최초 1회 실행, 1~2초 소요)
uv sync

# 3. FastAPI 개발 서버 실행 (포트 8000)
uv run uvicorn src.main:app --reload --port 8000
```

### 🔗 백엔드 접속 주소
- **서버 루트**: http://127.0.0.1:8000
- **Swagger 인터랙티브 API 문서**: http://127.0.0.1:8000/docs
- **ReDoc 문서**: http://127.0.0.1:8000/redoc
- **DB 헬스체크**: http://127.0.0.1:8000/health/db

> [!NOTE]
> 이제 백엔드는 이 서버 하나만 켜두시면 됩니다! 3개의 프론트엔드가 모두 포트 `8000`을 바라보며 동시에 작동합니다.

---

## 3. 3개 프론트엔드 실행 방법 (새 터미널 창에서 각각 실행)

### ① 고객 쇼핑몰 프론트엔드 (`an/react-baseason-frontend`)
일반 고객/구매자가 접속하는 온라인 쇼핑몰 화면입니다.

```powershell
# 새 터미널 창을 열고 실행
cd "C:\Users\enjoy\Desktop\공용 백엔드 만들기\an\react-baseason-frontend"

# 의존성 설치 (최초 1회)
npm install

# 개발 서버 실행
npm run dev
```
- **접속 주소**: 터미널에 표시되는 로컬 주소 (보통 `http://localhost:5173` 또는 `5174`)
- **테스트 계정 로그인 정보**:
  - 화면의 **"테스트 구매자로 빠른 로그인"** 드롭다운을 사용하거나 직접 입력:
    - **아이디**: `buyer01`
    - **비밀번호**: `buyer1234`
  - *(그 외 `buyer02`, `buyer03`, `buyer96`, `buyer5` 모두 비밀번호 `buyer1234` 동일)*
- **주요 기능 테스트**:
  - 카테고리별 상품 필터 및 상품 상세(5장 캐러셀 이미지 확인)
  - 주문서 작성 및 결제(가상 결제 완료)
  - 마이페이지에서 주문 내역, 환불 신청, 배송지 관리, 1:1 고객 문의 작성

---

### ② 지사 관리자 프론트엔드 (`park/react-app-teamproject`)
가맹 지사/지점장이 재고를 관리하고 판매가를 변경하는 시스템입니다.

```powershell
# 새 터미널 창을 열고 실행
cd "C:\Users\enjoy\Desktop\공용 백엔드 만들기\park\react-app-teamproject"

# 의존성 설치 (최초 1회)
npm install

# 개발 서버 실행
npm run dev
```
- **접속 주소**: 터미널에 표시되는 로컬 주소
- **주요 기능 테스트**:
  - 지사 선택 드롭다운(예: `부산지사`, `전주지사`)을 변경하면 지사별 재고 데이터 즉시 로드
  - 정상가와 판매가를 비교한 **할인율(%) 자동 계산** 확인
  - 상품 목록에서 판매가 변경 버튼 클릭 시 **실시간 가격 수정(PUT)** 반영
  - 하단 본사 발주 상품 목록에서 **도매가(60%)** 적용 확인
  - 해당 지사로 접수된 고객 주문 및 문의 내역 확인

---

### ③ 본사 관리자 프론트엔드 (`song/frontend`)
본사 총괄 관리자가 전체 현황을 모니터링하고 정책/지사를 관리하는 시스템입니다.

```powershell
# 새 터미널 창을 열고 실행
cd "C:\Users\enjoy\Desktop\공용 백엔드 만들기\song\frontend"

# 의존성 설치 (최초 1회)
npm install

# 개발 서버 실행
npm run dev
```
- **접속 주소**: 터미널에 표시되는 로컬 주소
- **주요 기능 테스트**:
  - **대시보드 (`Dashboard.jsx`)**: 상단 9개 요약 카드(운영 조직 수, 회원 수, 판매자 수, 상품 수, 주문 수 등) 및 최근 주문 5건 정상 노출
  - **지사 관리 (`BranchAdmin.jsx`)**: 본사 및 산하 지사 목록 확인, 신규 지사 등록, 지사 비활성화/활성화
  - **공지사항 (`NoticeList.jsx`)**: 공지사항 목록 조회, 신규 공지 작성 시 이미지 드래그앤드롭 업로드(`uploads/notices` 저장)
  - **운영 정책 (`CompanyPolicies.jsx`)**: 회사 운영 규정 및 약관 목록 확인

---

## 4. 유용한 트러블슈팅 및 팁 (Troubleshooting)

### Q1. 포트 8000이 이미 사용 중이라는 에러가 발생할 때
기존에 실행 중이던 이전 백엔드(an, park, song) 프로세스를 종료해야 합니다.
```powershell
# 포트 8000을 점유 중인 프로세스 확인
Get-NetTCPConnection -LocalPort 8000

# 프로세스 강제 종료
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force
```

### Q2. DB 연결 실패 에러가 발생할 때
- MySQL 서비스가 실행 중인지 확인하세요:
  ```powershell
  Get-Service -Name *mysql*
  ```
- `common-backend/.env` 파일의 계정 정보(`shopdb3jo` / `shopdb3jo`)가 맞는지 확인하세요.

### Q3. 백엔드 API가 정상 동작하는지 터미널에서 빠르게 검증하고 싶을 때
`common-backend` 폴더에서 아래 파이썬 테스트 명령을 실행하면 모든 주요 API가 정상 작동하는지 1초 만에 확인해 줍니다:
```powershell
cd "C:\Users\enjoy\Desktop\공용 백엔드 만들기\common-backend"
uv run python -c "from fastapi.testclient import TestClient; from src.main import app; c = TestClient(app); print('DB Health:', c.get('/health/db').json()); print('Dashboard:', c.get('/api/dashboard/summary').json()); print('Branches:', len(c.get('/api/branch/branches').json()))"
```
