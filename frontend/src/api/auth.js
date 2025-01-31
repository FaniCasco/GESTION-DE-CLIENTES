/* Este código tiene la funcion de realizar una petición a la api
para iniciar sesion */

import axios from 'axios';// Importar axios

const API_URL = '/api/auth'; // URL de la API

export const login = async (credentials) => { // Función para iniciar sesion
  const response = await axios.post(`${API_URL}/login`, credentials);// Realizar la petición a la API
  return response.data;   // Devolver los datos de la petición
};
