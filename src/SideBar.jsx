import React, { useState } from 'react';
import { 
  Home, Map, PlusCircle, Star, User, 
  MessageCircle, LogOut 
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase/firebase';
import UserProfile from './UserProfile';

export default function Sidebar({ activeTab = 'inicio', onTabChange, onLogout, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleItemClick = (itemId) => {
    onTabChange?.(itemId);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      setShowProfileMenu(false);
      await signOut(auth);
    } catch (error) {
      alert('Error al cerrar sesión. Intenta nuevamente.');
    }
  };

  const handleOpenProfile = () => {
    setShowProfileMenu(false);
    setShowProfileModal(true);
  };

  const handleMyPublications = () => {
    onTabChange?.('mis-publicaciones');
  };

  return (
    <>
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-20 lg:bg-white lg:shadow-md lg:flex-col lg:z-200 lg:items-center lg:py-6">
        <div className="mb-8">
          <Home className="w-8 h-8 text-primary" />
        </div>

        <nav className="flex-1 flex flex-col items-center gap-6">
          <button
            onClick={() => handleItemClick('inicio')}
            className={`relative group transition-all ${
              activeTab === 'inicio'
                ? 'text-primary'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Inicio"
          >
            <Home className="w-7 h-7" />
            {activeTab === 'inicio' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 w-1 h-8 bg-primary rounded-r-full" />
            )}
            <span className="absolute left-full ml-4 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Inicio
            </span>
          </button>

          <button
            onClick={() => handleItemClick('favoritos')}
            className={`relative group transition-all ${
              activeTab === 'favoritos'
                ? 'text-primary'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Favoritos"
          >
            <Star className="w-7 h-7" />
            {activeTab === 'favoritos' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 w-1 h-8 bg-primary rounded-r-full" />
            )}
            <span className="absolute left-full ml-4 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Favoritos
            </span>
          </button>

          <button
            onClick={() => handleItemClick('mapa')}
            className={`relative group transition-all ${
              activeTab === 'mapa'
                ? 'text-primary'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Explorar"
          >
            <Map className="w-7 h-7" />
            {activeTab === 'mapa' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 w-1 h-8 bg-primary rounded-r-full" />
            )}
            <span className="absolute left-full ml-4 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Explorar
            </span>
          </button>

          <button
            onClick={() => handleItemClick('publicar')}
            className={`relative group transition-all ${
              activeTab === 'publicar'
                ? 'text-primary'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Publicar"
          >
            <PlusCircle className="w-7 h-7" />
            {activeTab === 'publicar' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 w-1 h-8 bg-primary rounded-r-full" />
            )}
            <span className="absolute left-full ml-4 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Publicar
            </span>
          </button>
        </nav>

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
            <User className="w-7 h-7" />
            {activeTab === 'perfil' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 w-1 h-8 bg-primary rounded-r-full" />
            )}
          </button>

          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute bottom-0 left-full ml-2 mb-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48 z-40">
                <button
                  onClick={handleOpenProfile}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">Mi Perfil</span>
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Navigation Mobile - Con Lucide React */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around px-4 py-3 z-60">
        <button
          onClick={() => handleItemClick('inicio')}
          className="flex flex-col items-center gap-1"
        >
          <Home size={24} className="text-gray-700" />
          <span className="text-xs text-gray-700">Inicio</span>
        </button>
        
        <button
          onClick={() => handleItemClick('mapa')}
          className="flex flex-col items-center gap-1"
        >
          <Map size={24} className="text-gray-700" />
          <span className="text-xs text-gray-700">Mapa</span>
        </button>
        
        <button
          onClick={() => handleItemClick('publicar')}
          className="flex flex-col items-center gap-1"
        >
          <PlusCircle size={24} className="text-gray-700" />
          <span className="text-xs text-gray-700">Publicar</span>
        </button>
        
        <button
          onClick={() => handleItemClick('favoritos')}
          className="flex flex-col items-center gap-1"
        >
          <Star size={24} className="text-gray-700" />
          <span className="text-xs text-gray-700">Favoritos</span>
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex flex-col items-center gap-1"
          >
            <User size={24} className="text-gray-700" />
            <span className="text-xs text-gray-700">Perfil</span>
          </button>

          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48 z-50">
                <button
                  onClick={handleOpenProfile}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">Mi Perfil</span>
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <UserProfile 
          onClose={() => setShowProfileModal(false)}
          onMyPublications={handleMyPublications}
          user={user}
        />
      )}

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
                <Home className="text-primary" />
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
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">Mensajes</span>
              </button>
            </nav>
          </div>
        </>
      )}

      <div className="hidden lg:block lg:w-20" />
    </>
  );
}