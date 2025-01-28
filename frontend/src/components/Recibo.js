import React from 'react';
import logo from '../assets/img/logo.png'; // Ajusta la ruta según tu estructura de archivos

const Recibo = React.forwardRef(({ inquilino }, ref) => {
  if (!inquilino) {
    return (
      <div className="container mt-5">
        <div className="card shadow-sm p-4">
          <h2 className="h4">Recibo de Alquiler</h2>
          <p className="text-muted">No hay datos disponibles para este recibo.</p>
        </div>
      </div>
    );
  }

  const {
    propietario_nombre = 'N/A',
    propietario_direccion = 'N/A',
    propietario_localidad = 'N/A',
    nombre = 'N/A',
    apellido = 'N/A',
    telefono = 'N/A',
    periodo = 'N/A',
    contrato = 'N/A',
    aumento = 'N/A',
    alquileres_adeudados = 0,
    gastos_adeudados = 'N/A',
    alquileres_importe = 0,
    agua_importe = 0,
    tasa_importe = 0,
    otros = 0,
    importe_total = 0,
  } = inquilino;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
  };

  /*const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR');
  };*/

  return (
    <div ref={ref} className="container mt-5" role="document" aria-label="Recibo de Alquiler">
      <div
        className="card shadow-sm p-4"
        style={{
          borderRadius: "10px",
          border: "1px solid rgb(14, 9, 9)",
          maxWidth: "900px",
          height: "700px",
          margin: "0 auto",
          paddingTop: "50px",
          backgroundColor: "#f9f9f9",
        }}
        aria-labelledby="recibo-title"
      >
        {/* Cabecera */}
        <div className="mb-4">
          <div className="row align-items-center">
            {/* Columna 1: Logo */}
            <div className="col-md-4 text-center mb-3">
              <img
                src={logo}
                alt="Logo"
                style={{
                  width: "130px",
                  height: "auto",
                }}
              />
            </div>

            {/* Columna 2: Información de la Inmobiliaria */}
            <div className="col-md-4">
              <h6 className="fw-bold">MS INMOBILIARIA</h6>
              <p className="mb-1">Av. San Martín 353, Gdor Crespo, Tel: 3498 - 478730</p>
              <p className="text-muted mb-1">Emitido el: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Columna 3: Título */}
            <div className="col-md-4 text-center">
              <h2 id="recibo-title" className="h4" style={{ color: "#4a4a4a" }}>
                Recibo de Alquiler
              </h2>
            </div>
          </div>
        </div>

        {/* Detalles del Inquilino, Propietario y Otros Conceptos */}
        <div className="row mb-4 border-top pt-4">
          <div className="col-md-4">
            <h5 className="fw-bold" style={{ color: "#4a90e2" }}>Propietario</h5>
            <p className="mb-1">{propietario_nombre}</p>
            <p className="mb-1">{propietario_direccion}</p>
            <p className="mb-1">{propietario_localidad}</p>
          </div>

          {/* Nueva Columna: Otros Conceptos */}
          <div className="col-md-4">
            <h5 className="fw-bold" style={{ color: "#4a90e2" }}>Otros Conceptos</h5>
          </div>

          <div className="col-md-4">
            <h5 className="fw-bold" style={{ color: "#4a90e2" }}>Inquilino</h5>
            <p className="mb-1">{nombre} {apellido}</p>
            <p className="mb-1">Teléfono: {telefono}</p>
          </div>
        </div>

        {/* Detalles del Alquiler y Liquidación */}
        <div className="row mb-4 border-top pt-4">
          <div className="col-md-6">
            <h5 className="fw-bold" style={{ color: "#4a90e2" }}>Detalles del Alquiler</h5>
            <ul className="list-unstyled">
              <li><strong>Periodo:</strong> {periodo}</li>
              <li><strong>Contrato:</strong> {contrato}</li>
              <li><strong>Aumento:</strong> {aumento}</li>
              <li><strong>Estado:</strong> {alquileres_adeudados > 0
                ? `${alquileres_adeudados} meses adeudados`
                : "Al día"}
              </li>
              <li><strong>Alq. adeudados:</strong> {alquileres_adeudados}</li>
              <li><strong>Deudas de gastos:</strong> {gastos_adeudados}</li>
            </ul>
          </div>

          <div className="col-md-6">
            <h5 className="fw-bold" style={{ color: "#4a90e2" }}>Detalles de Liquidación</h5>
            <ul className="list-unstyled">
              <li><strong>Alquileres:</strong> {formatCurrency(alquileres_importe)}</li>
              <li><strong>Agua:</strong> {formatCurrency(agua_importe)}</li>
              <li><strong>Tasa:</strong> {formatCurrency(tasa_importe)}</li>
              <li><strong>Otros:</strong> {formatCurrency(otros)}</li>
              <li><strong>Importe Total:</strong> {formatCurrency(importe_total)}</li>
            </ul>
          </div>
        </div>

        {/* Firmas */}
        <div className="border-top pt-3">
          <div className="row text-center mt-4">
            <div className="col-6">
              <p className="mb-1">Firma del Propietario</p>
              <div style={{ borderBottom: "1px solid #000", height: "2rem" }}></div>
            </div>
            <div className="col-6">
              <p className="mb-1">Firma del Inquilino</p>
              <div style={{ borderBottom: "1px solid #000", height: "2rem" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Recibo;




















