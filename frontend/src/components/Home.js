import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import logo from '../assets/img/logo.png'; // Ajusta la ruta según tu estructura de archivos

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Simulación de una solicitud para validar el token (reemplaza con tu lógica real)
        const response = await fetch('/api/validate-token', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Token inválido o expirado');
        }

        setLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error al validar el token:', error);
        } else {
          console.error('Error al validar el token:', error);
        }

       
        Swal.fire({
          title: 'Sesión Expirada',
          text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
        }).then(() => {
          localStorage.removeItem('token');
          navigate('/login');
        });
      }
    };

    validateToken().catch((error) => {
      console.error('Error al ejecutar la función validateToken:', error);
    });
   
  }, [navigate]);

  if (loading) {
    return (
      <div className="text-center mt-5" aria-live="polite" aria-busy="true">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Validando sesión...</p>
      </div>
    );
  }

  return (
    <div className="text-center mt-5">
      <h1>MS Inmobiliaria</h1>
      <p className="lead">Administre sus inquilinos de manera rápida y eficiente.</p>
      <img 
        src={logo} 
        alt="Logo de la Gestión de Inmobiliaria" 
        className="img-fluid mt-4 mb-5" 
        style={{ maxWidth: '150px' }} 
      />
    </div>
  );
};

export default Home;
