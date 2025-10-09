import React, { useEffect, useRef, useState } from 'react';
import { FaMapPin, FaUndo, FaLocationArrow, FaTimes } from 'react-icons/fa';
import { useAnimatedClose } from './hooks/useAnimatedClose';
import { MdArrowBackIos } from "react-icons/md";
import { MdMyLocation } from "react-icons/md";

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
    <div className="w-full h-full flex flex-col bg-white">
      {/* Contenedor del Mapa - Ocupa todo el espacio disponible */}
      {job.ubication && job.ubication.lat && job.ubication.lng ? (
        <div className="w-full h-full relative">
          <div
            ref={mapContainerRef}
            className="w-full h-full"
          />
          {/* Botón flotante para ubicación del usuario */}
          <button
            onClick={centerOnUserLocation}
            disabled={isLocating}
            className="absolute bottom-4 right-4 bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-50 transition disabled:opacity-50 z-10"
            title="Mi ubicación"
          >
            <MdMyLocation className={`w-6 h-6 ${isLocating ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      ) : (
        <div className="w-full h-full flex items-center bg-gray-100 justify-center">
          <div className="text-center text-gray-500">
            <FaMapPin className="w-12 h-12 mx-auto mb-2" />
            <p>Ubicación no disponible</p>
          </div>
        </div>
      )}
    </div>
  );
}