import React from "react";

const Recibo = React.forwardRef(({ inquilino }, ref) => {

    return (
        <div ref={ref} className="container mt-5">


            <div
                className="card shadow-sm p-4"
                style={{
                    borderRadius: "10px",
                    border: "1px solid rgb(14, 9, 9)",
                    maxWidth: "900px",
                    margin: "0 auto",
                }}
            >
                <div className="mb-4">
                    <div className="row align-items-center">
                        {/* Columna 1: Logo */}
                        <div className="col-md-4 text-center mb-3">
                            <img src="../assets/img/logo.png" alt="Logo"
                                style={{ width: "150px", height: "auto", marginLeft: "-100px" }}
                            />
                        </div>

                        {/* Columna 2:  */}
                        <div className="col-md-4">
                            <h6 className="fw-bold">MS INMOBILIARIA</h6>
                            <p className="mb-1">Av. San Martín 353, Gdor Crespo, Tel: 3498 - 478730</p>

                            <p className="text-muted mb-1">Emitido el: {new Date().toLocaleDateString()}</p>
                        </div>



                        {/* Columna 3:  */}
                        <div className="col-md-4 text-center">
                            <h2 className="h4" style={{ color: "#4a4a4a" }}>
                                Recibo de Alquiler
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="row mb-4 border-top pt-4">
                    <div className="col-md-6">
                        <h5 className="fw-bold" style={{ color: "#4a90e2" }}>
                            Propietario
                        </h5>
                        <p className="mb-1">{inquilino.propietario_nombre}</p>
                        <p className="mb-1">{inquilino.propietario_direccion}</p>
                        <p className="mb-1">{inquilino.propietario_localidad}</p>
                    </div>
                    <div className="col-md-6">
                        <h5 className="fw-bold" style={{ color: "#4a90e2" }}>
                            Inquilino
                        </h5>
                        <p className="mb-1">{inquilino.nombre} {inquilino.apellido}</p>
                        <p className="mb-1">Teléfono: {inquilino.telefono}</p>
                    </div>
                </div>

                <div className="row mb-4 border-top pt-4">
                    <div className="col-md-6">
                        <h5 className="fw-bold" style={{ color: "#4a90e2" }}>
                            Detalles del Alquiler
                        </h5>
                        <ul className="list-unstyled">
                            <li><strong>Periodo:</strong> {inquilino.periodo}</li>
                            <li><strong>Contrato:</strong> {inquilino.contrato}</li>
                            <li><strong>Aumento:</strong> {inquilino.aumento}</li>
                            <li>
                                <strong>Estado:</strong>{" "}
                                {inquilino.alquileres_adeudados > 0
                                    ? `${inquilino.alquileres_adeudados} meses adeudados`
                                    : "Al día"}
                            </li>
                            <li><strong>Alq. adeudados:</strong> {inquilino.alquileres_adeudados}</li>
                            <li><strong>Deudas de gastos:</strong> {inquilino.gastos_adeudados}</li>
                        </ul>
                    </div>

                    <div className="col-md-6">
                        <h5 className="fw-bold" style={{ color: "#4a90e2" }}>
                            Detalles de Liquidación
                        </h5>
                        <ul className="list-unstyled">
                            <li><strong>Alquileres:</strong> ${inquilino.alquileres_importe}</li>
                            <li><strong>Agua:</strong> ${inquilino.agua_importe}</li>
                            <li><strong>Tasa:</strong> ${inquilino.tasa_importe}</li>
                            <li><strong>Otros:</strong> ${inquilino.otros}</li>
                            <li><strong>Importe Total:</strong> ${inquilino.importe_total}</li>
                        </ul>
                    </div>
                </div>

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











