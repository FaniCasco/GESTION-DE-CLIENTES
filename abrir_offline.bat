@echo off
chcp 65001 >nul

echo ==========================================
echo BIENVENIDO A LA APLICACIÓN INMOBILIARIA
echo ------------------------------------------
echo Por favor, no cierre esta ventana mientras la aplicación esté funcionando.
echo ==========================================
echo.

REM Verificar que las dependencias están instaladas
echo Verificando dependencias...

cd server
IF NOT EXIST "node_modules" (
    echo Error: Las dependencias del servidor no están instaladas. Conéctate a Internet y ejecuta 'npm install'.
    pause
    exit /b 1
)
start /b npm run start-backend
if %ERRORLEVEL% NEQ 0 (
    echo Error: No se pudo iniciar el servidor.
    pause
    exit /b 1
)
cd ..

cd frontend
IF NOT EXIST "node_modules" (
    echo Error: Las dependencias del frontend no están instaladas. Conéctate a Internet y ejecuta 'npm install'.
    pause
    exit /b 1
)
start /b npm run start
if %ERRORLEVEL% NEQ 0 (
    echo Error: No se pudo iniciar el frontend.
    pause
    exit /b 1
)
cd ..

pause
exit