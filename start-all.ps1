# BASEASON 통합 개발 서버 원클릭 실행기 (PowerShell용)
$root = $PSScriptRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  BASEASON 통합 개발 서버 실행기 (PowerShell)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "[1/4] 백엔드 서버 시작 (Port 8000)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$root\common-backend`" && uv run python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000"

Start-Sleep -Seconds 2

Write-Host "[2/4] 구매자(an) 프론트엔드 시작 (Port 5173)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$root\an\react-baseason-frontend`" && npm run dev"

Write-Host "[3/4] 판매자(park) 프론트엔드 시작 (Port 5174)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$root\park\react-app-teamproject`" && npm run dev"

Write-Host "[4/4] 관리자(song) 프론트엔드 시작 (Port 5175)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$root\song\frontend`" && npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  모든 서버가 별도의 독립 창으로 실행되었습니다!" -ForegroundColor Green
Write-Host "  • 구매자 메인 (시작점): http://localhost:5173" -ForegroundColor Green
Write-Host "  • 판매자 페이지:        http://localhost:5174" -ForegroundColor Green
Write-Host "  • 관리자 페이지:        http://localhost:5175" -ForegroundColor Green
Write-Host "  • 백엔드 API:           http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

