import React, { useState } from "react";
import { useInquilinos } from "../features/inquilinos/useInquilinos";
import Modal from "react-modal";
import { useForm } from "react-hook-form";

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
    reset(inquilino); // Carga los datos en el formulario
    setIsEditing(false); // Modo de visualización por defecto
    setViewModalOpen(true);
  };

  const handleEditClick = (inquilino) => {
    setSelectedInquilino(inquilino);
    reset(inquilino); // Carga los datos en el formulario
    setIsEditing(true); // Activa la edición directamente
    setViewModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    const confirmed = window.confirm("¿Estás seguro de que quieres eliminar este inquilino?");
    if (confirmed) {
      try {
        const response = await fetch(`/api/inquilinos/${id}`, { method: "DELETE" });
        if (!response.ok) {
          throw new Error("Error al eliminar el inquilino");
        }
        console.log("Inquilino eliminado exitosamente");
        refetch(); // Actualiza la lista de inquilinos
      } catch (error) {
        console.error("Error al intentar eliminar el inquilino:", error);
      }
    }
  };
  
  const onSubmit = async (data) => {
    try {
      const updatedInquilino = { ...selectedInquilino, ...data };
      console.log("Actualizando inquilino:", updatedInquilino);

      // Actualizar datos en el backend
      await fetch(`/api/inquilinos/${selectedInquilino.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedInquilino),
      });

      refetch();
      setIsEditing(false); // Vuelve al modo visualización
      setViewModalOpen(false); // Cierra el modal
    } catch (error) {
      console.error("Error al actualizar los datos del inquilino", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return <p>Cargando inquilinos...</p>;
  }

  if (isError) {
    return <p>Error al cargar inquilinos: {error.message}</p>;
  }

  // Filtrar y ordenar los inquilinos
  const filteredInquilinos = inquilinos
    ?.filter((inquilino) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        inquilino.id.toString().includes(searchTerm) ||
        inquilino.nombre.toLowerCase().includes(searchLower) ||
        inquilino.apellido.toLowerCase().includes(searchLower) ||
        inquilino.propietario_nombre?.toLowerCase().includes(searchLower) ||
        inquilino.propietario_apellido?.toLowerCase().includes(searchLower) ||
        inquilino.propietario_direccion?.toLowerCase().includes(searchLower) ||
        inquilino.alquileres_adeudados?.toString().includes(searchLower)


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
          placeholder="Buscar por ID, Nombre, Apellido, Alquileres adeudados (si/no) o Propietario"
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
                  className="btn btn-sm"
                  style={{ backgroundColor: "#dc3545", color: "#fff" }}
                  onClick={() => handleDeleteClick(inquilino.id)}
                >
                  <i className="bi bi-trash"></i>
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
            maxWidth: "800px", // Aumenta el ancho del modal
            margin: "auto",
            height: "90vh", // Aumenta la altura del modal
            maxHeight: "90vh", // Limita la altura máxima al 90% de la pantalla
            overflowY: "auto", // Permite el scroll solo si es necesario
            backgroundColor: "#2c2c2c", // Fondo oscuro
            color: "#f5f5f5", // Texto claro
            borderRadius: "10px", // Bordes redondeados
            border: "1px solid #444", // Borde más claro
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)", // Sombra sutil
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.8)", // Fondo translúcido para el overlay
          },
        }}
      >
        <h3>{isEditing ? "Editar Información del Inquilino" : "Información del Inquilino"}</h3>
        {selectedInquilino && (
          <form onSubmit={handleSubmit(onSubmit)}>
            {Object.keys(selectedInquilino).map((key) => (
              <div className="mb-2" key={key}>
                <label className="form-label">{key}</label>
                <input
                  type="text"
                  className="form-control"
                  {...register(key)}
                  defaultValue={selectedInquilino[key]}
                  readOnly={!isEditing} // Deshabilita edición si no está en modo "Editar"
                />
              </div>
            ))}
            <div className="d-flex justify-content-between mt-4">
              {isEditing ? (
                <>
                  <button type="submit" className="btn btn-success">
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </button>
              )}
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setViewModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default InquilinosList;







