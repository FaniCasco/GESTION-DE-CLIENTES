const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const inquilinosRoutes = require("./routes/inquilinosRoutes");

const app = express();

// Middlewares
//app.use(cors());
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000', // Dominio del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));


// Ruta de prueba inicial
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente.");
});

// Registrar rutas CRUD de inquilinos
app.use("/api/inquilinos", inquilinosRoutes);


module.exports = app;





