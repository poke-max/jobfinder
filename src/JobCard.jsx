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
      <div className="bg-white modal-card overflow-hidden relative flex flex-col max-h-full">
        {/* Sección de Imagen - 60% de la altura */}
        <div className="relative w-full flex-shrink-0" style={{ height: '60%' }}>
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
            >
              {job.images.map((imageUrl, index) => (
                <SwiperSlide key={index}>
                  <PhotoView src={imageUrl}>
                    <div className="relative w-full h-full cursor-pointer">
                      {/* Fondo blur usando background-image CSS */}
                      <div
                        className="absolute inset-0 w-full h-full blur-2xl scale-110"
                        style={{
                          /* backgroundImage: `url(${imageUrl})`, */
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                      {/* Imagen principal */}
                      <img
                        src={imageUrl}
                        alt={`${job.title} - ${index + 1}`}
                        className="relative w-full h-full object-cover z-10"
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
                {/* Fondo blur usando background-image CSS */}
                <div
                  className="absolute inset-0 w-full h-full blur-3xl scale-110"
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
                  className="relative w-full h-full object-cover z-10"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%234299e1" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="white"%3E📋%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            </PhotoView>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
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

        {/* Sección de Información - 40% de la altura con scroll */}
        <div className="p-4 bg-white flex-shrink-0 overflow-y-auto" style={{ height: '40%' }}>
          {/* Información del trabajo */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className='flex flex-row gap-2'>
                {job.title && (
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h2>
                )}
                {job.isActive !== undefined && (
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${job.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${job.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    {job.isActive ? 'Disponible' : 'No disponible'}
                  </span>
                )}
              </div>
              {job.company && (
                <p className="text-gray-600 text-sm">{job.company}</p>
              )}
              <div className="flex gap-3 mt-2 text-xs text-gray-600 flex-wrap">
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
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 right-0">
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