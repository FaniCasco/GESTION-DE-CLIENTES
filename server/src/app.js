const express = require("express");
const cors = require("cors");
const inquilinosRoutes = require("./routes/inquilinosRoutes");
const authRoutes = require("./routes/authRoutes");
const path = require('path');
const app = express();
app.options('*', cors());


// Habilitar CORS de forma global
app.use(cors({
  origin: 'http://localhost:3000',  // Permite solicitudes desde el frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,  // Si necesitas enviar cookies o tokens en las cabeceras
}));


// Middleware para parsear JSON
app.use(express.json());

// Ruta de prueba inicial
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente.");
});

// Registrar rutas de autenticación
app.use("/api/auth", authRoutes);

// Registrar rutas CRUD de inquilinos
app.use("/api/inquilinos", inquilinosRoutes);

// Sirve los archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Redirige todas las rutas no manejadas al index.html del frontend
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/build', 'index.html'));
});

module.exports = app;


















