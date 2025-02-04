# INTRUCTIVO PARA EL FUNCIONAMIENTO DE LA APP

1. **Instalación de Postgres:**

 Puedes descargarlo desde [postgresql.org](https://www.postgresql.org/download/). Asegúrate de instalar la versión 13 o superior.

 ***Configuración de la base de datos:***

 Ejecuta el siguiente comando en la terminal para crear una base de datos y un usuario con permisos de administrador:

```bash
  createdb -U postgres inquilinos
```

  ***Configuración del archivo `.env`:***

 Crea un archivo `.env` en la raíz del proyecto y agrega las siguientes variables de entorno:

```
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








