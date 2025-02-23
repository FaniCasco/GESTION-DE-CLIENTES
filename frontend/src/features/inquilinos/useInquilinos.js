// frontend/src/features/inquilinos/useInquilinos.js
import { useQuery } from '@tanstack/react-query';

export const useInquilinos = () => {
  return useQuery({
    queryKey: ['inquilinos'], // Clave única para la consulta
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/inquilinos');

      if (!response.ok) {
        throw new Error('Error al cargar los inquilinos');
      }
      return response.json();
    },
    refetchInterval: 5000, // Intervalo de 5 segundos para hacer un refetch automáticamente
    refetchIntervalInBackground: true, // Hace que el refetch siga funcionando incluso cuando la app no está en primer plano
    staleTime: 30000, // 30 segundos antes de que los datos sean considerados "obsoletos"
    cacheTime: 60000, // 1 minuto para que los datos permanezcan en caché
  });
};





/*import { useQuery } from '@tanstack/react-query';

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
};*/

