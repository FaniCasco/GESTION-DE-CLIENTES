const pool = require("../config/db");
const PDFMake = require('pdfmake'); // Importar correctamente pdfmake
const fs = require('fs');
const path = require('path');


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
  periodo,
  contrato,
  aumento,
  propietario_nombre,
  propietario_direccion,
  propietario_localidad,
  alquileres_adeudados,
  gastos_adeudados,
  ROUND(alquileres_importe) AS alquileres_importe, 
  ROUND(agua_importe) AS agua_importe,             
  ROUND(luz_importe) AS luz_importe,               
  ROUND(tasa_importe) AS tasa_importe,             
  ROUND(otros) AS otros,                           
  ROUND(importe_total) AS importe_total            
FROM inquilinos

    ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
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
        TO_CHAR(inicio_contrato, 'DD/MM/YYYY') AS inicio_contrato, -- Formatear la fecha
        periodo,
        contrato,
        aumento,
        propietario_nombre,
        propietario_direccion,
        propietario_localidad,
        alquileres_adeudados,
        gastos_adeudados,
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
    nombre, apellido, telefono, inicio_contrato, periodo, contrato,
    aumento, propietario_nombre, propietario_direccion, propietario_localidad,
    alquileres_adeudados, gastos_adeudados,
    // Recibimos estos como string desde el frontend
    alquileres_importe, agua_importe, luz_importe, tasa_importe, otros, importe_total, // <-- Ahora son strings o null/undefined
  } = req.body;

  if (!nombre || !apellido || !telefono || !inicio_contrato || !periodo || !contrato ||
    !propietario_nombre || !propietario_direccion || !propietario_localidad) {
    return res.status(400).json({ message: "Faltan datos obligatorios." });
  }

  // Convertir la fecha al formato ISO (esto ya lo tienes y está bien si frontend envía algo parseable por new Date)
  // Si el frontend envía dd/mm/yyyy, new Date(fechaString) podría necesitar parseo manual o librerías si la string no es estándar ISO.
  // TU FRONTEND YA HACE EL PARSEO DE DD/MM/YYYY a Date.toISOString() ANTES DE ENVIAR, así que ESTO ESTÁ BIEN.
  const fechaISO = inicio_contrato ? new Date(inicio_contrato).toISOString() : null;


  // --- Aplicar la nueva función de parseo a los campos numéricos ---
  const alquileres_importe_parsed = parseNumericField(alquileres_importe);
  const agua_importe_parsed = parseNumericField(agua_importe);
  const luz_importe_parsed = parseNumericField(luz_importe);
  const tasa_importe_parsed = parseNumericField(tasa_importe);
  const otros_parsed = parseNumericField(otros); // Asegúrate que 'otros' SIEMPRE es numérico o null/vacío si lo parseas así
  const importe_total_parsed = parseNumericField(importe_total);
  // Agrega periodo y aumento si también necesitan este parseo en backend (tu frontend los trata así)
  const periodo_parsed = parseNumericField(periodo);
  const aumento_parsed = parseNumericField(aumento);


  try {
    const query = `
      INSERT INTO inquilinos (
        nombre, apellido, telefono, inicio_contrato, periodo, contrato, aumento,
        propietario_nombre, propietario_direccion, propietario_localidad,
        alquileres_adeudados, gastos_adeudados, alquileres_importe,
        agua_importe, luz_importe, tasa_importe, otros, importe_total
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *;
    `;

    const values = [
      nombre, apellido, telefono, fechaISO, periodo_parsed, contrato, aumento_parsed, // <-- Usar variables parseadas
      propietario_nombre, propietario_direccion, propietario_localidad,
      alquileres_adeudados, gastos_adeudados, alquileres_importe_parsed, // <-- Usar variables parseadas
      agua_importe_parsed, luz_importe_parsed, tasa_importe_parsed, otros_parsed,
      importe_total_parsed, // <-- Usar variables parseadas
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
    nombre, apellido, telefono, inicio_contrato, periodo, contrato, aumento,
    propietario_nombre, propietario_direccion, propietario_localidad,
    alquileres_adeudados, gastos_adeudados,
    // Recibimos estos como string desde el frontend
    alquileres_importe, agua_importe, luz_importe, tasa_importe, otros, importe_total, // <-- Ahora son strings o null/undefined
  } = req.body;

  // --- Aplicar la nueva función de parseo a los campos numéricos ---
  // (Similar a addInquilino)
  const alquileres_importe_parsed = parseNumericField(alquileres_importe);
  const agua_importe_parsed = parseNumericField(agua_importe);
  const luz_importe_parsed = parseNumericField(luz_importe);
  const tasa_importe_parsed = parseNumericField(tasa_importe);
  const otros_parsed = parseNumericField(otros);
  const importe_total_parsed = parseNumericField(importe_total);
  const periodo_parsed = parseNumericField(periodo);
  const aumento_parsed = parseNumericField(aumento);

  // TU FRONTEND YA HACE EL PARSEO DE DD/MM/YYYY a Date.toISOString() ANTES DE ENVIAR inicio_contrato,
  // así que inicio_contrato ya debería venir en un formato ISO o parseable por new Date().
  // Si el frontend envía null, undefined o '', puedes dejarlo así para que parseNumericField (o una verificación similar) lo maneje.
  // Si necesitas asegurarte de que sea una fecha válida ISO o null:
   const fechaISO = inicio_contrato ? new Date(inicio_contrato).toISOString() : null;
   // NOTA: Si el frontend envía ya un string ISO, `new Date(inicio_contrato).toISOString()` es redundante pero inofensivo si la string es válida.
   // Si el frontend envía DD/MM/YYYY, el frontend debe parsearlo antes de enviar. El frontend que te pasé ya hace esto.


  try {
    const query = `
      UPDATE inquilinos SET
        nombre = $1, apellido = $2, telefono = $3, inicio_contrato = $4,
        periodo = $5, contrato = $6, aumento = $7, propietario_nombre = $8,
        propietario_direccion = $9, propietario_localidad = $10,
        alquileres_adeudados = $11, gastos_adeudados = $12,
        alquileres_importe = $13, agua_importe = $14, luz_importe = $15, tasa_importe = $16,
        otros = $17, importe_total = $18
      WHERE id = $19 RETURNING *;
    `;

    const values = [
      nombre, apellido, telefono, fechaISO, // <-- Usar fechaISO parseada/validada
      periodo_parsed, contrato, aumento_parsed, // <-- Usar variables parseadas
      propietario_nombre, propietario_direccion, propietario_localidad,
      alquileres_adeudados, gastos_adeudados,
      alquileres_importe_parsed, agua_importe_parsed, luz_importe_parsed, tasa_importe_parsed, // <-- Usar variables parseadas
      otros_parsed, importe_total_parsed, // <-- Usar variables parseadas
      id // El ID siempre va al final en esta query
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
