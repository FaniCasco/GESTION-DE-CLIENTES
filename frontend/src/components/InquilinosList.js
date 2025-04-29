import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInquilinos } from '../features/inquilinos/useInquilinos';
import Modal from 'react-modal';
import { useForm } from 'react-hook-form';
import logo from '../assets/img/logo.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import Swal from 'sweetalert2';
import ReactPaginate from 'react-paginate';


Modal.setAppElement('#root');

const InquilinosList = () => {
  const { data: inquilinos, isLoading, isError, error, refetch } = useInquilinos();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const [currentPage, setCurrentPage] = useState(0);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedInquilino, setSelectedInquilino] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const inquilinosPerPage = 6;

  useEffect(() => {
    console.log('selectedInquilino actualizado:', selectedInquilino);
  }, [selectedInquilino]);

  const handleSearchChange = (e) => {
    setSearchParams({ search: e.target.value });
  };

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

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
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto una vez eliminado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/inquilinos/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar el inquilino');

        await Swal.fire({
          title: '¡Eliminado!',
          text: 'El inquilino ha sido eliminado con éxito.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });

        refetch();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Hubo un problema al intentar eliminar el inquilino.';
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#3085d6',
        });
        console.error('Error al intentar eliminar el inquilino:', error);
      }
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const updatedInquilino = { ...selectedInquilino, ...data };
      await fetch(`/api/inquilinos/${selectedInquilino.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedInquilino),
      });

      refetch();
      setIsEditing(false);
      setViewModalOpen(false);
      reset();
    } catch (error) {
      console.error('Error al actualizar los datos del inquilino', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = resolve;
      img.onerror = reject;
    });
  };

  const handlePrint = async (inquilino) => {
    await preloadImage(logo);

    const printWindow = window.open('', '_blank', 'height=900,width=1200');
    const content = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo de Alquiler</title>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
  <style>
   @page {
        size: A4;
        margin: 10mm;
      }
    @media print {
     
      .card {
        padding: 10px;
        border: 1px solid #000;
        max-width: 100%;
        height: 530px;
        margin: 0 auto 10px auto;
        page-break-inside: avoid;
      }
      .row {
        display: flex;
        justify-content: space-between;
      }
      .col-4 {
        width: 33.33%;
      }
      img.logo {
        max-width: 110px;
        height: auto;
      }
      h5, h6 {
        font-size: 14px;
        margin-bottom: 5px;
      }
      p {
        font-size: 18px;
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
      max-width: 1000px;
      height: auto;
      margin: 13px auto;
      padding-top: 50px;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .logo {
      width: 110px;
      height: auto;
    }
    .row {
      margin-bottom: 8px;
    }
    h5, h6 {
      color: #4a90e2;
      margin-bottom: 5px;
    }
    p {
      font-size: 18px;
      margin-bottom: 5px;
    }
   
    .list-group-item {
      padding: 3px 10px;
      border: none;
      font-size: 1.2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Primer recibo -->
    <div class="card">
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
          <ul class="list-group">
            <li class="list-group-item">${inquilino.propietario_nombre}</li>
            <li class="list-group-item">${inquilino.propietario_direccion}</li>
            <li class="list-group-item">${inquilino.propietario_localidad}</li>
          </ul>
        </div>

        <div class="col-4">
          <h5 class="fw-bold">Inquilino</h5>
          <ul class="list-group">
            <li class="list-group-item">${inquilino.nombre} ${inquilino.apellido}</li>
            <li class="list-group-item">Teléfono: ${inquilino.telefono}</li>
          </ul>
        </div>

        <div class="col-4">
          <h5 class="fw-bold">Otros Conceptos</h5>
          <ul class="list-group">
            <li class="list-group-item"></li>
          </ul>
        </div>
      </div>

      <div class="row mb-3 border-top pt-3">
        <div class="col-4">
          <h5 class="fw-bold">Detalles del Alquiler</h5>
          <ul class="list-group">
            <li class="list-group-item"><strong>Periodo:</strong> ${inquilino.periodo}</li>
            <li class="list-group-item"><strong>Contrato:</strong> ${inquilino.contrato}</li>
            <li class="list-group-item"><strong>Aumento:</strong> ${inquilino.aumento}</li>
            <li class="list-group-item"><strong>Estado:</strong> ${inquilino.alquileres_adeudados > 0 ? `${inquilino.alquileres_adeudados} meses adeudados` : 'Al día'}</li>
          </ul>
        </div>

        <div class="col-4">
          <h5 class="fw-bold">Detalles de Liquidación</h5>
          <ul class="list-group">
            <li class="list-group-item"><strong>Alquileres:</strong> ${inquilino.alquileres_importe}</li>
            <li class="list-group-item"><strong>Otros:</strong> ${inquilino.otros}</li>
          </ul>
        </div>

        <div class="col-4">
          <h5 class="fw-bold">Impuestos</h5>
          <ul class="list-group">
            <li class="list-group-item"><strong>Agua:</strong> ${inquilino.agua_importe}</li>
            <li class="list-group-item"><strong>Luz:</strong> ${inquilino.luz_importe}</li>
            <li class="list-group-item"><strong>Tasa:</strong> ${inquilino.tasa_importe}</li>
            <li class="list-group-item"><strong>Total:</strong> ${inquilino.importe_total}</li>
          </ul>
        </div>
      </div>

      <!-- Firmas -->
      <div class="row text-center mt-4" style="margin-top: 60px;">
        <div class="col-6">
          <div class="firma-digital" style="height: 80px;">
            <!-- Aquí va la firma digital como imagen -->
            <img src="${window.location.origin}/assets/img/firma_digital.png" alt="Firma Digital" style="max-height: 80px;" />
          </div>
          
          <p class="mt-1">Firma Inmobiliaria</p>
        </div>
        <div class="col-6">
          <div class="linea" style="margin-top: 80px;"></div>
          <p class="mt-1">Firma del Inquilino</p>
        </div>
      </div>

    </div>
  </div>

  <div class="container">
    <!-- Segundo recibo -->
    <div class="card">
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
          <ul class="list-group">
            <li class="list-group-item">${inquilino.propietario_nombre}</li>
            <li class="list-group-item">${inquilino.propietario_direccion}</li>
            <li class="list-group-item">${inquilino.propietario_localidad}</li>
          </ul>
        </div>

        <div class="col-4">
          <h5 class="fw-bold">Inquilino</h5>
          <ul class="list-group">
            <li class="list-group-item">${inquilino.nombre} ${inquilino.apellido}</li>
            <li class="list-group-item">Teléfono: ${inquilino.telefono}</li>
          </ul>
        </div>

        <div class="col-4">
          <h5 class="fw-bold">Otros Conceptos</h5>
          <ul class="list-group">
            <li class="list-group-item">Otros: ${inquilino.otros}</li>
          </ul>
        </div>
      </div>

      <div class="row mb-3 border-top pt-3">
        <div class="col-4">
          <h5 class="fw-bold">Detalles del Alquiler</h5>
          <ul class="list-group">
            <li class="list-group-item"><strong>Periodo:</strong> ${inquilino.periodo}</li>
            <li class="list-group-item"><strong>Contrato:</strong> ${inquilino.contrato}</li>
            <li class="list-group-item"><strong>Aumento:</strong> ${inquilino.aumento}</li>
            <li class="list-group-item"><strong>Estado:</strong> ${inquilino.alquileres_adeudados > 0 ? `${inquilino.alquileres_adeudados} meses adeudados` : 'Al día'}</li>
          </ul>
        </div>

        <div class="col-4">
          <h5 class="fw-bold">Detalles de Liquidación</h5>
          <ul class="list-group">
            <li class="list-group-item"><strong>Alquileres:</strong> ${inquilino.alquileres_importe}</li>
            <li class="list-group-item"><strong>Otros:</strong> ${inquilino.otros}</li>
          </ul>
        </div>

        <div class="col-4">
          <h5 class="fw-bold">Impuestos</h5>
          <ul class="list-group">
            <li class="list-group-item"><strong>Agua:</strong> ${inquilino.agua_importe}</li>
            <li class="list-group-item"><strong>Luz:</strong> ${inquilino.luz_importe}</li>
            <li class="list-group-item"><strong>Tasa:</strong> ${inquilino.tasa_importe}</li>
            <li class="list-group-item"><strong>Total:</strong> ${inquilino.importe_total}</li>
          </ul>
        </div>
      </div>

      <!-- Firmas -->
      <div class="row text-center mt-4" style="margin-top: 60px;">
        <div class="col-6">
          <div class="firma-digital" style="height: 80px;">
            <!-- Aquí va la firma digital como imagen -->
            <img src="${window.location.origin}/assets/img/firma_digital.png" alt="Firma Digital" style="max-height: 80px;" />
          </div>
         
          <p class="mt-1">Firma Inmobiliaria</p>
        </div>
        <div class="col-6">
          <div class="linea" style="margin-top: 80px;"></div>
          <p class="mt-1">Firma del Inquilino</p>
        </div>
      </div>

    </div>
  </div>
</body>
</html>

    `;


    printWindow.document.write(content);
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  //impresion masiva
  const handlePrintAll = async (inquilinos) => {
    // Preload la imagen del logo para todos los recibos
    await preloadImage(logo);

    const printWindow = window.open('', '_blank', 'height=900,width=1200');

    // Generar el contenido HTML para todos los recibos
    let content = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recibos de Alquiler</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
    <style>
     @page {
            size: A4;
            margin: 10mm;
          }
      @media print {
        .page-break {
          page-break-after: always;
        }
         

        .card {
          padding: 20px;
          border: 1px solid #000;
          max-width: 900px;
          height: auto;
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
          max-width: 110px;
          height: auto;
        }
        h5, h6 {
          font-size: 14px;
          margin-bottom: 5px;
        }
        p {
          font-size: 18px;
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
        height: auto;
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
        width: 110px;
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
        font-size: 18px;
        margin-bottom: 5px;
      }
     
    </style>
  </head>
  <body>
  `;

    // Generar dos recibos por cada inquilino (original y copia)
    inquilinos.forEach((inquilino, index) => {
      content += `
    <div class="container">
      <!-- Primer recibo -->
      <div class="card">
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
            <p><strong>Estado:</strong> ${inquilino.alquileres_adeudados > 0 ? `${inquilino.alquileres_adeudados} meses adeudados` : 'Al día'}</p>
          </div>
          <div class="col-4">
            <h5 class="fw-bold">Detalles de Liquidación</h5>
            <p><strong>Alquileres:</strong> ${inquilino.alquileres_importe}</p>
            <p><strong>Agua:</strong> ${inquilino.agua_importe}</p>
            <p><strong>Tasa:</strong> ${inquilino.tasa_importe}</p>
            <p><strong>Luz:</strong> ${inquilino.luz_importe}</p>
            <p><strong>Otros:</strong> ${inquilino.otros}</p>
            <p><strong>Total:</strong> ${inquilino.importe_total}</p>
          </div>
        </div>
  
       <!-- Firmas -->
        <div class="row text-center mt-4" style="margin-top: 60px;">
          <div class="col-6">
            <div class="firma-digital" style="height: 80px;">
              <!-- Aquí va la firma digital como imagen -->
              <img src="${window.location.origin}/assets/img/firma_digital.png" alt="Firma Digital" style="max-height: 80px;" />
            </div>
           
            <p class="mt-1">Firma Inmobiliaria</p>
          </div>
          <div class="col-6">
            <div class="linea" style="margin-top: 80px;"></div>
            <p class="mt-1">Firma del Inquilino</p>
          </div>
        </div>

      </div>
    </div>
  
    <div class="container">
      <!-- Segundo recibo (copia) -->
      <div class="card">
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
            <p><strong>Estado:</strong> ${inquilino.alquileres_adeudados > 0 ? `${inquilino.alquileres_adeudados} meses adeudados` : 'Al día'}</p>
          </div>
          <div class="col-4">
            <h5 class="fw-bold">Detalles de Liquidación</h5>
            <p><strong>Alquileres:</strong> ${inquilino.alquileres_importe}</p>
            <p><strong>Agua:</strong> ${inquilino.agua_importe}</p>
            <p><strong>Tasa:</strong> ${inquilino.tasa_importe}</p>
            <p><strong>Luz:</strong> ${inquilino.luz_importe}</p>
            <p><strong>Otros:</strong> ${inquilino.otros}</p>
            <p><strong>Total:</strong> ${inquilino.importe_total}</p>
          </div>
        </div>
  
       <!-- Firmas -->
        <div class="row text-center mt-4" style="margin-top: 60px;">
          <div class="col-6">
            <div class="firma-digital" style="height: 80px;">
              <!-- Aquí va la firma digital como imagen -->
              <img src="${window.location.origin}/assets/img/firma_digital.png" alt="Firma Digital" style="max-height: 80px;" />
            </div>
           
            <p class="mt-1">Firma Inmobiliaria</p>
          </div>
          <div class="col-6">
            <div class="linea" style="margin-top: 80px;"></div>
            <p class="mt-1">Firma del Inquilino</p>
          </div>
        </div>

      </div>
    </div>
    
    ${index < inquilinos.length - 1 ? '<div class="page-break"></div>' : ''}
      `;
    });

    content += `
  </body>
  </html>
    `;

    printWindow.document.write(content);
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  };
  //impresion masiva

  const handleSendWhatsApp = (inquilino) => {
    const phoneNumber = inquilino.telefono.replace(/\D/g, ''); // Elimina todo lo que no sea número

    // Crear el mensaje del recibo con formato enriquecido
    const message = `
  🏠 *Recibo de Alquiler* 🏠
https://postimg.cc/mPst7Kzn  
  *Inquilino:*
  👤 ${inquilino.nombre} ${inquilino.apellido}
  📞 ${inquilino.telefono}
  
  *Propietario:*
  👤 ${inquilino.propietario_nombre}
  📍 ${inquilino.propietario_direccion}
  🏙️ ${inquilino.propietario_localidad}
  
  *Detalles del Alquiler:*
  📅 Período: ${inquilino.periodo}
  📄 Contrato: ${inquilino.contrato}
  📈 Aumento: ${inquilino.aumento}
  📊 Estado: ${inquilino.alquileres_adeudados > 0 ? `${inquilino.alquileres_adeudados} meses adeudados` : 'Al día'}
  
  *Detalles de Liquidación:*
  💰 Alquileres: ${inquilino.alquileres_importe}
  💧 Agua: ${inquilino.agua_importe}
  📜 Tasa: ${inquilino.tasa_importe}
  💡 Luz: ${inquilino.luz_importe}
  📦 Otros: ${inquilino.otros}
  
  *Total a Pagar:*
  💵 ${inquilino.importe_total}
  
  Gracias por tu pago. 🎉
  
  *MS Inmobiliaria*
  📞 Tel: 3498 - 478730
  📍 Av. San Martín 353, Gdor Crespo
    `;

    // Crear el enlace de WhatsApp Web
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    // Abrir WhatsApp en una nueva pestaña
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) return <p>Cargando inquilinos...</p>;
  if (isError) return <p>Error al cargar inquilinos: {error.message}</p>;

  const filteredInquilinos = inquilinos?.filter((inquilino) => {
    const searchLower = searchTerm.toLowerCase();

    const matchId = inquilino.id.toString().includes(searchTerm);
    const matchNombre = inquilino.nombre.toLowerCase().includes(searchLower);
    const matchApellido = inquilino.apellido.toLowerCase().includes(searchLower);
    const matchPropietario = inquilino.propietario_nombre?.toLowerCase().includes(searchLower);
    const matchAlquileres = inquilino.alquileres_adeudados?.toString().includes(searchLower);
    const matchGastos = inquilino.gastos_adeudados?.toString().includes(searchLower);

    return (
      matchId ||
      matchNombre ||
      matchApellido ||
      matchPropietario ||
      matchAlquileres ||
      matchGastos
    );
  }).sort((a, b) => a.apellido.localeCompare(b.apellido));

  const indexOfLastInquilino = (currentPage + 1) * inquilinosPerPage;
  const indexOfFirstInquilino = currentPage * inquilinosPerPage;
  const currentInquilinos = filteredInquilinos?.slice(indexOfFirstInquilino, indexOfLastInquilino);

  const formatFieldName = (fieldName) => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="container mt-4">
      <div className="p-3 mb-4 bg-agregar text-white rounded shadow">
        <h4 className="text-center mb-0">Lista de Inquilinos</h4>
      </div>

      <div className="mb-3 search-container">
        <i className="bi bi-search search-icon"></i>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="d-flex justify-content-between mb-3">
        <div className="search-container" style={{ flex: 1 }}>
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <button
          className="btn btn-primary ms-3"
          onClick={() => handlePrintAll(filteredInquilinos)}
        >
          <i className="bi bi-printer me-2"></i>
          Imprimir Todos
        </button>
      </div>

      <table className="table custom-table">
        <thead>
          <tr>
            <th> <i className="bi bi-person-circle me-2"></i></th>
            <th>Apellido</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentInquilinos?.map((inquilino, index) => (
            <tr key={inquilino.id}>
              <td>{currentPage * inquilinosPerPage + index + 1}</td>
              <td>{inquilino.apellido}</td>
              <td>{inquilino.nombre}</td>
              <td>{inquilino.telefono}</td>
              <td>{inquilino.propietario_direccion}</td>
              <td>
                <button
                  className="btn btn-sm me-2"
                  style={{ backgroundColor: '#17a2b8', color: '#fff' }}
                  onClick={() => handleViewClick(inquilino)}
                >
                  <i className="bi bi-eye"></i>
                </button>
                <button
                  className="btn btn-sm me-2"
                  style={{ backgroundColor: '#007bff', color: '#fff' }}
                  onClick={() => handleEditClick(inquilino)}
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button
                  className="btn btn-sm me-2"
                  style={{ backgroundColor: '#dc3545', color: '#fff' }}
                  onClick={() => handleDeleteClick(inquilino.id)}
                >
                  <i className="bi bi-trash"></i>
                </button>

                <button
                  className="btn btn-sm me-2"
                  style={{ backgroundColor: '#7028a7', color: '#fff' }}
                  onClick={() => handlePrint(inquilino)}
                >
                  <i className="bi bi-printer"></i>
                </button>


                <button
                  className="btn btn-sm me-2"
                  style={{ backgroundColor: '#05933a', color: '#fff' }}
                  onClick={() => handleSendWhatsApp(inquilino)}
                >
                  <i className="bi bi-whatsapp"></i>

                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ReactPaginate
        previousLabel={'Anterior'}
        nextLabel={'Siguiente'}
        pageCount={Math.ceil(filteredInquilinos?.length / inquilinosPerPage)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageChange}
        containerClassName={'pagination'}
        activeClassName={'active'}
      />

      <Modal
        isOpen={isViewModalOpen}
        onRequestClose={() => setViewModalOpen(false)}
        contentLabel="Ver/Editar Inquilino"
        style={{
          content: {
            maxWidth: '800px',
            margin: 'auto',
            height: '85vh',
            maxHeight: '85vh',
            overflowY: 'auto',
            background: '#2c2c2c',
            color: '#ffffff',
            borderRadius: '15px',
            border: 'none',
            boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.6)',
            padding: '20px',
            animation: 'fadeIn 0.3s ease-in-out',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          },
        }}
      >
        <h3 style={{ borderBottom: '2px solid #555', paddingBottom: '10px' }}>
          {isEditing ? 'Editar Información del Inquilino' : 'Información del Inquilino'}
        </h3>

        {selectedInquilino && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {Object.keys(selectedInquilino).map((key) => {
                if (key === 'importe_total') return null; // Evitamos que se oculte en el mapeo general

                const value = key === 'inicio_contrato'
                  ? new Date(selectedInquilino[key]).toLocaleDateString('es-AR')
                  : selectedInquilino[key];
                return (
                  <div key={key}>
                    <label style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '300', display: 'block', fontSize: '15px', marginBottom: '5px' }}>
                      {formatFieldName(key)}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      {...register(key)}
                      defaultValue={value}
                      readOnly={!isEditing}
                      style={{
                        background: isEditing ? '#f5f5dc' : '#2c2c2c',
                        color: isEditing ? 'black' : 'white',
                        border: '1px solid #555',
                        borderRadius: '5px',
                        fontSize: '15px',
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: '300',
                        padding: '8px',
                      }}
                    />
                  </div>
                );
              })}

            </div>

            <div className="d-flex justify-content-between mt-4">
              {isEditing ? (
                <>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: '#28a745',
                      borderColor: '#28a745',
                      color: '#fff',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      padding: '8px 16px',
                    }}
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                    style={{
                      backgroundColor: '#6c757d',
                      borderColor: '#6c757d',
                      color: '#fff',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      padding: '8px 16px',
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
                    backgroundColor: '#007bff',
                    borderColor: '#007bff',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    width: '100px',
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
                  backgroundColor: '#dc3545',
                  borderColor: '#dc3545',
                  color: '#fff',
                  fontWeight: 'bold',
                }}
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