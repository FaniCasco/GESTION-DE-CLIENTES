# Instructivo para Restaurar la Base de Datos

Este instructivo explica cómo restaurar la base de datos PostgreSQL a partir de los archivos de respaldo (`.sql` o `.backup`) en un entorno de desarrollo.

## Prerrequisitos

1. **PostgreSQL Instalado**: Asegúrate de tener PostgreSQL instalado en tu máquina.
2. **Acceso al Archivo de Respaldo**: Verifica que tengas el archivo de respaldo disponible. Este archivo se encuentra en la carpeta del proyecto:

---

   CLIENTES/backup.sql

---


## Restaurar desde un Archivo `.sql`

1. **Abrir Terminal o Consola**: Navega a la carpeta donde se encuentra el archivo `backup.sql`:

   ```bash
   cd CLIENTES
   ```

2. **Ejecutar el Comando de Restauración**:

psql -U postgres -d clientes -f backup.sql

 
3. **Confirmación**: Si todo se ejecuta correctamente, la base de datos será restaurada.

---

#Con esto hacemos el archivo backup de la bbdd inicial
pg_dump -U postgres -h localhost -p 5432 -F c -b -v -f inquilinos_backup.backup inquilinos


🔹 Restaurar en la Nueva Máquina

En la nueva máquina, asegúrate de que PostgreSQL esté instalado y sigue estos pasos:

Crear la Base de Datos en la Nueva Máquina
PGPASSWORD="ParaguayS3660" psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE clientes;"

Restaurar la Base de Datos:

Si tienes un archivo .sql
PGPASSWORD="ParaguayS3660" psql -U postgres -h localhost -p 5432 -d clientes -f backup.sql

Si tienes un archivo .dump:
PGPASSWORD="ParaguayS3660" pg_restore -U postgres -h localhost -p 5432 -d clientes -1 backup.dump

Verificar que los datos se hayan restaurado correctamente:


PGPASSWORD="ParaguayS3660" psql -U postgres -h localhost -p 5432 -d clientes -c "\dt"