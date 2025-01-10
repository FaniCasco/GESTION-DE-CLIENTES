import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Login.css'; 

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Intentar la solicitud de login
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        username,
        password,
      });
      console.log('Respuesta del servidor:', JSON.stringify(response.data, null, 2));  // Ver los datos de la respuesta
  
      // Almacenar el token recibido en localStorage
      localStorage.setItem('token', response.data.token);
      
      // Redirigir al home (si el login fue exitoso)
      navigate('/');
    } catch (err) {
      // Si ocurre un error, mostrar el mensaje
      console.error('Error al iniciar sesión:', err);
      setError('Credenciales inválidas. Intenta de nuevo.');
    }
  };
  
  

  return (
    <div className="login-container">
      <div className="card shadow-sm">
        <h2 className="text-center mb-4">Inicio de Sesión</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Usuario</label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Iniciar Sesión</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
