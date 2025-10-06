import React, { useState, useEffect } from 'react';
import { FaBriefcase, FaBookmark, FaTimes, FaCheck, FaDollarSign, FaClock, FaChevronDown, FaMapPin, FaComments, FaLocationArrow, FaStar } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import ColorThief from 'colorthief';
import 'swiper/css';
import 'swiper/css/pagination';
import 'react-photo-view/dist/react-photo-view.css';

export default function JobCard({
  job,
  isSaved,
  justSaved,
  showDetails,
  onToggleDetails,
  onDismiss,
  onSave,
  onLocate,
  onChat
}) {
  const [dominantColor, setDominantColor] = useState('rgb(66, 153, 225)'); // Color por defecto (azul)
  const colorThief = new ColorThief();

  // Preparar todas las imágenes
  const allImages = job.images && job.images.length > 0
    ? job.images
    : job.url
      ? [job.url]
      : [];

  // Función para extraer el color dominante
  const extractDominantColor = (imgElement) => {
    try {
      if (imgElement.complete) {
        const color = colorThief.getColor(imgElement);
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
      <div className="bg-white modal-card flex flex-col">
        {/* Sección de Imagen - Toma todo el espacio disponible */}
        <div className="relative w-full flex-1 overflow-hidden">
          {job.images && job.images.length > 0 ? (
            <Swiper
              direction="horizontal"
              spaceBetween={0}
              slidesPerView={1}
              pagination={{
                clickable: true,
                dynamicBullets: true
              }}
              modules={[Pagination]}
              className="w-full h-full"
              nested={true}
              allowTouchMove={true}
              onSlideChange={(swiper) => {
                // Extraer color de la nueva imagen cuando cambia el slide
                const activeSlide = swiper.slides[swiper.activeIndex];
                const img = activeSlide?.querySelector('img');
                if (img) {
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
                          if (index === 0 || swiper?.activeIndex === index) {
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

          {justSaved && (
            <div className="absolute inset-0 bg-teal-400/80 pointer-events-none z-50 flex items-center justify-center animate-fav-ani">
              <div className="text-white text-center">
                <FaStar className="text-6xl mx-auto mb-4 animate-bounce" />
                <div className="text-2xl font-bold">Añadido a favoritos</div>
              </div>
            </div>
          )}
        </div>

        {/* Sección de Información - Altura automática basada en contenido */}
        <div className="p-4 bg-white flex-shrink-0">
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
      </div>
    </PhotoProvider>
  );
}