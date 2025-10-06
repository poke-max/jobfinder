import React, { useEffect, useRef, useState } from 'react';
import { FaMapPin, FaUndo, FaLocationArrow } from 'react-icons/fa';
import { useAnimatedClose } from './hooks/useAnimatedClose';
import { MdArrowBackIos } from "react-icons/md";
// Cargar el CSS de Mapbox (solo una vez)
if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
  const mapboxCSS = document.createElement('link');
  mapboxCSS.rel = 'stylesheet';
  mapboxCSS.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
  document.head.appendChild(mapboxCSS);
}

// Cargar el script de Mapbox (solo una vez)
if (!document.querySelector('script[src*="mapbox-gl.js"]')) {
  const mapboxScript = document.createElement('script');
  mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
  document.head.appendChild(mapboxScript);
}

export default function JobMapView({ job, onClose }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const [isLocating, setIsLocating] = useState(false);
  const { handleClose, getAnimationClass } = useAnimatedClose(onClose);


  // Inicializar mapa cuando se monta el componente
  useEffect(() => {
    if (mapContainerRef.current && job?.ubication?.lat && job?.ubication?.lng) {
      const initMap = () => {
        if (window.mapboxgl) {
          window.mapboxgl.accessToken = 'pk.eyJ1IjoibWF4OTkiLCJhIjoiY21nNXVkdXc4MDV1YzJycHk2ZXkzMDJwaiJ9.bL8FqOik8Hze2dz8DU9OGg';

          // Limpiar instancia anterior si existe
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
          }

          // Crear nuevo mapa
          const map = new window.mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [job.ubication.lng, job.ubication.lat],
            zoom: 15
          });

          // Añadir marcador
          new window.mapboxgl.Marker({ color: '#3b82f6' })
            .setLngLat([job.ubication.lng, job.ubication.lat])
            .addTo(map);

          mapInstanceRef.current = map;
        } else {
          // Reintentar si Mapbox aún no está cargado
          setTimeout(initMap, 100);
        }
      };

      initMap();

      // Cleanup al desmontar
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, [job]);

  // Función para centrar en la ubicación del usuario
  const centerOnUserLocation = () => {
    if (!mapInstanceRef.current) return;

    setIsLocating(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Centrar el mapa en la ubicación del usuario
          mapInstanceRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            duration: 1500
          });

          // Remover marcador anterior si existe
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          // Añadir marcador de usuario
          userMarkerRef.current = new window.mapboxgl.Marker({
            color: '#10b981' // Color verde para ubicación del usuario
          })
            .setLngLat([longitude, latitude])
            .addTo(mapInstanceRef.current);

          setIsLocating(false);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          alert('No se pudo obtener tu ubicación');
          setIsLocating(false);
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
      setIsLocating(false);
    }
  };

  return (
    <div className={`absolute inset-0 flex items-center justify-center p-2 z-40 ${getAnimationClass()}`}>
      <div className="bg-white overflow-hidden modal-card flex flex-col">
        {/* Contenedor del Mapa */}
        <div className="flex-1 relative">
          {job.ubication && job.ubication.lat && job.ubication.lng ? (
            <div className="w-full h-full relative">
              <div
                ref={mapContainerRef}
                className="w-full h-full rounded-t-3xl"
              />
              {/* Botón flotante para ubicación del usuario */}
              <button
                onClick={centerOnUserLocation}
                disabled={isLocating}
                className="absolute bottom-16 right-2 bg-white text-blue-600 p-3 rounded-full shadow-lg hover:bg-gray-50 transition disabled:opacity-50 z-10"
                title="Mi ubicación"
              >
                <FaLocationArrow className={`w-5 h-5 ${isLocating ? 'animate-pulse' : ''}`} />
              </button>

              {/* Footer con información del trabajo */}
              <div className="p-4 bg-white border-t">
                <div className="mb-3">
                  <h3 className="font-bold text-gray-900 mb-1">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.company}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaMapPin className="w-4 h-4 text-blue-600" />
                    <span>{job.location || 'Remoto'}</span>
                  </div>
                  {job.ubication && job.ubication.lat && job.ubication.lng && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${job.ubication.lat},${job.ubication.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Abrir en Google Maps
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center bg-gray-100 justify-center rounded-t-3xl">
              <div className="text-center text-gray-500">
                <FaMapPin className="w-12 h-12 mx-auto mb-2" />
                <p>Ubicación no disponible</p>
              </div>
            </div>
          )}

          {/* Botón de cerrar */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-800 w-10 h-10 rounded-full shadow-lg hover:bg-white transition flex items-center justify-center z-10"
          >
            <MdArrowBackIos className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}