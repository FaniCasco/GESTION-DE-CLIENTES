import React, { useState } from "react";

import { useInquilinos } from "../features/inquilinos/useInquilinos";
import Modal from "react-modal";
import { useForm } from "react-hook-form";
import logo from "../assets/img/logo.png";
import 'bootstrap/dist/css/bootstrap.min.css';


Modal.setAppElement("#root");

const InquilinosList = () => {
  const { data: inquilinos, isLoading, isError, error, refetch } = useInquilinos();
  const [searchTerm, setSearchTerm] = useState("");
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedInquilino, setSelectedInquilino] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const handleViewClick = (inquilino) => {
    setSelectedInquilino(inquilino);
    reset(inquilino);
    setIsEditing(false);
    setViewModalOpen(true);
  };

  const handleEditClick = (inquilino) => {
    setSelectedInquilino(inquilino);
    reset(inquilino);
    setIsEditing(true);
    setViewModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    const confirmed = window.confirm("¿Estás seguro de que quieres eliminar este inquilino?");
    if (confirmed) {
      try {
        const response = await fetch(`/api/inquilinos/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Error al eliminar el inquilino");
        console.log("Inquilino eliminado exitosamente");
        refetch();
      } catch (error) {
        console.error("Error al intentar eliminar el inquilino:", error);
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      const updatedInquilino = { ...selectedInquilino, ...data };
      console.log("Actualizando inquilino:", updatedInquilino);

      await fetch(`/api/inquilinos/${selectedInquilino.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedInquilino),
      });

      refetch();
      setIsEditing(false);
      setViewModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar los datos del inquilino", error);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = resolve;
      img.onerror = reject;
    });
  };

  const handlePrint = async (inquilino) => {
    await preloadImage(logo); // Pre-cargar logo
  
      const printWindow = window.open("", "_blank", "height=900,width=1200");
  

    // Generar el contenido dinámico con las variables reales
    const content = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo de Alquiler</title>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
  <style>
    @media print {
      .card {
        padding: 20px;
        border: 1px solid #000;
        max-width: 900px;
        height: 600px;
        margin: 0 auto;
        padding-top: 50px;
      }
      .row {
        display: flex;
        justify-content: space-between;
      }
      .col-4 {
        width: 33.33%;
      }
      img.logo {
        max-width: 80px;
        height: auto;
      }
      h5, h6 {
        font-size: 14px;
        margin-bottom: 5px;
      }
      p {
        font-size: 12px;
        margin-bottom: 3px;
      }
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
    }
    .card {
      padding: 15px;
      border-radius: 10px;
      border: 1px solid #000;
      max-width: 900px;
      height: 600px;
      margin: 15px auto;
      padding-top: 50px;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .logo {
      width: 100px;
      height: auto;
    }
    .row {
      margin-bottom: 10px;
    }
    h5, h6 {
      color: #4a90e2;
      margin-bottom: 5px;
    }
    p {
      font-size: 14px;
      margin-bottom: 5px;
    }
    .linea {
      border-bottom: 1px solid #000;
      height: 1rem;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container mt-5">
    <!-- Primer recibo -->
    <div class="card shadow-sm">
      <!-- Cabecera -->
      <div class="row mb-3 header-row">
        <div class="col-4 text-left">
          <img src="${window.location.origin}/assets/img/logo.png" alt="Logo" class="logo" />
        </div>
        <div class="col-4 text-center">
          <h6 class="fw-bold">MS INMOBILIARIA</h6>
          <p>Av. San Martín 353, Gdor Crespo</p>
          <p>Tel: 3498 - 478730</p>
          <p class="text-muted">Emitido el: ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="col-4 text-right">
          <h2 class="h4">Recibo de Alquiler</h2>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="row mb-3 border-top pt-3">
        <div class="col-4">
          <h5 class="fw-bold">Propietario</h5>
          <p>${inquilino.propietario_nombre}</p>
          <p>${inquilino.propietario_direccion}</p>
          <p>${inquilino.propietario_localidad}</p>
        </div>
        <div class="col-4">
          <h5 class="fw-bold">Otros Conceptos</h5>
        </div>
        <div class="col-4">
          <h5 class="fw-bold">Inquilino</h5>
          <p>${inquilino.nombre} ${inquilino.apellido}</p>
          <p>Teléfono: ${inquilino.telefono}</p>
        </div>
      </div>

      <div class="row mb-3 border-top pt-3">
        <div class="col-4">
          <h5 class="fw-bold">Detalles del Alquiler</h5>
          <p><strong>Periodo:</strong> ${inquilino.periodo}</p>
          <p><strong>Contrato:</strong> ${inquilino.contrato}</p>
          <p><strong>Aumento:</strong> ${inquilino.aumento}</p>
          <p><strong>Estado:</strong> ${inquilino.alquileres_adeudados > 0 ? `${inquilino.alquileres_adeudados} meses adeudados` : "Al día"}</p>
        </div>
        <div class="col-4">
          <h5 class="fw-bold">Detalles de Liquidación</h5>
          <p><strong>Alquileres:</strong> ${inquilino.alquileres_importe}</p>
          <p><strong>Agua:</strong> ${inquilino.agua_importe}</p>
          <p><strong>Tasa:</strong> ${inquilino.tasa_importe}</p>
          <p><strong>Otros:</strong> ${inquilino.otros}</p>
          <p><strong>Total:</strong> ${inquilino.importe_total}</p>
        </div>
      </div>

      <!-- Firmas -->
      <div class="row text-center mt-3">
        <div class="col-6">
          <div class="linea"></div>
          <p>Firma Inmobiliaria</p>
        </div>
        <div class="col-6">
          <div class="linea"></div>
          <p>Firma del Inquilino</p>
        </div>
      </div>
    </div>
  </div>

  <div class="container mt-5">
    <!-- Segundo recibo -->
    <div class="card shadow-sm">
      <!-- Cabecera -->
      <div class="row mb-3 header-row">
        <div class="col-4 text-left">
          <img src="${window.location.origin}/assets/img/logo.png" alt="Logo" class="logo" />
        </div>
        <div class="col-4 text-center">
          <h6 class="fw-bold">MS INMOBILIARIA</h6>
          <p>Av. San Martín 353, Gdor Crespo</p>
          <p>Tel: 3498 - 478730</p>
          <p class="text-muted">Emitido el: ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="col-4 text-right">
          <h2 class="h4">Recibo de Alquiler</h2>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="row mb-3 border-top pt-3">
        <div class="col-4">
          <h5 class="fw-bold">Propietario</h5>
          <p>${inquilino.propietario_nombre}</p>
          <p>${inquilino.propietario_direccion}</p>
          <p>${inquilino.propietario_localidad}</p>
        </div>
        <div class="col-4">
          <h5 class="fw-bold">Otros Conceptos</h5>
        </div>
        <div class="col-4">
          <h5 class="fw-bold">Inquilino</h5>
          <p>${inquilino.nombre} ${inquilino.apellido}</p>
          <p>Teléfono: ${inquilino.telefono}</p>
        </div>
      </div>

      <div class="row mb-3 border-top pt-3">
        <div class="col-4">
          <h5 class="fw-bold">Detalles del Alquiler</h5>
          <p><strong>Periodo:</strong> ${inquilino.periodo}</p>
          <p><strong>Contrato:</strong> ${inquilino.contrato}</p>
          <p><strong>Aumento:</strong> ${inquilino.aumento}</p>
          <p><strong>Estado:</strong> ${inquilino.alquileres_adeudados > 0 ? `${inquilino.alquileres_adeudados} meses adeudados` : "Al día"}</p>
        </div>
        <div class="col-4">
          <h5 class="fw-bold">Detalles de Liquidación</h5>
          <p><strong>Alquileres:</strong> ${inquilino.alquileres_importe}</p>
          <p><strong>Agua:</strong> ${inquilino.agua_importe}</p>
          <p><strong>Tasa:</strong> ${inquilino.tasa_importe}</p>
          <p><strong>Otros:</strong> ${inquilino.otros}</p>
          <p><strong>Total:</strong> ${inquilino.importe_total}</p>
        </div>
      </div>

      <!-- Firmas -->
      <div class="row text-center mt-3">
        <div class="col-6">
          <div class="linea"></div>
          <p>Firma Inmobiliaria</p>
        </div>
        <div class="col-6">
          <div class="linea"></div>
          <p>Firma del Inquilino</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>


    `;

    // Escribir el contenido y lanzar la impresión
    printWindow.document.write(content);
   
     // Espera 500ms para garantizar que todo se haya renderizado antes de imprimir
  setTimeout(() => {
    printWindow.print();   
  }, 500);

  };



  if (isLoading) return <p>Cargando inquilinos...</p>;

  if (isError) return <p>Error al cargar inquilinos: {error.message}</p>;

  const filteredInquilinos = inquilinos
    ?.filter((inquilino) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        inquilino.id.toString().includes(searchTerm) ||
        inquilino.nombre.toLowerCase().includes(searchLower) ||
        inquilino.apellido.toLowerCase().includes(searchLower) ||
        inquilino.propietario_nombre?.toLowerCase().includes(searchLower) ||
        inquilino.propietario_direccion?.toLowerCase().includes(searchLower) ||
        inquilino.alquileres_adeudados?.toString().includes(searchLower) ||
        inquilino.gastos_adeudados?.toString().includes(searchLower)
      );

    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div className="container mt-4">
      {/* Ajuste del título */}
      <div className="p-3 mb-4 bg-agregar text-white rounded shadow">
        <h4 className="text-center mb-0">Lista de Inquilinos</h4>
      </div>

      {/* Campo de búsqueda */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por ID, Nombre, Apellido, Alquileres adeudados (si debe/no debe) o Propietario"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <table className="table custom-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredInquilinos.map((inquilino) => (
            <tr key={inquilino.id}>
              <td>{inquilino.nombre}</td>
              <td>{inquilino.apellido}</td>
              <td>{inquilino.telefono}</td>
              <td>{inquilino.propietario_direccion}</td>
              <td>
                <button
                  className="btn btn-sm me-2"
                  style={{ backgroundColor: "#17a2b8", color: "#fff" }}
                  onClick={() => handleViewClick(inquilino)}
                >
                  <i className="bi bi-eye"></i>
                </button>
                <button
                  className="btn btn-sm me-2"
                  style={{ backgroundColor: "#007bff", color: "#fff" }}
                  onClick={() => handleEditClick(inquilino)}
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button
                  className="btn btn-sm me-2"
                  style={{ backgroundColor: "#dc3545", color: "#fff" }}
                  onClick={() => handleDeleteClick(inquilino.id)}
                >
                  <i className="bi bi-trash"></i>
                </button>
                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: "#28a745", color: "#fff" }}
                  onClick={() => handlePrint(inquilino)} // Botón de imprimir
                >
                  <i className="bi bi-printer"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

   
      {/* Modal Ver y Editar */}
      <Modal
        isOpen={isViewModalOpen}
        onRequestClose={() => setViewModalOpen(false)}
        contentLabel="Ver/Editar Inquilino"
        style={{
          content: {
            maxWidth: "800px", // Ancho máximo del modal
            margin: "auto",
            height: "85vh", // Altura del modal
            maxHeight: "85vh", // Limita la altura máxima
            overflowY: "auto", // Permite el scroll solo si es necesario
            background: "#2c2c2c", // Fondo oscuro
            color: "#ffffff", // Texto claro
            borderRadius: "15px", // Bordes más redondeados
            border: "none", // Sin borde
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.6)", // Sombra pronunciada
            padding: "20px", // Espaciado interno
            animation: "fadeIn 0.3s ease-in-out", // Animación de entrada
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.8)", // Fondo translúcido para el overlay
          },
        }}
      >
        <h3 style={{ borderBottom: "2px solid #555", paddingBottom: "10px" }}>
          {isEditing ? "Editar Información del Inquilino" : "Información del Inquilino"}
        </h3>
        {selectedInquilino && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div
              style={{
                display: "grid",

                gridTemplateColumns: "1fr 1fr", // Dos columnas
                gap: "15px", // Espaciado entre columnas
              }}
            >
              {Object.keys(selectedInquilino).map((key) => (
                <div key={key}>
                  <label
                    style={{
                      FontFamily: "'Poppins', sans-serif;",
                      FontWeight: "300",
                      display: "block",
                      fontSize: "15px",
                      marginBottom: "5px",
                    }}
                  >
                    {key}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    {...register(key)}
                    defaultValue={selectedInquilino[key]}
                    readOnly={!isEditing} // Deshabilita edición si no está en modo "Editar"
                    style={{
                      background: isEditing ? "#f5f5dc" : "#2c2c2c",
                      color: isEditing ? "black" : "white",
                      border: "1px solid #555", // Borde sutil
                      borderRadius: "5px", // Bordes suaves
                      fontSize: "15px", // Texto más pequeño
                      FontFamily: "'Poppins', sans-serif;",
                      FontWeight: "300",
                      padding: "8px", // Espaciado interno reducido
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-between mt-4">
              {isEditing ? (
                <>
                  <button
                    type="submit"
                    className="btn btn-success"
                    style={{
                      backgroundColor: "#28a745",
                      borderColor: "#28a745",
                      color: "#fff",
                      fontSize: "15px", // Texto más pequeño
                      fontWeight: "bold",
                      padding: "8px 16px",
                    }}
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                    style={{
                      backgroundColor: "#6c757d",
                      borderColor: "#6c757d",
                      color: "#fff",
                      fontSize: "15px", // Texto más pequeño
                      fontWeight: "bold",
                      padding: "8px 16px",
                    }}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                  style={{
                    backgroundColor: "#007bff",
                    borderColor: "#007bff",
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: "bold",
                    padding: "8px 16px",
                  }}
                >
                  Editar
                </button>
              )}
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setViewModalOpen(false)}
                style={{
                  backgroundColor: "#dc3545",
                  borderColor: "#dc3545",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "15px", // Texto más pequeño
                  padding: "8px 16px",
                }}
              >
                Cerrar
              </button>
            </div>
          </form>
        )}
      </Modal>


    </div >
  );
};

export default InquilinosList;














