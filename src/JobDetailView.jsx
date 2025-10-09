import React from 'react';
import { X, Mail, Globe, MapPin, Building2, Users, Wallet, Briefcase, FileText, Clock } from 'lucide-react';

export default function JobDetailView({ job, onClose }) {

    // Demo data for preview
    const demoJob = {
        position: 'Digital Designer',
        company: 'Design Studio Inc.',
        email: 'jacob.west@designstudio.com',
        phoneNumber: '+1 202 555 0147',
        website: 'designstudio.com',
        city: 'San Francisco, CA',
        direction: '123 Market Street, Suite 400',
        description: 'Buscamos un diseñador digital creativo con experiencia en UI/UX para unirse a nuestro equipo. Trabajarás en proyectos innovadores para clientes de alto perfil.',
        requeriments: 'Experiencia mínima de 3 años en diseño digital, dominio de Figma, Adobe Creative Suite, conocimientos de HTML/CSS',
        salary_range: '$60,000 - $80,000',
        type: 'Tiempo completo',
        modality: 'Híbrido',
        vacancies: 2
    };

    const displayJob = job || demoJob;

    const InfoSection = ({ icon: Icon, label, value }) => {
        if (!value) return null;

        return (
            <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 font-medium">{label}</span>
                </div>
                <p className="text-gray-900 ml-6">{value}</p>
            </div>
        );
    };

    return (
        <div className="absolute inset-0 bg-gray-200 overflow-y-auto z-90 mt-20">
            <div className="min-h-full p-6 ">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
{/*                             {displayJob.type && (
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Tipo</p>
                                        <p className="text-gray-900 font-medium">{displayJob.type}</p>
                                    </div>
                                </div>
                            )} */}
                            {displayJob.modality && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Modalidad</p>
                                        <p className="text-gray-900 font-medium">{displayJob.modality}</p>
                                    </div>
                                </div>
                            )}
                            {displayJob.vacancies && (
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Vacantes</p>
                                        <p className="text-gray-900 font-medium">{displayJob.vacancies}</p>
                                    </div>
                                </div>
                            )}
                            {displayJob.salary_range && (
                                <div className="flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Salario</p>
                                        <p className="text-gray-900 font-medium">{displayJob.salary_range}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Location */}
                        {displayJob.city && (
                            <InfoSection
                                icon={MapPin}
                                label="Ciudad"
                                value={displayJob.city}
                            />
                        )}

                        {displayJob.direction && (
                            <InfoSection
                                icon={Building2}
                                label="Dirección"
                                value={displayJob.direction}
                            />
                        )}

                        {/* Requirements */}
                        {displayJob.requeriments && (
                            <div className="border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-500 font-medium">Requisitos</span>
                                </div>
                                <p className="text-gray-900 ml-6 whitespace-pre-line">{displayJob.requeriments}</p>
                            </div>
                        )}

                        {/* Contact Information */}

                        {/* Email */}
                        {displayJob.email && (
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">Email</span>
                                </div>
                                <p className="text-gray-900 ml-6">{displayJob.email}</p>
                            </div>
                        )}

                        {/* Phone */}
                        {displayJob.phoneNumber && (
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    <span className="text-sm text-gray-500">Teléfono</span>
                                </div>
                                <p className="text-gray-900 ml-6">{displayJob.phoneNumber}</p>
                            </div>
                        )}

                        {/* Website */}
                        {displayJob.website && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Globe className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">Sitio Web</span>
                                </div>
                                <p className="text-gray-900 ml-6">{displayJob.website}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}