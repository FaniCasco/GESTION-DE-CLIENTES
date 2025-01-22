import React from 'react';

const ModalInquilino = ({ selectedInquilino }) => {
  if (!selectedInquilino) {
    return <div>No hay inquilino seleccionado</div>;
  }

  return (
    <div className="modal-content">
      <h3>Detalles del Inquilino</h3>
      <form>
        {Object.keys(selectedInquilino).map((key) => (
          <div className="mb-2" key={key}>
            <label className="form-label">{key}</label>
            <input
                type="text"
                className="form-control"
                value={selectedInquilino[key]}
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

