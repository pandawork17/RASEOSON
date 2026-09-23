@echo off
chcp 65001 > nul
echo ========================================================
echo   [BASEOSON] 공용 백엔드 서버 실행 (포트 8000)
echo ========================================================
echo.

if not exist .venv (
    echo [1/2] Python 가상환경(.venv) 생성 및 패키지 설치 중...
    python -m venv .venv
    call .venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate
)

echo.
echo [2/2] FastAPI 백엔드 서버 시작 (http://127.0.0.1:8000)
echo 종료하려면 창을 닫거나 Ctrl+C를 누르세요.
echo.
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
pause
