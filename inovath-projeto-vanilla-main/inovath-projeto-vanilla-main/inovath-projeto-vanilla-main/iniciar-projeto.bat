@echo off
title Registro Verde - Iniciar projeto
echo.
echo [1/2] Iniciando backend (Flask) em http://localhost:5000 ...
start "Backend Registro Verde" cmd /k "cd /d "%~dp0Registro-verde-backend\backend" && python app.py"
timeout /t 2 /nobreak >nul
echo.
echo [2/2] Abrindo site no Google Chrome ...
start chrome "%~dp0frontend-vanilla\index.html"
echo.
echo Pronto! Mantenha a janela do backend aberta.
pause
