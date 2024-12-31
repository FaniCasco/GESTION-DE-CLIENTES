import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Thunk para obtener inquilinos
export const fetchInquilinos = createAsyncThunk(
  'inquilinos/fetchInquilinos',
  async () => {
      try {
          const response = await api.get('/inquilinos');
          console.log('Datos recibidos:', response.data);
          return response.data;
      } catch (error) {
          console.error('Error al cargar inquilinos:', error);
          throw error;
      }
  }
);


const inquilinosSlice = createSlice({
  name: 'inquilinos',
  initialState: {
    data: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInquilinos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInquilinos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchInquilinos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default inquilinosSlice.reducer;
