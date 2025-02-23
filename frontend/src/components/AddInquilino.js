/*Este componente cumple la funcion de agregar un inquilino */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const AddInquilino = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    if (!data) {
      throw new Error('No se han proporcionado datos para agregar el inquilino');
    }

    setIsSubmitting(true);
    try {
      if (!data?.nombre || !data?.apellido || !data?.direccion || !data?.telefono) {

        throw new Error('Todos los campos son obligatorios');
      }

      const response = await fetch('/api/inquilinos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response || !response.ok) {
        throw new Error('Error al agregar el inquilino');
      }

      const responseData = await response.json();

      if (!responseData || !responseData.ok) {
        throw new Error('Error al agregar el inquilino');
      }

      Swal.fire({
        title: '¡Inquilino Agregado!',
        text: `El inquilino ${data?.nombre} ${data?.apellido} se ha agregado correctamente.`,

        icon: 'success',
        confirmButtonText: 'Aceptar',
      });
      reset();
    } catch (error) {
      if (error instanceof Error) {
        Swal.fire({
          title: 'Error',
          text: error.message,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      } else {
        console.error('Error no manejado:', error);
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3>Agregar Nuevo Inquilino</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Nombre:</label>
          <input
            {...register('nombre', { required: 'El nombre es obligatorio', minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' } })}
            aria-label="Nombre"
            aria-describedby={errors?.nombre ? 'nombre-error' : undefined}

          />
          {errors?.nombre && <span id="nombre-error" className="error">{errors?.nombre?.message}</span>}

        </div>
        <div>
          <label>Apellido:</label>
          <input
            {...register('apellido', { required: 'El apellido es obligatorio' })}
            aria-label="Apellido"
            aria-describedby={errors?.apellido ? 'apellido-error' : undefined}

          />
          {errors?.apellido && <span id="apellido-error" className="error">{errors?.apellido?.message}</span>}

        </div>
        <div>
          <label>Dirección:</label>
          <input
            {...register('direccion', { required: 'La dirección es obligatoria' })}
            aria-label="Dirección"
            aria-describedby={errors?.direccion ? 'direccion-error' : undefined}

          />
          {errors?.direccion && <span id="direccion-error" className="error">{errors?.direccion?.message}</span>}

        </div>
        <div>
          <label>Teléfono:</label>
          <input
            {...register("telefono", {
              pattern: {
                value: /^[0-9]+$/, // Permite solo números, sin límite de longitud
                message: "El teléfono solo debe contener números",
              },
            })}
            aria-label="Teléfono"
            aria-describedby={errors?.telefono ? "telefono-error" : undefined}
          />
          {errors?.telefono && (
            <span id="telefono-error" className="error">{errors?.telefono?.message}</span>
          )}
        </div>


        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Agregando...' : 'Agregar Inquilino'}
        </button>
      </form>
    </div>
  );
};

export default AddInquilino;














