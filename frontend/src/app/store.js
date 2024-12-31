//frontend/src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import inquilinosReducer from '../features/inquilinos/inquilinosSlice';

const store = configureStore({
    reducer: {
        inquilinos: inquilinosReducer,
    },
});

export default store;

