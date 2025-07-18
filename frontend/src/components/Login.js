import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../Login.css';

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError('Por favor, complete todos los campos.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response?.data?.token) {
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        navigate('/');
      } else {
        setError('Hubo un error inesperado. Inténtelo más tarde.');
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        setError('Credenciales incorrectas. Verifique su nombre de usuario y contraseña.');
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.request) {
        setError('No se recibió respuesta del servidor. Verifique su conexión a internet.');
      } else {
        setError('Hubo un error inesperado. Inténtelo más tarde.');
      }
    } finally {
      setLoading(false);
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
                    aria-describedby={error ? "login-error" : undefined}
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
                    aria-describedby={error ? "login-error" : undefined}
                  />
                </div>
                {error && <div id="login-error" className="alert alert-danger mt-3">{error}</div>}
                <div className="form-group text-center mt-4">
                  <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Iniciar sesión'}
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

