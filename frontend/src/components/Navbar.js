import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      setIsAuthenticated(false); // Cambia el estado de autenticación a false
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Hubo un problema al cerrar sesión. Inténtalo de nuevo.');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-nav shadow-sm" aria-label="Barra de navegación principal" style={{ backgroundColor: '#2c3e50' }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/" aria-label="Inicio">
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
          aria-label="Alternar navegación"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link 
                className="nav-link btn-metal text-white btn rounded-pill me-2 py-2 px-4 shadow-sm hover-shadow"
                to="/inquilinos" 
                aria-label="Inquilinos"
              >
                <i className="bi bi-people-fill me-2"></i>Inquilinos
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link btn-metal text-white btn btn-success rounded-pill me-2 py-2 px-4 shadow-sm hover-shadow"
                to="/add-inquilino" 
                aria-label="Agregar nuevo inquilino"
              >
                <i className="bi bi-person-plus-fill me-2"></i>Agregar Nuevo
              </Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <Link 
                  className="nav-link btn btn-danger rounded-pill px-4 py-2 shadow btn-bold" 
                  to="/login" 
                  onClick={handleLogout}
                  aria-label="Cerrar sesión"
                >
                  <i className="bi bi-box-arrow-right me-2"></i>Salir
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

