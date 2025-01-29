import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const InquilinoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInquilino = async () => {
      if (id) {
        try {
          const response = await api.get(`/inquilinos/${id}`);
          Object.keys(response.data).forEach((key) => setValue(key, response.data[key]));
        } catch (err) {
          console.error('Error al cargar el inquilino:', err);
          Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los datos del inquilino.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        }
      } else {
        reset();
      }
    };

    fetchInquilino();
  }, [id, setValue, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const formattedData = {
      ...data,
      inicio_contrato: data.inicio_contrato ? new Date(data.inicio_contrato).toISOString().split('T')[0] : null,
      alquileres_importe: parseFloat(data.alquileres_importe) || 0,
      agua_importe: parseFloat(data.agua_importe) || 0,
      tasa_importe: parseFloat(data.tasa_importe) || 0,
      otros: parseFloat(data.otros) || 0,
      alquileres_adeudados: data.alquileres_adeudados === 'true' ? 'si debe' : 'no debe',
      gastos_adeudados: data.gastos_adeudados === 'true' ? 'si debe' : 'no debe',
      importe_total: parseFloat(data.importe_total) || 0,
    };

    try {
      if (id) {
        await api.put(`/inquilinos/${id}`, formattedData);
        Swal.fire({
          title: '¡Inquilino Actualizado!',
          text: 'Los datos del inquilino se han actualizado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
      } else {
        await api.post('/inquilinos', formattedData);
        Swal.fire({
          title: '¡Inquilino Agregado!',
          text: 'El nuevo inquilino se ha registrado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
        reset();
      }
      navigate('/inquilinos');
    } catch (err) {
      console.error('Error al guardar los datos:', err);
      const errorMessage = err.response?.data?.message || 'Hubo un problema al guardar los datos del inquilino. Inténtalo nuevamente.';
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Los cambios no guardados se perderán.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(-1);
      }
    });
  };

  const camposInquilino = [
    { label: 'Nombre', name: 'nombre', required: true },
    { label: 'Apellido', name: 'apellido', required: true },
    { label: 'Teléfono', name: 'telefono', required: true, pattern: /^[0-9]{10}$/, message: 'El teléfono debe tener 10 dígitos' },
    { label: 'Periodo', name: 'periodo', required: true },
    { label: 'Contrato', name: 'contrato', required: true },
    { label: 'Inicio del Contrato', name: 'inicio_contrato', required: true, type: 'date' },
    { label: 'Aumento', name: 'aumento', required: true },
  ];

  const camposInmueble = [
    { label: 'Propietario', name: 'propietario_nombre', required: true },
    { label: 'Dirección', name: 'propietario_direccion', required: true },
    { label: 'Localidad', name: 'propietario_localidad', required: true },
    { label: 'Alquileres adeudados', name: 'alquileres_adeudados', required: true },
    { label: 'Gastos adeudados', name: 'gastos_adeudados', required: true },
  ];

  const camposLiquidacion = [
    { label: 'Alquileres', name: 'alquileres_importe' },
    { label: 'Agua', name: 'agua_importe' },
    { label: 'Tasa', name: 'tasa_importe' },
    { label: 'Otros', name: 'otros' },
    { label: 'Importe Total', name: 'importe_total' }, 
  ];

  const renderCampos = (campos) => campos.map((campo) => {
    if (campo.name === 'alquileres_adeudados' || campo.name === 'gastos_adeudados') {
      return (
        <div className="col-md-6 mb-3" key={campo.name}>
          <label className="form-label" htmlFor={campo.name}>{campo.label}</label>
          <select
            id={campo.name}
            className={`form-control ${errors[campo.name] ? 'is-invalid' : ''}`}
            {...register(campo.name, campo.required ? { required: `${campo.label} es obligatorio` } : {})}
          >
            <option value="si debe">Sí debe</option>
            <option value="no debe">No debe</option>
          </select>
          {errors[campo.name] && <span className="text-danger">{errors[campo.name].message}</span>}
        </div>
      );
    }

    return (
      <div className="col-md-6 mb-3" key={campo.name}>
        <label className="form-label" htmlFor={campo.name}>{campo.label}</label>
        <input
          id={campo.name}
          type={campo.type || 'text'}
          className={`form-control ${errors[campo.name] ? 'is-invalid' : ''}`}
          aria-label={campo.label}
          aria-describedby={errors[campo.name] ? `${campo.name}-error` : undefined}
          {...register(campo.name, {
            required: campo.required ? `${campo.label} es obligatorio` : false,
            pattern: campo.pattern ? { value: campo.pattern, message: campo.message } : undefined,
          })}
        />
        {errors[campo.name] && <span id={`${campo.name}-error`} className="text-danger">{errors[campo.name].message}</span>}
      </div>
    );
  });

  return (
    <div className="container mt-4">
      <div className="p-3 mb-4 bg-agregar text-white rounded shadow">
        <h4 className="text-center mb-0">{id ? 'Editar Información del Inquilino' : 'Agregar Nuevo Inquilino'}</h4>
      </div>
      <form className="p-4 border rounded bg-light custom-shadow" onSubmit={handleSubmit(onSubmit)}>
        <h5 className="mb-4 text-primary">Datos del Inquilino</h5>
        <div className="row">
          {renderCampos(camposInquilino)}
        </div>

        <h5 className="mt-4 text-primary">Datos del Inmueble</h5>
        <div className="row">
          {renderCampos(camposInmueble)}
        </div>

        <h5 className="mt-4 text-primary">Detalle de Liquidaciones</h5>
        <div className="row">
          {renderCampos(camposLiquidacion)}
        </div>

        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary me-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                {id ? ' Actualizando...' : ' Guardando...'}
              </>
            ) : (id ? 'Actualizar' : 'Guardar')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default InquilinoForm;













