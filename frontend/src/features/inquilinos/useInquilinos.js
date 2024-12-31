// frontend/src/features/inquilinos/useInquilinos.js
import { useQuery } from '@tanstack/react-query';

export const useInquilinos = () => {
  return useQuery({
    queryKey: ['inquilinos'], // Clave única para la consulta
    queryFn: async () => {
      const response = await fetch('/api/inquilinos'); // Ajusta tu endpoint
      if (!response.ok) {
        throw new Error('Error al cargar los inquilinos');
      }
      return response.json();
    },
  });
};
