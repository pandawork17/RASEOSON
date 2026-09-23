@echo off
chcp 65001 > nul
echo ========================================================
echo   [BASEOSON] 통합 프론트엔드 포털 실행 (포트 5173)
echo   - 구매자 쇼핑몰 (/)
echo   - 지사 판매자 대시보드 (/seller)
echo   - 본사 총괄 관리자 (/admin)
echo ========================================================
echo.

if not exist node_modules (
    echo [1/2] 프론트엔드 의존성 패키지(node_modules) 설치 중...
    call npm install
)

echo.
echo [2/2] Vite 개발 서버 시작 (http://localhost:5173)
echo 브라우저에서 http://localhost:5173 으로 접속하세요.
echo 종료하려면 창을 닫거나 Ctrl+C를 누르세요.
echo.
call npm run dev
pause

