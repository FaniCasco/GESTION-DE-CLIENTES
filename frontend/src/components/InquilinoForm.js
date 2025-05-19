import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api'; // Asegúrate de que este path sea correcto
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const formatNumberWithDots = (number) => {
  if (typeof number === 'string') {
    number = number.replace(/\./g, '');
  }
  const num = Number(number);
  return isNaN(num) ? '' : num.toLocaleString('es-AR');
};

const parseNumberWithoutDots = (value) => {
  if (typeof value !== 'string') return Number(value);
  return Number(value.replace(/\./g, ''));
};

const numericFields = [
  'alquileres_importe', 'agua_importe', 'tasa_importe',
  'otros', 'luz_importe', 'importe_total'
];

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
          const dataFormateada = {};

          Object.entries(response.data).forEach(([key, value]) => {
            if (value === undefined || value === null) {
              dataFormateada[key] = '';
              return;
            }

            // 🔸 Fecha
            if (key === 'inicio_contrato') {
              const fecha = new Date(value);
              dataFormateada[key] = !isNaN(fecha.getTime())
                ? `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`
                : '';
              return;
            }

            // 🔸 Booleanos tipo texto
            if (key === 'alquileres_adeudados' || key === 'gastos_adeudados') {
              dataFormateada[key] = value === 'si debe' ? 'Sí' : 'No';
              return;
            }

            // 🔸 Campos numéricos
            if (numericFields.includes(key) && !key.toLowerCase().includes('telefono')) {
              let numberValue;
              if (typeof value === 'string') {
                numberValue = parseNumberWithoutDots(value);
              } else if (typeof value === 'number') {
                numberValue = value;
              } else {
                numberValue = NaN;
              }

              dataFormateada[key] = isNaN(numberValue) ? '' : formatNumberWithDots(numberValue);
              return;
            }

            // 🔸 Campos específicos como aumento y periodo
            if (key === 'aumento' || key === 'periodo') {
              dataFormateada[key] = value?.toString() || '';
              return;
            }

            // 🔸 Resto de campos
            dataFormateada[key] = value;
          });

          reset(dataFormateada); // ✅ esto evita usar muchos setValue y evita errores de input bloqueado
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
    // Normalizar campos de deuda
    ['alquileres_adeudados', 'gastos_adeudados'].forEach((campo) => {
      const valor = (data[campo] || '').toString().trim().toLowerCase();
      if (valor === 'sí' || valor === 'si') {
        data[campo] = 'Sí';
      } else if (valor === 'no') {
        data[campo] = 'No';
      } else {
        // Por si el usuario pone algo inválido manualmente
        throw new Error("Valores inválidos para campos de deuda. Use 'Sí' o 'No'");
      }
    });
    console.log('Datos crudos del formulario:', data); // Ver qué llegó

    const formattedData = {};
    const camposObligatorios = ['nombre', 'apellido', 'telefono', 'periodo', 'contrato', 'inicio_contrato'];

    Object.entries(data).forEach(([key, value]) => {
      // Si el campo está vacío
      if (value === '' || value === undefined || value === null) {
        if (camposObligatorios.includes(key)) {
          formattedData[key] = ''; // No null para obligatorios
        } else {
          formattedData[key] = null;
        }
        return;
      }

      // --- Formateos especiales ---
      if (key === 'inicio_contrato') {
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
          const [day, month, year] = value.split('/');
          const date = new Date(Date.UTC(year, month - 1, day));
          formattedData[key] = !isNaN(date.getTime()) ? date.toISOString() : null;
        } else {
          formattedData[key] = null;
        }

      } else if (key === 'alquileres_adeudados' || key === 'gastos_adeudados') {
        formattedData[key] = value === 'Sí' ? 'si debe' : 'no debe';
      } else if (numericFields.includes(key)) {
        const parsed = parseNumberWithoutDots(value);
        formattedData[key] = isNaN(parsed) ? null : parsed;
      } else if (key === 'aumento' || key === 'periodo') {
        formattedData[key] = value.toString();
      } else {
        formattedData[key] = value;
      }
    });

    // Verificación manual de campos obligatorios
    for (const campo of camposObligatorios) {
      if (!formattedData[campo] || formattedData[campo] === '') {
        console.error(`Falta el campo obligatorio: ${campo}`);
        Swal.fire({
          title: 'Error',
          text: `Falta completar el campo obligatorio: ${campo}`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        setIsSubmitting(false);
        return;
      }
    }

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

      if (!id) reset(); // Limpiar si es nuevo
      navigate('/inquilinos'); // Redirigir
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
    { label: 'Inicio del Contrato', name: 'inicio_contrato', required: true, type: 'date' },
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
      if (campo.name === 'inicio_contrato') {
        return (
          <div className="col-md-6 mb-3" key={campo.name}>
            <label className="form-label">{campo.label}</label>
            <input
              type="text"
              className={`form-control ${errors[campo.name] ? 'is-invalid' : ''}`}
              placeholder="DD/MM/AAAA"
              {...register(campo.name, {
                required: campo.required ? `${campo.label} es obligatorio` : false,
                pattern: {
                  value: /^\d{2}\/\d{2}\/\d{4}$/,
                  message: 'El formato debe ser DD/MM/AAAA',
                },
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
