import React, { useState } from 'react';
import { X, Mail, Globe, Copy, Check } from 'lucide-react';

export default function JobContactView({ job, onClose }) {
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const hasContactInfo = job?.email || job?.phoneNumber || job?.website;

  // Demo data for preview
  const demoJob = {
    title: 'Digital Designer',
    company: 'Design Studio',
    email: 'jacob.west@gmail.com',
    phoneNumber: '+1 202 555 0147',
    website: 'example.com'
  };

  const displayJob = job || demoJob;

  return (
    <div className="fixed z-50 inset-0 bg-gray-200 mt-16 ">
      <div className="max-w-2xl mx-auto h-full flex flex-col animate-fadeIn">
   
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!hasContactInfo ? (
<div className="flex items-center justify-center min-h-[400px]">
  <div className="text-center">
    <div className="text-6xl mb-4">📭</div>
    <p className="text-gray-600 text-lg mb-2">Sin información de contacto</p>
    <p className="text-gray-400 text-sm">
      Este trabajo no tiene datos de contacto disponibles
    </p>
  </div>
</div>
          ) : (
            <div className="space-y-6">
              {/* Email */}
              {displayJob?.email && (
                <div className="border-b border-gray-100 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Email</span>
                    <button
                      onClick={() => handleCopy(displayJob.email, 'email')}
                      className="p-1.5 hover:bg-gray-100 rounded transition"
                    >
                      {copiedField === 'email' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{displayJob.email}</p>
                  </div>
                  <a
                    href={`mailto:${displayJob.email}`}
                    className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2.5 rounded-lg transition font-medium"
                  >
                    Enviar Email
                  </a>
                </div>
              )}

              {/* Phone */}
              {displayJob?.phoneNumber && (
                <div className="border-b border-gray-100 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Phone</span>
                    <button
                      onClick={() => handleCopy(displayJob.phoneNumber, 'phone')}
                      className="p-1.5 hover:bg-gray-100 rounded transition"
                    >
                      {copiedField === 'phone' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <p className="text-gray-900">{displayJob.phoneNumber}</p>
                  </div>
                  <a
                    href={`https://wa.me/${displayJob.phoneNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center py-2.5 rounded-lg transition font-medium"
                  >
                    Abrir WhatsApp
                  </a>
                </div>
              )}

              {/* Website */}
              {displayJob?.website && (
                <div className="border-b border-gray-100 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Website</span>
                    <button
                      onClick={() => handleCopy(displayJob.website, 'website')}
                      className="p-1.5 hover:bg-gray-100 rounded transition"
                    >
                      {copiedField === 'website' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a
                      href={displayJob.website.startsWith('http') ? displayJob.website : `https://${displayJob.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 hover:text-blue-600 transition"
                    >
                      {displayJob.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}