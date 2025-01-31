//Este codigo tiene la configuracion de redux que cumple la funcion de 
// almacenar los datos de los inquilinos en el store de redux, 
// para poder acceder a ellos desde cualquier componente

import { configureStore } from '@reduxjs/toolkit';
// Importar configureStore de redux toolkit que sirve para configurar el store de redux

import inquilinosReducer from '../features/inquilinos/inquilinosSlice';
// Importar el reducer del modulo de inquilinos que contiene los datos de los inquilinos

const store = configureStore({
    reducer: {
        inquilinos: inquilinosReducer,
    },
});

export default store;

