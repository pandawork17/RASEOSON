# React Baseason Frontend

BASEASON 쇼핑몰 프론트엔드입니다. Vite + React로 작성되었으며, `react-baseason-backend`(FastAPI)
의 REST API를 통해 실제 `shopdb3jo` 데이터를 표시합니다.

## 1. 의존성 설치

```powershell
cd react-baseason-frontend
npm install
```

## 2. 환경 변수

`.env`에 백엔드 API 주소가 설정되어 있습니다.

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## 3. 개발 서버 실행

먼저 `react-baseason-backend`를 `http://127.0.0.1:8000`에서 실행한 뒤:

```powershell
npm run dev
```

- 기본 주소: http://localhost:5173 (포트가 사용 중이면 Vite가 자동으로 다음 포트를 사용합니다)

## 주요 기능

- 카테고리/상품 목록, 상품 상세(옵션 선택, 재고 표시, 갤러리 이미지 5장 이상)
- 회원가입 / 로그인 (JWT)
- 주문/결제(테스트 결제) → 주문 완료 → 주문내역/주문상세
- 환불 신청 및 환불내역 조회
- 배송지 관리, 회원정보 수정, 비밀번호 변경

## 참고

- 장바구니 없이 상품 상세에서 바로 "구매하기"로 진행하는 단일 상품 주문 플로우입니다.
- 결제는 실제 PG 연동 없이 백엔드에서 즉시 결제완료 처리되는 테스트 결제입니다.
- 로그인 화면의 "테스트 구매자로 빠른 로그인" 드롭다운에서 구매자를 선택하면 아이디/비밀번호가
  화면에 자동으로 채워집니다 (모두 비밀번호 `buyer1234`). 직접 회원가입해서 새 계정으로
  테스트할 수도 있습니다.
