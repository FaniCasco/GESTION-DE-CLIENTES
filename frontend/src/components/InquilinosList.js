import React, { useState, useEffect } from 'react';
import api from '../api/api';
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
import InputMask from 'react-input-mask';
import { getCurrentPeriodo } from '../utils/periodoUtils';



Modal.setAppElement('#root');

const InquilinosList = () => {
  const numericFields = new Set([
    'alquileres_importe', 'agua_importe', 'luz_importe',
    'tasa_importe', 'importe_total', 'otros'
  ]);
  //const [watchValues, setWatchValues] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm();
  const { data: allInquilinos, isLoading, isError, error, refetch } = useInquilinos();
  const [filteredInquilinos, setFilteredInquilinos] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const [currentPage, setCurrentPage] = useState(0);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedInquilino, setSelectedInquilino] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inquilinosPerPage = 6;

  const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
      // Si ya está en formato DD/MM/AAAA
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
      }

      // Parsear desde ISO
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  };

  const formatFieldName = (fieldName) => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  const getContractStatus = (timeRemaining) => {
    if (!timeRemaining) {
      return {
        status: 'unknown',
        color: '#6c757d',
        text: 'SIN FECHA',
        icon: 'bi bi-question-circle',
        fontWeight: 'normal'
      };
    }

    if (timeRemaining.expired) {
      return {
        status: 'expired',
        color: '#dc3545',
        text: 'VENCIDO',
        icon: 'bi bi-exclamation-triangle',
        fontWeight: 'bold'
      };
    }

    if (timeRemaining.totalDays <= 30) {
      return {
        status: 'danger',
        color: '#dc3545',
        text: timeRemaining.days === 1 ? 'VENCE MAÑANA' : `VENCE EN ${timeRemaining.days} DÍAS`,
        icon: 'bi bi-exclamation-triangle',
        fontWeight: 'bold'
      };
    }

    if (timeRemaining.totalDays <= 365) {
      const months = timeRemaining.months + (timeRemaining.years * 12);
      return {
        status: months <= 2 ? 'warning' : 'success',
        color: months <= 2 ? '#fd7e14' : '#28a745',
        text: months === 1 ? '1 MES' : `${months} MESES`,
        icon: months <= 2 ? 'bi bi-exclamation-circle' : 'bi bi-check-circle',
        fontWeight: 'bold' // Texto siempre en negrita para este caso
      };
    }

    return {
      status: 'success',
      color: '#28a745',
      text: timeRemaining.years === 1 ?
        `1 AÑO ${timeRemaining.months} MESES` :
        `${timeRemaining.years} AÑOS ${timeRemaining.months} MESES`,
      icon: 'bi bi-check-circle',
      fontWeight: 'bold'
    };
  };


  // Función mejorada para calcular fecha de vencimiento
  /**
   * Calcula el tiempo restante hasta la fecha de vencimiento de un contrato
   * @param {string|Date} endDate - Fecha de vencimiento en formato DD/MM/YYYY o objeto Date
   * @returns {object|null} Objeto con el tiempo restante o null si la fecha es inválida
   */
  const calculateTimeRemaining = (endDate) => {
    const end = parseDate(endDate);
    if (!end) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Normalizar fecha de fin
    const endNormalized = new Date(end);
    endNormalized.setHours(0, 0, 0, 0);

    const diffMs = endNormalized - today;
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (totalDays < 0) {
      return { expired: true, totalDays: 0, years: 0, months: 0, days: 0 };
    }

    // Calcular años, meses y días restantes
    let years = end.getFullYear() - today.getFullYear();
    let months = end.getMonth() - today.getMonth();
    let days = end.getDate() - today.getDate();

    // Ajustar días negativos
    if (days < 0) {
      months--;
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      ).getDate();
      days += lastDayOfMonth;
    }

    // Ajustar meses negativos
    if (months < 0) {
      years--;
      months += 12;
    }

    return {
      expired: false,
      totalDays,
      years,
      months,
      days
    };
  };

  /**
   * Función auxiliar para parsear fechas en formato DD/MM/YYYY
   * @param {string|Date} dateString - Fecha a parsear
   * @returns {Date|null} Objeto Date o null si es inválido
   */
  const parseDate = (dateString) => {
    if (!dateString) return null;

    // Si ya es un objeto Date válido
    if (dateString instanceof Date && !isNaN(dateString)) {
      return dateString;
    }

    // Manejar formato DD/MM/YYYY
    if (typeof dateString === 'string' && dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateString.split('/').map(Number);

      // Validación básica de fecha
      if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1000) {
        return null;
      }

      const date = new Date(year, month - 1, day);

      // Verificar si la fecha creada coincide con los valores ingresados
      if (
        date.getDate() !== day ||
        date.getMonth() + 1 !== month ||
        date.getFullYear() !== year
      ) {
        return null;
      }

      return date;
    }

    // Intentar parsear como fecha ISO u otros formatos
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };


  // Agrega este useEffect al inicio de tus efectos
  useEffect(() => {
    if (allInquilinos) {
      setFilteredInquilinos(allInquilinos);
    }
  }, [allInquilinos]);

  useEffect(() => {
    if (selectedInquilino) {
      const formattedInquilino = {
        ...selectedInquilino,
        alquileres_importe: selectedInquilino.alquileres_importe || 0,
        agua_importe: selectedInquilino.agua_importe || 0,
        luz_importe: selectedInquilino.luz_importe || 0,
        tasa_importe: selectedInquilino.tasa_importe || 0,
        otros: selectedInquilino.otros || 0,
        importe_total: selectedInquilino.importe_total || 0
      };

      numericFields.forEach(field => {
        if (formattedInquilino[field] !== undefined) {
          formattedInquilino[field] = new Intl.NumberFormat('es-AR').format(
            parseNumberWithoutDots(formattedInquilino[field])
          );
        }
      });

      reset(formattedInquilino);
      calculateTotal(formattedInquilino);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInquilino, reset]);

  const calculateTotal = (data) => {
    const total = [
      'alquileres_importe',
      'agua_importe',
      'luz_importe',
      'tasa_importe',
      'otros'
    ].reduce((sum, field) => {
      const value = data[field] || '0';
      return sum + parseNumberWithoutDots(value);
    }, 0);

    setValue('importe_total', new Intl.NumberFormat('es-AR').format(total), {
      shouldValidate: true,
      shouldDirty: true
    });
  };

  // Función mejorada para parsear números
  const parseNumberWithoutDots = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;

    // Convertir formato argentino (1.234,56 => 1234.56)
    const cleanedValue = value.toString()
      .replace(/\./g, '')  // Eliminar puntos (separadores de miles)
      .replace(',', '.');  // Convertir coma decimal a punto

    const num = Number(cleanedValue);
    return isNaN(num) ? 0 : num;
  };



  // Agrega este useEffect para recalcular cuando cambien los valores
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && numericFields.has(name) && name !== 'importe_total') {
        calculateTotal(value);
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);


  const handleSearchChange = (e) => {
    setSearchParams({ search: e.target.value });
  };

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  const handleViewClick = (inquilino) => {
    const formattedInquilino = { ...inquilino };

    // Formatear campos numéricos
    numericFields.forEach(field => {
      if (formattedInquilino[field] !== undefined) {
        formattedInquilino[field] = new Intl.NumberFormat('es-AR').format(formattedInquilino[field]);
      }
    });

    // Formatear fechas
    formattedInquilino.inicio_contrato = formatDate(inquilino.inicio_contrato);
    formattedInquilino.vencimiento_contrato = formatDate(inquilino.vencimiento_contrato);

    setSelectedInquilino(formattedInquilino);
    reset(formattedInquilino);
    setIsEditing(false);
    setViewModalOpen(true);
  };

  const handleEditClick = (inquilino) => {
    const formattedInquilino = { ...inquilino };

    // Formatear campos numéricos
    numericFields.forEach(field => {
      if (formattedInquilino[field] !== undefined) {
        formattedInquilino[field] = new Intl.NumberFormat('es-AR').format(formattedInquilino[field]);
      }
    });

    // Formatear fechas
    formattedInquilino.inicio_contrato = formatDate(inquilino.inicio_contrato);
    formattedInquilino.vencimiento_contrato = formatDate(inquilino.vencimiento_contrato);

    setSelectedInquilino(formattedInquilino);
    reset(formattedInquilino);
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
        const response = await api.delete(`/inquilinos/${id}`);
        if (response.status !== 200 && response.status !== 204) {
          throw new Error('Error al eliminar el inquilino');
        }
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

  // eslint-disable-next-line no-unused-vars
  const handleUpdatePeriodo = async () => {
    const nuevoPeriodo = getCurrentPeriodo();

    if (window.confirm(`¿Actualizar período a ${nuevoPeriodo} para TODOS los inquilinos?`)) {
      try {
        await api.post('/inquilinos/update-periodo', {
          periodo: nuevoPeriodo
        });
        refetch();
        Swal.fire('Éxito', `Período actualizado a ${nuevoPeriodo}`, 'success');
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || error.message, 'error');
      }
    }
  };
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const payload = {
        ...data,

        inicio_contrato: data.inicio_contrato
          ? parseDate(data.inicio_contrato)?.toISOString()
          : null
      };
      console.log('Payload a enviar:', payload);
      // Enviar datos al backend
      const response = await api.put(`/inquilinos/${selectedInquilino.id}`, payload);
      if (response.status === 200) {
        await Swal.fire({
          title: 'Éxito',
          text: 'Datos actualizados correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        refetch();
        setIsEditing(false);
        setViewModalOpen(false);
        reset();
      } else {
        throw new Error(response.data?.message || 'Error en la actualización');
      }

    } catch (error) {
      console.error('Error al guardar:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || error.message || 'Error al guardar los cambios',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
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

  const handleSaveReceipt = async (inquilino) => {
    // eslint-disable-next-line no-unused-vars
    const datosCompletos = {
      ...inquilino,
      alquileres_importe: inquilino.alquileres_importe || 0,
      agua_importe: inquilino.agua_importe || 0,
      luz_importe: inquilino.luz_importe || 0,
      tasa_importe: inquilino.tasa_importe || 0,
      otros: inquilino.otros || 0,
      importe_total: inquilino.importe_total || 0
    };

    try {
      // 1. Crear elemento temporal con dimensiones exactas
      const receiptElement = document.createElement('div');
      receiptElement.style.width = '210mm';
      receiptElement.style.minHeight = '148mm';
      receiptElement.style.position = 'absolute';
      receiptElement.style.left = '-9999px';
      receiptElement.style.background = 'white';
      receiptElement.style.boxSizing = 'border-box';
      receiptElement.style.padding = '10mm';

      // 2. HTML del recibo con estructura compacta
      receiptElement.innerHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: Arial;
          }
          .receipt-content {
            width: 190mm;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 5mm;
          }
          .logo {
            width: 80px;
            height: auto;
          }
          .header {
            grid-column: 1 / 4;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5mm;
          }
          .section {
            margin-bottom: 3mm;
          }
          .section-title {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 2mm;
            border-bottom: 1px solid #000;
          }
          .section-content {
            font-size: 11px;
          }
          .total {
            font-weight: bold;
            margin-top: 2mm;
          }
          .signatures {
            grid-column: 1 / 4;
            display: flex;
            justify-content: space-between;
            margin-top: 10mm;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h4>MS INMOBILIARIA</h4>
            <p>Av. San Martín 353,<br>Gdor Crespo<br>Tel: 3498 - 478730</p>
            <p>Emitido el:<br>${new Date().toLocaleDateString()}</p>
          </div>
          <img src="${window.location.origin}/assets/img/logo.png" class="logo">
          <h3>Recibo de Alquiler</h3>
        </div>
  
        <div class="receipt-content">
          <!-- Columna 1 -->
          <div class="section">
            <div class="section-title">Propietario</div>
            <div class="section-content">
              ${inquilino.propietario_nombre}<br>
              ${inquilino.propietario_direccion}<br>
              ${inquilino.propietario_localidad}
            </div>
          </div>
  
          <!-- Columna 2 -->
          <div class="section">
            <div class="section-title">Inquilino</div>
            <div class="section-content">
              ${inquilino.nombre} ${inquilino.apellido}<br>
              Teléfono:<br>
              ${inquilino.telefono}
            </div>
          </div>
  
          <!-- Columna 3 -->
          <div class="section">
            <div class="section-title">Otros Conceptos</div>
            <div class="section-content">       
            </div>
          </div>
  
          <!-- Detalles del Alquiler -->
          <div class="section">
            <div class="section-title">Detalles del Alquiler</div>
            <div class="section-content">
              Período:<br>${inquilino.periodo}<br><br>
              Contrato:<br>${inquilino.contrato}<br><br>
            
              Aumento:<br>${inquilino.aumento}<br><br>
              Estado: ${inquilino.alquileres_adeudados > 0 ? `${inquilino.alquileres_adeudados} meses adeudados` : 'Al día'}
            </div>
          </div>
  
          <!-- Detalles de Liquidación -->
          <div class="section">
            <div class="section-title">Detalles de Liquidación</div>
            <div class="section-content">
              Alquileres:<br>${new Intl.NumberFormat('es-AR').format(inquilino.alquileres_importe)}<br><br>
              Otros:<br>${new Intl.NumberFormat('es-AR').format(inquilino.otros || 0)}

            </div>
          </div>
  
          <!-- Impuestos -->
          <div class="section">
            <div class="section-title">Impuestos</div>
            <div class="section-content">
              Agua:<br>${new Intl.NumberFormat('es-AR').format(inquilino.agua_importe)}<br><br>
              Luz:<br>${new Intl.NumberFormat('es-AR').format(inquilino.luz_importe)}<br><br>
              Tasa:<br>${new Intl.NumberFormat('es-AR').format(inquilino.tasa_importe)}<br><br>
              <div class="total">Total:<br>${new Intl.NumberFormat('es-AR').format(inquilino.importe_total)}</div>
            </div>
          </div>
  
          <!-- Firmas -->
          <div class="signatures">
            <div>
              <div style="height: 30mm; border-bottom: 1px solid #000;"></div>
              <p>Firma Inmobiliaria</p>
            </div>
            <div>
              <div style="height: 30mm; border-bottom: 1px solid #000;"></div>
              <p>Firma del Inquilino</p>
            </div>
          </div>
        </div>
      </body>
      </html>
      `;

      document.body.appendChild(receiptElement);

      // 3. Configuración optimizada para html2canvas
      const { jsPDF } = await import('jspdf');
      const html2canvas = await import('html2canvas');

      const canvas = await html2canvas.default(receiptElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        windowWidth: receiptElement.scrollWidth,
        windowHeight: receiptElement.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // 4. Generar PDF con proporciones correctas
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      // Calcular dimensiones manteniendo aspecto
      const imgRatio = canvas.width / canvas.height;
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const targetHeight = pdfWidth / imgRatio;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, targetHeight);

      pdf.save(`Recibo_${inquilino.apellido}.pdf`);

      document.body.removeChild(receiptElement);
      Swal.fire('Éxito', 'Recibo generado correctamente', 'success');
    } catch (error) {
      console.error('Error al generar recibo:', error);
      Swal.fire('Error', 'No se pudo generar el recibo', 'error');
    }
  };
  const handlePrint = async (inquilino) => {
    try {
      await preloadImage(logo);

      const printWindow = window.open('', '_blank', 'height=900,width=1200');
      if (!printWindow) {
        throw new Error('El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio.');
      }

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
              <li class="list-group-item"><strong>Alquileres:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.alquileres_importe)}</li>
              <li class="list-group-item"><strong>Otros:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.otros)}</li>
          </ul>
        </div>

        <div class="col-4">
          <h5 class="fw-bold">Impuestos</h5>
          <ul class="list-group">
            <li class="list-group-item"><strong>Agua:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.agua_importe)}</li>
            <li class="list-group-item"><strong>Luz:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.luz_importe)}</li>
            <li class="list-group-item"><strong>Tasa:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.tasa_importe)}</li>
            <li class="list-group-item"><strong>Total:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.importe_total)}</li>
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
       
              <li class="list-group-item"><strong>Alquileres:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.alquileres_importe)}</li>
              <li class="list-group-item"><strong>Otros:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.otros)}</li>
          </ul>
        </div>

        <div class="col-4">
          <h5 class="fw-bold">Impuestos</h5>
          <ul class="list-group">
             <ul class="list-group">
            <li class="list-group-item"><strong>Agua:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.agua_importe)}</li>
            <li class="list-group-item"><strong>Luz:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.luz_importe)}</li>
            <li class="list-group-item"><strong>Tasa:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.tasa_importe)}</li>
            <li class="list-group-item"><strong>Total:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.importe_total)}</li>
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
      printWindow.document.close();

      printWindow.onload = function () {
        setTimeout(() => {
          printWindow.focus(); // Enfocar la ventana
          printWindow.print();
        }, 300);
      };
    } catch (error) {
      console.error('Error al imprimir:', error);
      Swal.fire('Error', `No se pudo abrir la ventana de impresión: ${error.message}`, 'error');
    }
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
            <p><strong>Inicio de contrato:</strong> ${inquilino.inicio_contrato}</p>
       
            <p><strong>Aumento:</strong> ${inquilino.aumento}</p>
            <p><strong>Estado:</strong> ${inquilino.alquileres_adeudados > 0 ? `${inquilino.alquileres_adeudados} meses adeudados` : 'Al día'}</p>
          </div>
          <div class="col-4">
            <h5 class="fw-bold">Detalles de Liquidación</h5>
            <p><strong>Alquileres:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.alquileres_importe)}</p>
            <p><strong>Agua:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.agua_importe)}</p>
            <p><strong>Tasa:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.tasa_importe)}</p>
            <p><strong>Luz:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.luz_importe)}</p>
            <p><strong>Total:</strong>${new Intl.NumberFormat('es-AR').format(inquilino.importe_total)}</p>
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
            <p><strong>Inicio de contrato:</strong> ${inquilino.inicio_contrato}</p>
             
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
            <p><strong>Total:</strong> ${new Intl.NumberFormat('es-AR').format(inquilino.importe_total)}</p>
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
    printWindow.document.close();
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
  📅 Inicio de contrato ${inquilino.inicio_contrato}
  📈 Aumento: ${inquilino.aumento}
  📊 Estado: ${inquilino.alquileres_adeudados > 0 ? `${inquilino.alquileres_adeudados} meses adeudados` : 'Al día'}
  
  *Detalles de Liquidación:*
  💰 Alquileres: ${new Intl.NumberFormat('es-AR').format(inquilino.alquileres_importe)}
  💧 Agua: ${new Intl.NumberFormat('es-AR').format(inquilino.agua_importe)}
  📜 Tasa: ${new Intl.NumberFormat('es-AR').format(inquilino.tasa_importe)}
  💡 Luz: ${new Intl.NumberFormat('es-AR').format(inquilino.luz_importe)}
 📦 Otros: ${new Intl.NumberFormat('es-AR').format(inquilino.otros || 0)}
  
  *Total a Pagar:*
  💵 ${new Intl.NumberFormat('es-AR').format(inquilino.importe_total)}
  
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

  // 1. Primero obtenemos TODOS los inquilinos (sin filtrar por búsqueda)
  const allFilteredByPeriodo = filteredInquilinos || [];

  // 2. Aplicamos el filtrado por búsqueda solo a los del período actual
  const filteredBySearch = allFilteredByPeriodo.filter((inquilino) => {
    const searchLower = searchTerm.toLowerCase();

    const matchId = inquilino.id?.toString().includes(searchTerm) || false;
    const matchNombre = (inquilino.nombre?.toLowerCase() || '').includes(searchLower);
    const matchApellido = (inquilino.apellido?.toLowerCase() || '').includes(searchLower);
    const matchPropietario = (inquilino.propietario_nombre?.toLowerCase() || '').includes(searchLower);
    const matchAlquileres = (inquilino.alquileres_adeudados?.toString().toLowerCase() || '').includes(searchLower);
    const matchGastos = (inquilino.gastos_adeudados?.toString().toLowerCase() || '').includes(searchLower);

    return (
      matchId ||
      matchNombre ||
      matchApellido ||
      matchPropietario ||
      matchAlquileres ||
      matchGastos
    );
  })?.sort((a, b) => {
    const apellidoA = a.apellido?.toLowerCase() || '';
    const apellidoB = b.apellido?.toLowerCase() || '';
    return apellidoA.localeCompare(apellidoB);
  }) || [];

  const paginatedInquilinos = filteredBySearch.slice(
    currentPage * inquilinosPerPage,
    (currentPage + 1) * inquilinosPerPage
  );

  // eslint-disable-next-line no-unused-vars
  const generatePeriodoOptions = () => {
    const options = [];
    const today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();

    for (let i = 0; i < 12; i++) {
      const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

      options.unshift(`${monthNames[month]} ${year}`);

      month -= 1;
      if (month < 0) {
        month = 11;
        year -= 1;
      }
    }

    return options;
  };

  return (
    <div className="container mt-4">
      <div className="p-3 mb-4 bg-agregar text-white rounded shadow">
        <h4 className="text-center mb-0">
          Lista de Inquilinos
        </h4>
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
          className="btn btn-imprimir-todo ms-3"
          onClick={() => handlePrintAll(filteredInquilinos)}
        >
          <i className="bi bi-printer me-2"></i>
          Imprimir Todos
        </button>
        <button
          className="btn btn-periodo ms-2"
          onClick={async () => {
            const nuevoPeriodo = getCurrentPeriodo();

            // Mostrar confirmación con SweetAlert
            const { isConfirmed } = await Swal.fire({
              title: '¿Confirmar actualización?',
              html: `¿Deseas actualizar el período a <b>${nuevoPeriodo}</b> para TODOS los inquilinos?`,
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: 'Sí, actualizar',
              cancelButtonText: 'Cancelar',
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              reverseButtons: true
            });

            if (isConfirmed) {
              try {
                // Mostrar loader mientras se procesa
                Swal.fire({
                  title: 'Actualizando...',
                  html: 'Por favor espera mientras se actualizan los períodos',
                  allowOutsideClick: false,
                  didOpen: () => {
                    Swal.showLoading();
                  }
                });

                // Hacer la petición a la API
                await api.post('/inquilinos/update-periodo', { periodo: nuevoPeriodo });

                // Refrescar los datos
                await refetch();

                // Mostrar confirmación de éxito
                Swal.fire({
                  title: '¡Éxito!',
                  html: `Período actualizado a <b>${nuevoPeriodo}</b> correctamente`,
                  icon: 'success',
                  timer: 2000,
                  timerProgressBar: true,
                  showConfirmButton: false
                });
              } catch (error) {
                // Mostrar error detallado
                Swal.fire({
                  title: 'Error',
                  html: `No se pudo actualizar el período:<br><b>${error.response?.data?.message || error.message}</b>`,
                  icon: 'error',
                  confirmButtonText: 'Entendido'
                });
                console.error('Error al actualizar período:', error);
              }
            }
          }}
        >
          <i className="bi bi-arrow-repeat me-2"></i>
          Actualizar Períodos
        </button>
      </div>

      <table className="table custom-table">

        <thead>
          <tr>
            <th>#</th>
            <th>Apellido</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Inicio Contrato</th>
            <th>Fin Contrato</th>  {/* Columna para la fecha de vencimiento */}
            <th>Tiempo Restante</th>  {/* Columna para el cálculo del tiempo */}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedInquilinos?.map((inquilino, index) => {
            const timeRemaining = calculateTimeRemaining(inquilino.vencimiento_contrato);
            const contractStatus = getContractStatus(timeRemaining);
            return (
              <tr key={inquilino.id}>
                <td>{currentPage * inquilinosPerPage + index + 1}</td>
                <td>{inquilino.apellido || '-'}</td>
                <td>{inquilino.nombre || '-'}</td>
                <td>{inquilino.telefono || '-'}</td>
                <td>{inquilino.propietario_direccion || '-'}</td>
                <td>{formatDate(inquilino.inicio_contrato) || '-'}</td>
                <td>{formatDate(inquilino.vencimiento_contrato) || '-'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <i className={`${contractStatus.icon} me-2`} style={{ color: contractStatus.color }}></i>
                    <span style={{
                      color: contractStatus.color,
                      fontWeight: contractStatus.fontWeight // Usamos la propiedad definida
                    }}>
                      {contractStatus.text}
                    </span>
                  </div>
                </td>
                <td>
                  <button className="btn btn-sm me-2" style={{ backgroundColor: '#17a2b8', color: '#fff' }} onClick={() => handleViewClick(inquilino)}>
                    <i className="bi bi-eye"></i>
                  </button>
                  <button className="btn btn-sm me-2" style={{ backgroundColor: '#007bff', color: '#fff' }} onClick={() => handleEditClick(inquilino)}><i className="bi bi-pencil"></i></button><button className="btn btn-sm me-2" style={{ backgroundColor: '#dc3545', color: '#fff' }} onClick={() => handleDeleteClick(inquilino.id)}><i className="bi bi-trash"></i></button><button className="btn btn-sm me-2" style={{ backgroundColor: '#7028a7', color: '#fff' }} onClick={() => handlePrint(inquilino)}><i className="bi bi-printer"></i></button><button className="btn btn-sm me-2" style={{ backgroundColor: '#05933a', color: '#fff' }} onClick={() => handleSendWhatsApp(inquilino)}><i className="bi bi-whatsapp"></i></button><button className="btn btn-sm me-2" style={{ backgroundColor: '#e7bd02', color: 'black' }} onClick={() => handleSaveReceipt(inquilino)} title="Guardar recibo"><i className="bi bi-save"></i></button></td></tr>);
          })}
        </tbody>
      </table>

      <ReactPaginate
        previousLabel={'Anterior'}
        nextLabel={'Siguiente'}
        pageCount={Math.ceil(filteredBySearch.length / inquilinosPerPage)}
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
            background: '#333',
            color: '#f0f0f0',
            borderRadius: '12px',
            border: 'none',
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.5)',
            padding: '25px',
            animation: 'fadeIn 0.3s ease-in-out',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(3px)',
          },
        }}
      >
        <h3 style={{
          borderBottom: '2px solid #444',
          paddingBottom: '12px',
          marginBottom: '25px',
          fontSize: '1.4rem',
          fontWeight: '500',
          fontFamily: "'Poppins', sans-serif",
          color: '#e0e0e0'
        }}>
          {isEditing ? 'Editar Información del Inquilino' : 'Información del Inquilino'}
        </h3>

        {selectedInquilino && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '25px'
            }}>
              {Object.keys(selectedInquilino).map((key) => {
                // Manejo de campos de fecha (inicio_contrato y vencimiento_contrato)
                if (key === 'inicio_contrato' || key === 'vencimiento_contrato') {
                  return (
                    <div key={key}>
                      <label style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: '300',
                        display: 'block',
                        fontSize: '0.9rem',
                        marginBottom: '8px',
                        color: '#d0d0d0'
                      }}>
                        {formatFieldName(key)}
                      </label>
                      {isEditing ? (
                        <InputMask
                          mask="99/99/9999"
                          maskChar={null}
                          {...register(key)}
                          defaultValue={formatDate(selectedInquilino[key])}
                          placeholder="DD/MM/AAAA"
                          style={{
                            background: isEditing ? '#f8f9fa' : '#404040',
                            color: isEditing ? '#333' : '#f0f0f0',
                            border: '1px solid #555',
                            borderRadius: '6px',
                            fontSize: '0.95rem',
                            padding: '10px 12px',
                            width: '100%',
                            outline: 'none'
                          }}
                        />
                      ) : (
                        <input
                          type="text"
                          value={formatDate(selectedInquilino[key])}
                          readOnly
                          style={{
                            background: '#404040',
                            color: '#f0f0f0',
                            border: '1px solid #555',
                            borderRadius: '6px',
                            fontSize: '0.95rem',
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: '300',
                            padding: '10px 12px',
                            width: '100%',
                            outline: 'none'
                          }}
                        />
                      )}
                    </div>
                  );
                }

                // Eliminar el bloque de duracion_contrato ya que lo reemplazamos por vencimiento_contrato
                if (key === 'duracion_contrato') {
                  return null; // O simplemente no incluir este if
                }

                if (key === 'alquileres_adeudados' || key === 'gastos_adeudados') {
                  const displayValue = selectedInquilino[key] === 'si debe' ? 'Sí' : 'No';
                  return (
                    <div key={key}>
                      <label style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: '300',
                        display: 'block',
                        fontSize: '0.9rem',
                        marginBottom: '8px',
                        color: '#d0d0d0'
                      }}>
                        {formatFieldName(key)}
                      </label>
                      <select
                        {...register(key)}
                        defaultValue={displayValue}
                        disabled={!isEditing}
                        style={{
                          backgroundColor: isEditing ? '#f8f9fa' : '#404040',
                          color: isEditing ? '#333' : '#f0f0f0',
                          border: '1px solid #555',
                          borderRadius: '6px',
                          fontSize: '0.95rem',
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: '300',
                          padding: '10px 12px',
                          width: '100%',
                          outline: 'none',
                          appearance: 'none',
                          backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmZmZmZmIj48cGF0aCBkPSJNNyAxMGw1IDUgNS01eiIvPjwvc3ZnPg==")',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                          backgroundSize: '14px'
                        }}
                      >
                        <option value="Sí">Sí</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  );
                }

                const value = key === 'inicio_contrato' || key === 'vencimiento_contrato'
                  ? formatDate(selectedInquilino[key])
                  : !isEditing && numericFields.has(key)
                    ? new Intl.NumberFormat('es-AR').format(selectedInquilino[key])
                    : selectedInquilino[key];

                return (
                  <div key={key}>
                    <label style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: '300',
                      display: 'block',
                      fontSize: '0.9rem',
                      marginBottom: '8px',
                      color: '#d0d0d0'
                    }}>
                      {formatFieldName(key)}
                    </label>
                    <input
                      type="text"
                      {...register(key)}
                      defaultValue={value}
                      readOnly={!isEditing}
                      style={{
                        background: isEditing ? '#f8f9fa' : '#404040',
                        color: isEditing ? '#333' : '#f0f0f0',
                        border: '1px solid #555',
                        borderRadius: '6px',
                        fontSize: '0.95rem',
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: '300',
                        padding: '10px 12px',
                        width: '100%',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '15px',
              marginTop: '25px',
              borderTop: '1px solid #444',
              paddingTop: '20px'
            }}>
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{
                      background: 'linear-gradient(135deg, #666, #444)',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 22px',
                      borderRadius: '6px',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textTransform: 'uppercase'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      background: 'linear-gradient(135deg, #34c759, #248a3d)',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 22px',
                      borderRadius: '6px',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textTransform: 'uppercase'
                    }}
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    style={{
                      background: 'linear-gradient(135deg, #4a90e2, #2f6eb5)',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 22px',
                      borderRadius: '6px',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textTransform: 'uppercase'
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewModalOpen(false)}
                    style={{
                      background: 'linear-gradient(135deg, #ff3b30, #cc2a22)',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 22px',
                      borderRadius: '6px',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textTransform: 'uppercase'
                    }}
                  >
                    Cerrar
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </Modal>

    </div >
  );
};

export default InquilinosList;