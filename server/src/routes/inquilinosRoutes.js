const express = require("express");
const router = express.Router();
const path = require("path");
require("dotenv").config();
//const PDFDocument = require('pdfmake'); 


// 📌 Importar controladores de inquilinos
const {
  getAllInquilinos,
  getInquilinoById,
  addInquilino,
  updateInquilino,
  deleteInquilino,
  generarRecibo,
} = require("../controllers/inquilinosController");


// 📌 Rutas de inquilinos
router.get("/", getAllInquilinos); // Obtener todos los inquilinos
router.get("/:id", getInquilinoById); // Obtener un inquilino por ID
router.post("/", addInquilino); // Agregar un nuevo inquilino
router.put("/:id", updateInquilino); // Actualizar un inquilino por ID
router.delete("/:id", deleteInquilino); // Eliminar un inquilino por ID
router.post("/generar-recibo", generarRecibo); // Nueva ruta para generar recibo

module.exports = router;
