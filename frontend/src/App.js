import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import InquilinosList from './components/InquilinosList';
import InquilinoForm from './components/InquilinoForm';
import Login from './components/Login';

import './App.css';
import './index.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import 'bootstrap/dist/css/bootstrap.min.css';


// Función para verificar si el usuario está autenticado
const isAuthenticated = () => {
  return !!localStorage.getItem('token'); // Verifica si hay un token almacenado
};


function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <div className="container mt-4 flex-grow-1">
          <Routes>
            {/* Redirigir al Login si no está autenticado */}
            <Route
              path="/"
              element={isAuthenticated() ? <Home /> : <Navigate to="/login" />}
            />

            <Route path="/login" element={<Login />} />
            <Route
              path="/inquilinos"
              element={isAuthenticated() ? <InquilinosList /> : <Navigate to="/login" />}
            />
            <Route
              path="/add-inquilino"
              element={isAuthenticated() ? <InquilinoForm /> : <Navigate to="/login" />}
            />
            <Route
              path="/edit-inquilino/:id"
              element={isAuthenticated() ? <InquilinoForm /> : <Navigate to="/login" />}
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;









