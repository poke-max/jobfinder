import React, { useState } from 'react';
import { 
  FaHome, FaComments, FaBookmark, FaMapMarkedAlt , 
  FaUser, FaBars, FaTimes, FaStar, FaSignOutAlt 
} from 'react-icons/fa';

import { FaSquarePlus } from "react-icons/fa6";

import {
  FaRegComments,
  FaRegBookmark,
  FaRegMap,
  FaRegPlusSquare,
  FaRegStar,
  FaRegUser
} from 'react-icons/fa';

import { signOut } from 'firebase/auth';
import { auth } from './firebase/firebase';

export default function Sidebar({ activeTab = 'inicio', onTabChange, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const mobileItems = [
    { id: 'inicio', icon: FaHome, iconReg: FaHome, label: 'Inicio' },
    { id: 'mapa', icon: FaMapMarkedAlt, iconReg: FaRegMap, label: 'Explorar' },
    { id: 'publicar', icon: FaSquarePlus , iconReg: FaRegPlusSquare, label: 'Publicar' },
    { id: 'favoritos', icon: FaStar, iconReg: FaRegStar, label: 'Favoritos' }
  ];

  const desktopItems = [
    { id: 'inicio', icon: FaHome, iconReg: FaHome, label: 'Inicio' },
    { id: 'mensajes', icon: FaComments, iconReg: FaRegComments, label: 'Mensajes' },
    { id: 'favoritos', icon: FaStar, iconReg: FaRegStar, label: 'Favoritos' },
    { id: 'mapa', icon: FaMapMarkedAlt, iconReg: FaRegMap, label: 'Explorar' },
    { id: 'publicar', icon: FaSquarePlus , iconReg: FaRegPlusSquare, label: 'Publicar' }
  ];

  const handleItemClick = (itemId) => {
    onTabChange?.(itemId);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      setShowProfileMenu(false);
      await signOut(auth);
      console.log('Sesión cerrada exitosamente');
      // Opcional: Recargar la página para limpiar el estado
      // window.location.reload();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión. Intenta nuevamente.');
    }
  };

  return (
    <>
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-20 lg:bg-white lg:shadow-md lg:flex-col lg:z-200 lg:items-center lg:py-6">
        {/* Logo */}
        <div className="mb-8">
          <FaHome className="w-8 h-8 text-primary" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col items-center gap-6">
          {desktopItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = isActive ? item.icon : item.iconReg;
            
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

        {/* Profile Button at Bottom */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`relative group transition-all ${
              activeTab === 'perfil'
                ? 'text-primary'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Perfil"
          >
            {activeTab === 'perfil' ? <FaUser className="w-7 h-7" /> : <FaRegUser className="w-7 h-7" />}
            {activeTab === 'perfil' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 w-1 h-8 bg-primary rounded-r-full" />
            )}
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute bottom-0 left-full ml-2 mb-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48 z-40">
                <button
                  onClick={() => {
                    handleItemClick('perfil');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FaUser className="w-4 h-4" />
                  <span className="font-medium">Mi Perfil</span>
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
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
            const isActive = activeTab === item.id;
            const Icon = isActive ? item.icon : item.iconReg;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`flex flex-col items-center transition-all ${
                  isActive ? 'text-primary scale-110' : 'text-black'
                }`}
              >
                <Icon className="text-2xl mb-0" />
              </button>
            );
          })}
          
          {/* Profile Button Mobile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex flex-col items-center transition-all ${
                activeTab === 'perfil' ? 'text-primary scale-110' : 'text-black'
              }`}
            >
              {activeTab === 'perfil' ? <FaUser className="text-2xl mb-0" /> : <FaRegUser className="text-2xl mb-0" />}
            </button>

            {/* Profile Menu Dropdown Mobile */}
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48 z-50">
                  <button
                    onClick={() => {
                      handleItemClick('perfil');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FaUser className="w-4 h-4" />
                    <span className="font-medium">Mi Perfil</span>
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span className="font-medium">Cerrar Sesión</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

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
                <FaHome className="text-primary" />
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