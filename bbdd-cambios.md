**Ejecuta esto primero para confirmar que no existen**

SELECT * FROM information_schema.columns 
WHERE table_name = 'inquilinos' 
AND column_name IN ('duracion_contrato', 'vencimiento_contrato');

**Hacer las nuevas columnas**

ALTER TABLE inquilinos
ADD COLUMN duracion_contrato INTEGER,
ADD COLUMN vencimiento_contrato DATE;