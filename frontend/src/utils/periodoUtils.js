export const getCurrentPeriodo = () => {
  const now = new Date();
  let month = now.getMonth();
  let year = now.getFullYear().toString().slice(-2); // Solo últimos 2 dígitos

  // Si es después del día 20, mostrar el próximo mes
  if (now.getDate() >= 20) {
    month = month + 1;
    if (month > 11) {
      month = 0;
      year = (now.getFullYear() + 1).toString().slice(-2);
    }
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return `${monthNames[month]}/${year}`;
};