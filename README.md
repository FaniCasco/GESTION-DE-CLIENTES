# INTRUCTIVO PARA EL FUNCIONAMIENTO DE LA APP

1. **Instalación de Postgres:**

 Puedes descargarlo desde [postgresql.org](https://www.postgresql.org/download/). Asegúrate de instalar la versión 13 o superior.

1️⃣ **Crear la Base de Datos**
*Ejecuta el siguiente comando en la terminal para crear la base de datos clientes:*

psql -U postgres -c "CREATE DATABASE clientes;"


2️⃣ **Conectarse a la Base de Datos**

*Después de crear la base de datos, conéctate a ella:*
    
´´´sql

psql -U postgres -d clientes

´´´
3️⃣ **Crear la Tabla inquilinos**
*Dentro de psql, ejecuta el siguiente comando SQL para crear la tabla:*

´´´sql

CREATE TABLE inquilinos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

´´´
 4️⃣ **Verificar que la Tabla se Creó Correctamente**
 *Ejecuta:*
´´´sql

 \dt

 ´´´

*Si quieres ver la estructura de la tabla:*

´´´sql

\d inquilinos

´´´

  ***Configuración del archivo `.env`:***

 Crea un archivo `.env` en la raíz del proyecto y agrega las siguientes variables de entorno:

```.env

DB_HOST=ip de la maquina 1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=ParaguayS3660
DB_NAME=clientes
PORT=3001
```

2. **Instalación de Node.js:**

Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
version 10.9.0
3. **Instalación de las dependencias:**

 Ejecuta el siguiente comando en la terminal para instalar las dependencias necesarias:

```bash
npm install
```

4. **Asegurar las variables de entorno: path**

Revisar las variables de entorno de windows para ver que el path de node este agregado
**Agregarlo al path de windows bin asi**:
Buscar en C:\Program Files\nodejs\node_modules\npm\bin

* Copiar el path de la carpeta node_modules\npm\bin
* Ir a variables de entorno de windows y agregarlo a path

**Hacer lo mismo con Postgres**

Buscar en C:\Program Files\PostgreSQL\13\bin

* Copiar el path de la carpeta bin
* Ir a variables de entorno de windows y agregarlo a path








