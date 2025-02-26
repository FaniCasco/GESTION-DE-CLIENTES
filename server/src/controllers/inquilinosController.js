const pool = require("../config/db");
const PDFMake = require('pdfmake'); // Importar correctamente pdfmake
const fs = require('fs');
const path = require('path');

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
    alquileres_adeudados, gastos_adeudados, alquileres_importe,
    agua_importe, luz_importe, tasa_importe, otros, importe_total
  } = req.body;

  if (!nombre || !apellido || !telefono || !inicio_contrato || !periodo || !contrato ||
      !propietario_nombre || !propietario_direccion || !propietario_localidad) {
    return res.status(400).json({ message: "Faltan datos obligatorios." });
  }

  // Convertir la fecha al formato ISO antes de guardarla en la base de datos
  const fechaISO = new Date(inicio_contrato).toISOString();

  const numericFields = {
    alquileres_importe: parseFloat(alquileres_importe) || 0,
    agua_importe: parseFloat(agua_importe) || 0,
    luz_importe: parseFloat(luz_importe) || 0,
    tasa_importe: parseFloat(tasa_importe) || 0,
    otros: parseFloat(otros) || 0,
    importe_total: parseFloat(importe_total) || 0,
  };

  try {
    const query = `
      INSERT INTO inquilinos (
        nombre, apellido, telefono, inicio_contrato, periodo, contrato, aumento, 
        propietario_nombre, propietario_direccion, propietario_localidad, 
        alquileres_adeudados, gastos_adeudados, alquileres_importe, 
        agua_importe, luz_importe, tasa_importe, otros, importe_total
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *;
    `;

    const values = [
      nombre, apellido, telefono, fechaISO, periodo, contrato, aumento,
      propietario_nombre, propietario_direccion, propietario_localidad,
      alquileres_adeudados, gastos_adeudados, numericFields.alquileres_importe,
      numericFields.agua_importe, numericFields.luz_importe, numericFields.tasa_importe, numericFields.otros,
      numericFields.importe_total,
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
    alquileres_adeudados, gastos_adeudados, alquileres_importe, agua_importe, luz_importe,
    tasa_importe, otros, importe_total
  } = req.body;

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
      nombre, apellido, telefono, inicio_contrato, periodo, contrato, aumento,
      propietario_nombre, propietario_direccion, propietario_localidad,
      alquileres_adeudados, gastos_adeudados, alquileres_importe, agua_importe, luz_importe,
      tasa_importe, otros, importe_total, id
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
