import React from 'react';
import { format, parseISO } from 'date-fns';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return format(parseISO(dateString), 'dd/MM/yyyy');
};

const ModalInquilino = ({ selectedInquilino }) => {
  if (!selectedInquilino) {
    return (
      <div className="modal-content p-3">
        <h3 className="mb-3">Detalles del Inquilino</h3>
        <p className="text-muted">No hay datos disponibles para este inquilino.</p>
      </div>
    );
  }

  const camposRelevantes = [
    'nombre', 
    'apellido', 
    'telefono', 
    'direccion', 
    'inicio_contrato', 
    'periodo', 
    'contrato', 
    'aumento', 
    'alquileres_adeudados', 
    'gastos_adeudados'
  ];

  const formatValue = (key, value) => {
    if (key === 'inicio_contrato' && value) {
      // Usar date-fns para formatear la fecha
      return formatDate(value);
    }
    return value || 'N/A'; // Si no hay valor, mostrar 'N/A'
  };

  // Depuración
  console.log('Fecha desde el backend:', selectedInquilino?.inicio_contrato);
  console.log('Fecha después de formatear:', formatValue('inicio_contrato', selectedInquilino?.inicio_contrato));

  return (
    <div className="modal-content p-3" role="dialog" aria-labelledby="modal-title" aria-describedby="modal-description">
      <h3 id="modal-title" className="mb-3">Detalles del Inquilino</h3>
      <p id="modal-description" className="sr-only">Este modal muestra los detalles del inquilino seleccionado.</p>
      <form>
        {camposRelevantes.map((key) => (
          <div className="mb-3" key={key}>
            <label className="form-label fw-bold" htmlFor={key}>
              {key.replace(/_/g, ' ')} {/* Reemplazar guiones bajos por espacios */}
            </label>
            <input
              type="text"
              className="form-control"
              id={key}
              value={formatValue(key, selectedInquilino[key])}
              readOnly
              aria-label={key.replace(/_/g, ' ')}
            />
          </div>
        ))}
      </form>
    </div>
  );
};

export default ModalInquilino;