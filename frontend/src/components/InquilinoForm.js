import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api'; // Asegúrate de que este path sea correcto
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const formatNumberWithDots = (number) => {

  const num = typeof number === 'string' ? parseFloat(number.replace(/\./g, '').replace(/,/g, '.')) : number;

  if (typeof num !== 'number' || isNaN(num)) {
    return '';
  }
  return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseNumberWithoutDots = (value) => {
  if (typeof value !== 'string') {
    return NaN;
  }

  const cleanedValue = value.replace(/\./g, '');
  const parsed = parseInt(cleanedValue, 10);

  return isNaN(parsed) ? NaN : parsed;
};

const numericFields = [

  'alquileres_importe',
  'agua_importe',
  'tasa_importe',
  'otros',
  'luz_importe',
  'importe_total',
];

// --- COMPONENTE PRINCIPAL ---
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
          if (response.data) {
            Object.keys(response.data).forEach((key) => {
              const value = response.data[key];

              // Solo establecer valor si no es undefined o null desde el backend
              if (value !== undefined && value !== null) {
                if (key === 'inicio_contrato') {
                  try {
                    const fecha = new Date(value);
                    if (!isNaN(fecha.getTime())) {
                      const formattedDate = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
                      setValue(key, formattedDate);
                    } else {
                      setValue(key, '');
                    }
                  } catch (e) {
                    setValue(key, '');
                  }
                }
                else if (key === 'alquileres_adeudados' || key === 'gastos_adeudados') {
                  setValue(key, value === 'si debe' ? 'Sí' : (value === 'no debe' ? 'No' : ''));
                }
                else if (
                  numericFields.includes(key) &&
                  !key.toLowerCase().includes('telefono')
                ) {
                  // --- Logs de depuración TEMPORALES (Mantenlos hasta que funcione) ---
                  console.log('--- Procesando Campo Potencialmente Numérico para Formato ---');
                  console.log('Campo (key):', key);
                  console.log('Valor recibido del Backend (raw):', value); // <-- Mira el valor ORIGINAL ("385000")
                  console.log('Tipo de valor recibido:', typeof value); // <-- ¡Este es CRUCIAL! ¿Es 'string' o 'number'?
                  // --- Fin Logs ---

                  let numberValue;

                  // Intentar convertir a número, manejando diferentes tipos de entrada (string o number)
                  if (typeof value === 'string' && value.trim() !== '') {
                    // Si es una cadena no vacía, usar la función de parseo que quita puntos (seguro aunque no los tenga)
                    numberValue = parseNumberWithoutDots(value);
                    console.log(' -> Parseo desde String (sin puntos):', numberValue); // Log: Debería mostrar el número sin puntos
                  } else if (typeof value === 'number') {
                    // Si ya es un número, usarlo directamente
                    numberValue = value;
                    console.log(' -> Valor ya es un número:', numberValue); // Log
                  } else {
                    // Para null, undefined (manejados arriba), o cadena vacía (''), no es un número válido para formatear
                    numberValue = NaN; // Será NaN si value es '', NaN si parseNumberWithoutDots falló, o si el tipo no era string/number
                    console.log(' -> Valor no es string ni number válido para parsear.'); // Log
                  }

                  // Verifica si numberValue es un número válido (no NaN)
                  if (!isNaN(numberValue)) { // Si logramos obtener un número válido (ej: 385000)
                    console.log(' -> Valor convertido a número válido para formato:', numberValue); // Log

                    // Formatear el número válido para mostrar con puntos
                    const formattedValue = formatNumberWithDots(numberValue); // 385000 -> "385.000"
                    console.log(' -> Valor formateado para MOSTRAR:', formattedValue); // <-- ¡Este es el importante! Log: ¿Tiene puntos?

                    setValue(key, formattedValue); // Establece el valor formateado (STRING) en el input

                    console.log('--- Fin Formateo Exitoso ---');

                  } else {
                    // Si el valor original era inválido para convertir a número (ej: "abc", o llegó null/undefined/'' y numberValue es NaN)
                    console.warn(` -> El valor para ${key} (${value}) no pudo ser convertido a un número válido para formato. No se aplicará formato numérico.`); // Log
                    // Setea el input a una cadena vacía o la string original si no es null/undefined (aunque ya se manejó arriba, esto es un fallback)
                    setValue(key, value === null || value === undefined ? '' : String(value));
                  }
                }
                // --- Lógica para otros campos ---
                else {

                  setValue(key, value);
                }
              } else {

                setValue(key, '');
              }
            });
          } else {
            Swal.fire({
              title: 'Error', text: 'No se pudieron cargar los datos del inquilino.',
              icon: 'error', confirmButtonText: 'Aceptar',
            });
          }
        } catch (err) {
          console.error('Error al cargar el inquilino:', err);
          Swal.fire({
            title: 'Error', text: 'No se pudieron cargar los datos del inquilino.',
            icon: 'error', confirmButtonText: 'Aceptar',
          });
        }
      } else {

        reset();
      }
    };

    fetchInquilino();
  }, [id, setValue, reset]);

  // Función para manejar el envío del formulario

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const formattedData = {};

    Object.entries(data).forEach(([key, value]) => {

      if (value === '' || value === undefined || value === null) {
        formattedData[key] = null;
        return;
      }

      // --- Lógica para campos específicos ---

      if (key === 'inicio_contrato') {

        const [day, month, year] = String(value).split('/');
        const date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10)));

        formattedData[key] = !isNaN(date.getTime()) ? date.toISOString() : null; // Guardar como ISO 8601 o null si fecha inválida
      }
      // Selects Sí/No: mapear etiqueta ('Sí'/'No') a valor de DB ('si debe'/'no debe')
      else if (key === 'alquileres_adeudados' || key === 'gastos_adeudados') {

        formattedData[key] = value === 'Sí' ? 'si debe' : (value === 'No' ? 'no debe' : null);
      }
      // --- Lógica para campos numéricos con parseo ---

      else if (numericFields.includes(key)) {
        const parsedValue = parseNumberWithoutDots(value);
        if (!isNaN(parsedValue)) {
          formattedData[key] = parsedValue;
        } else {

          console.warn(`Entrada numérica inválida para el campo ${key}: "${value}". Enviando null.`);
          formattedData[key] = null;
        }
      }
      // --- Lógica para otros campos ---
      else {
        formattedData[key] = value;
      }
    });

    // Manejo de la promesa de la API
    try {

      const apiCall = id
        ? api.put(`/inquilinos/${id}`, formattedData)
        : api.post('/inquilinos', formattedData);

      apiCall
        .then(() => {
          Swal.fire({
            title: id ? '¡Inquilino Actualizado!' : '¡Inquilino Agregado!',
            text: id ? 'Los datos del inquilino se han actualizado correctamente.' : 'El nuevo inquilino se ha registrado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });
          if (!id) {
            reset();
          }
        })
        .catch((err) => {
          console.error('Error al guardar los datos:', err.response?.data || err.message);
          const errorMessage = err.response?.data?.message || 'Hubo un problema al guardar los datos del inquilino. Inténtalo nuevamente.';
          Swal.fire({
            title: 'Error',
            text: typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage,
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        })
        .finally(() => {
          setIsSubmitting(false);
          navigate('/inquilinos');
        });

    } catch (err) {

      console.error('Error sincrónico en onSubmit:', err);
      Swal.fire({ title: 'Error', text: 'Ocurrió un error inesperado antes de enviar los datos.', icon: 'error', confirmButtonText: 'Aceptar' });
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
    { label: 'Luz', name: 'luz_importe' },
    { label: 'Importe Total', name: 'importe_total' },
  ];

  // --- Función para Renderizar Campos ---
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
            <option value="Sí">Sí</option>
            <option value="No">No</option>
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

          type={numericFields.includes(campo.name) ? 'text' : (campo.type || 'text')}
          className={`form-control ${errors[campo.name] ? 'is-invalid' : ''}`}
          aria-label={campo.label}
          aria-describedby={errors[campo.name] ? `${campo.name}-error` : undefined}
          {...register(campo.name, {
            required: campo.required ? { message: `${campo.label} es obligatorio` } : false,

            validate: (value) => {

              if (numericFields.includes(campo.name) && value !== null && value !== undefined && value !== '') {
                const parsed = parseNumberWithoutDots(value);
                if (isNaN(parsed)) {
                  return `${campo.label} debe ser un número válido.`;
                }
              }
              return true;
            },
            pattern: campo.pattern ? { value: campo.pattern, message: campo.message } : undefined,
          })}
        />
        {errors[campo.name] && <span id={`${campo.name}-error`} className="text-danger">{errors[campo.name].message}</span>}
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

























