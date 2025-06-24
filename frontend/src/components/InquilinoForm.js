import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useForm, useWatch } from 'react-hook-form';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import InputMask from 'react-input-mask';
import { format, isValid } from 'date-fns';
import { getCurrentPeriodo } from '../utils/periodoUtils';

// Convierte de Date a DD/MM/AAAA
const formatDateToDisplay = (date) => {
  if (!date) return '';
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    const utcDate = new Date(Date.UTC(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate()
    ));
    return isValid(utcDate) ? format(utcDate, 'dd/MM/yyyy') : '';
  } catch {
    return '';
  }
};

const parseDateFromInput = (dateString) => {
  if (!dateString || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return null;
  try {
    const [day, month, year] = dateString.split('/');
    const date = new Date(year, month - 1, day);
    return date.toISOString();
  } catch {
    return null;
  }
};

const parseNumberWithoutDots = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;

  // Convertir formato argentino (1.234,56 => 1234.56)
  const cleanedValue = value.toString()
    .replace(/\./g, '')  // Eliminar puntos (separadores de miles)
    .replace(',', '.');  // Convertir coma decimal a punto

  const num = Number(cleanedValue);
  return isNaN(num) ? 0 : num;
};



const formatNumberForDisplay = (value) => {
  const num = parseNumberWithoutDots(value);
  return num.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const InquilinoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm({
    defaultValues: {
      alquileres_importe: '0',
      agua_importe: '0',
      tasa_importe: '0',
      otros: '0',
      luz_importe: '0',
      importe_total: '0'
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const watchValues = useWatch({
    control,
    name: ['alquileres_importe', 'agua_importe', 'tasa_importe', 'otros', 'luz_importe']
  });

  useEffect(() => {
    const total = [
      parseNumberWithoutDots(watchValues[0]), // alquileres_importe
      parseNumberWithoutDots(watchValues[1]), // agua_importe
      parseNumberWithoutDots(watchValues[2]), // tasa_importe
      parseNumberWithoutDots(watchValues[3]), // otros
      parseNumberWithoutDots(watchValues[4])  // luz_importe
    ].reduce((sum, num) => sum + num, 0);

    setValue('importe_total', formatNumberForDisplay(total), {
      shouldValidate: true,
      shouldDirty: true
    });
  }, [watchValues, setValue]);



useEffect(() => {
  if (!id) { // Solo para nuevos registros
    const currentPeriodo = getCurrentPeriodo();
    setValue('periodo', currentPeriodo, {
      shouldValidate: true,
      shouldDirty: true
    });
    
    // También puedes mostrarlo en consola para debug
    console.log('Período automático establecido:', currentPeriodo);
  }
}, [setValue, id]);

  useEffect(() => {
    const fetchInquilino = async () => {
      if (!id) return;

      try {
        const response = await api.get(`/inquilinos/${id}`);
        if (response.data) {
          const dataFormateada = {
            ...response.data,
            inicio_contrato: formatDateToDisplay(response.data.inicio_contrato),
            vencimiento_contrato: formatDateToDisplay(response.data.vencimiento_contrato),
            alquileres_importe: formatNumberForDisplay(response.data.alquileres_importe),
            agua_importe: formatNumberForDisplay(response.data.agua_importe),
            tasa_importe: formatNumberForDisplay(response.data.tasa_importe),
            otros: formatNumberForDisplay(response.data.otros),
            luz_importe: formatNumberForDisplay(response.data.luz_importe),
            importe_total: formatNumberForDisplay(response.data.importe_total)
          };
          reset(dataFormateada);
        }
      } catch (err) {
        console.error('Error al cargar el inquilino:', err);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los datos del inquilino.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
    };

    fetchInquilino();
  }, [id, reset]);

  const formatFieldName = (fieldName) => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const camposObligatorios = ['nombre', 'apellido', 'telefono', 'periodo', 'contrato', 'inicio_contrato', 'vencimiento_contrato'];
    for (const campo of camposObligatorios) {
      if (!data[campo]) {
        Swal.fire({
          title: 'Error',
          text: `El campo ${formatFieldName(campo)} es obligatorio`,
          icon: 'error'
        });
        setIsSubmitting(false);
        return;
      }
    }

    const formattedData = {
      ...data,
      inicio_contrato: parseDateFromInput(data.inicio_contrato),
      vencimiento_contrato: parseDateFromInput(data.vencimiento_contrato),
      alquileres_adeudados: data.alquileres_adeudados === 'Sí' ? 'si debe' : 'no debe',
      gastos_adeudados: data.gastos_adeudados === 'Sí' ? 'si debe' : 'no debe',
      alquileres_importe: parseNumberWithoutDots(data.alquileres_importe),
      agua_importe: parseNumberWithoutDots(data.agua_importe),
      tasa_importe: parseNumberWithoutDots(data.tasa_importe),
      otros: parseNumberWithoutDots(data.otros),
      luz_importe: parseNumberWithoutDots(data.luz_importe),
      importe_total: parseNumberWithoutDots(data.importe_total),
      aumento: data.aumento.toString(),
      periodo: data.periodo.toString()
    };

    try {
      if (id) {
        await api.put(`/inquilinos/${id}`, formattedData);
      } else {
        await api.post('/inquilinos', formattedData);
      }

      Swal.fire({
        title: id ? '¡Inquilino Actualizado!' : '¡Inquilino Agregado!',
        text: id
          ? 'Los datos del inquilino se han actualizado correctamente.'
          : 'El nuevo inquilino se ha registrado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
      });

      if (!id) reset();
      navigate('/inquilinos');
    } catch (err) {
      console.error('Error al guardar los datos:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Hubo un problema al guardar los datos del inquilino. Inténtalo nuevamente.';
      Swal.fire({
        title: 'Error',
        text: typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage,
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
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(-1);
      }
    });
  };

  const camposInquilino = [
  { label: 'Nombre', name: 'nombre', required: true },
  { label: 'Apellido', name: 'apellido', required: true },
  { label: 'Teléfono', name: 'telefono', required: true },
  {
    label: 'Periodo',
    name: 'periodo',
    required: true,
    type: 'text',
    readOnly: false,
    placeholder: 'Ej: Julio/25',
    validate: (value) => {
      if (!value) return "El período es obligatorio";
      if (!/^(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre)\/\d{2}$/.test(value)) {
        return "Formato inválido (Ej: Julio/25)";
      }
      return true;
    }
  },
    {
      label: 'Contrato',
      name: 'contrato',
      required: true,
      type: 'text',
      placeholder: 'Ej: Vivienda, Departamento, Local, Galpón...'
    },
    { label: 'Inicio del Contrato', name: 'inicio_contrato', required: true, type: 'text' },
    { label: 'Fin del Contrato', name: 'vencimiento_contrato', required: true, type: 'text' },
    {
      label: 'Aumento',
      name: 'aumento',
      required: true,
      type: 'select',
      options: ['Anual', 'Semestral', 'Trimestral', 'Bimestral'],
      defaultValue: 'Anual'
    },
  ];

  const camposInmueble = [
    { label: 'Propietario', name: 'propietario_nombre', required: true },
    { label: 'Dirección', name: 'propietario_direccion', required: true },
    { label: 'Localidad', name: 'propietario_localidad', required: true },
    {
      label: 'Alquileres adeudados',
      name: 'alquileres_adeudados',
      type: 'select',
      required: true,
      options: ['Sí', 'No'],
      defaultValue: 'No'
    },
    {
      label: 'Gastos adeudados',
      name: 'gastos_adeudados',
      type: 'select',
      required: true,
      options: ['Sí', 'No'],
      defaultValue: 'No'
    },
  ];

  const camposLiquidacion = [
    { label: 'Alquileres', name: 'alquileres_importe', type: 'number' },
    { label: 'Agua', name: 'agua_importe', type: 'number' },
    { label: 'Tasa', name: 'tasa_importe', type: 'number' },
    { label: 'Otros', name: 'otros', type: 'number' },
    { label: 'Luz', name: 'luz_importe', type: 'number' },
    { label: 'Importe Total', name: 'importe_total', type: 'number', readOnly: true },
  ];

  const renderCampos = (campos) => {
    return campos.map((campo) => {
      if (campo.type === 'select') {
        return (
          <div className="col-md-6 mb-3" key={campo.name}>
            <label className="form-label">{campo.label}</label>
            <select
              className={`form-select ${errors[campo.name] ? 'is-invalid' : ''}`}
              {...register(campo.name, {
                required: campo.required ? `${campo.label} es obligatorio` : false
              })}
              defaultValue={campo.defaultValue || ''}
            >
              <option value="">Seleccione...</option>
              {campo.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors[campo.name] && (
              <div className="invalid-feedback">{errors[campo.name].message}</div>
            )}
          </div>
        );
      }

      if (campo.name === 'inicio_contrato' || campo.name === 'vencimiento_contrato') {
        return (
          <div className="col-md-6 mb-3" key={campo.name}>
            <label className="form-label">{campo.label}</label>
            <InputMask
              mask="99/99/9999"
              maskChar={null}
              placeholder="DD/MM/AAAA"
              className={`form-control ${errors[campo.name] ? 'is-invalid' : ''}`}
              {...register(campo.name, {
                required: campo.required ? `${campo.label} es obligatorio` : false,
                validate: (value) => {
                  if (!value) return "La fecha es requerida";
                  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return "Formato debe ser DD/MM/AAAA";

                  const [day, month, year] = value.split('/');
                  const date = new Date(year, month - 1, day);

                  if (isNaN(date.getTime())) return "Fecha inválida";
                  return true;
                }
              })}
            />
            {errors[campo.name] && (
              <div className="invalid-feedback">{errors[campo.name].message}</div>
            )}
          </div>
        );
      }

      return (
        <div className="col-md-6 mb-3" key={campo.name}>
          <label className="form-label">{campo.label}</label>
          <input
            type={campo.type || 'text'}
            className={`form-control ${errors[campo.name] ? 'is-invalid' : ''} ${campo.readOnly ? 'bg-light' : ''}`}
            readOnly={campo.readOnly}
            placeholder={campo.placeholder || ''}
            {...register(campo.name, {
              required: campo.required ? `${campo.label} es obligatorio` : false,
              validate: (value) => {
                if (!campo.readOnly && campo.type === 'number' && value) {
                  const parsed = parseNumberWithoutDots(value);
                  if (isNaN(parsed)) {
                    return `${campo.label} debe ser un número válido`;
                  }
                }
                return true;
              }
            })}
          />
          {errors[campo.name] && (
            <span className="text-danger">{errors[campo.name].message}</span>
          )}
        </div>
      );
    });
  };


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

        <div className="d-flex justify-content-end mt-4">
          <button type="submit" className="btn btn-primary me-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                {id ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (id ? 'Actualizar' : 'Guardar')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default InquilinoForm;
