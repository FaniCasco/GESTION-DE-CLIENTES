import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format, addMonths, addYears, differenceInDays } from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import '../AddInquilino.css';
import InputMask from 'react-input-mask';

const AddInquilino = () => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Observar cambios en campos relevantes
  const watchStartDate = watch('inicio_contrato');
  const watchDuration = watch('duracion_contrato');
  const watchDurationType = watch('duracion_tipo');

  // Calcular vencimiento automáticamente
  useEffect(() => {
    if (watchStartDate && watchDuration && watchDurationType) {
      try {
        // Validar formato de fecha
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(watchStartDate)) return;

        const [day, month, year] = watchStartDate.split('/');
        const startDate = new Date(year, month - 1, day);

        if (isNaN(startDate.getTime())) return;

        let expirationDate;
        if (watchDurationType === 'months') {
          expirationDate = addMonths(startDate, parseInt(watchDuration));
        } else {
          expirationDate = addYears(startDate, parseInt(watchDuration));
        }

        const formattedExpiration = format(expirationDate, 'dd/MM/yyyy');
        setValue('vencimiento_contrato', formattedExpiration);

        const daysRemaining = differenceInDays(expirationDate, new Date());
        setValue('dias_vencimiento', daysRemaining > 0 ? daysRemaining : 0);
      } catch (error) {
        console.error('Error al calcular vencimiento:', error);
        setValue('vencimiento_contrato', '');
        setValue('dias_vencimiento', '');
      }
    } else {
      setValue('vencimiento_contrato', '');
      setValue('dias_vencimiento', '');
    }
  }, [watchStartDate, watchDuration, watchDurationType, setValue]);

  // Establecer período automáticamente
  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDate();
    let month = today.getMonth();
    let year = today.getFullYear();
    
    if (currentDay > 20) {
      month = month + 1;
      if (month > 11) {
        month = 0;
        year = year + 1;
      }
    }
    
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                       "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    setValue('periodo', `${monthNames[month]} ${year}`, {
      shouldValidate: true,
      shouldDirty: true
    });
  }, [setValue]);

  // Definición de campos para el formulario
  const camposInquilino = [
    { label: 'Nombre', name: 'nombre', required: true },
    { label: 'Apellido', name: 'apellido', required: true },
    {
      label: 'Teléfono',
      name: 'telefono',
      required: true,
      pattern: /^\d+$/,
      message: "El teléfono solo debe contener números"
    },
    { 
      label: 'Contrato', 
      name: 'contrato', 
      required: true,
      placeholder: 'Ej: Vivienda, Departamento, Local, Galpón...'
    },
    {
      label: 'Inicio del Contrato',
      name: 'inicio_contrato',
      required: true,
      type: 'date-mask'
    },
    {
      label: 'Duración',
      name: 'duracion_contrato',
      required: true,
      type: 'number',
      min: 1
    },
    {
      label: 'Tipo de Duración',
      name: 'duracion_tipo',
      required: true,
      type: 'select',
      options: [
        { value: 'months', label: 'Meses' },
        { value: 'years', label: 'Años' }
      ]
    },
    {
      label: 'Vencimiento del Contrato',
      name: 'vencimiento_contrato',
      readOnly: true
    },
    {
      label: 'Días para Vencimiento',
      name: 'dias_vencimiento',
      readOnly: true
    },
    {
      label: 'Periodo',
      name: 'periodo',
      required: true,
      type: 'text',
      readOnly: true
    },
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
      required: true,
      type: 'select',
      options: ['Sí', 'No'],
      defaultValue: 'No'
    },
    {
      label: 'Gastos adeudados',
      name: 'gastos_adeudados',
      required: true,
      type: 'select',
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
    {
      label: 'Importe Total',
      name: 'importe_total',
      type: 'number',
      readOnly: true
    },
  ];

  // Función para renderizar campos
  const renderCampos = (campos) => {
    return campos.map((campo) => {
      if (campo.type === 'select') {
        return (
          <div className="col-md-6 mb-3" key={campo.name}>
            <label className="form-label dark-label">{campo.label}</label>
            <select
              className={`form-select dark-select ${errors[campo.name] ? 'is-invalid' : ''}`}
              {...register(campo.name, {
                required: campo.required ? `${campo.label} es obligatorio` : false
              })}
              defaultValue={campo.defaultValue || ''}
            >
              <option value="">Seleccione...</option>
              {campo.options.map(option => (
                typeof option === 'object' ? (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ) : (
                  <option key={option} value={option}>
                    {option}
                  </option>
                )
              ))}
            </select>
            {errors[campo.name] && (
              <span className="text-danger">{errors[campo.name].message}</span>
            )}
          </div>
        );
      }

      if (campo.type === 'date-mask') {
        return (
          <div className="col-md-6 mb-3" key={campo.name}>
            <label className="form-label dark-label">{campo.label}</label>
            <InputMask
              mask="99/99/9999"
              maskChar={null}
              placeholder="DD/MM/AAAA"
              className={`form-control dark-input ${errors.inicio_contrato ? 'is-invalid' : ''}`}
              {...register('inicio_contrato', {
                required: 'La fecha de inicio es obligatoria',
                validate: (value) => {
                  // Validar formato DD/MM/AAAA
                  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
                    return 'Formato de fecha inválido (DD/MM/AAAA)';
                  }

                  // Validar que sea una fecha real
                  const [day, month, year] = value.split('/');
                  const date = new Date(year, month - 1, day);
                  if (isNaN(date.getTime())) {
                    return 'Fecha inválida';
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
      }

      return (
        <div className="col-md-6 mb-3" key={campo.name}>
          <label className="form-label dark-label">{campo.label}</label>
          <input
            type={campo.type || 'text'}
            className={`form-control dark-input ${errors[campo.name] ? 'is-invalid' : ''}`}
            readOnly={campo.readOnly}
            placeholder={campo.placeholder || ''}
            min={campo.min}
            {...register(campo.name, {
              required: campo.required ? `${campo.label} es obligatorio` : false,
              pattern: campo.pattern ? {
                value: campo.pattern,
                message: campo.message
              } : undefined,
              min: campo.min ? {
                value: campo.min,
                message: `El valor mínimo es ${campo.min}`
              } : undefined
            })}
          />
          {errors[campo.name] && (
            <span className="text-danger">{errors[campo.name].message}</span>
          )}
        </div>
      );
    });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Formatear datos para enviar al backend
      const formattedData = {
        ...data,
        periodo: data.periodo.toString().trim(),
        aumento: data.aumento.toString().trim(),
        alquileres_adeudados: data.alquileres_adeudados === 'Sí' ? 'si debe' : 'no debe',
        gastos_adeudados: data.gastos_adeudados === 'Sí' ? 'si debe' : 'no debe',
        alquileres_importe: parseFloat(data.alquileres_importe) || 0,
        agua_importe: parseFloat(data.agua_importe) || 0,
        luz_importe: parseFloat(data.luz_importe) || 0,
        tasa_importe: parseFloat(data.tasa_importe) || 0,
        otros: parseFloat(data.otros) || 0,
        importe_total: parseFloat(data.importe_total) || 0,
        // Convertir duración a meses si es necesario
        duracion_contrato: data.duracion_tipo === 'years'
          ? parseInt(data.duracion_contrato) * 12
          : parseInt(data.duracion_contrato),
        // Parsear fechas
        inicio_contrato: data.inicio_contrato,
        vencimiento_contrato: data.vencimiento_contrato
      };

      // Aquí iría la llamada a la API para guardar los datos
      console.log('Datos a enviar:', formattedData);

      Swal.fire({
        title: '¡Inquilino Agregado!',
        text: `El inquilino ${formattedData.nombre} ${formattedData.apellido} se ha agregado correctamente.`,
        icon: 'success',
        confirmButtonText: 'Aceptar',
      });
      reset();
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
    <div className="dark-theme-bg">
      <div className="dark-card p-4 mb-4">
        <h4 className="text-center text-light mb-0">Agregar Nuevo Inquilino</h4>
      </div>

      <form className="dark-card p-4" onSubmit={handleSubmit(onSubmit)}>
        <h5 className="dark-title mb-4">Datos del Inquilino</h5>
        <div className="row g-3">
          {renderCampos(camposInquilino)}
        </div>

        <h5 className="dark-title mt-5 mb-4">Datos del Inmueble</h5>
        <div className="row g-3">
          {renderCampos(camposInmueble)}
        </div>

        <h5 className="dark-title mt-5 mb-4">Detalle de Liquidaciones</h5>
        <div className="row g-3">
          {renderCampos(camposLiquidacion)}
        </div>

        <div className="d-flex justify-content-end mt-5">
          <button type="submit" className="btn dark-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Guardando...
              </>
            ) : 'Agregar Inquilino'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInquilino;


























