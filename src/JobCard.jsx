import React from 'react';
import { FaBriefcase, FaBookmark, FaTimes, FaCheck, FaDollarSign, FaClock, FaChevronDown, FaMapPin, FaComments, FaLocationArrow, FaStar } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { PhotoProvider, PhotoView } from 'react-photo-view';
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
  // Preparar todas las imágenes
  const allImages = job.images && job.images.length > 0
    ? job.images
    : job.url
      ? [job.url]
      : [];

  return (
    <PhotoProvider
      speed={() => 300}
      easing={(type) => (type === 2 ? 'cubic-bezier(0.36, 0, 0.66, -0.56)' : 'cubic-bezier(0.34, 1.56, 0.64, 1)')}
      maskOpacity={0.95}
    >
      <div className="bg-white modal-card overflow-hidden relative">
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
            className="absolute inset-0 w-full h-full z-20"
            nested={true}
            allowTouchMove={true}
          >
            {job.images.map((imageUrl, index) => (
              <SwiperSlide key={index}>
                <PhotoView src={imageUrl}>
                  <div className="relative w-full h-full cursor-pointer">
                    {/* Fondo blur usando background-image CSS */}
                    <div
                      className="absolute inset-0 w-full h-full blur-2xl scale-110"
                      style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    {/* Imagen principal */}
                    <img
                      src={imageUrl}
                      alt={`${job.title} - ${index + 1}`}
                      className="relative w-full h-full object-contain z-10"
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
            <div className="absolute inset-0 w-full h-full cursor-pointer">
              {/* Fondo blur usando background-image CSS */}
              <div
                className="absolute inset-0 w-full h-full blur-2xl scale-110"
                style={{
                  backgroundImage: `url(${job.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              {/* Imagen principal */}
              <img
                src={job.url}
                alt={job.title || 'Imagen del trabajo'}
                className="relative w-full h-full object-contain z-10"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%234299e1" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="white"%3E📋%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          </PhotoView>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600"></div>
        )}

        {/* Gradiente inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-12"></div>


        {justSaved && (
          <div className="absolute bottom-0 left-0 right-0 h-full bg-teal-400/80 pointer-events-none z-100 flex items-center justify-center animate-fav-ani">
            <div className="text-white text-center">
              <FaStar className="text-6xl mx-auto mb-4 animate-bounce" />
              <div className="text-2xl font-bold">Añadido a favoritos</div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 flex flex-col justify-between p-4 z-30 pointer-events-none">
          {/* 🔹 Descripción arriba */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 mt-6 shadow-xl max-h-[45vh] overflow-y-auto pointer-events-auto">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Descripción</h3>
              <p className="text-gray-700 text-xs leading-relaxed">
                {showDetails
                  ? (job.description || 'Buscamos un profesional talentoso para unirse a nuestro equipo. Ofrecemos un ambiente de trabajo dinámico, oportunidades de crecimiento y beneficios competitivos.')
                  : ((job.description || 'Buscamos un profesional talentoso para unirse a nuestro equipo...').substring(0, 80) + '...')}
              </p>
              <button
                onClick={onToggleDetails}
                className="text-blue-600 text-xs mt-2 flex items-center gap-1 hover:text-blue-700 font-medium"
              >
                {showDetails ? 'Ver menos' : 'Ver más'}
                <FaChevronDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showDetails && (
              <>
                {job.requeriments && (
                  <div className="mt-3 pt-3 border-t">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">Requisitos</h3>
                    <ul className="space-y-1 text-xs text-gray-700">
                      {(Array.isArray(job.requeriments) ? job.requeriments : job.requeriments?.split(',') || ['React', 'Node.js', '3+ años experiencia']).map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <FaCheck className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{typeof req === 'string' ? req.trim() : req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.vacancies && (
                  <div className="mt-3 pt-3 border-t">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">Vacantes Disponibles</h3>
                    <p className="text-gray-700 text-xs">{job.vacancies} posiciones disponibles</p>
                  </div>
                )}

                {job.website && (
                  <div className="mt-3 pt-3 border-t">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">Sitio Web</h3>
                    <a
                      href={job.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-xs hover:underline break-all"
                    >
                      {job.website}
                    </a>
                  </div>
                )}

                {(job.email || job.phoneNumber) && (
                  <div className="mt-3 pt-3 border-t">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">Contacto</h3>
                    <div className="space-y-1 text-xs text-gray-700">
                      {job.email && (
                        <p className="break-all">
                          <span className="font-medium">Email:</span> {job.email}
                        </p>
                      )}
                      {job.phoneNumber && (
                        <p>
                          <span className="font-medium">Teléfono:</span> {job.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {job.city && (
                  <div className="mt-3 pt-3 border-t">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">Ciudad</h3>
                    <p className="text-gray-700 text-xs">{job.city}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 🔹 Información del trabajo abajo */}
          <div className="flex items-start gap-3 mb-20">
            <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <FaBriefcase className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white drop-shadow-lg mb-1">{job.title || 'Desarrollador Senior'}</h2>
              <p className="text-white/90 text-sm drop-shadow">{job.company || 'Tech Company'}</p>
              <div className="flex gap-3 mt-2 text-xs text-white/90 drop-shadow flex-wrap">
                <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                  <FaMapPin className="w-3 h-3" />
                  {job.location || 'Remoto'}
                </span>
                <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                  <FaDollarSign className="w-3 h-3" />
                  {job.salary || '$50k-70k'}
                </span>
                <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                  <FaClock className="w-3 h-3" />
                  {job.type || 'Full-time'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhotoProvider>
  );
}