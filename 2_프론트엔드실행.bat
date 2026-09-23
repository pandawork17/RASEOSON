@echo off
chcp 65001 > nul
title [BASEOSON 3조] 통합 프론트엔드 포털 (Vite/React)
cd /d "%~dp0frontend"
call run_frontend.bat

