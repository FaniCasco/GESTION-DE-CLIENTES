// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // Importa el Footer
import Home from './components/Home';
import InquilinosList from './components/InquilinosList';
import InquilinoForm from './components/InquilinoForm';
import "bootstrap-icons/font/bootstrap-icons.css";
import './App.css';
import './index.css';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <div className="container mt-4 flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inquilinos" element={<InquilinosList />} />
            <Route path="/add-inquilino" element={<InquilinoForm />} />
            <Route path="/edit-inquilino/:id" element={<InquilinoForm />} />
          </Routes>
        </div>
        <Footer /> 
      </div>
    </Router>
  );
}

export default App;







