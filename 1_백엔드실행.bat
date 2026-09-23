@echo off
chcp 65001 > nul
title [BASEOSON 3조] 공용 백엔드 서버 (FastAPI)
cd /d "%~dp0backend"
call run_backend.bat

