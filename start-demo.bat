@echo off
title Continuum Living Segmentation Demo
echo ======================================================================
echo           CONTINUUM LIVING SEGMENTATION - EXECUTIVE DEMO
echo ======================================================================
echo.

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not detected on your system.
    echo Please install Node.js from https://nodejs.org or ask IT to install it.
    echo.
    pause
    exit /b 1
)

if not exist node_modules (
    echo [1/2] Installing dependencies (first run only, takes ~30 seconds)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
) else (
    echo [1/2] Dependencies already installed.
)

echo [2/2] Launching demo server...
echo.
echo Opening browser at http://localhost:5173/ ...
echo Press Ctrl+C in this window when you want to stop the demo.
echo.

start http://localhost:5173/
call npm run dev
pause
