import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, Bookmark, X, Check, DollarSign, Clock, ChevronDown, MapPin, MessageCircle, GalleryHorizontalEnd, MoreHorizontal, Navigation, Star, Plane, Send, Phone } from 'lucide-react';
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
  setShowMap,
  onColorChange,
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
        const rgbColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        setDominantColor(rgbColor);

        // ⭐ NUEVO: Notificar al padre sobre el cambio de color
        if (onColorChange) {
          onColorChange(rgbColor);
        }
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
      maskOpacity={1}
    >
      <div className="mx-auto modal-card overflow-hidden relative flex flex-col h-screen">
        {/* Sección de Imagen - Altura flexible */}
        <div className="relative w-full flex-1 flex-shrink-1">
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
                      <div className="relative w-full h-full cursor-pointer pt-20">
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
        </div>

        {/* Sección de Información - Altura fija 25% */}
        <div className="relative bottom-0 left-0 right-0 h-[20%] bg-white flex flex-col px-4 pt-3 z-90">
          {/* Botones de acción superiores */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button>
                <GalleryHorizontalEnd size={26} strokeWidth={1.5} className="text-black" />
              </button>
              <button onClick={onLocate}>
                <MapPin size={26} strokeWidth={1.5} className="text-black" />
              </button>
              <button onClick={() => setShowContact(true)}>
                <MessageCircle size={26} strokeWidth={1.5} className="text-black" />
              </button>
              <button>
                <MoreHorizontal size={26} strokeWidth={1.5} className="text-black" />
              </button>
            </div>
            <button onClick={onSave}>
              <Bookmark
                size={26}
                strokeWidth={1.5}
                className={isSaved ? "text-yellow-400" : "text-black"}
                fill={isSaved ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Información del trabajo */}
          <div className="mt-3 flex flex-col">
            {job.title && (
              <h1 className="text-black text-md font-semibold">{job.title}</h1>
            )}
            {job.city && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={12} strokeWidth={1.5} className="text-gray-400" />
                <p className="text-gray-600 text-sm">{job.city}</p>
              </div>
            )}
            {job.createdAt && (
              <p className="text-gray-600 text-sm mt-3">
                {(() => {
                  const date = job.createdAt.toDate ? job.createdAt.toDate() : new Date(job.createdAt);
                  const currentYear = new Date().getFullYear();
                  const dateYear = date.getFullYear();

                  const day = date.getDate();
                  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
                  const month = months[date.getMonth()];

                  return dateYear === currentYear
                    ? `${day} de ${month}`
                    : `${day} de ${month} de ${dateYear}`;
                })()}
              </p>
            )}
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