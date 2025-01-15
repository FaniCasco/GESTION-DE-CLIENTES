const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Cargar variables de entorno desde .env

const SECRET_KEY = process.env.SECRET_KEY || 'mysecretkey';

// Simulación de base de datos con contraseñas hasheadas
const users = [{ 
  username: 'admin', 
  password: bcrypt.hashSync('*Noe37*', 10) // Contraseña hasheada
}];

// Controlador para login
exports.login = (req, res) => {
  const { username, password } = req.body;

  // Validar usuario
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Usuario no encontrado' });
  }

  // Validar contraseña
  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Contraseña incorrecta' });
  }

  // Generar token JWT
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

  res.json({ token });
};

// Middleware para verificar el token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Extraer el token después de "Bearer"
  if (!token) {
    return res.status(403).json({ message: 'Token inválido' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = decoded;
    next();
  });
};

