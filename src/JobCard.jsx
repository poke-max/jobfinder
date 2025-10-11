import React, { useState, useEffect, useRef } from 'react';
import {
  Info,
  Briefcase,
  Bookmark,
  X, Check,
  DollarSign,
  Clock, ChevronDown,
  MapPin, MessageCircle, GalleryHorizontalEnd,
  MoreHorizontal, Navigation, Star, Plane, Send,
  Phone, Laptop, Banknote, MapPinned, Copy, User
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import ColorThief from 'colorthief';
import 'swiper/css';
import 'swiper/css/pagination';
import 'react-photo-view/dist/react-photo-view.css';
import { Mail, Globe, Building2, Users, Wallet, FileText } from 'lucide-react';
import JobMapView from './JobMapView';
import JobContactView from './JobContactView';
import JobDetailView from './JobDetailView';

export default function JobCard({
  job,
  userData,
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
  parentSwiperRef,
}) {

  const [dominantColor, setDominantColor] = useState('rgba(255, 255, 255, 1)');
  const [activeModal, setActiveModal] = useState('gallery'); // 'gallery', 'map', 'contact', 'details'
  const swiperRef = useRef(null);
  const colorThiefRef = useRef(new ColorThief());
  const parentSwiperEnabledRef = useRef(null);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
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

  const [isAnimating, setIsAnimating] = useState(false);

  const handleSave = () => {
    if (!isSaved) {
      setIsAnimating(true);

      // Sonido de "pop" o "click"
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audio.volume = 0.3;
      audio.play().catch(err => console.log('Error reproduciendo audio:', err));

      setTimeout(() => setIsAnimating(false), 500);
    }
    onSave();
  };

  // Cargar el color de la primera imagen disponible
  // Cargar el color de la primera imagen disponible con reintentos
  useEffect(() => {
    if (allImages.length > 0) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = allImages[0];
      img.onload = () => extractDominantColor(img);

      // Si falla, reintentar cuando vuelva la conexión
      img.onerror = () => {
        const retryLoad = () => {
          const retryImg = new Image();
          retryImg.crossOrigin = 'Anonymous';
          retryImg.src = allImages[0];
          retryImg.onload = () => extractDominantColor(retryImg);
        };

        // Escuchar evento de conexión restaurada
        const handleOnline = () => {
          retryLoad();
          window.removeEventListener('online', handleOnline);
        };
        window.addEventListener('online', handleOnline);

        // También reintentar después de 3 segundos por si acaso
        setTimeout(retryLoad, 3000);
      };
    }
  }, [job.images, job.url]);


  useEffect(() => {
    // Cuando se abre el mapa o contacto, deshabilitar swiper padre
    if (activeModal === 'map') {
      if (parentSwiperRef?.current) {
        parentSwiperRef.current.disable();
      }
    } else {
      // Cuando se cierra, rehabilitar swiper padre
      if (parentSwiperRef?.current) {
        parentSwiperRef.current.enable();
      }
    }
  }, [activeModal, parentSwiperRef]);

  return (
    <PhotoProvider
      speed={() => 300}
      easing={(type) => (type === 2 ? 'cubic-bezier(0.36, 0, 0.66, -0.56)' : 'cubic-bezier(0.34, 1.56, 0.64, 1)')}
      maskOpacity={1}
    >
      <div className="mx-auto modal-card overflow-hidden relative flex flex-col h-screen">
        {/* Sección de Imagen - Altura flexible */}
        <div className="relative w-full flex-1 flex-shrink-1 ">
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
                className="w-full h-full "
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
                          className={`relative w-full h-full object-contain z-10 transition-opacity duration-300 ${activeModal === 'gallery' ? 'opacity-100' : 'opacity-0'}`}
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
                    className={`relative w-full h-full object-contain z-10 transition-opacity duration-200 ${activeModal === 'gallery' ? 'opacity-100' : 'opacity-0'}`}
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

          {/* Modales - Posicionados sobre la imagen */}
          {activeModal === 'map' && (
            <div className="absolute inset-0 z-900">
              <JobMapView
                job={job}
                onClose={() => {
                  setActiveModal('gallery');
                  setShowMap(false);
                }}
              />
            </div>
          )}

          {activeModal === 'contact' && (
            <div className="absolute inset-0 ">
              <JobContactView
                job={job}
                onClose={() => setActiveModal('gallery')}
              />
            </div>
          )}

          {activeModal === 'details' && (
            <div className="absolute inset-0 ">
              <JobDetailView
                job={job}
                onClose={() => setActiveModal('gallery')}
              />
            </div>
          )}

        </div>



        {/* Sección de Información - Altura fija 25% */}
        <div className={`relative bottom-0 left-0 right-0 ${isInfoExpanded ? 'max-h-[100vh]' : 'max-h-[25vh]'} overflow-y-auto bg-white flex flex-col px-4 pt-3 pb-4 z-90 transition-all duration-300 ease-in-out`}>
          {/* Botones de acción superiores */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button onClick={() => {
                setActiveModal('gallery')
                setShowMap(false);
              }}>
                <GalleryHorizontalEnd
                  size={26}
                  strokeWidth={1.5}
                  className="text-black"
                  fill={activeModal === 'gallery' ? "currentColor" : "none"}
                />
              </button>
              <button onClick={() => {
                const newState = activeModal === 'map' ? 'gallery' : 'map';
                setActiveModal(newState);
                setShowMap(newState === 'map');
              }}>
                <MapPin
                  size={26}
                  strokeWidth={1.5}
                  className="text-black"
                  fill={activeModal === 'map' ? "currentColor" : "none"}
                />
              </button>
              {/* <button onClick={() => {
                setActiveModal(activeModal === 'contact' ? 'gallery' : 'contact')
                setShowMap(false);

              }}>
                <MessageCircle
                  size={26}
                  strokeWidth={1.5}
                  className="text-black"
                  fill={activeModal === 'contact' ? "currentColor" : "none"}
                />
              </button> */}
              <button onClick={() => {
                setIsInfoExpanded(!isInfoExpanded);
                setShowMap(false);
              }}>
                {isInfoExpanded ? (
                  <div className="w-[26px] h-[26px] bg-black rounded-full flex items-center justify-center">
                    <MoreHorizontal size={16} strokeWidth={2} className="text-white" />
                  </div>
                ) : (
                  <MoreHorizontal size={26} strokeWidth={1.5} className="text-black" />
                )}
              </button>
            </div>
            <button
              onClick={handleSave}
              className="transition-transform hover:scale-105"
            >
              <Bookmark
                size={26}
                strokeWidth={1.5}
                className={`${isSaved ? "text-yellow-400" : "text-black"
                  } ${isAnimating ? "animate-shake-scale" : ""}`}
                fill={isSaved ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Información del trabajo */}

          <div onClick={() => {
            setIsInfoExpanded(!isInfoExpanded);
            setShowMap(false);
          }} className=" flex flex-col ">
             <div className="flex flex-row items-center gap-1">
                {userData?.customPhotoURL ? (
                  <img
                    src={userData.customPhotoURL}
                    alt={userData.displayName || 'Usuario'}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FE9F92 0%, #F66F71 100%)' }}>
                    <User className="w-3 h-3 text-white" strokeWidth={2.5} />
                  </div>
                )}
                <p className="text-gray-800 text-xs font-bold">
                  {userData?.displayName || 'Usuario'}
                </p>
                <span className="text-gray-400 text-sm">•</span>


                {job.createdAt && (
                  <p className="text-gray-600 text-xs">
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
            <div className="flex flex-row items-center gap-1 mt-1">
              {job.title && (
                <h1 className="text-black text-md font-semibold">{job.title}</h1>
              )}
            </div>
            {job.description && (
              <p className={`text-gray-700 text-sm mt-0 ${!isInfoExpanded ? 'line-clamp-3' : ''}`}>
                {job.description}
              </p>
            )}

            <div className='flex flex-col mt-3'>

 
              {job.city && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={12} strokeWidth={1.5} className="text-gray-700" />
                  <p className="text-gray-700 text-xs">{job.city}</p>
                </div>
              )}
              {isInfoExpanded && (
                <>
                  <div className="flex items-center gap-1 mt-1">
                    <Laptop size={12} strokeWidth={1.5} className="text-gray-700" />
                    <p className="text-gray-700 text-xs">Remoto</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Users size={12} strokeWidth={1.5} className="text-gray-700" />
                    <p className="text-gray-700 text-xs">2 vacantes</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Banknote size={12} strokeWidth={1.5} className="text-gray-700" />
                    <p className="text-gray-700 text-xs">Salario mínimo</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPinned size={12} strokeWidth={1.5} className="text-gray-700" />
                    <p className="text-gray-700 text-xs">Barrio Azucena, Las Residentas</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <FileText size={14} strokeWidth={1.5} className="text-gray-700" />
                    <p className="text-gray-700 text-xs">Experiencia en animales de granja, ganado, farmacos y medifinas.</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Phone size={14} strokeWidth={1.5} className="text-gray-700" />
                    <p className="text-gray-700 text-xs">+595 9876554</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Mail size={14} strokeWidth={1.5} className="text-gray-700" />
                    <p className="text-gray-700 text-xs">example@gmail.com</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Globe size={14} strokeWidth={1.5} className="text-gray-700" />
                    <p className="text-gray-700 text-xs">web.com.py</p>
                  </div>
                  <div className='flex flex-row gap-2 mt-4 justify-end'>
                    <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="block w-10 h-10 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center rounded-full transition font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </a>
                    <a href="mailto:tu@email.com" target="_blank" rel="noopener noreferrer" className="block w-10 h-10 text-xs bg-rose-400 hover:bg-rose-500 text-white flex items-center justify-center rounded-full transition font-medium">
                      <Mail size={20} />
                    </a>
                    <a href="https://tu-sitio-web.com" target="_blank" rel="noopener noreferrer" className="block w-10 h-10 text-xs bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center rounded-full transition font-medium">
                      <Globe size={20} />
                    </a>
                  </div>
                </>
              )}

            </div>

          </div>
        </div>
      </div>
    </PhotoProvider >
  );
}