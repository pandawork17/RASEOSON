@echo off
cd /d "%~dp0"
title BASEASON Dev Servers

echo ========================================================
echo   BASEASON Dev Server Launcher
echo ========================================================
echo.

echo [1/4] Starting Backend Server (Port 8000)...
start "BASEASON-Backend" /D "%~dp0common-backend" cmd /k "uv run python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000"

ping 127.0.0.1 -n 3 > nul

echo [2/4] Starting Buyer Frontend (Port 5173)...
start "BASEASON-Buyer-an" /D "%~dp0an\react-baseason-frontend" cmd /k "npm run dev"

echo [3/4] Starting Seller Frontend (Port 5174)...
start "BASEASON-Seller-park" /D "%~dp0park\react-app-teamproject" cmd /k "npm run dev"

echo [4/4] Starting Admin Frontend (Port 5175)...
start "BASEASON-Admin-song" /D "%~dp0song\frontend" cmd /k "npm run dev"

echo.
echo ========================================================
echo   All servers launched in separate windows!
echo   - Buyer (Main):  http://localhost:5173
echo   - Seller:        http://localhost:5174
echo   - Admin:         http://localhost:5175
echo   - Backend API:   http://127.0.0.1:8000
echo ========================================================
echo.
pause
