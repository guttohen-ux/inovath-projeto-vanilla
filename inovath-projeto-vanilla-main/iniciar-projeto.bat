@echo off
title Registro Verde - Iniciar projeto
echo.
echo [1/3] Instalando dependencias Python (primeira vez)...
cd /d "%~dp0Registro-verde-backend\backend"
python -m pip install -r requirements.txt >nul 2>&1
echo.
echo [2/3] Iniciando Backend (HTTPS)...
start "Backend Registro Verde" cmd /k "cd /d "%~dp0Registro-verde-backend\backend" && python app.py"
timeout /t 2 /nobreak >nul
echo.
echo [3/3] Iniciando Frontend (HTTP)...
start "Frontend Registro Verde" cmd /k "cd /d "%~dp0frontend-vanilla" && python servidor.py"
timeout /t 2 /nobreak >nul
echo.
echo Abrindo navegador...
timeout /t 1 /nobreak >nul
start chrome "http://localhost:8000"
echo.
echo ========================================
echo ✅ Sistema iniciado!
echo ========================================
echo 🌐 Frontend: http://localhost:8000
echo 🔒 Backend: https://localhost:5000
echo ========================================
echo.
echo Mantenha ambas as janelas abertas.
echo Pressione CTRL+C em cada uma para parar.
pause
