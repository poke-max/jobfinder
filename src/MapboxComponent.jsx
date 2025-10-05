import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaHeart, FaHome, FaBriefcase, FaLayerGroup, FaTimes, FaLocationArrow, FaChevronDown, FaDollarSign, FaClock } from 'react-icons/fa';
import { useAnimatedClose } from './hooks/useAnimatedClose';

export default function MapboxComponent({ onClose }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showMapStyles, setShowMapStyles] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [currentMapStyle, setCurrentMapStyle] = useState('streets');
  const [currentView, setCurrentView] = useState('jobs');
  const { handleClose, getAnimationClass } = useAnimatedClose(onClose);

  // Estilos de mapa disponibles
  const mapStyles = [
    { id: 'streets', name: 'Calles', style: 'mapbox://styles/mapbox/streets-v12' },
    { id: 'light', name: 'Claro', style: 'mapbox://styles/mapbox/light-v11' },
    { id: 'dark', name: 'Oscuro', style: 'mapbox://styles/mapbox/dark-v11' },
    { id: 'satellite', name: 'Satélite', style: 'mapbox://styles/mapbox/satellite-streets-v12' },
    { id: 'outdoors', name: 'Exterior', style: 'mapbox://styles/mapbox/outdoors-v12' }
  ];

  // Opciones de vista
  const viewOptions = [
    { id: 'jobs', name: 'Empleos', icon: FaBriefcase },
    { id: 'favorites', name: 'Favoritos', icon: FaHeart },
    { id: 'rentals', name: 'Alquileres', icon: FaHome }
  ];

  // Datos de ejemplo
  const mockData = {
    jobs: [
      { id: 1, title: 'Desarrollador Frontend', company: 'Tech Corp', salary: '$2500', location: 'Asunción Centro', lat: -25.2637, lng: -57.5759, type: 'Tiempo completo' },
      { id: 2, title: 'Diseñador UX/UI', company: 'Design Studio', salary: '$2000', location: 'Villa Morra', lat: -25.2887, lng: -57.5759, type: 'Medio tiempo' },
      { id: 3, title: 'Backend Developer', company: 'StartUp Inc', salary: '$3000', location: 'San Lorenzo', lat: -25.3400, lng: -57.5100, type: 'Remoto' }
    ],
    favorites: [
      { id: 4, title: 'Marketing Manager', company: 'Agency 360', salary: '$2800', location: 'Lambaré', lat: -25.3428, lng: -57.6283, type: 'Tiempo completo' }
    ],
    rentals: [
      { id: 5, title: 'Departamento 2 dormitorios', price: '$400/mes', location: 'Asunción Centro', lat: -25.2700, lng: -57.5700, type: 'Alquiler', bedrooms: 2 },
      { id: 6, title: 'Casa 3 dormitorios', price: '$600/mes', location: 'Fernando de la Mora', lat: -25.3350, lng: -57.5400, type: 'Alquiler', bedrooms: 3 }
    ]
  };

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const mapboxgl = window.mapboxgl;
    if (!mapboxgl) {
      console.error('Mapbox GL JS no está cargado');
      return;
    }

    mapboxgl.accessToken = 'pk.eyJ1IjoibWF4OTkiLCJhIjoiY21nNXVkdXc4MDV1YzJycHk2ZXkzMDJwaiJ9.bL8FqOik8Hze2dz8DU9OGg';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyles.find(s => s.id === currentMapStyle).style,
      center: [-57.5759, -25.2637],
      zoom: 12
    });

    mapRef.current = map;

    // Agregar controles de navegación
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Agregar marcadores
    const currentData = getCurrentData();
    currentData.forEach(item => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = currentView === 'rentals' ? '🏠' : '💼';
      
      el.addEventListener('mouseenter', () => {
        el.classList.add('marker-hover');
      });
      
      el.addEventListener('mouseleave', () => {
        el.classList.remove('marker-hover');
      });

      el.addEventListener('click', () => {
        setSelectedItem(item);
        map.flyTo({
          center: [item.lng, item.lat],
          zoom: 14,
          duration: 1000
        });
      });

      new mapboxgl.Marker(el)
        .setLngLat([item.lng, item.lat])
        .addTo(map);
    });

    return () => {
      map.remove();
    };
  }, [currentMapStyle, currentView]);

  // Obtener ubicación del usuario
  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [longitude, latitude],
              zoom: 15,
              duration: 1500
            });

            // Agregar marcador de usuario
            const el = document.createElement('div');
            el.className = 'user-location-marker';

            new window.mapboxgl.Marker(el)
              .setLngLat([longitude, latitude])
              .addTo(mapRef.current);
          }
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          alert('No se pudo obtener tu ubicación');
        }
      );
    }
  };

  // Cambiar estilo del mapa
  const changeMapStyle = (styleId) => {
    setCurrentMapStyle(styleId);
    setShowMapStyles(false);
  };

  // Cambiar vista
  const changeView = (viewId) => {
    setCurrentView(viewId);
    setSelectedItem(null);
    setShowViewOptions(false);
  };

  // Obtener datos actuales según la vista
  const getCurrentData = () => {
    if (currentView === 'favorites') return mockData.favorites;
    if (currentView === 'rentals') return mockData.rentals;
    return mockData.jobs;
  };

  return (
    <div className={`relative w-full z-40 h-screen animate-slideUp ${getAnimationClass()}`}>
      <style jsx>{`
        :root {
          --color-primary: #fa709a;
          --color-primary-light: #fc8baa;
          --color-primary-dark: #f8578a;
          --color-secondary: #fee140;
          --color-secondary-light: #fef280;
          --color-secondary-dark: #fdd520;
          --color-bg: #ffffff;
        }

        .bg-primary {
          background-color: var(--color-primary);
        }

        .bg-primary-light {
          background-color: var(--color-primary-light);
        }

        .bg-secondary {
          background-color: var(--color-secondary);
        }

        .text-primary {
          color: var(--color-primary);
        }

        .text-secondary-dark {
          color: var(--color-secondary-dark);
        }

        .hover\\:bg-primary:hover {
          background-color: var(--color-primary);
        }

        .hover\\:bg-primary-light:hover {
          background-color: var(--color-primary-light);
        }

        .border-primary {
          border-color: var(--color-primary);
        }

        .ring-primary {
          --tw-ring-color: var(--color-primary);
        }

        .custom-marker {
          width: 40px;
          height: 40px;
          background-color: var(--color-primary);
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          transition: transform 0.2s;
        }

        .custom-marker.marker-hover {
          transform: scale(1.2);
        }

        .user-location-marker {
          width: 20px;
          height: 20px;
          background-color: var(--color-secondary);
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 0 8px rgba(254, 225, 64, 0.3);
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>

      {/* Mapa */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Botón Mi Ubicación */}
      <button
        onClick={getUserLocation}
        className="absolute bottom-32 right-4 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition z-10"
        title="Mi ubicación"
      >
        <FaLocationArrow className="text-primary text-xl" />
      </button>

      {/* Selector de Vista */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => setShowViewOptions(!showViewOptions)}
          className="bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-2 hover:shadow-xl transition"
        >
          {React.createElement(viewOptions.find(v => v.id === currentView).icon, { className: 'text-primary' })}
          <span className="font-medium text-gray-800">{viewOptions.find(v => v.id === currentView).name}</span>
          <FaChevronDown className={`text-gray-600 text-sm transition-transform ${showViewOptions ? 'rotate-180' : ''}`} />
        </button>

        {showViewOptions && (
          <div className="absolute top-full mt-2 bg-white rounded-xl shadow-xl overflow-hidden w-48 animate-slide-up">
            {viewOptions.map(option => (
              <button
                key={option.id}
                onClick={() => changeView(option.id)}
                className={`w-full px-4 py-3 flex items-center gap-3 transition ${
                  currentView === option.id
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {React.createElement(option.icon, { className: 'text-lg' })}
                <span className="font-medium">{option.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selector de Estilo de Mapa */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowMapStyles(!showMapStyles)}
          className="bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-2 hover:shadow-xl transition"
        >
          <FaLayerGroup className="text-primary" />
          <span className="font-medium text-gray-800">{mapStyles.find(s => s.id === currentMapStyle).name}</span>
          <FaChevronDown className={`text-gray-600 text-sm transition-transform ${showMapStyles ? 'rotate-180' : ''}`} />
        </button>

        {showMapStyles && (
          <div className="absolute top-full mt-2 bg-white rounded-xl shadow-xl overflow-hidden w-48 animate-slide-up">
            {mapStyles.map(style => (
              <button
                key={style.id}
                onClick={() => changeMapStyle(style.id)}
                className={`w-full px-4 py-3 text-left transition ${
                  currentMapStyle === style.id
                    ? 'bg-primary text-white font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tarjeta de Información */}
      {selectedItem && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-2xl p-5 animate-slide-up z-20 max-w-md mx-auto">
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FaTimes className="text-gray-600" />
          </button>

          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
              currentView === 'rentals' ? 'bg-secondary' : 'bg-primary'
            }`}>
              {currentView === 'rentals' ? '🏠' : '💼'}
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800 mb-1">{selectedItem.title}</h3>
              
              {currentView === 'rentals' ? (
                <>
                  <p className="text-gray-600 text-sm mb-2">{selectedItem.bedrooms} dormitorios</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-secondary-dark font-semibold">
                      <FaDollarSign />
                      {selectedItem.price}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <FaMapMarkerAlt />
                      {selectedItem.location}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-600 text-sm mb-2">{selectedItem.company}</p>
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <span className="flex items-center gap-1 text-secondary-dark font-semibold">
                      <FaDollarSign />
                      {selectedItem.salary}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <FaMapMarkerAlt />
                      {selectedItem.location}
                    </span>
                  </div>
                  <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                    {selectedItem.type}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button className="flex-1 bg-primary hover:bg-primary-light text-white font-semibold py-3 rounded-xl transition">
              Ver Detalles
            </button>
            <button className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition">
              <FaHeart />
            </button>
          </div>
        </div>
      )}

      {/* Script de Mapbox */}
      <link href="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css" rel="stylesheet" />
      <script src="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js"></script>
    </div>
  );
}