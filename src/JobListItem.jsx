import React from 'react';
import { FaMapMarkerAlt, FaDollarSign, FaClock, FaBriefcase } from 'react-icons/fa';

export default function JobListItem({ job, formatTimeAgo, onClick, showPublisherBadge }) {
  const isNew = formatTimeAgo(job.createdAt) === 'Hace menos de 1h';
  const imageUrl = job.url || job.flyerImage || job.image;
  
  return (
    <div 
      className="mb-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="flex gap-3 p-4">
        {/* Company Logo/Image con Placeholder */}
        <div className="flex-shrink-0">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={job.company || job.title}
              className="w-16 h-16 rounded-lg object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Placeholder cuando no hay imagen */}
          <div className={`${imageUrl ? 'hidden' : 'flex'} w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center`}>
            <FaBriefcase className="w-6 h-6 text-gray-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">
                {job.title || 'Sin título'}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {job.company || 'Empresa no especificada'}
              </p>
            </div>
            
            {/* Status Badges */}
            <div className="flex gap-2 ml-2 flex-shrink-0">
              {isNew && (
                <span className="text-xs bg-primary-opacity text-primary px-2 py-1 rounded font-medium">
                  Nuevo
                </span>
              )}
              {showPublisherBadge && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                  Tuyo
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded font-medium ${
                job.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {job.isActive ? 'Disponible' : 'Cerrado'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {job.location && (
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt /> {job.location}
              </span>
            )}
            {(job.salary || job.salaryMin || job.salaryMax) && (
              <span className="flex items-center gap-1">
                <FaDollarSign /> 
                {job.salary 
                  ? `$${job.salary}` 
                  : job.salaryMin && job.salaryMax 
                  ? `$${job.salaryMin}-${job.salaryMax}`
                  : job.salaryMin 
                  ? `Desde $${job.salaryMin}`
                  : `Hasta $${job.salaryMax}`
                }
              </span>
            )}
            <span className="flex items-center gap-1">
              <FaClock /> {formatTimeAgo(job.createdAt)}
            </span>
          </div>
          
          {job.employmentType && (
            <div className="mt-2">
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                {job.employmentType}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}