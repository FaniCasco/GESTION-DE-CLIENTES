const express = require('express');
const { login, verifyToken } = require('../controllers/authController');
const router = express.Router();

// Ruta para el login
router.post('/login', login);

// Ejemplo de ruta protegida
router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: `Bienvenido, ${req.user.username}. Accediste a una ruta protegida.` });
});

module.exports = router;

