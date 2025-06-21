import React from 'react';
import { format, parseISO } from 'date-fns';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    // Si ya está en formato DD/MM/AAAA
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }
    
    // Si es una fecha ISO
    if (dateString.includes('T')) {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    }
    
    // Si es otra fecha (como timestamp o string sin formato)
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return format(date, 'dd/MM/yyyy');
    }
    
    return 'N/A';
  } catch {
    return 'N/A';
  }
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

  // Asegúrate de incluir vencimiento_contrato en los campos relevantes
  const camposRelevantes = [
    'nombre',
    'apellido',
    'telefono',
    'propietario_direccion',
    'inicio_contrato',
    'vencimiento_contrato',  // Asegúrate de que esté incluido
    'duracion_contrato',
    'periodo',
    'contrato',
    'aumento',
    'alquileres_adeudados',
    'gastos_adeudados',
    'alquileres_importe',
    'agua_importe',
    'luz_importe',
    'tasa_importe',
    'otros',
    'importe_total'
  ];

  const formatValue = (key, value) => {
    // Manejar campos de fecha
    if (key.includes('contrato')) {
      return formatDate(value);
    }

    if (key === 'alquileres_adeudados' || key === 'gastos_adeudados') {
      return value === 'si debe' ? 'Sí' : 'No';
    }

    // Campos numéricos
    const numericFields = [
      'alquileres_importe', 'agua_importe', 'luz_importe',
      'tasa_importe', 'otros', 'importe_total', 'duracion_contrato'
    ];

    if (numericFields.includes(key)) {
      const numValue = parseFloat(value?.toString().replace(/\./g, ''));
      return isNaN(numValue) ? 'N/A' : numValue.toLocaleString('es-AR');
    }

    return value || 'N/A';
  };

  return (
    <div className="modal-content p-3">
      <h3 className="mb-3">Detalles del Inquilino</h3>
      <form>
        {camposRelevantes.map((key) => (
          <div className="mb-3" key={key}>
            <label className="form-label fw-bold">
              {key.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </label>
            <input
              type="text"
              className="form-control"
              value={formatValue(key, selectedInquilino[key])}
              readOnly
            />
          </div>
        ))}
      </form>
    </div>
  );
};

export default ModalInquilino;