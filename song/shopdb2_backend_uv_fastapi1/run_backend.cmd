@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0run_backend.ps1"
exit /b %errorlevel%
