// frontend/src/components/Home.js
import React from 'react';

const Home = () => {
  return (
    <div className="text-center mt-5 bg-home">
      <h1>MS Inmobiliaria</h1>
      <p className="lead">Administre sus inquilinos de manera rápida y eficiente.</p>
      <img 
        src="../assets/img/logo.png" 
        alt="Logo de la Gestión de Inmobiliaria" 
        className="img-fluid mt-4 mb-5" 
        style={{ maxWidth: '150px' }} 
      />
    </div>
  );
};

export default Home;

