import React, { useState } from 'react';
import { FaTimes, FaEnvelope, FaWhatsapp, FaGlobe, FaCopy, FaCheck } from 'react-icons/fa';
import { MdArrowBackIos } from "react-icons/md";

export default function JobContactView({ job, onClose }) {
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const hasContactInfo = job?.email || job?.phoneNumber || job?.website;

  return (
        
    <div className="fixed z-50 flex inset-0  items-center justify-center">
      <div className="bg-bg w-full  modal-card flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center bg-white justify-between p-4 px-5 border-b border-gray-200">
          <h2 className="text-md font-bold text-gray-700">Información de Contacto</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center shadow-lg bg-white/10 justify-center rounded-full transition pt-2"
          >
            <FaTimes className="text-xl text-gray-700 " />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!hasContactInfo ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 text-lg mb-2">Sin información de contacto</p>
              <p className="text-gray-400 text-sm">
                Este trabajo no tiene datos de contacto disponibles
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Job Title */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {job?.title || 'Trabajo'}
                </h3>
                <p className="text-sm text-gray-500">
                  {job?.company || 'Empresa'}
                </p>
              </div>

              {/* Email */}
              {job?.email && (
                <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaEnvelope className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                        Email
                      </p>
                      <p className="text-gray-900 break-all">{job.email}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(job.email, 'email')}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition flex-shrink-0"
                    >
                      {copiedField === 'email' ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaCopy className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* WhatsApp */}
              {job?.phoneNumber && (
                <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaWhatsapp className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                        WhatsApp
                      </p>
                      <p className="text-gray-900">{job.phoneNumber}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(job.phoneNumber, 'phone')}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition flex-shrink-0"
                    >
                      {copiedField === 'phone' ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaCopy className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  <a
                    href={`https://wa.me/${job.phoneNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center py-2 rounded-lg transition font-medium"
                  >
                    Abrir WhatsApp
                  </a>
                </div>
              )}

              {/* Website */}
              {job?.website && (
                <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaGlobe className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                        Sitio Web
                      </p>
                      <p className="text-gray-900 break-all">{job.website}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(job.website, 'website')}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition flex-shrink-0"
                    >
                      {copiedField === 'website' ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaCopy className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  <a
                    href={job.website.startsWith('http') ? job.website : `https://${job.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2 rounded-lg transition font-medium"
                  >
                    Visitar Sitio Web
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}