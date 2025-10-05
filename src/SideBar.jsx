import React, { useState } from 'react';
import { 
  FaFire, FaComments, FaBookmark, FaMapMarkedAlt, FaPlusCircle, 
  FaUser, FaBars, FaTimes, FaStar 
} from 'react-icons/fa';

export default function Sidebar({ activeTab = 'inicio', onTabChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const mobileItems = [
    { id: 'inicio', icon: FaFire, label: 'Inicio' },
    { id: 'mapa', icon: FaMapMarkedAlt, label: 'Explorar' },
    { id: 'publicar', icon: FaPlusCircle, label: 'Publicar' },
    { id: 'favoritos', icon: FaStar, label: 'Favoritos' },
    { id: 'perfil', icon: FaUser, label: 'Perfil' }
  ];

  const desktopItems = [
    { id: 'inicio', icon: FaFire, label: 'Inicio' },
    { id: 'mensajes', icon: FaComments, label: 'Mensajes' },
    { id: 'favoritos', icon: FaStar, label: 'Favoritos' },
    { id: 'mapa', icon: FaMapMarkedAlt, label: 'Explorar' },
    { id: 'publicar', icon: FaPlusCircle, label: 'Publicar' },
    { id: 'perfil', icon: FaUser, label: 'Mi Perfil' }
  ];

  const handleItemClick = (itemId) => {
    onTabChange?.(itemId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-20 lg:bg-white lg:shadow-md lg:flex-col lg:z-200 lg:items-center lg:py-6">
        {/* Logo */}
        <div className="mb-8">
          <FaFire className="w-8 h-8 text-primary" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col items-center gap-6">
          {desktopItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`relative group transition-all ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title={item.label}
              >
                <Icon className="w-7 h-7" />
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 w-1 h-8 bg-primary rounded-r-full" />
                )}
                <span className="absolute left-full ml-4 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Navigation Mobile */}
      <div className="
      lg:hidden
      fixed bottom-0 
      left-0 right-0 
      bg-white 
      shadow-2xl 
      z-60 rounded-t-3xl 
      pb-[env(safe-area-inset-bottom)] h-[var(--altura-barra)] 
      ">
        <div className="flex items-center justify-around px-4 h-full">
          {mobileItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`flex flex-col items-center transition-all ${
                  isActive ? 'text-primary scale-110' : 'text-gray-400'
                }`}
              >
                <Icon className="w-7 h-7 mb-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Hamburger Menu Button - Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-full shadow-lg text-gray-700"
      >
        {isOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
      </button>

      {/* Slide Menu Mobile */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="lg:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaFire className="text-primary" />
                JobFeed
              </h2>
            </div>
            <nav className="p-4 space-y-2">
              <button
                onClick={() => handleItemClick('mensajes')}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'mensajes'
                    ? 'bg-pink-50 text-primary'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaComments className="w-5 h-5" />
                <span className="font-medium">Mensajes</span>
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="hidden lg:block lg:w-20" />
    </>
  );
}