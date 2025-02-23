**Configurar archivos de Postgres para sincronizacion de maquina 1 y maquina 2**

**MÁQUINA 1:**

1. Editar archivo postgresql.conf

```
# C:/Program Files/PostgreSQL/17/data/postgresql.conf
```

**Agregar las siguientes lineas**

```
listen_addresses = '*'					
port = 5432			
max_connections = 100			
wal_level = logical
max_wal_size = 1GB
min_wal_size = 80MB
max_wal_senders = 10					
max_replication_slots = 10					
wal_keep_size = 512MB	
hot_standby = on
```

2. Editar archivo pg_hba.conf

```
# C:/Program Files/PostgreSQL/17/data/pg_hba.conf
```
**Agregar las siguientes lineas**

```
host    all             all             IP_MAQUINA-2/32         md5
host    clientes        replicador2     IP_MAQUINA-1/32         md5 
```

**MÁQUINA 2:**

1. Editar archivo postgresql.conf

```
# C:/Program Files/PostgreSQL/17/data/postgresql.conf
```

**Agregar las siguientes lineas**

```
listen_addresses = '*'					
port = 5432			
max_connections = 100			
wal_level = logical
max_wal_size = 1GB
min_wal_size = 80MB
max_wal_senders = 10					
max_replication_slots = 10					
wal_keep_size = 512MB	
hot_standby = on
```

2. Editar archivo pg_hba.conf

```
# C:/Program Files/PostgreSQL/17/data/pg_hba.conf
```
**Agregar las siguientes lineas**

```
host    clientes        replicador2     IP_MAQUINA-1/32         md5 
host    all             all             IP_MAQUINA-2/32         md5

```
**IMPORTANTE!!**

**Reiniciar el servicio de postgresql en ambas maquinas UNA VEZ CONFIGURADO LOS ARCHIVOS**

**LA MAQUINA 1 SERÁ LA MASTER Y LA MAQUINA 2 SERÁ LA SLAVE**

**CONFIGURAR REPLICACION: base de datos. clientes, tabla inquilinos**
1- Crear usuario replicador en la maquina 1 
En terminal:

psql -U postgres -d clientes

Pedita la clave de postgres y se vera esto: 

#clientes: 

Luego ingresa estos comandos:

CREATE ROLE replicador WITH REPLICATION LOGIN PASSWORD 'replicador123';

Verificar la Replicación;
SELECT * FROM pg_stat_replication;


