import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api'; // Asegúrate de que este path sea correcto
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import InputMask from 'react-input-mask';
import { format, isValid } from 'date-fns';

// Convierte de Date a DD/MM/AAAA
const formatDateToDisplay = (date) => {
  if (!date) return '';
  try {
    // Asegurarnos de que es un objeto Date válido
    const dateObj = date instanceof Date ? date : new Date(date);

    // Usar UTC para evitar problemas de zona horaria
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
  if (typeof value !== 'string') return Number(value);
  return Number(value.replace(/\./g, ''));
};

const numericFields = [
  'alquileres_importe', 'agua_importe', 'tasa_importe',
  'otros', 'luz_importe', 'importe_total'
];


// Validador de fecha
const validateDate = (value) => {
  if (!value) return "La fecha es requerida";
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return "Formato debe ser DD/MM/AAAA";

  const [day, month, year] = value.split('/');
  const date = new Date(year, month - 1, day);

  if (isNaN(date.getTime())) return "Fecha inválida";

  return true; // Eliminamos la validación de fecha futura
};

//const formatNumberWithDots = (number) => {
//if (typeof number === 'string') {
//number = number.replace(/\./g, '');
//}
//const num = Number(number);
//return isNaN(num) ? '' : num.toLocaleString('es-AR');
//};

// --- COMPONENTE PRINCIPAL ---
const InquilinoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {},
  });

  useEffect(() => {
    console.log('Errores del formulario:', errors);
  }, [errors]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInquilino = async () => {
      if (!id) {
        reset();
        return;
      }

      try {
        const response = await api.get(`/inquilinos/${id}`);
        if (response.data) {
          const dataFormateada = {
            ...response.data,
            inicio_contrato: formatDateToDisplay(response.data.inicio_contrato)
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


  // Función para manejar el envío del formulario

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const formatFieldName = (fieldName) => {
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

    // Verificación de campos obligatorios primero
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

    // Preparar datos para enviar
    const formattedData = { ...data };

    // Convertir fechas (sin validar si son pasadas)
    formattedData.inicio_contrato = parseDateFromInput(data.inicio_contrato);
    formattedData.vencimiento_contrato = parseDateFromInput(data.vencimiento_contrato);
    // Eliminar duracion_contrato ya que no lo usaremos más
    delete formattedData.duracion_contrato;

    // Normalizar campos de deuda
    ['alquileres_adeudados', 'gastos_adeudados'].forEach((campo) => {
      const valor = (data[campo] || '').toString().trim().toLowerCase();
      if (valor === 'sí' || valor === 'si') {
        formattedData[campo] = 'si debe';
      } else if (valor === 'no') {
        formattedData[campo] = 'no debe';
      }
    });

    // Convertir campos numéricos
    numericFields.forEach((campo) => {
      if (formattedData[campo] !== undefined && formattedData[campo] !== null && formattedData[campo] !== '') {
        const parsed = parseNumberWithoutDots(formattedData[campo]);
        formattedData[campo] = isNaN(parsed) ? null : parsed;
      } else {
        formattedData[campo] = null;
      }
    });

    // Convertir fecha
    formattedData.inicio_contrato = parseDateFromInput(data.inicio_contrato);

    // Campos específicos
    if (formattedData.aumento) formattedData.aumento = formattedData.aumento.toString();
    if (formattedData.periodo) formattedData.periodo = formattedData.periodo.toString();

    console.log('Datos enviados al backend:', formattedData);

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
      title: '¿Estás seguro?', text: 'Los cambios no guardados se perderán.',
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Sí, salir', cancelButtonText: 'Cancelar', reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(-1);
      }
    });
  };

  // --- Definición de Campos del Formulario ---
  const camposInquilino = [
    { label: 'Nombre', name: 'nombre', required: true },
    { label: 'Apellido', name: 'apellido', required: true },
    { label: 'Teléfono', name: 'telefono', required: true },
    { label: 'Periodo', name: 'periodo', required: true },
    { label: 'Contrato', name: 'contrato', required: true },
    { label: 'Inicio del Contrato', name: 'inicio_contrato', required: true, type: 'text' },
    { label: 'Fin del Contrato', name: 'vencimiento_contrato', required: true, type: 'text' },
    { label: 'Aumento', name: 'aumento', required: true },
  ];

  const camposInmueble = [
    {
      label: 'Propietario',
      name: 'propietario_nombre',
      required: true
    },
    {
      label: 'Dirección',
      name: 'propietario_direccion',
      required: true
    },
    {
      label: 'Localidad',
      name: 'propietario_localidad',
      required: true
    },
    {
      label: 'Alquileres adeudados',
      name: 'alquileres_adeudados',
      type: 'select',
      required: true,
      options: ['Sí', 'No'],
      defaultValue: 'No' // Valor por defecto
    },
    {
      label: 'Gastos adeudados',
      name: 'gastos_adeudados',
      required: true,
      type: 'select',
      options: ['Sí', 'No'],
      defaultValue: 'No'
    }
  ];

  const camposLiquidacion = [
    { label: 'Alquileres', name: 'alquileres_importe' },
    { label: 'Agua', name: 'agua_importe' },
    { label: 'Tasa', name: 'tasa_importe' },
    { label: 'Otros', name: 'otros' },
    { label: 'Luz', name: 'luz_importe' },
    { label: 'Importe Total', name: 'importe_total' },
  ];



  // --- Función para Renderizar Campos ---
  const renderCampos = (campos) =>
    campos.map((campo) => {
      if (campo.type === 'select') {
        return (
          <div className="col-md-6 mb-3" key={campo.name}>
            <label className="form-label">{campo.label}</label>
            <select
              className={`form-select ${errors[campo.name] ? 'is-invalid' : ''}`}
              {...register(campo.name, {
                required: campo.required ? `${campo.label} es obligatorio` : false,
              })}
            >
              <option value="">Seleccione...</option>
              {campo.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors[campo.name] && (
              <div className="invalid-feedback">{errors[campo.name].message}</div>
            )}
          </div>
        );
      }

      // Campos 'aumento' y 'periodo' tratados como texto con validación de solo números
      if (campo.name === 'aumento' || campo.name === 'periodo') {
        return (
          <div className="col-md-6 mb-3" key={campo.name}>
            <label className="form-label">{campo.label}</label>
            <input
              type="text"
              className={`form-control ${errors[campo.name] ? 'is-invalid' : ''}`}
              {...register(campo.name, {
                required: campo.required ? `${campo.label} es obligatorio` : false,
              })}
            />
            {errors[campo.name] && (
              <div className="invalid-feedback">
                {errors[campo.name].message}
              </div>
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
                validate: validateDate // Solo validamos formato, no fecha futura
              })}
            />
            {errors[campo.name] && (
              <div className="invalid-feedback">{errors[campo.name].message}</div>
            )}
          </div>
        );
      }
      // Por defecto, input común
      return (

        <div className="col-md-6 mb-3" key={campo.name}>
          <label className="form-label" htmlFor={campo.name}>{campo.label}</label>
          <input
            id={campo.name}
            type={numericFields.includes(campo.name) ? 'text' : (campo.type || 'text')}
            className={`form-control ${errors[campo.name] ? 'is-invalid' : ''}`}
            {...register(campo.name, {
              required: campo.required ? { message: `${campo.label} es obligatorio` } : false,
              validate: (value) => {
                if (
                  numericFields.includes(campo.name) &&
                  value !== null &&
                  value !== undefined &&
                  value !== ''
                ) {
                  const parsed = parseNumberWithoutDots(value);
                  if (isNaN(parsed)) {
                    return `${campo.label} debe ser un número válido.`;
                  }
                }
                return true;
              },
            })}
          />
          {errors[campo.name] && (
            <span className="text-danger">{errors[campo.name].message}</span>
          )}
        </div>

      );

    });


  return (
    <div className="container mt-4">
      {/* Encabezado */}
      <div className="p-3 mb-4 bg-agregar text-white rounded shadow">
        <h4 className="text-center mb-0">{id ? 'Editar Información del Inquilino' : 'Agregar Nuevo Inquilino'}</h4>
      </div>

      {/* Formulario */}
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

        {/* Botones de acción */}
        <div className="d-flex justify-content-end mt-4">
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
