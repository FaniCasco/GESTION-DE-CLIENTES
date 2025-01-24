import React from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';



const AddInquilino = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    try {
      // Aquí puedes manejar la lógica para agregar un nuevo inquilino
      console.log('Inquilino agregado:', data);

      // Mostrar alerta de éxito
      Swal.fire({
        title: '¡Inquilino Agregado!',
        text: `El inquilino ${data.nombre} ${data.apellido} se ha agregado correctamente.`,
        icon: 'success',
        confirmButtonText: 'Aceptar',
      });
    } catch (error) {
      // Mostrar alerta de error
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al agregar el inquilino. Inténtalo nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    }
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

        <button type="submit">Agregar Inquilino</button>
      </form>
    </div>
  );
};

export default AddInquilino;














