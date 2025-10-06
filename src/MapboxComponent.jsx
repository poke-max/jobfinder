import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { FaMapMarkerAlt, FaStar, FaHome, FaBriefcase, FaLayerGroup, FaTimes, FaLocationArrow, FaChevronDown, FaDollarSign, FaEye } from 'react-icons/fa';

export default function MapboxComponent({ onClose }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showMapStyles, setShowMapStyles] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [currentMapStyle, setCurrentMapStyle] = useState('streets');
  const [activeViews, setActiveViews] = useState({
    jobs: true,
    rentals: true
  });

  // Estilos de mapa disponibles
  const mapStyles = [
    { id: 'streets', name: 'Calles', style: 'mapbox://styles/mapbox/streets-v12' },
    { id: 'light', name: 'Claro', style: 'mapbox://styles/mapbox/light-v11' },
    { id: 'dark', name: 'Oscuro', style: 'mapbox://styles/mapbox/dark-v11' },
  ];

  // Opciones de vista
  const viewOptions = [
    { id: 'jobs', name: 'Empleos / Favoritos', icon: FaBriefcase, color: 'text-blue-400', categories: ['jobs', 'favorites'] },
    { id: 'rentals', name: 'Alquileres', icon: FaHome, color: 'text-amber-400', categories: ['rentals'] }
  ];

  // Datos de ejemplo
  const mockData = {
    jobs: [
      { id: 1, title: 'Desarrollador Frontend', company: 'Tech Corp', salary: '$2500', location: 'Asunción Centro', lat: -25.2637, lng: -57.5759, type: 'Tiempo completo', category: 'jobs' },
      { id: 2, title: 'Diseñador UX/UI', company: 'Design Studio', salary: '$2000', location: 'Villa Morra', lat: -25.2887, lng: -57.5759, type: 'Medio tiempo', category: 'jobs' },
      { id: 3, title: 'Backend Developer', company: 'StartUp Inc', salary: '$3000', location: 'San Lorenzo', lat: -25.3400, lng: -57.5100, type: 'Remoto', category: 'jobs' }
    ],
    favorites: [
      { id: 4, title: 'Marketing Manager', company: 'Agency 360', salary: '$2800', location: 'Lambaré', lat: -25.3428, lng: -57.6283, type: 'Tiempo completo', category: 'favorites' }
    ],
    rentals: [
      { id: 5, title: 'Departamento 2 dormitorios', price: '$400/mes', location: 'Asunción Centro', lat: -25.2700, lng: -57.5700, type: 'Alquiler', bedrooms: 2, category: 'rentals' },
      { id: 6, title: 'Casa 3 dormitorios', price: '$600/mes', location: 'Fernando de la Mora', lat: -25.3350, lng: -57.5400, type: 'Alquiler', bedrooms: 3, category: 'rentals' }
    ]
  };

  // Obtener datos filtrados según las vistas activas
  const getFilteredData = () => {
    let data = [];
    if (activeViews.jobs) {
      data = [...data, ...mockData.jobs, ...mockData.favorites];
    }
    if (activeViews.rentals) {
      data = [...data, ...mockData.rentals];
    }
    return data;
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
      zoom: 11
    });

    mapRef.current = map;

    // Agregar controles de navegación
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Agregar marcadores iniciales
    const currentData = getFilteredData();
    currentData.forEach(item => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      
      // Renderizar icono de React en el elemento con fondo
      const root = ReactDOM.createRoot(el);
      if (item.category === 'rentals') {
        root.render(
          <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
            <FaHome className="text-white" size={20} />
          </div>
        );
      } else if (item.category === 'favorites') {
        root.render(
          <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center shadow-lg">
            <FaStar className="text-white" size={20} />
          </div>
        );
      } else {
        root.render(
          <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center shadow-lg">
            <FaBriefcase className="text-white" size={20} />
          </div>
        );
      }
      
      el.addEventListener('mouseenter', () => {
        el.classList.add('marker-hover');
      });
      
      el.addEventListener('mouseleave', () => {
        el.classList.remove('marker-hover');
      });

      el.addEventListener('click', () => {
        setSelectedItem(item);
        map.jumpTo({ center: [item.lng, item.lat] });
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([item.lng, item.lat])
        .addTo(map);
      
      markersRef.current.push(marker);
    });

    return () => {
      map.remove();
    };
  }, [currentMapStyle]);

  // Actualizar marcadores cuando cambian las vistas activas (sin zoom)
  useEffect(() => {
    if (!mapRef.current) return;

    const mapboxgl = window.mapboxgl;

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Agregar nuevos marcadores
    const currentData = getFilteredData();
    currentData.forEach(item => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      
      // Renderizar icono de React en el elemento con fondo
      const root = ReactDOM.createRoot(el);
      if (item.category === 'rentals') {
        root.render(
          <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
            <FaHome className="text-white" size={20} />
          </div>
        );
      } else if (item.category === 'favorites') {
        root.render(
          <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center shadow-lg">
            <FaStar className="text-white" size={20} />
          </div>
        );
      } else {
        root.render(
          <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center shadow-lg">
            <FaBriefcase className="text-white" size={20} />
          </div>
        );
      }
      
      el.addEventListener('mouseenter', () => {
        el.classList.add('marker-hover');
      });
      
      el.addEventListener('mouseleave', () => {
        el.classList.remove('marker-hover');
      });

      el.addEventListener('click', () => {
        setSelectedItem(item);
        mapRef.current.jumpTo({ center: [item.lng, item.lat] });
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([item.lng, item.lat])
        .addTo(mapRef.current);
      
      markersRef.current.push(marker);
    });
  }, [activeViews]);

  // Obtener ubicación del usuario
  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          if (mapRef.current) {
            // Remover marcador anterior si existe
            if (userMarkerRef.current) {
              userMarkerRef.current.remove();
            }

            // Saltar a ubicación del usuario sin animación
            mapRef.current.jumpTo({ center: [longitude, latitude] });

            // Crear elemento del marcador con animación de pulso
            const el = document.createElement('div');
            el.className = 'user-location-marker';
            el.innerHTML = `
              <div class="relative">
                <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
              </div>
            `;

            // Agregar marcador de usuario
            userMarkerRef.current = new window.mapboxgl.Marker(el)
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

  // Toggle vista específica
  const toggleView = (viewId) => {
    setActiveViews(prev => ({
      ...prev,
      [viewId]: !prev[viewId]
    }));
  };

  // Contar vistas activas
  const activeCount = Object.values(activeViews).filter(Boolean).length;

  return (
    <div className="absolute inset-0 bg-gray-100 z-50">

      {/* Mapa */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Botón Mi Ubicación */}
      <button
        onClick={getUserLocation}
        className="absolute bottom-20 right-4 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition z-10"
        title="Mi ubicación"
      >
        <FaLocationArrow className="text-blue-600 text-xl" />
      </button>

      {/* Selector de Disponibilidad */}
      <div className="absolute bottom-4 left-4 z-10">
        <button
          onClick={() => setShowViewOptions(!showViewOptions)}
          className="bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-2 hover:shadow-xl transition"
        >
          <FaEye className="text-blue-600" />
          <span className="font-medium text-gray-800">Ver Disponibilidad</span>
          <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">{activeCount}</span>
          <FaChevronDown className={`text-gray-600 text-sm transition-transform ${showViewOptions ? 'rotate-180' : ''}`} />
        </button>

        {showViewOptions && (
          <div className="absolute bottom-full mb-2 bg-white rounded-xl shadow-xl overflow-hidden w-56">
            {viewOptions.map(option => (
              <button
                key={option.id}
                onClick={() => toggleView(option.id)}
                className={`w-full px-4 py-3 flex items-center gap-3 transition hover:bg-gray-50 ${
                  activeViews[option.id] ? 'bg-gray-50' : ''
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                  activeViews[option.id] 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300'
                }`}>
                  {activeViews[option.id] && (
                    <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </div>
                {React.createElement(option.icon, { className: `text-lg ${option.color}` })}
                <span className="font-medium text-gray-700">{option.name}</span>
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
          <FaLayerGroup className="text-blue-600" />
          <span className="font-medium text-gray-800">{mapStyles.find(s => s.id === currentMapStyle).name}</span>
          <FaChevronDown className={`text-gray-600 text-sm transition-transform ${showMapStyles ? 'rotate-180' : ''}`} />
        </button>

        {showMapStyles && (
          <div className="absolute top-full mt-2 bg-white rounded-xl shadow-xl overflow-hidden w-48">
            {mapStyles.map(style => (
              <button
                key={style.id}
                onClick={() => changeMapStyle(style.id)}
                className={`w-full px-4 py-3 text-left transition ${
                  currentMapStyle === style.id
                    ? 'bg-blue-600 text-white font-medium'
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
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-2xl p-5 z-20 max-w-md mx-auto">
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FaTimes className="text-gray-600" />
          </button>

          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
              selectedItem.category === 'rentals' ? 'bg-amber-400' : 
              selectedItem.category === 'favorites' ? 'bg-blue-400' : 'bg-blue-400'
            }`}>
              {selectedItem.category === 'rentals' ? <FaHome className="text-white text-2xl" /> : 
               selectedItem.category === 'favorites' ? <FaStar className="text-white text-2xl" /> : 
               <FaBriefcase className="text-white text-2xl" />}
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800 mb-1">{selectedItem.title}</h3>
              
              {selectedItem.category === 'rentals' ? (
                <>
                  <p className="text-gray-600 text-sm mb-2">{selectedItem.bedrooms} dormitorios</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-800 font-semibold">
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
                    <span className="flex items-center gap-1 text-gray-800 font-semibold">
                      <FaDollarSign />
                      {selectedItem.salary}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <FaMapMarkerAlt />
                      {selectedItem.location}
                    </span>
                  </div>
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                    {selectedItem.type}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition">
              Ver Detalles
            </button>
            <button className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition">
              <FaStar />
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