# React Baseason Backend

FastAPI로 구현한 BASEASON 쇼핑몰 백엔드 서버입니다. `shopdb3jo` MySQL 데이터베이스를 사용합니다.

## 요구 사항

- Python 3.12 (`.python-version`에 고정되어 있음)
- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- 로컬에 실행 중인 MySQL 8.0 (`shopdb3jo` 데이터베이스, `shopdb3jo` 계정)

## 1. 의존성 설치

```powershell
cd react-baseason-backend
uv sync
```

## 2. 환경 변수

`.env` 파일이 이미 로컬 개발용 기본값으로 채워져 있습니다 (DB 계정 `shopdb3jo` / `shopdb3jo`, DB명 `shopdb3jo`).
다른 환경에서는 `.env.example`을 복사해 값을 맞춰주세요.

```powershell
copy .env.example .env
```

## 3. 개발 서버 실행

```powershell
uv run uvicorn src.main:app --reload
```

- 서버: http://127.0.0.1:8000
- API 문서: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## 4. 주요 API

| 기능                             | 메서드/경로                                    |
| -------------------------------- | ---------------------------------------------- |
| 카테고리 목록                    | `GET /api/categories`                          |
| 상품 목록/검색                   | `GET /api/products?category_id=&search=`       |
| 상품 상세 (이미지 5장 이상 포함) | `GET /api/products/{id}`                       |
| 회원가입                         | `POST /api/auth/register`                      |
| 로그인                           | `POST /api/auth/login`                         |
| 내 정보 조회/수정                | `GET/PATCH /api/auth/me`                       |
| 비밀번호 변경                    | `POST /api/auth/change-password`               |
| 배송지 관리                      | `GET/POST/DELETE /api/addresses`               |
| 주문 생성/조회                   | `POST/GET /api/orders`, `GET /api/orders/{id}` |
| 환불 신청/조회                   | `POST/GET /api/refund-requests`                |

인증이 필요한 API는 `Authorization: Bearer <access_token>` 헤더가 필요합니다.

## 5. 상품 이미지 정책

DB 시드 데이터의 상품 대표 이미지가 1장뿐인 경우, `src/react_baseason_backend/images.py`에서
[Lorem Picsum](https://picsum.photos)의 상품코드 기반 시드 이미지를 자동으로 채워
상품 상세 페이지에 항상 5장 이상의 이미지가 표시되도록 처리합니다.

## 6. 테스트 구매자 계정 (고정 로그인 정보)

DB 시드 데이터의 구매자 계정은 원래 비밀번호 해시를 알 수 없어 로그인이 불가능했습니다.
아래 스크립트로 5개 구매자 계정의 비밀번호를 **`buyer1234`** 로 고정해두었습니다
(이미 실행 완료된 상태이며, 다시 초기화하고 싶을 때만 재실행하면 됩니다).

```powershell
uv run python scripts/reset_test_buyer_passwords.py
```

| 아이디    | 비밀번호    | 이름     | 소속     |
| --------- | ----------- | -------- | -------- |
| `buyer01` | `buyer1234` | 구매자김 | 전주지사 |
| `buyer02` | `buyer1234` | 구매자이 | 부산지사 |
| `buyer03` | `buyer1234` | 구매자박 | 본사     |
| `buyer96` | `buyer1234` | Buyer 96 | 본사     |
| `buyer5`  | `buyer1234` | 오길동   | 본사     |

프론트엔드 로그인 화면의 "테스트 구매자로 빠른 로그인" 드롭다운에서 위 계정을 선택하면
아이디/비밀번호가 화면에 자동으로 채워집니다. 관리자(`admin01`)/판매자(`seller01`,
`seller02`) 계정은 그대로 두었으므로 여전히 로그인할 수 없습니다.

## 7. 참고

- DB 백업/마이그레이션 SQL은 `shopdb3jo` DB에 이미 적용되어 있는 상태를 전제로 합니다 (본사/지사/발주/재고/고객배송 스키마 포함).
- `/api/auth/register`로 새 계정을 직접 만들어 테스트할 수도 있습니다.
