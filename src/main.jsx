import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.jsx'

// Crear instancia de QueryClient con configuración optimizada
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración global para todas las queries
      refetchOnWindowFocus: false, // No refetch al cambiar de pestaña
      refetchOnReconnect: true, // Refetch al reconectar internet
      retry: 1, // Reintentar 1 vez en caso de error
      staleTime: 1000 * 60 * 5, // Los datos son "frescos" por 5 minutos
      gcTime: 1000 * 60 * 10, // Mantener en caché por 10 minutos (antes era cacheTime)
    },
    mutations: {
      // Configuración global para todas las mutaciones
      retry: 0, // No reintentar mutaciones (dismiss, save, etc.)
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      
      {/* DevTools solo en desarrollo - muestra el estado de las queries */}
      {/* {import.meta.env.DEV && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )} */}
    </QueryClientProvider>
  </StrictMode>,
)