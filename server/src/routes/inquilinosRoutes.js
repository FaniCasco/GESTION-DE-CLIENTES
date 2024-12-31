const express = require("express");
const router = express.Router();
const { 
  getAllInquilinos, 
  getInquilinoById, 
  addInquilino, 
  updateInquilino, 
  deleteInquilino 
} = require("../controllers/inquilinosController");

// Ruta para obtener todos los inquilinos
router.get("/", getAllInquilinos);

// Ruta para obtener un inquilino por ID
router.get("/:id", getInquilinoById);

// Ruta para agregar un nuevo inquilino
router.post("/", addInquilino);

// Ruta para actualizar un inquilino por ID
router.put("/:id", updateInquilino);

// Ruta para eliminar un inquilino por ID
router.delete("/:id", deleteInquilino);

module.exports = router;


