const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'mysecretkey';

// Simulación de base de datos
const users = [{ username: 'admin', password: '*Noe37*' }];

// Controlador para login
exports.login = (req, res) => {
  const { username, password } = req.body;

  // Validar usuario
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

  // Generar token JWT
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

  res.json({ token });
};

// Middleware para verificar el token
exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = decoded;
    next();
  });
};
