import React from 'react';
import { useForm } from 'react-hook-form';

const AddInquilino = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    // Aquí puedes manejar la lógica para agregar un nuevo inquilino
    console.log('Inquilino agregado:', data);
  };

  return (
    <div>
      <h3>Agregar Nuevo Inquilino</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Nombre:</label>
          <input {...register('nombre')} required />
        </div>
        <div>
          <label>Apellido:</label>
          <input {...register('apellido')} required />
        </div>
        <div>
          <label>Dirección:</label>
          <input {...register('direccion')} required />
        </div>
        <div>
          <label>Teléfono:</label>
          <input {...register('telefono')} required />
        </div>
        

        {/* Otros campos que desees agregar */}
        <button type="submit">Agregar Inquilino</button>
      </form>
    </div>
  );
};

export default AddInquilino;













