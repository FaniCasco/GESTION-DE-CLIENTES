@echo off
REM Cambiar la codificación de la consola a UTF-8
chcp 65001 >nul

REM Mensaje inicial para el usuario
echo ==========================================
echo BIENVENIDO A LA APLICACIÓN INMOBILIARIA
echo ------------------------------------------
echo Por favor, no cierre esta ventana mientras la aplicación esté funcionando.
echo ==========================================
echo.

REM Verifica la conexión a Internet
echo Verificando conexión a Internet...
ping -n 1 www.google.com >nul 2>&1

IF %ERRORLEVEL% EQU 0 (
    echo Se detectó conexión a Internet. Instalando dependencias...
) ELSE (
    echo No se detectó conexión a Internet. Solo se iniciará la aplicación si las dependencias ya están instaladas.
)

REM Función para iniciar el servidor
echo Iniciando servidor...
cd server
IF NOT EXIST "node_modules" (
    IF %ERRORLEVEL% EQU 0 (
        echo Instalando dependencias del servidor...
        npm install
    ) ELSE (
        echo Error: No hay conexión a Internet y las dependencias del servidor no están instaladas.
        pause
        exit /b 1
    )
)
start /b npm run start-backend
if %ERRORLEVEL% NEQ 0 (
    echo Error: No se pudo iniciar el servidor.
    pause
    exit /b 1
)
cd ..

REM Función para iniciar el frontend
echo Iniciando frontend...
cd frontend
IF NOT EXIST "node_modules" (
    IF %ERRORLEVEL% EQU 0 (
        echo Instalando dependencias del frontend...
        npm install
    ) ELSE (
        echo Error: No hay conexión a Internet y las dependencias del frontend no están instaladas.
        pause
        exit /b 1
    )
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

