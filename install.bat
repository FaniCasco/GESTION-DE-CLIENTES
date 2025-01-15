@echo off

REM Instalar dependencias del backend
echo Instalando dependencias del backend...
cd server
npm install
cd ..

REM Restaurar la base de datos
echo Restaurando la base de datos...
psql -U postgres -d clientes -f backup.sql

REM Instalar dependencias del frontend
echo Instalando dependencias del frontend...
cd frontend
npm install
npm run build
cd ..

echo Instalación completa. Para ejecutar la aplicación:
echo 1. Abre un terminal en la carpeta server.
echo 2. Ejecuta "npm start".
