/*Este componente cumple la funcion de agregar un inquilino */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
// Asegúrate de tener estos estilos CSS de Bootstrap disponibles en tu proyecto
import 'bootstrap/dist/css/bootstrap.min.css';


const AddInquilino = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Definición de campos para el formulario
  const camposInquilino = [
    { label: 'Nombre', name: 'nombre', required: true },
    { label: 'Apellido', name: 'apellido', required: true },
    { label: 'Teléfono', name: 'telefono', required: true, pattern: /^\d+$/, message: "El teléfono solo debe contener números" },
    { label: 'Periodo', name: 'periodo', required: true },
    { label: 'Contrato', name: 'contrato', required: true },
    { label: 'Inicio del Contrato', name: 'inicio_contrato', required: true, type: 'date' },
    { label: 'Aumento', name: 'aumento', required: true },
  ];

  const camposInmueble = [
    { label: 'Propietario', name: 'propietario_nombre', required: true },
    { label: 'Dirección', name: 'propietario_direccion', required: true }, // Usando el nombre consistente
    { label: 'Localidad', name: 'propietario_localidad', required: true },
    { label: 'Alquileres adeudados', name: 'alquileres_adeudados', required: true, type: 'select', options: ['Sí', 'No'] },
    { label: 'Gastos adeudados', name: 'gastos_adeudados', required: true, type: 'select', options: ['Sí', 'No'] },
  ];

  // Campos de liquidación configurados para números enteros
  const camposLiquidacion = [
    { label: 'Alquileres', name: 'alquileres_importe', type: 'number', integer: true },
    { label: 'Agua', name: 'agua_importe', type: 'number', integer: true },
    { label: 'Tasa', name: 'tasa_importe', type: 'number', integer: true },
    { label: 'Otros', name: 'otros', type: 'number', integer: true },
    { label: 'Luz', name: 'luz_importe', type: 'number', integer: true },
    { label: 'Importe Total', name: 'importe_total', type: 'number', integer: true },
  ];

  // Función auxiliar para renderizar los campos del formulario
  const renderCampos = (campos) => campos.map((campo) => {
    // Renderizar campos select (para adeudados)
    if (campo.type === 'select') {
      return (
        <div className="col-md-6 mb-3" key={campo.name}>
          <label className="form-label" htmlFor={campo.name}>{campo.label}</label>
          <select
            id={campo.name}
            className={`form-select ${errors[campo.name] ? 'is-invalid' : ''}`} // Usando form-select de Bootstrap
            {...register(campo.name, campo.required ? { required: `${campo.label} es obligatorio` } : {})}
          >
            {campo.options.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          {errors[campo.name] && <span className="text-danger">{errors[campo.name].message}</span>}
        </div>
      );
    }

    // Renderizar campos numéricos (enteros)
    if (campo.type === 'number' && campo.integer) {
      return (
        <div className="col-md-6 mb-3" key={campo.name}>
          <label className="form-label" htmlFor={campo.name}>{campo.label}</label>
          <input
            id={campo.name}
            type="number"
            step="1" // Configurado para aceptar solo pasos de 1 (enteros)
            className={`form-control ${errors[campo.name] ? 'is-invalid' : ''}`}
            aria-label={campo.label}
            {...register(campo.name, {
              required: campo.required ? { message: `${campo.label} es obligatorio` } : false,
              // Patrón para asegurar que sea un número entero positivo (opcional, type="number" + step="1" ya ayuda)
              pattern: {
                value: /^\d+$/,
                message: `${campo.label} debe ser un número entero positivo`,
              },
              valueAsNumber: true // Convierte automáticamente el input a número
            })}
          />
          {errors[campo.name] && <span className="text-danger">{errors[campo.name].message}</span>}
        </div>
      );
    }

    // Renderizar campos de fecha
    if (campo.type === 'date') {
      return (
        <div className="col-md-6 mb-3" key={campo.name}>
          <label className="form-label" htmlFor={campo.name}>{campo.label}</label>
          <input
            id={campo.name}
            type="date"
            className={`form-control ${errors[campo.name] ? 'is-invalid' : ''}`}
            aria-label={campo.label}
            {...register(campo.name, {
              required: campo.required ? { message: `${campo.label} es obligatorio` } : false,
            })}
          />
          {errors[campo.name] && <span className="text-danger">{errors[campo.name].message}</span>}
        </div>
      );
    }


    // Renderizar campos de texto por defecto
    return (
      <div className="col-md-6 mb-3" key={campo.name}>
        <label className="form-label" htmlFor={campo.name}>{campo.label}</label>
        <input
          id={campo.name}
          type={campo.type || 'text'}
          className={`form-control ${errors[campo.name] ? 'is-invalid' : ''}`}
          aria-label={campo.label}
          {...register(campo.name, {
            required: campo.required ? { message: `${campo.label} es obligatorio` } : false,
            pattern: campo.pattern ? { value: campo.pattern, message: campo.message } : undefined,
          })}
        />
        {errors[campo.name] && <span className="text-danger">{errors[campo.name].message}</span>}
      </div>
    );
  });


  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Formatear datos para enviar al backend
      const formattedData = {
        ...data,
        // Convertir 'Sí'/'No' a 'si debe'/'no debe'
        alquileres_adeudados: data.alquileres_adeudados === 'Sí' ? 'si debe' : 'no debe',
        gastos_adeudados: data.gastos_adeudados === 'Sí' ? 'si debe' : 'no debe',
        // Los campos numéricos ya se convierten por valueAsNumber: true en register,
        // pero parseFloat(value) || 0 es un buen fallback si el campo estuviera vacío
        alquileres_importe: parseFloat(data.alquileres_importe) || 0,
        agua_importe: parseFloat(data.agua_importe) || 0,
        luz_importe: parseFloat(data.luz_importe) || 0,
        tasa_importe: parseFloat(data.tasa_importe) || 0,
        otros: parseFloat(data.otros) || 0,
        importe_total: parseFloat(data.importe_total) || 0,
        // Convertir fecha a formato ISO (el input type="date" ya da 'YYYY-MM-DD')
        inicio_contrato: data.inicio_contrato ? new Date(data.inicio_contrato).toISOString() : null,
      };

      const response = await fetch('/api/inquilinos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData), // Enviar todos los datos, incluidos los nuevos campos
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error desconocido al agregar el inquilino.');
      }

      Swal.fire({
        title: '¡Inquilino Agregado!',
        text: `El inquilino ${formattedData.nombre} ${formattedData.apellido} se ha agregado correctamente.`,
        icon: 'success',
        confirmButtonText: 'Aceptar',
      });
      reset(); // Limpiar el formulario después de agregar
    } catch (error) {
      console.error('Error al agregar el inquilino:', error.message);
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-4"> {/* Usando clases de Bootstrap para centrar y dar margen */}
      <div className="p-3 mb-4 bg-primary text-white rounded shadow"> {/* Estilo de encabezado Bootstrap */}
        <h4 className="text-center mb-0">Agregar Nuevo Inquilino</h4>
      </div>
      <form className="p-4 border rounded bg-light" onSubmit={handleSubmit(onSubmit)}> {/* Estilo de formulario Bootstrap */}

        <h5 className="mb-4 text-primary">Datos del Inquilino</h5>
        <div className="row"> {/* Usando grid de Bootstrap */}
          {renderCampos(camposInquilino)}
        </div>

        <h5 className="mt-4 text-primary">Datos del Inmueble</h5>
        <div className="row"> {/* Usando grid de Bootstrap */}
          {renderCampos(camposInmueble)}
        </div>

        <h5 className="mt-4 text-primary">Detalle de Liquidaciones (Enteros)</h5>
        <div className="row"> {/* Usando grid de Bootstrap */}
          {renderCampos(camposLiquidacion)}
        </div>

        <div className="d-flex justify-content-end mt-4"> {/* Botón al final */}
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Guardando...
              </>
            ) : (
              'Agregar Inquilino'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInquilino;














