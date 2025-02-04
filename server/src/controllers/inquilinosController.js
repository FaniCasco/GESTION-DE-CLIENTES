const pool = require("../config/db");

// Obtener todos los inquilinos
const getAllInquilinos = async (req, res) => {
  const { nombre, periodo, contrato } = req.query;

  let query = "SELECT * FROM inquilinos WHERE 1=1";
  const values = [];

  if (nombre) {
    query += " AND nombre ILIKE $1";
    values.push(`%${nombre}%`);
  }

  if (periodo) {
    query += " AND periodo = $2";
    values.push(periodo);
  }

  if (contrato) {
    query += " AND contrato = $3";
    values.push(contrato);
  }

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
    const result = await pool.query("SELECT * FROM inquilinos WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Inquilino no encontrado" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error al obtener el inquilino", error: err.message });
  }
};
// Agregar un nuevo inquilino
const addInquilino = async (req, res) => {
  const {
    nombre,
    apellido,
    telefono,
    inicio_contrato,
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
    tasa_importe,
    otros,
    importe_total,
  } = req.body;

  // Convertir números
  const importe_total_num = parseFloat(importe_total);
  const alquileres_importe_num = parseFloat(alquileres_importe);
  const agua_importe_num = parseFloat(agua_importe);
  const tasa_importe_num = parseFloat(tasa_importe);
  const otros_num = parseFloat(otros);

  // Convertir fecha a formato ISO
  let inicio_contrato_formatted;
  try {
    inicio_contrato_formatted = new Date(inicio_contrato).toISOString().slice(0, 10); // YYYY-MM-DD
  } catch (error) {
    return res.status(400).json({
      message: "La fecha de inicio del contrato no es válida.",
    });
  }

  // Validar campos obligatorios
  if (
    !nombre ||
    !apellido ||
    !telefono ||
    !inicio_contrato ||
    !periodo ||
    !contrato ||
    !propietario_nombre ||
    !propietario_direccion ||
    !propietario_localidad ||
    isNaN(alquileres_importe_num) ||
    isNaN(agua_importe_num) ||
    isNaN(tasa_importe_num) ||
    isNaN(otros_num) ||
    isNaN(importe_total_num)
  ) {
    return res.status(400).json({
      message:
        "Faltan datos obligatorios o los datos no son válidos. Verifica el cuerpo de la solicitud.",
    });
  }

  try {
    // SQL Query para insertar datos
    const query = `
      INSERT INTO inquilinos (
        nombre, apellido, telefono, inicio_contrato, periodo,
        contrato, aumento, propietario_nombre, propietario_direccion,
        propietario_localidad, alquileres_adeudados, gastos_adeudados,
        alquileres_importe, agua_importe, tasa_importe, otros, importe_total
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17
      )
      RETURNING *;
    `;

    const values = [
      nombre,
      apellido,
      telefono,
      inicio_contrato,
      periodo,
      contrato,
      aumento,
      propietario_nombre,
      propietario_direccion,
      propietario_localidad,
      alquileres_adeudados,
      gastos_adeudados,
      alquileres_importe_num,
      agua_importe_num,
      tasa_importe_num,
      otros_num,
      importe_total_num,
    ];

    // Ejecutar consulta
    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Inquilino agregado exitosamente",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error al agregar el inquilino:", err.message);
    res.status(500).json({
      message: "Error al agregar el inquilino.",
      error: err.message,
    });
  }
};


// Actualizar un inquilino por ID
const updateInquilino = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    apellido,
    telefono,
    inicio_contrato,
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
    tasa_importe,
    otros,
    importe_total
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE inquilinos 
       SET nombre = $1, apellido = $2, telefono = $3, inicio_contrato = $4, periodo = $5,
           contrato = $6, aumento = $7, propietario_nombre = $8, propietario_direccion = $9, 
           propietario_localidad = $10, alquileres_adeudados = $11, gastos_adeudados = $12, 
           alquileres_importe = $13, agua_importe = $14, tasa_importe = $15, otros = $16, 
           importe_total = $17 
       WHERE id = $18 
       RETURNING *`,
      [
        nombre, apellido, telefono, inicio_contrato, periodo, contrato, aumento,
        propietario_nombre, propietario_direccion, propietario_localidad,
        alquileres_adeudados, gastos_adeudados, alquileres_importe,
        agua_importe, tasa_importe, otros, importe_total, id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Inquilino no encontrado" });
    }

    res.status(200).json({ message: "Inquilino actualizado", data: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error al actualizar el inquilino", error: err.message });
  }
};


// Eliminar un inquilino
const deleteInquilino = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "El ID del inquilino es obligatorio." });
  }

  try {
    const result = await pool.query(`DELETE FROM inquilinos WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Inquilino no encontrado" });
    }

    res.status(200).json({ message: "Inquilino eliminado exitosamente" });
  } catch (err) {
    console.error("Error al eliminar el inquilino:", err.message);
    res.status(500).json({ message: "Error al eliminar el inquilino", error: err.message });
  }
};


module.exports = { getAllInquilinos, getInquilinoById, addInquilino, updateInquilino, deleteInquilino };

