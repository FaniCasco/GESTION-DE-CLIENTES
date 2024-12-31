// frontend/src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api', // Asegúrate de apuntar al backend
});

export default api;



