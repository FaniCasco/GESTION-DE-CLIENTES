# Instructivo para Restaurar la Base de Datos

Este instructivo explica cómo restaurar la base de datos PostgreSQL a partir de los archivos de respaldo (`.sql` o `.backup`) en un entorno de desarrollo.

## Prerrequisitos

1. **PostgreSQL Instalado**: Asegúrate de tener PostgreSQL instalado en tu máquina. Puedes descargarlo desde [postgresql.org](https://www.postgresql.org/download/).
2. **Acceso al Archivo de Respaldo**: Verifica que tengas el archivo de respaldo disponible. Este archivo se encuentra en la carpeta del proyecto:

---

   CLIENTES/server/backup.sql

---

   o si usas el formato binario:

---

   CLIENTES/server/backup.backup

---

3. **Credenciales de PostgreSQL**: Necesitas un usuario con privilegios para restaurar la base de datos.

---

## Restaurar desde un Archivo `.sql`

1. **Abrir Terminal o Consola**: Navega a la carpeta donde se encuentra el archivo `backup.sql`:

   ```bash
   cd CLIENTES/server
   ```

2. **Ejecutar el Comando de Restauración**:

   ```bash
   psql -U <tu_usuario> -d <nombre_de_tu_base_de_datos> -f backup.sql
   ```

   - Reemplaza `<tu_usuario>` por el usuario de PostgreSQL.
   - Reemplaza `<nombre_de_tu_base_de_datos>` por el nombre de la base de datos que deseas restaurar.

3. **Confirmación**: Si todo se ejecuta correctamente, la base de datos será restaurada.

---

## Restaurar desde un Archivo `.backup`

1. **Abrir Terminal o Consola**: Navega a la carpeta donde se encuentra el archivo `backup.backup`:

   ```bash
   cd CLIENTES/server
   ```

2. **Ejecutar el Comando de Restauración**:

   ```bash
   pg_restore -U <tu_usuario> -d <nombre_de_tu_base_de_datos> --clean --create backup.backup
   ```

   - Reemplaza `<tu_usuario>` por el usuario de PostgreSQL.
   - Reemplaza `<nombre_de_tu_base_de_datos>` por el nombre de la base de datos que deseas restaurar. Si usas `--create`, el nombre se define dentro del respaldo.

3. **Confirmación**: Si todo se ejecuta correctamente, verás los logs de restauración en la terminal.

---

## Notas Adicionales

- Si la base de datos no existe y no estás usando `--create`, créala manualmente antes de la restauración:

  ```bash
  createdb -U <tu_usuario> <nombre_de_tu_base_de_datos>
  ```

- Asegúrate de que el usuario tenga los privilegios necesarios para crear y modificar bases de datos.

---

## Solución de Problemas

- **Error de conexión**: Asegúrate de que el servidor PostgreSQL esté en ejecución.
- **Permisos insuficientes**: Verifica que el usuario tiene privilegios suficientes para restaurar.
- **Archivo no encontrado**: Confirma que estás en el directorio correcto.

---

¡Tu base de datos debería estar lista para usarse después de completar estos pasos! Si tienes alguna duda o necesitas ayuda adicional, no dudes en consultarlo.

---
