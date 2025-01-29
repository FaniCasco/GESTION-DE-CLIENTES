// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import InquilinosList from './components/InquilinosList';
import InquilinoForm from './components/InquilinoForm';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const handleTokenChange = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    window.addEventListener('storage', handleTokenChange);

    return () => {
      window.removeEventListener('storage', handleTokenChange);
    };
  }, []);

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar 
          isAuthenticated={isAuthenticated} 
          setIsAuthenticated={setIsAuthenticated} 
        />
        <div className="container mt-4 flex-grow-1">
          <Routes>
            <Route
              path="/"
              element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
            />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route
              path="/inquilinos"
              element={isAuthenticated ? <InquilinosList /> : <Navigate to="/login" />}
            />
            <Route
              path="/add-inquilino"
              element={isAuthenticated ? <InquilinoForm /> : <Navigate to="/login" />}
            />
            <Route
              path="/edit-inquilino/:id"
              element={isAuthenticated ? <InquilinoForm /> : <Navigate to="/login" />}
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;




