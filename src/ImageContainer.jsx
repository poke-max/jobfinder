import { Home, Map, PlusCircle, Star, User, MapPin, Search, MessageCircle, FileText, Bookmark, MoreHorizontal, GalleryHorizontalEnd, Building2 } from 'lucide-react';

function ImageContainer() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=375&h=812&fit=crop"
        alt="Paisaje de montaña"
        className="w-full h-full object-cover"
      />
      
      {/* Header con nombre de app y búsqueda */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
        <h2 className="text-white text-xl font-semibold">Mandala</h2>
        <button>
          <Search size={24} strokeWidth={1.5} className="text-white" />
        </button>
      </div>
      

     {/* Bullets indicadores */}
      <div className="absolute bottom-[%] left-0 right-0 flex justify-center gap-2 pb-4">
        <div className="w-2 h-2 rounded-full bg-white"></div>
        <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
        <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
        <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-white flex flex-col px-4 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button>
              <GalleryHorizontalEnd size={26} strokeWidth={1.5} className="text-black" />
            </button>
            <button>
              <MapPin size={26} strokeWidth={1.5} className="text-black" />
            </button>
            <button>
              <MessageCircle size={26} strokeWidth={1.5} className="text-black" />
            </button>
            <button>
              <MoreHorizontal size={26} strokeWidth={1.5} className="text-black" />
            </button>
          </div>
          <button>
            <Bookmark size={26} strokeWidth={1.5} className="text-black" />
          </button>
        </div>
        
        <div className="mt-3 flex flex-col">
          <h1 className="text-black text-md font-semibold">Montañas de ejemplo</h1>
          <div className="flex items-center gap-1 mt-1">
            <Building2 size={12} strokeWidth={1.5} className="text-gray-400" />
            <p className="text-gray-400 text-sm">Asunción</p>
          </div>
          <p className="text-gray-400 text-sm mt-3">19 de septiembre</p>
        </div>
      </div>
      
      {/* Barra de navegación inferior */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around px-4 py-3">
        <button className="flex flex-col items-center gap-1">
          <Home size={24} className="text-gray-700" />
          <span className="text-xs text-gray-700">Inicio</span>
        </button>
        
        <button className="flex flex-col items-center gap-1">
          <Map size={24} className="text-gray-700" />
          <span className="text-xs text-gray-700">Mapa</span>
        </button>
        
        <button className="flex flex-col items-center gap-1">
          <PlusCircle size={24} className="text-gray-700" />
          <span className="text-xs text-gray-700">Publicar</span>
        </button>
        
        <button className="flex flex-col items-center gap-1">
          <Star size={24} className="text-gray-700" />
          <span className="text-xs text-gray-700">Favoritos</span>
        </button>
        
        <button className="flex flex-col items-center gap-1">
          <User size={24} className="text-gray-700" />
          <span className="text-xs text-gray-700">Perfil</span>
        </button>
      </div>
    </div>
  );
}

export { ImageContainer };
export default ImageContainer;