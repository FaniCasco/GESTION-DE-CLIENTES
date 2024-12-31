import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useForm } from 'react-hook-form';

const InquilinoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchInquilino = async () => {
      if (id) {
        try {
          const response = await api.get(`/inquilinos/${id}`);
          Object.keys(response.data).forEach((key) => setValue(key, response.data[key]));
        } catch (err) {
          console.error('Error al cargar el inquilino:', err);
          setError('No se pudieron cargar los datos del inquilino.');
        }
      } else {
        reset();
      }
    };

    fetchInquilino();
  }, [id, setValue, reset]);

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      inicio_contrato: data.inicio_contrato ? new Date(data.inicio_contrato).toISOString().split('T')[0] : null,
      importe_total: parseFloat(data.importe_total) || 0,
      alquileres_importe: parseFloat(data.alquileres_importe) || 0,
      agua_importe: parseFloat(data.agua_importe) || 0,
      tasa_importe: parseFloat(data.tasa_importe) || 0,
      otros: parseFloat(data.otros) || 0,
      alquileres_adeudados: data.alquileres_adeudados === 'true', // Convertir a booleano
      gastos_adeudados: data.gastos_adeudados === 'true', // Convertir a booleano
    };

    try {
      if (id) {
        await api.put(`/inquilinos/${id}`, formattedData);
        setMessage('Inquilino actualizado correctamente');
      } else {
        await api.post('/inquilinos', formattedData);
        setMessage('Inquilino agregado correctamente');
      }
      navigate('/inquilinos');
    } catch (err) {
      console.error('Error al guardar los datos:', err);
      setError('Error al guardar los datos.');
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const camposInquilino = [
    { label: 'Nombre', name: 'nombre', required: true },
    { label: 'Apellido', name: 'apellido', required: true },
    { label: 'Teléfono', name: 'telefono', required: true, pattern: /^[0-9]{10}$/ },
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
    // Verificar si el campo es de tipo booleano (alquileres_adeudados o gastos_adeudados)
    if (campo.name === 'alquileres_adeudados' || campo.name === 'gastos_adeudados') {
      return (
        <div className="col-md-6 mb-3" key={campo.name}>
          <label className="form-label" htmlFor={campo.name}>{campo.label}</label>
          <select
            id={campo.name}
            className={`form-control ${errors[campo.name] ? 'is-invalid' : ''}`}
            {...register(campo.name, campo.required ? { required: `${campo.label} es obligatorio` } : {})}
          >
            <option value="true">Sí</option>
            <option value="false">No</option>
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
          {...register(campo.name, campo.required ? { required: `${campo.label} es obligatorio`, pattern: campo.pattern && { value: campo.pattern, message: 'Formato inválido' } } : {})}
        />
        {errors[campo.name] && <span className="text-danger">{errors[campo.name].message}</span>}
      </div>
    );
  });

  return (
    <div className="container mt-4">
      <div className="p-3 mb-4 bg-agregar text-white rounded shadow">
        <h4 className="text-center mb-0">{id ? 'Editar Información del Inquilino' : 'Agregar Nuevo Inquilino'}</h4>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
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
          <button type="submit" className="btn btn-primary me-2">{id ? 'Actualizar' : 'Guardar'}</button>
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default InquilinoForm;







