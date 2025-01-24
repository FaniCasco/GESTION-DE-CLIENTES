//CLIENTES/ frontend/src/components/Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Bloquea el botón
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Credenciales incorrectas. Verifique su nombre de usuario y contraseña.');
      } else {
        setError('Hubo un error inesperado. Inténtelo más tarde.');
      }
    } finally {
      setLoading(false); // Desbloquea el botón
    }

    };
    

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title text-center">Iniciar sesión</h3>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="username">Nombre de usuario</label>
                  <input
                    type="text"
                    id="username"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Ingrese su nombre de usuario"
                    aria-label="Nombre de usuario"
                  />
                </div>
                <div className="form-group mt-3">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Ingrese su contraseña"
                    aria-label="Contraseña"
                  />
                </div>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
                <div className="form-group text-center mt-4">
                  <button type="submit" className="btn btn-primary btn-block">
                    Iniciar sesión
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
