@echo off
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

IF ERRORLEVEL 1 (
    echo No se detectó conexión a Internet. Solo se iniciará la aplicación si las dependencias ya están instaladas.
    REM Inicia la aplicación sin instalar dependencias
    echo Iniciando servidor...
    cd server
    start /b npm run start-backend
    cd ..
    echo Iniciando frontend...
    cd frontend
    start /b npm run start
    pause
    exit
) ELSE (
    echo Se detectó conexión a Internet. Instalando dependencias e iniciando la aplicación.
    REM Instala dependencias si hay internet
    echo Instalando dependencias del servidor...
    cd server
    npm install
    echo Iniciando servidor...
    start /b npm run start-backend
    cd ..
    echo Instalando dependencias del frontend...
    cd frontend
    npm install
    echo Iniciando frontend...
    start /b npm run start
    pause
    exit
)

