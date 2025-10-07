import React, { useState, useRef, useEffect } from 'react';
import { 
  FaBriefcase, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaDollarSign, 
  FaFileAlt, 
  FaUsers, 
  FaEnvelope, 
  FaPhone, 
  FaGlobe, 
  FaImage,
  FaTimes,
  FaCheckCircle,
  FaCrosshairs
} from 'react-icons/fa';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Token de Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoibWF4OTkiLCJhIjoiY21nNXVkdXc4MDV1YzJycHk2ZXkzMDJwaiJ9.bL8FqOik8Hze2dz8DU9OGg';

export default function PublishComponent({ userId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requeriments: '',
    position: '',
    city: '',
    direction: '',
    salary_range: '',
    email: '',
    phoneNumber: '',
    website: '',
    vacancies: 1,
    type: 'Empleo',
    source: 'app',
    isActive: true,
    ubication: {
      lat: -25.2637,
      lng: -57.5759
    }
  });

  useEffect(() => {
    if (showMap && mapContainer.current && !map.current) {
      // Inicializar mapa centrado en Asunción, Paraguay
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [formData.ubication.lng, formData.ubication.lat],
        zoom: 12
      });

      // Agregar controles de navegación
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Crear marcador inicial
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';

      marker.current = new mapboxgl.Marker({
        element: el,
        draggable: true
      })
        .setLngLat([formData.ubication.lng, formData.ubication.lat])
        .addTo(map.current);

      // Actualizar ubicación cuando se arrastra el marcador
      marker.current.on('dragend', () => {
        const lngLat = marker.current.getLngLat();
        setSelectedLocation({
          lat: lngLat.lat,
          lng: lngLat.lng
        });
      });

      // Click en el mapa para mover el marcador
      map.current.on('click', (e) => {
        marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        setSelectedLocation({
          lat: e.lngLat.lat,
          lng: e.lngLat.lng
        });
      });
    }
  }, [showMap]);

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Mover mapa y marcador a la ubicación del usuario
          if (map.current && marker.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 15
            });
            marker.current.setLngLat([longitude, latitude]);
            setSelectedLocation({
              lat: latitude,
              lng: longitude
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('No se pudo obtener tu ubicación. Verifica los permisos.');
        }
      );
    } else {
      setError('Tu navegador no soporta geolocalización.');
    }
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      setFormData(prev => ({
        ...prev,
        ubication: selectedLocation
      }));
    }
    setShowMap(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 4 - imageFiles.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    if (filesToAdd.length > 0) {
      setImageFiles(prev => [...prev, ...filesToAdd]);
      
      filesToAdd.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
    
    if (files.length > remainingSlots) {
      alert(`Solo puedes subir hasta 4 imágenes. Se agregaron ${remainingSlots} de ${files.length} seleccionadas.`);
    }
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      setError('Por favor completa al menos el título y la descripción');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Simular guardado (aquí iría tu lógica de Firebase)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Job data:', formData);
      console.log('Images:', imageFiles);
      
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error publishing job:', error);
      
      if (error.code === 'permission-denied') {
        setError('No tienes permisos para publicar trabajos. Verifica tu cuenta.');
      } else if (error.code === 'storage/unauthorized') {
        setError('Error al subir imágenes. Verifica los permisos de almacenamiento.');
      } else if (error.message.includes('network')) {
        setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
      } else if (error.code === 'quota-exceeded' || error.code === 'storage/quota-exceeded') {
        setError('El servicio está temporalmente no disponible. Por favor intenta más tarde o contacta a soporte.');
      } else {
        setError('Error al publicar el trabajo. Por favor intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed  inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-fadeIn">
          <FaCheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Publicado!</h3>
          <p className="text-gray-600">Tu oferta de trabajo ha sido publicada exitosamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 mx-auto max-w-4xl overflow-y-auto">
      <div className="flex items-center w-full justify-center">
        <div className="bg-white w-full animate-slideUp ">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-opacity rounded-xl">
                  <FaBriefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Publicar Trabajo</h2>
                  <p className="text-sm text-gray-500">Completa la información del puesto</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <FaTimes className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 h-full pb-20 overflow-y-auto">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 animate-fadeIn">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 mb-1">Error al publicar</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="flex-shrink-0 text-red-500 hover:text-red-700"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Imágenes del Trabajo (Hasta 4)
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-40 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
                      {index + 1}/4
                    </div>
                  </div>
                ))}
                
                {imagePreviews.length < 4 && (
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary cursor-pointer transition bg-gray-50">
                    <FaImage className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 text-center px-2">
                      {imagePreviews.length === 0 ? 'Agregar imágenes' : 'Agregar más'}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      {imagePreviews.length}/4
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaBriefcase className="text-primary" />
                  Título del Puesto *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Desarrollador Full Stack"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ring-primary"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaBuilding className="text-primary" />
                  Empresa
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Nombre de la empresa"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ring-primary"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaFileAlt className="text-primary" />
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe el puesto y responsabilidades..."
                rows="4"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ring-primary resize-none"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaFileAlt className="text-primary" />
                Requisitos
              </label>
              <textarea
                value={formData.requeriments}
                onChange={(e) => handleInputChange('requeriments', e.target.value)}
                placeholder="Lista los requisitos y habilidades necesarias..."
                rows="3"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ring-primary resize-none"
              />
            </div>

            {/* Location with Map */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaMapMarkerAlt className="text-primary" />
                Ubicación en el Mapa
              </label>
              
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="w-full px-4 py-3 bg-primary-opacity border-2 border-primary rounded-xl hover:bg-primary hover:text-white transition font-semibold text-primary flex items-center justify-center gap-2"
              >
                <FaMapMarkerAlt />
                {formData.ubication.lat !== -25.2637 ? 'Cambiar Ubicación' : 'Seleccionar Ubicación'}
              </button>

              {formData.ubication.lat !== -25.2637 && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                  <span className="font-semibold text-green-800">Ubicación seleccionada:</span>
                  <p className="text-green-700">Lat: {formData.ubication.lat.toFixed(6)}</p>
                  <p className="text-green-700">Lng: {formData.ubication.lng.toFixed(6)}</p>
                </div>
              )}

              {showMap && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fadeIn shadow-2xl">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-800">Seleccionar Ubicación</h3>
                      <button
                        onClick={() => setShowMap(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                      >
                        <FaTimes className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    
                    <div className="relative">
                      <div ref={mapContainer} className="h-[60vh] w-full" />
                      
                      {/* Botón flotante de Mi Ubicación */}
                      <button
                        onClick={handleMyLocation}
                        className="absolute bottom-6 right-6 p-4 bg-white rounded-full shadow-lg hover:bg-primary hover:text-white transition-all transform hover:scale-110 border-2 border-primary"
                        title="Mi ubicación"
                      >
                        <FaCrosshairs className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border-t border-gray-200">

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowMap(false)}
                          className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={confirmLocation}
                          className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition shadow-lg"
                        >
                          Confirmar Ubicación
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* City and Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaMapMarkerAlt className="text-primary" />
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Ej: Asunción"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ring-primary"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaMapMarkerAlt className="text-primary" />
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direction}
                  onChange={(e) => handleInputChange('direction', e.target.value)}
                  placeholder="Dirección específica"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ring-primary"
                />
              </div>
            </div>

            {/* Salary and Vacancies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaDollarSign className="text-primary" />
                  Rango Salarial
                </label>
                <input
                  type="text"
                  value={formData.salary_range}
                  onChange={(e) => handleInputChange('salary_range', e.target.value)}
                  placeholder="Ej: $2000 - $3000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ring-primary"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaUsers className="text-primary" />
                  Vacantes
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.vacancies}
                  onChange={(e) => handleInputChange('vacancies', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ring-primary"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaEnvelope className="text-primary" />
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contacto@empresa.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ring-primary"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaPhone className="text-primary" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+595 xxx xxx xxx"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ring-primary"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaGlobe className="text-primary" />
                Sitio Web
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.empresa.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ring-primary"
              />
            </div>

            {/* Position Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaBriefcase className="text-primary" />
                Tipo de Posición
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Ej: Tiempo completo, Remoto"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ring-primary"
              />
            </div>

            {/* Active Status */}
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-5 h-5 rounded accent-primary"
              />
              <div>
                <span className="text-sm font-semibold text-gray-700">Publicar como activo</span>
                <p className="text-xs text-gray-500">El trabajo será visible inmediatamente</p>
              </div>
            </label>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
{/*               <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancelar
              </button> */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Publicando...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="w-5 h-5" />
                    Publicar Trabajo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}