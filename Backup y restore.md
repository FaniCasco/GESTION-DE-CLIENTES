# Instructivo para Restaurar la Base de Datos

Este instructivo explica cómo restaurar la base de datos PostgreSQL

## Prerrequisitos

1. **PostgreSQL Instalado**: Asegúrate de tener PostgreSQL instalado en tu máquina.
2. **Acceso al Archivo de Respaldo**: Verifica que tengas el archivo de respaldo disponible. Este archivo se encuentra en la carpeta del proyecto:

---

   CLIENTES/backup_clientes.dump

---
## 1. Generar el Backup en la Máquina Origen
Ejecuta el siguiente comando en la máquina donde está tu base de datos original:

´´´
pg_dump -U postgres -h localhost -p 5432 -F c -b -v -f backup_clientes.dump clientes

´´´

## 2. Restaurar el Backup en la Máquina Destino

En la máquina de destino, asegúrate de tener PostgreSQL instalado y ejecuta:

´´´
pg_restore -U usuario -h localhost -p 5432 -d nombre_de_la_bbdd -v backup_clientes.dump

´´´

## 3. 📌 Si la base de datos aún no existe, créala antes de restaurar:

1️⃣ Abrir la terminal de PostgreSQL
Abre cmd y ejecuta:


psql -U postgres

2️⃣ Crear la base de datos
Dentro de psql, ejecuta:

CREATE DATABASE nombre_de_tu_base;

3️⃣ Salir de psql
\q

4️⃣ Restaurar la base de datos:

pg_restore -U usuario -h localhost -p 5432 -d nombre_de_la_bbdd -v backup_clientes.dump

## Verificación:

Después de la restauración, revisa que los datos estén correctos:

´´´
psql -U postgres -d clientes -c "\dt"

´´´