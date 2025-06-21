const pool = require("../config/db");
const PDFMake = require('pdfmake'); // Importar correctamente pdfmake
const fs = require('fs');
const path = require('path');

const safeDateToISO = (dateString) => {
  if (!dateString) return null;

  try {
    // Si ya es una fecha ISO válida, retornarla directamente
    if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      return dateString;
    }

    // Manejar formato DD/MM/YYYY
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateString.split('/');
      return new Date(`${year}-${month}-${day}`).toISOString();
    }

    // Intentar parsear como fecha
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    return date.toISOString();
  } catch (error) {
    console.error("Error al convertir fecha:", error);
    return null;
  }
};
const parseNumericField = (value) => {
  // Si el valor es null, undefined, o cadena vacía, lo guardamos como null en la DB.
  if (value === null || value === undefined || value === '') {
    return null;
  }
  // Asegurarse de que estamos trabajando con una cadena
  const valueStr = String(value);
  // Eliminar todos los puntos (que usamos como separadores de miles)
  const cleanedValue = valueStr.replace(/\./g, '');
  // Parsear como entero.
  const parsed = parseInt(cleanedValue, 10);
  // Si el resultado no es un número válido (NaN), retornamos null (o 0, según prefieras)
  return isNaN(parsed) ? null : parsed;
};
// Obtener todos los inquilinos con filtros opcionales
const getAllInquilinos = async (req, res) => {
  const { nombre, periodo, contrato } = req.query;

  let filters = [];
  let values = [];

  if (nombre) {
    filters.push(`nombre ILIKE $${values.length + 1}`);
    values.push(`%${nombre}%`);
  }
  if (periodo) {
    filters.push(`periodo = $${values.length + 1}`);
    values.push(periodo);
  }
  if (contrato) {
    filters.push(`contrato = $${values.length + 1}`);
    values.push(contrato);
  }

  const query = `
  SELECT 
    id,
    nombre,
    apellido,
    telefono,
    TO_CHAR(inicio_contrato, 'DD/MM/YYYY') AS inicio_contrato,
    TO_CHAR(vencimiento_contrato, 'DD/MM/YYYY') AS vencimiento_contrato,
    periodo,
    contrato,
    aumento,
    propietario_nombre,
    propietario_direccion,
    propietario_localidad,
    CASE 
      WHEN alquileres_adeudados = 'si debe' THEN 'Sí'
      ELSE 'No' 
    END as alquileres_adeudados,
    CASE 
      WHEN gastos_adeudados = 'si debe' THEN 'Sí'
      ELSE 'No' 
    END as gastos_adeudados,
    ROUND(alquileres_importe) AS alquileres_importe,
    ROUND(agua_importe) AS agua_importe,
    ROUND(luz_importe) AS luz_importe,
    ROUND(tasa_importe) AS tasa_importe,
    ROUND(otros) AS otros,
    ROUND(importe_total) AS importe_total
  FROM inquilinos
  ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''};
`;

  try {
    const result = await pool.query(query, values);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error al obtener los inquilinos", error: err.message });
  }
};

// Obtener un inquilino por ID
const getInquilinoById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
  SELECT 
    id,
    nombre,
    apellido,
    telefono,
    TO_CHAR(inicio_contrato, 'DD/MM/YYYY') AS inicio_contrato,
    TO_CHAR(vencimiento_contrato, 'DD/MM/YYYY') AS vencimiento_contrato,
    periodo::TEXT,
    contrato,
    aumento::TEXT,
    propietario_nombre,
    propietario_direccion,
    propietario_localidad,
    CASE 
      WHEN alquileres_adeudados = 'si debe' THEN 'Sí'
      ELSE 'No' 
    END as alquileres_adeudados,
    CASE 
      WHEN gastos_adeudados = 'si debe' THEN 'Sí'
      ELSE 'No' 
    END as gastos_adeudados,
    alquileres_importe,
    agua_importe,
    luz_importe,
    tasa_importe,
    otros,
    importe_total
  FROM inquilinos
  WHERE id = $1;
`;

    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Inquilino no encontrado" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error al obtener el inquilino', error: err.message });
  }
};

const addInquilino = async (req, res) => {
  const {
    nombre, apellido, telefono, inicio_contrato, vencimiento_contrato, periodo, contrato,
    aumento, propietario_nombre, propietario_direccion, propietario_localidad,
    alquileres_adeudados, gastos_adeudados,
    alquileres_importe, agua_importe, luz_importe, tasa_importe, otros, importe_total, // <-- Ahora son strings o null/undefined
  } = req.body;

  if (!nombre || !apellido || !telefono || !inicio_contrato || !vencimiento_contrato || !periodo || !contrato ||
    !propietario_nombre || !propietario_direccion || !propietario_localidad) {
    return res.status(400).json({ message: "Faltan datos obligatorios." });
  }
  // Cambiá la validación en addInquilino y updateInquilino así:
  if (!['si debe', 'no debe'].includes(alquileres_adeudados) || !['si debe', 'no debe'].includes(gastos_adeudados)) {
    return res.status(400).json({
      message: "Valores inválidos para campos de deuda. Use 'si debe' o 'no debe'"
    });
  }


  const inicio_contratoISO = safeDateToISO(inicio_contrato);
  const vencimiento_contratoISO = safeDateToISO(vencimiento_contrato);
  const alquileres_importe_parsed = parseNumericField(alquileres_importe);
  const agua_importe_parsed = parseNumericField(agua_importe);
  const luz_importe_parsed = parseNumericField(luz_importe);
  const tasa_importe_parsed = parseNumericField(tasa_importe);
  const otros_parsed = parseNumericField(otros); // Asegúrate que 'otros' SIEMPRE es numérico o null/vacío si lo parseas así
  const importe_total_parsed = parseNumericField(importe_total);
  try {
    const query = `
      INSERT INTO inquilinos (
        nombre, apellido, telefono, inicio_contrato, vencimiento_contrato, periodo, contrato, aumento,
        propietario_nombre, propietario_direccion, propietario_localidad,
        alquileres_adeudados, gastos_adeudados, alquileres_importe,
        agua_importe, luz_importe, tasa_importe, otros, importe_total
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *;
    `;

    const normalizeDeuda = (value) => {
      if (value === 'Sí' || value === 'si debe') return 'si debe';
      if (value === 'No' || value === 'no debe') return 'no debe';
      return null;
    };

    const transformedAlquileres = normalizeDeuda(alquileres_adeudados);
    const transformedGastos = normalizeDeuda(gastos_adeudados);

    if (!transformedAlquileres || !transformedGastos) {
      return res.status(400).json({
        message: "Valores inválidos para campos de deuda."
      });
    }
    const values = [
      nombre,
      apellido,
      telefono,
      inicio_contratoISO,
      vencimiento_contratoISO,
      periodo,
      contrato,
      aumento,
      propietario_nombre,
      propietario_direccion,
      propietario_localidad,
      transformedAlquileres,
      transformedGastos,
      alquileres_importe_parsed,
      agua_importe_parsed,
      luz_importe_parsed,
      tasa_importe_parsed,
      otros_parsed,
      importe_total_parsed,
      id
    ];


    const result = await pool.query(query, values);
    res.status(201).json({ message: "Inquilino agregado", data: result.rows[0] });
  } catch (err) {
    console.error("Error al agregar el inquilino:", err.message);
    res.status(500).json({ message: "Error al agregar el inquilino.", error: err.message });
  }
};

// Actualizar un inquilino
const updateInquilino = async (req, res) => {
  const { id } = req.params;
  const {
    nombre, apellido, telefono, inicio_contrato, vencimiento_contrato, periodo, contrato, aumento,
    propietario_nombre, propietario_direccion, propietario_localidad,
    alquileres_adeudados, gastos_adeudados,
    alquileres_importe, agua_importe, luz_importe, tasa_importe, otros, importe_total
  } = req.body;

  if (!['Sí', 'No'].includes(alquileres_adeudados) || !['Sí', 'No'].includes(gastos_adeudados)) {
    return res.status(400).json({
      message: "Valores inválidos para campos de deuda. Use 'Sí' o 'No'"
    });
  }
  // --- Aplicar la nueva función de parseo a los campos numéricos ---
  // (Similar a addInquilino)
  const inicio_contratoISO = safeDateToISO(inicio_contrato);
  const vencimiento_contratoISO = safeDateToISO(vencimiento_contrato);
  const alquileres_importe_parsed = parseNumericField(alquileres_importe);
  const agua_importe_parsed = parseNumericField(agua_importe);
  const luz_importe_parsed = parseNumericField(luz_importe);
  const tasa_importe_parsed = parseNumericField(tasa_importe);
  const otros_parsed = parseNumericField(otros);
  const importe_total_parsed = parseNumericField(importe_total);

  const transformedAlquileres = alquileres_adeudados === 'Sí' ? 'si debe' : 'no debe';
  const transformedGastos = gastos_adeudados === 'Sí' ? 'si debe' : 'no debe';

  try {
    const query = `
      UPDATE inquilinos SET
        nombre = $1, apellido = $2, telefono = $3, inicio_contrato = $4, vencimiento_contrato = $5,
        periodo = $6, contrato = $7, aumento = $8, propietario_nombre = $9, propietario_direccion = $10,
        propietario_localidad = $11, alquileres_adeudados = $12, gastos_adeudados = $13,
        alquileres_importe = $14, agua_importe = $15, luz_importe = $16, tasa_importe = $17,
        otros = $18, importe_total = $19
      WHERE id = $20 RETURNING *;
    `;

    const values = [
      nombre,
      apellido,
      telefono,
      inicio_contratoISO,
      vencimiento_contratoISO,
      periodo,
      contrato,
      aumento,
      propietario_nombre,
      propietario_direccion,
      propietario_localidad,
      transformedAlquileres,
      transformedGastos,
      alquileres_importe_parsed,
      agua_importe_parsed,
      luz_importe_parsed,
      tasa_importe_parsed,
      otros_parsed,
      importe_total_parsed,
      id
    ];

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Inquilino no encontrado" });
    }

    res.status(200).json({ message: "Inquilino actualizado", data: result.rows[0] });
  } catch (err) {
    console.error("Error al actualizar el inquilino:", err.message);
    res.status(500).json({ message: "Error al actualizar el inquilino", error: err.message });
  }
};

// Eliminar un inquilino
const deleteInquilino = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM inquilinos WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Inquilino no encontrado" });
    }
    res.status(200).json({ message: "Inquilino eliminado", data: result.rows[0] });
  } catch (err) {
    console.error("Error al eliminar el inquilino:", err.message);
    res.status(500).json({ message: "Error al eliminar el inquilino", error: err.message });
  }
};

// Generar recibo en PDF
const generarRecibo = async (req, res) => {
  try {
    const { datosRecibo } = req.body;
    // Formatear los importes para asegurarse de que no tienen decimales
    const alquileresImporte = formatCurrency(datosRecibo.alquileres_importe);
    const aguaImporte = formatCurrency(datosRecibo.agua_importe);
    const luzImporte = formatCurrency(datosRecibo.luz_importe);
    const tasaImporte = formatCurrency(datosRecibo.tasa_importe);
    const otrosImportes = formatCurrency(datosRecibo.otros);
    const importeTotal = formatCurrency(datosRecibo.importe_total);
    const documentDefinition = {
      content: [{ text: 'Recibo de Alquiler', style: 'header' }, { text: `Inquilino: ${datosRecibo.nombre} ${datosRecibo.apellido}` }],
      styles: { header: { fontSize: 18, bold: true } }
    };

    const pdfPrinter = new PDFMake();
    const pdfDoc = pdfPrinter.createPdfKitDocument(documentDefinition);

    const rutaRecibos = path.join(__dirname, '../recibos');
    if (!fs.existsSync(rutaRecibos)) fs.mkdirSync(rutaRecibos, { recursive: true });

    const nombreArchivo = `recibo_${datosRecibo.id}.pdf`;
    const rutaArchivo = path.join(rutaRecibos, nombreArchivo);
    pdfDoc.pipe(fs.createWriteStream(rutaArchivo));
    pdfDoc.end();

    res.json({ url: `http://localhost:3001/recibos/${nombreArchivo}` });
  } catch (error) {
    console.error("Error al generar recibo:", error);
    res.status(500).json({ error: 'Error al generar recibo' });
  }
};

module.exports = { getAllInquilinos, getInquilinoById, addInquilino, updateInquilino, deleteInquilino, generarRecibo };