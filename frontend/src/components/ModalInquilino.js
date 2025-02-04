import React from 'react';

const ModalInquilino = ({ selectedInquilino }) => {
  if (!selectedInquilino) {
    return (
      <div className="modal-content p-3">
        <h3 className="mb-3">Detalles del Inquilino</h3>
        <p className="text-muted">No hay datos disponibles para este inquilino.</p>
      </div>
    );
  }

  const camposRelevantes = ['nombre', 'apellido', 'telefono', 'direccion', 'alquileres_adeudados', 'gastos_adeudados'];

  const formatValue = (key, value) => {
    if (key === 'inicio_contrato' && value) {
        const fecha = new Date(value);
        const day = String(fecha.getDate()).padStart(2, '0');
        const month = String(fecha.getMonth() + 1).padStart(2, '0'); // +1 porque los meses van de 0-11
        const year = fecha.getFullYear();
        return `${day}/${month}/${year}`;
    }
    if (key === 'telefono' && value) {
        return value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'); // Formatear teléfono
    }
    return value || 'N/A'; // Mostrar 'N/A' si el valor es undefined o null
};


  return (
    <div className="modal-content p-3" role="dialog" aria-labelledby="modal-title">
      <h3 id="modal-title" className="mb-3">Detalles del Inquilino</h3>
      <form>
        {camposRelevantes.map((key) => (
          <div className="mb-3" key={key}>
            <label className="form-label fw-bold" htmlFor={key}>
              {key}
            </label>
            <input
              type="text"
              className="form-control"
              id={key}
              value={formatValue(key, selectedInquilino[key])}
              readOnly
              aria-label={key}
            />
          </div>
        ))}
      </form>
    </div>
  );
};

export default ModalInquilino;
