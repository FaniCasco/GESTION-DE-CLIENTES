import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Eliminar el token de localStorage
    localStorage.removeItem('token');
    // Redirigir al usuario al login
    navigate('/login');
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return !!localStorage.getItem('token'); // Verifica si hay un token almacenado
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-nav shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img 
            src="/assets/img/logo.png" 
            alt="Logo" 
            width="50" 
            height="50" 
            className="me-2"
          />
          <h2><span>Gestión de clientes</span></h2>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/inquilinos">
                <i className="bi bi-people-fill me-2"></i>Inquilinos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/add-inquilino">
                <i className="bi bi-person-plus-fill me-2"></i>Agregar Nuevo
              </Link>
            </li>
            {/* Mostrar el botón de salir solo si el usuario está autenticado */}
            {isAuthenticated() && (
              <li className="nav-item">
                <button 
                  className="btn btn-danger nav-link text-white" 
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>Salir
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
