/*Este codigo tiene la funcion de crear una instancia de axios y 
asignarle una url base para realizar las peticiones a la api */


import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  
});

export default api;



