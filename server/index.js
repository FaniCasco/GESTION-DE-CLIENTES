//server/index.js
const app = require("./src/app");
const PORT = process.env.PORT || 3001;

// Iniciar el servidor y manejar errores
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Manejador de errores si el puerto ya está en uso
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Error: El puerto ${PORT} ya está en uso. Cierra el proceso que lo está ocupando e intenta nuevamente.`);
    process.exit(1); // Salir del proceso con un error
  } else {
    console.error("Error inesperado:", err);
    process.exit(1); // Salir del proceso con un error
  }
});

// Opcional: Manejo de cierre ordenado del servidor
const shutdown = () => {
  console.log("Cerrando el servidor...");
  server.close(() => {
    console.log("Servidor cerrado correctamente.");
    process.exit(0);
  });
};

// Escuchar señales del sistema para un cierre limpio
process.on("SIGINT", shutdown); // Ctrl+C
process.on("SIGTERM", shutdown); // Terminación desde el sistema

