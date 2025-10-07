import React, { useState, useEffect, useRef } from 'react';
import { FaBriefcase, FaBookmark, FaTimes, FaCheck, FaDollarSign, FaClock, FaChevronDown, FaMapPin, FaComments, FaLocationArrow, FaStar, FaPlane, FaPaperPlane, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import ColorThief from 'colorthief';
import 'swiper/css';
import 'swiper/css/pagination';
import 'react-photo-view/dist/react-photo-view.css';

import JobMapView from './JobMapView';
import JobContactView from './JobContactView';

export default function JobCard({
  job,
  isSaved,
  justSaved,
  showDetails,
  onToggleDetails,
  onDismiss,
  onSave,
  onLocate,
  onChat,
  showMap,
  setShowMap
}) {
  const [dominantColor, setDominantColor] = useState('rgba(255, 255, 255, 1)');
 
  const [showContact, setShowContact] = useState(false);
  const swiperRef = useRef(null);
  const colorThiefRef = useRef(new ColorThief());

  // Preparar todas las imágenes
  const allImages = job.images && job.images.length > 0
    ? job.images
    : job.url
      ? [job.url]
      : [];

  // Función para extraer el color dominante
  const extractDominantColor = (imgElement) => {
    try {
      if (imgElement.complete && imgElement.naturalHeight !== 0) {
        const color = colorThiefRef.current.getColor(imgElement);
        setDominantColor(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
      }
    } catch (error) {
      console.error('Error extrayendo color:', error);
    }
  };

  // Cargar el color de la primera imagen disponible
  useEffect(() => {
    if (allImages.length > 0) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = allImages[0];
      img.onload = () => extractDominantColor(img);
    }
  }, [job.images, job.url]);

  return (
    <PhotoProvider
      speed={() => 300}
      easing={(type) => (type === 2 ? 'cubic-bezier(0.36, 0, 0.66, -0.56)' : 'cubic-bezier(0.34, 1.56, 0.64, 1)')}
      maskOpacity={0.95}
    >
      <div className="bg-white mx-auto modal-card overflow-hidden relative flex flex-col h-screen">
        {/* Sección de Imagen - Altura fija 70% */}
        <div className="relative w-full flex-1  flex-shrink-1">
          <div className="absolute inset-0">
            {job.images && job.images.length > 0 ? (
              <Swiper
                direction="horizontal"
                spaceBetween={0}
                slidesPerView={1}
                pagination={job.images.length > 1 ? {
                  clickable: true,
                  dynamicBullets: true
                } : false}
                modules={[Pagination]}
                className="w-full h-full"
                nested={true}
                allowTouchMove={true}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                onSlideChange={(swiper) => {
                  // Extraer color de la nueva imagen cuando cambia el slide
                  const activeSlide = swiper.slides[swiper.activeIndex];
                  const img = activeSlide?.querySelector('img');
                  if (img && img.complete) {
                    extractDominantColor(img);
                  }
                }}
              >
                {job.images.map((imageUrl, index) => (
                  <SwiperSlide key={index}>
                    <PhotoView src={imageUrl}>
                      <div className="relative w-full h-full cursor-pointer">
                        {/* Fondo con color dominante */}
                        <div
                          className="absolute inset-0 w-full h-full"
                          style={{
                            backgroundColor: dominantColor
                          }}
                        />
                        {/* Imagen principal */}
                        <img
                          src={imageUrl}
                          alt={`${job.title} - ${index + 1}`}
                          className="relative w-full h-full object-contain z-10"
                          crossOrigin="anonymous"
                          onLoad={(e) => {
                            // Solo extraer color si es la imagen activa
                            if (!swiperRef.current || swiperRef.current.activeIndex === index) {
                              extractDominantColor(e.target);
                            }
                          }}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%234299e1" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="white"%3E📋%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    </PhotoView>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : job.url ? (
              <PhotoView src={job.url}>
                <div className="w-full h-full cursor-pointer">
                  {/* Fondo con color dominante */}
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      backgroundColor: dominantColor
                    }}
                  />
                  {/* Imagen principal */}
                  <img
                    src={job.url}
                    alt={job.title || 'Imagen del trabajo'}
                    className="relative w-full h-full object-contain z-10"
                    crossOrigin="anonymous"
                    onLoad={(e) => extractDominantColor(e.target)}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%234299e1" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="white"%3E📋%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              </PhotoView>
            ) : (
              <div
                className="w-full h-full"
                style={{ backgroundColor: dominantColor }}
              ></div>
            )}

          </div>

          {/* ⭐ BOTONES CIRCULARES ⭐ */}
          <div className="absolute right-4 bottom-0 translate-y-1/2 flex gap-2 z-20 lg:scale-120 lg:right-8">
            <button
              onClick={() => setShowMap(true)}
              className="w-12 h-12 rounded-full bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center shadow-lg transition-all duration-300"
              title="Ver ubicación"
            >
              <FaMapMarkerAlt className="text-lg" />
            </button>
            <button
              onClick={onSave}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isSaved
                ? 'bg-teal-400 text-white hover:bg-teal-500 animate-bounce-scale'
                : 'bg-white text-gray-700 hover:bg-gray-100 '
                }`}
              title={isSaved ? "Quitar de favoritos" : "Guardar en favoritos"}
            >
              <FaStar className="text-lg" />
            </button>
            <button
              onClick={() => setShowContact(true)}
              className="w-12 h-12 rounded-full bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 flex items-center justify-center shadow-lg transition-all duration-300"
              title="Contacto"
            >
              <FaPaperPlane className="text-lg" />
            </button>
          </div>
        </div>

        {/* Sección de Información - Altura fija 30% */}
        <div className="py-6 items-end px-4 bg-white h-[20vh] overflow-y-auto">
          {/* Información del trabajo */}
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className='flex flex-row gap-2 items-center flex-wrap'>
                {job.title && (
                  <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                )}
                {job.isActive !== undefined && (
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${job.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span className={`w-2 h-2 rounded-full ${job.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    {job.isActive ? 'Disponible' : 'No disponible'}
                  </span>
                )}
              </div>
              {job.company && (
                <p className="text-gray-600 text-sm mt-1">{job.company}</p>
              )}
              <div className="flex gap-2 mt-2 text-xs text-gray-600 flex-wrap">
                {job.city && (
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                    <FaMapPin className="w-3 h-3" />
                    {job.city}
                  </span>
                )}
                {job.salary_range && (
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                    <FaDollarSign className="w-3 h-3" />
                    {job.salary_range}
                  </span>
                )}
                {job.vacancies && (
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                    <FaBriefcase className="w-3 h-3" />
                    {job.vacancies} {job.vacancies === 1 ? 'vacante' : 'vacantes'}
                  </span>
                )}
              </div>
              {job.createdAt && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <FaClock className="w-3 h-3" />
                  {job.createdAt.toDate ? job.createdAt.toDate().toLocaleDateString() : job.createdAt}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modales */}
        {showMap && (
          <JobMapView 
            job={job} 
            onClose={() => setShowMap(false)} 
          />
        )}
        
        {showContact && (
          <JobContactView 
            job={job} 
            onClose={() => setShowContact(false)} 
          />
        )}
      </div>
    </PhotoProvider>
  );
}