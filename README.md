# 🛍️ BASEOSON (베이스시즌) 패션 스마트쇼핑 통합 플랫폼

> **3조 최종 프로젝트 제출본 (BASEOSON_final)**  
> 구매자 쇼핑몰, 지사 판매자 대시보드, 본사 총괄 관리자 및 공용 백엔드가 완벽하게 결합된 올인원 패키지입니다.

---

## 📌 1. 프로젝트 개요 및 아키텍처

본 프로젝트는 분산되어 있던 **구매자 쇼핑몰**, **지사 판매자 관리 시스템**, **본사 총괄 관리자 시스템**을 단일 프론트엔드 포털과 단일 공용 백엔드로 통합하여, 데이터베이스를 중심으로 3개 주체 간의 실시간 상호작용(발주 신청/승인, 주문/결제, 배송/환불, 알림 등)을 완벽하게 구현한 홈쇼핑 이커머스 솔루션입니다.

```
                          ┌─────────────────────────┐
                          │   MySQL (shopdb3jo)     │
                          └────────────┬────────────┘
                                       │ (SQLAlchemy ORM)
                          ┌────────────┴────────────┐
                          │ FastAPI 공용 백엔드      │
                          │ (포트: 8000)             │
                          └────────────┬────────────┘
                                       │ (REST API / CORS)
    ┌──────────────────────────────────┴──────────────────────────────────┐
    │              BASEOSON 통합 프론트엔드 포털 (Vite / React 19)          │
    │              (포트: 5173 - 상단 바 또는 URL로 1초 전환)              │
    ├──────────────────────┬──────────────────────┬───────────────────────┤
    │  🛍️ 구매자 쇼핑몰    │  🏪 지사 판매자      │  🏢 본사 총괄 관리자  │
    │  - 상품 탐색 및 주문  │  - 지사 재고/발주     │  - 발주 승인 및 출고   │
    │  - 배송지 자동 채움  │  - 주문 접수/배송    │  - 전체 주문/결제 관리 │
    │  - 베스트셀러/Q&A    │  - 실시간 알림 종    │  - 할인율 직접 설정   │
    └──────────────────────┴──────────────────────┴───────────────────────┘
```

---

## 📂 2. 폴더 및 파일 구성

```
BASEOSON_final/
├── README.md                # [본 문서] 타 컴퓨터 구동 및 실행 매뉴얼
├── .gitignore               # Git 형상관리 제외 설정
│
├── database/                # 데이터베이스 세팅 및 복구 파일
│   ├── BASEASON_shopdb3jo_backup.sql   # 전체 DB 테이블 스키마 + 샘플 데이터 완전 복구본
│   └── setup_db_guide.txt              # DB 계정 생성 및 SQL 임포트 명령어 안내
│
├── backend/                 # FastAPI 공용 백엔드 서버
│   ├── src/                 # 백엔드 소스코드 (routers, models, schemas, config 등)
│   ├── images/              # 상품 및 카테고리 배너 정적 이미지
│   ├── uploads/             # 사용자 첨부파일 저장소
│   ├── requirements.txt     # Python 의존성 라이브러리 목록
│   └── .env                 # DB 연결 설정 파일 (기본: shopdb3jo / 3306)
│
└── frontend/                # React 19 + Vite 통합 프론트엔드
    ├── public/images/       # 전체 상품/배너/아이콘 정적 리소스
    ├── src/
    │   ├── buyer/           # 🛍️ 구매자 쇼핑몰 컴포넌트
    │   ├── seller/          # 🏪 지사 판매자 관리자 (전주/부산 지사)
    │   ├── admin/           # 🏢 본사 총괄 관리자 (주문결제/발주승인/할인설정)
    │   ├── pages/           # 쇼핑몰 상세/주문서/마이페이지 컴포넌트
    │   ├── App.jsx          # 통합 포털 뷰어 & 역할(Role) 스위처
    │   └── api.js           # 공용 백엔드 REST API 통신 모듈
    └── package.json         # Node.js 패키지 정의
```

---

## 💻 3. 사전 설치 프로그램 (Prerequisites)

다른 컴퓨터에서 본 프로젝트를 실행하기 위해 아래 프로그램이 미리 설치되어 있어야 합니다.

1. **Node.js**: `v18.0.0` 이상 (LTS 버전 권장)  
   - 다운로드: https://nodejs.org/
   - 설치 확인: 터미널에서 `node -v` 및 `npm -v` 입력
2. **Python**: `v3.10` 이상 (`v3.12` 권장)  
   - 다운로드: https://www.python.org/downloads/
   - *설치 시 반드시 `Add python.exe to PATH` 체크박스 선택!*
   - 설치 확인: 터미널에서 `python --version` 입력
3. **MySQL Server**: `8.0` 이상 (또는 MariaDB 10.6 이상)  
   - 다운로드: https://dev.mysql.com/downloads/installer/
4. **uv** (권장 - 초고속 파이썬 패키지 및 가상환경 관리자)  
   - pip 대비 수십 배 빠른 패키지 다운로드 및 설치를 지원합니다.
   - **PowerShell 간편 설치 (Windows)**:
     ```powershell
     powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
     ```
   - **또는 기본 pip로 설치**:
     ```bash
     pip install uv
     ```
   - 설치 확인: 터미널에서 `uv --version` 입력

---

## 🚀 4. 단계별 실행 방법 (Step-by-Step)

### [Step 1] 데이터베이스(MySQL) 세팅 (최초 1회 필수)

1. MySQL이 실행 중인지 확인하고, **MySQL Command Line Client** 또는 터미널에서 `root`로 접속합니다.
   ```bash
   mysql -u root -p
   ```
2. 아래 쿼리를 복사하여 실행합니다 (DB 생성 및 전용 사용자 설정):
   ```sql
   CREATE DATABASE IF NOT EXISTS shopdb3jo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER IF NOT EXISTS 'shopdb3jo'@'%' IDENTIFIED BY 'shopdb3jo';
   CREATE USER IF NOT EXISTS 'shopdb3jo'@'localhost' IDENTIFIED BY 'shopdb3jo';
   GRANT ALL PRIVILEGES ON shopdb3jo.* TO 'shopdb3jo'@'%';
   GRANT ALL PRIVILEGES ON shopdb3jo.* TO 'shopdb3jo'@'localhost';
   FLUSH PRIVILEGES;
   exit
   ```
3. `database` 폴더에 있는 SQL 복구 파일을 임포트합니다.
   - **CLI 명령어 방식**:
     ```bash
     cd database
     mysql -u shopdb3jo -p shopdb3jo < BASEASON_shopdb3jo_backup.sql
     # 비밀번호: shopdb3jo 입력
     ```
   - **GUI 툴(Workbench / DBeaver / HeidiSQL) 방식**:
     - `shopdb3jo` 스키마 연결
     - `database/BASEASON_shopdb3jo_backup.sql` 열기 -> **전체 실행(Execute Script)**

> **※ 참고**: 만약 본인 컴퓨터의 MySQL 비밀번호가 `root` / `1234` 등 다르게 설정되어 있다면, `backend/.env` 파일을 열어 `DB_USER`와 `DB_PASSWORD`를 본인 환경에 맞게 수정하시면 됩니다.

---

### [Step 2] 백엔드 서버 실행 (포트 8000)

터미널(또는 명령 프롬프트)을 열고 `backend` 디렉토리로 이동하여 서버를 실행합니다.

#### 방법 A. 초고속 `uv` 사용 (권장)
```bash
cd backend

# 가상환경 생성 및 활성화
uv venv .venv
.venv\Scripts\activate

# 의존성 패키지 설치
uv pip install -r requirements.txt

# FastAPI 서버 가동
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 방법 B. 기본 `python / pip` 사용
```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv .venv
.venv\Scripts\activate

# 의존성 패키지 설치
pip install -r requirements.txt

# FastAPI 서버 가동
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```
- **정상 실행 확인**: 웹 브라우저에서 `http://127.0.0.1:8000/docs` 접속 시 Swagger API 문서가 열립니다.

---

### [Step 3] 프론트엔드 포털 실행 (포트 5173)

새 터미널 창을 열고 `frontend` 디렉토리로 이동하여 개발 서버를 실행합니다.

```bash
cd frontend

# 1. 패키지 의존성 설치 (최초 1회 필수)
npm install

# 2. Vite 개발 서버 실행
npm run dev
```
> **※ 참고**: 혹시 `npm install` 중 peer dependency 충돌 경고가 발생할 경우 `npm install --legacy-peer-deps` 를 입력해 주시면 정상 설치됩니다.
- **정상 실행 확인**: 웹 브라우저에서 **`http://localhost:5173`** 으로 접속합니다.

---

## 🧭 5. 통합 시스템 이용 가이드

통합 포털 상단에는 언제든지 화면을 전환할 수 있는 **스마트 네비게이션 바**가 제공됩니다:

| 역할 전환 버튼 | URL 경로 | 주요 기능 및 화면 |
| :--- | :--- | :--- |
| **🛍️ 구매자 쇼핑몰** | `http://localhost:5173/` | 홈쇼핑 상품 탐색, 카테고리/배너, 주문/결제, 마이페이지 |
| **🏪 지사 판매자 대시보드** | `http://localhost:5173/seller` | 전주/부산지사 재고 현황, **발주 신청**, 주문 승인, 지사 알림종(🔔) |
| **🏢 본사 총괄 관리자** | `http://localhost:5173/admin` | 전체 주문/결제 상태 변경, **지사 발주 접수/승인/출고**, 상품 할인율 설정 |

> **TIP**: 상단 바의 **[숨기기]** 버튼을 누르면 일반 쇼핑몰처럼 깔끔한 전체 화면으로 전환되며, 우측 하단의 **[🔄 포털 역할 전환 바 열기]** 버튼을 누르면 언제든지 다시 나타납니다.

---

## 🔑 6. 테스트용 데모 계정 안내

모든 계정은 데이터베이스에 기본 등록되어 있으며, 로그인 화면에서 원클릭 빠른 로그인도 지원합니다.

| 구분 | 아이디 (ID) | 비밀번호 (PW) | 소속 및 권한 |
| :--- | :--- | :--- | :--- |
| **구매자 (Buyer)** | `buyer01` | `buyer1234` | 일반 고객 (주문/결제/마이페이지 테스트용) |
| **구매자 (신규)** | `buyer02` | `buyer1234` | 일반 고객 |
| **판매자 (Seller)** | `seller01` | `seller1234` | 전주지사 매니저 (재고 관리 및 본사 발주 신청) |
| **판매자 (Seller)** | `seller02` | `seller1234` | 부산지사 매니저 (재고 관리 및 본사 발주 신청) |
| **관리자 (Admin)** | `admin01` | `admin1234` | 본사 총괄 관리자 (전체 승인 및 운영) |

---

## 🎬 7. 핵심 상호작용 시연 체크리스트

### 시나리오 ① : 지사(판매자) 발주 신청 ➡️ 본사(관리자) 승인 및 실시간 알림 연동
1. 상단 바에서 **[🏪 지사 판매자 대시보드]** 클릭 (또는 `seller01`로 로그인)
2. **"재고 관리"** 탭에서 임의의 상품(예: 미니멀 싱글 코트)의 **[발주 신청]** 버튼 클릭 ➡️ 수량(예: 10개) 입력 후 신청
3. 상단 바에서 **[🏢 본사 총괄 관리자]** 클릭 (또는 `admin01`로 로그인)
4. 본사 화면의 **"지사 발주 신청 내역"** 및 **"지사 재고 요청 관리"** 테이블에 방금 지사가 신청한 내역이 실시간으로 표시됨을 확인
5. 본사에서 **[승인]** 또는 **[출고완료]** 버튼 클릭
6. 다시 **[🏪 지사 판매자 대시보드]**로 돌아오면, 상단 **알림종(🔔)**에 *"발주가 승인되어 배송 진행 중입니다."* 알림이 도착하고 발주 내역 상태가 변경되어 있음을 확인

### 시나리오 ② : 구매자 주문 ➡️ 배송지 자동입력 ➡️ 본사 주문/결제 상태 변경
1. 상단 바에서 **[🛍️ 구매자 쇼핑몰]** 클릭 후 `buyer01`로 로그인
2. 상품 상세페이지에서 **[구매하기]** 클릭
3. 주문서 페이지에서 회원의 **기본 배송지가 자동으로 채워져** 있는지 확인
4. 결제 완료 후, **[🏢 본사 총괄 관리자]** 로 이동
5. **"주문 및 결제 관리"** 테이블에서 최신 주문건의 상태 드롭다운을 클릭하여 **'배송중'**, **'배송완료'** 로 변경 ➡️ 실시간 반영 확인

### 시나리오 ③ : 본사 상품 할인율 직접 설정
1. **[🏢 본사 총괄 관리자]** 로 이동
2. **"할인율 직접 설정"** 탭 클릭
3. 상품 드롭다운에서 원하는 상품을 선택하고 할인율(예: 15%) 입력
4. 정상가 대비 **할인 판매가**가 실시간으로 자동 연산되는 것을 확인 후 **[할인 적용]** 클릭
5. 아래 할인 목록 테이블에 실시간으로 등록 및 진행 상태 갱신 확인

---

## 🛠️ 8. 트러블슈팅 (자주 발생하는 문제 및 해결 방법)

### Q1. 백엔드 실행 시 `Access denied for user 'shopdb3jo'@'localhost'` 에러가 발생합니다.
- **해결**: 본인 MySQL의 `root` 비밀번호로 접근하여 계정을 생성하지 않았거나 비밀번호가 다른 경우입니다.
  `backend/.env` 파일을 메모장으로 열고:
  ```env
  DB_USER=root
  DB_PASSWORD=본인MySQL비밀번호
  ```
  로 변경한 뒤 백엔드를 재실행하시면 즉시 연결됩니다.

### Q2. 포트 충돌 에러 (`Address already in use: 8000` 또는 `5173`)
- **해결**: 이전에 실행 중이던 프로세스가 백그라운드에 남아있는 경우입니다.
  - Windows 명령 프롬프트(CMD)를 관리자 권한으로 열고:
    ```cmd
    # 8000 포트 점유 프로세스 확인 및 강제 종료
    netstat -ano | findstr :8000
    taskkill /f /pid <프로세스ID>

    # 5173 포트 점유 프로세스 확인 및 강제 종료
    netstat -ano | findstr :5173
    taskkill /f /pid <프로세스ID>
    ```

### Q3. 상품 이미지가 엑박(깨짐)으로 나옵니다.
- **해결**: 본 통합 패키지는 `backend/images/` 및 `frontend/public/images/` 에 전체 상품/배너 에셋이 내장되어 있습니다. 백엔드 서버(포트 8000)가 정상 실행 중인지 확인해 주세요. 백엔드의 `/images` 라우터가 정적 리소스를 안전하게 서빙합니다.

---

### 🏆 최종 점검 결과
- **프론트엔드 프로덕션 빌드 (`npm run build`)**: 48개 모듈 통합 번들링 완료 (0 error)
- **백엔드 REST API 구동 검증**: 지사 발주, 주문/결제, 알림, 할인 연동 100% 정상 작동 완료
- **데이터베이스 정합성**: 테이블 28개 및 샘플 데이터 완전 복구본 포함 완료

