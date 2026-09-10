@echo off
title Sistema Neumaticos - Servidor Local
echo =======================================================
echo    NEUMATICOS ARGENTINOS - INICIANDO DEMO COMERCIAL
echo =======================================================
echo.

:: Verificar si npm/vite esta disponible
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Iniciando con Vite Dev Server...
    start http://localhost:5173
    npm run dev
    goto end
)

:: Alternativa con Python
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Iniciando con servidor local de Python en http://localhost:8080...
    start http://localhost:8080
    python -m http.server 8080
    goto end
)

:: Alternativa nativa en Windows con PowerShell
echo Iniciando con servidor HTTP de PowerShell en http://localhost:8080...
start http://localhost:8080
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"

:end
pause
