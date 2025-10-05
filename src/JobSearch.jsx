import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaMapMarkerAlt, FaDollarSign, FaClock, FaBriefcase, FaFilter, FaChevronDown, FaHeart, FaFileAlt } from 'react-icons/fa';
import { collection, query, orderBy, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/firebase';
import JobListItem from './JobListItem';
import { MdArrowBackIos } from "react-icons/md";
import { useAnimatedClose } from './hooks/useAnimatedClose';

export default function JobSearch({ 
  user, 
  mode = 'search', // 'search', 'favorites', 'published'
  onClose 
}) {
  const userId = user?.uid;
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    radius: 25,
    salaryMin: 0,
    salaryMax: 100000,
    employmentType: [],
    datePosted: 'all',
    remote: false
  });

  const employmentTypes = ['Tiempo completo', 'Medio tiempo', 'Freelance', 'Pasantía'];
  const dateOptions = [
    { value: 'all', label: 'Cualquier momento' },
    { value: '24h', label: 'Últimas 24 horas' },
    { value: '7d', label: 'Última semana' },
    { value: '30d', label: 'Último mes' }
  ];
  const { handleClose, getAnimationClass } = useAnimatedClose(onClose);

  // Configuración según el modo
  const getModeConfig = () => {
    switch(mode) {
      case 'favorites':
        return {
          title: 'Mis Favoritos',
          icon: FaHeart,
          emptyMessage: 'No tienes trabajos guardados',
          emptySubtitle: 'Los trabajos que guardes aparecerán aquí'
        };
      case 'published':
        return {
          title: 'Mis Publicaciones',
          icon: FaFileAlt,
          emptyMessage: 'No has publicado trabajos',
          emptySubtitle: 'Tus publicaciones aparecerán aquí'
        };
      default:
        return {
          title: 'Buscar Empleos',
          icon: FaSearch,
          emptyMessage: 'No se encontraron resultados',
          emptySubtitle: 'Intenta ajustar tus filtros o búsqueda'
        };
    }
  };

  const config = getModeConfig();

  // Cargar trabajos según el modo
  useEffect(() => {
    loadJobs();
  }, [mode, userId]);

  // Aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, jobs]);

  const loadJobs = async () => {
    if (!userId && (mode === 'favorites' || mode === 'published')) {
      console.log('No hay usuario autenticado');
      return;
    }

    try {
      setLoading(true);
      let jobsData = [];

    if (mode === 'favorites') {
            // Cargar trabajos favoritos del usuario
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const savedJobIds = userDoc.data().savedJobs || [];
              
              if (savedJobIds.length > 0) {
                // Validar y filtrar IDs válidos
                const validJobIds = savedJobIds.filter(id => 
                  id && typeof id === 'string' && id.trim().length > 0
                );
                
                if (validJobIds.length > 0) {
                  // Cargar cada trabajo guardado
                  const jobPromises = validJobIds.map(async (jobId) => {
                    try {
                      const jobDocRef = doc(db, 'jobs', jobId);
                      const jobDoc = await getDoc(jobDocRef);
                      if (jobDoc.exists()) {
                        return { id: jobDoc.id, ...jobDoc.data() };
                      }
                    } catch (error) {
                      console.error(`Error loading job ${jobId}:`, error);
                    }
                    return null;
                  });
                  
                  const jobsResults = await Promise.all(jobPromises);
                  jobsData = jobsResults.filter(job => job !== null);
                }
              }
            }
          } else if (mode === 'published') {
            // Cargar trabajos publicados por el usuario
            const jobsRef = collection(db, 'jobs');
            const q = query(
              jobsRef, 
              where('publisherId', '==', userId),
              orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            
            jobsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          } else {
            // Modo búsqueda normal - cargar todos los trabajos
            const jobsRef = collection(db, 'jobs');
            const q = query(jobsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            
            jobsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          }
          
          setJobs(jobsData);
          setFilteredJobs(jobsData);
          setLoading(false);
        } catch (error) {
          console.error('Error loading jobs:', error);
          setLoading(false);
        }
      };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Filtro de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.skills?.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Filtro de ubicación
    if (filters.location.trim()) {
      const location = filters.location.toLowerCase();
      filtered = filtered.filter(job => 
        job.location?.toLowerCase().includes(location) ||
        job.city?.toLowerCase().includes(location)
      );
    }

    // Filtro de remoto
    if (filters.remote) {
      filtered = filtered.filter(job => job.remote === true);
    }

    // Filtro de salario
    if (filters.salaryMin > 0) {
      filtered = filtered.filter(job => {
        const salary = job.salary || job.salaryMin || 0;
        return salary >= filters.salaryMin;
      });
    }

    if (filters.salaryMax < 100000) {
      filtered = filtered.filter(job => {
        const salary = job.salary || job.salaryMax || 0;
        return salary <= filters.salaryMax;
      });
    }

    // Filtro de tipo de empleo
    if (filters.employmentType.length > 0) {
      filtered = filtered.filter(job => 
        filters.employmentType.includes(job.employmentType)
      );
    }

    // Filtro de fecha
    if (filters.datePosted !== 'all') {
      const now = new Date();
      const timeRanges = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      };
      
      const range = timeRanges[filters.datePosted];
      if (range) {
        filtered = filtered.filter(job => {
          const jobDate = job.createdAt?.toDate ? job.createdAt.toDate() : new Date(job.createdAt);
          return (now - jobDate) <= range;
        });
      }
    }

    setFilteredJobs(filtered);
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Fecha desconocida';
    
    const jobDate = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffMs = now - jobDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Hace menos de 1h';
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 30) return `Hace ${diffDays} días`;
    return 'Hace más de un mes';
  };

  const toggleEmploymentType = (type) => {
    setFilters(prev => ({
      ...prev,
      employmentType: prev.employmentType.includes(type)
        ? prev.employmentType.filter(t => t !== type)
        : [...prev.employmentType, type]
    }));
  };

  const activeFiltersCount = 
    (filters.location ? 1 : 0) +
    (filters.salaryMin > 0 ? 1 : 0) +
    (filters.employmentType.length > 0 ? 1 : 0) +
    (filters.datePosted !== 'all' ? 1 : 0) +
    (filters.remote ? 1 : 0);

  const resetFilters = () => {
    setFilters({
      location: '',
      radius: 25,
      salaryMin: 0,
      salaryMax: 100000,
      employmentType: [],
      datePosted: 'all',
      remote: false
    });
  };

  const handleJobClick = (job) => {
    console.log('Job clicked:', job);
  };

  const IconComponent = config.icon;

  return (
    <div className={`absolute inset-0 bg-bg z-50 overflow-y-auto ${getAnimationClass()}`}>
      {/* Header */}
      <div className="sticky top-0 bg-bg border-b border-gray-200 p-4 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <MdArrowBackIos className="w-5 h-5 text-gray-600" />
          </button>
          <IconComponent className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-gray-800">{config.title}</h2>
        </div>

        {/* Search Bar - Solo en modo búsqueda */}
        {mode === 'search' && (
          <>
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Puesto, empresa, o habilidad..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="mt-3 w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-2">
                <FaFilter className="w-4 h-4 text-primary" />
                <span className="text-gray-700">Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <FaChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </>
        )}

        {/* Search bar simple para favoritos y publicados */}
        {(mode === 'favorites' || mode === 'published') && (
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en esta lista..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
      </div>

      {/* Filters Panel - Solo en modo búsqueda */}
      {mode === 'search' && showFilters && (
        <div className="p-4 space-y-6 bg-gray-50 border-b border-gray-200">
          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700">
              <FaMapMarkerAlt className="text-primary" />
              Ubicación
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              placeholder="Ciudad o código postal"
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Radio: {filters.radius} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={filters.radius}
                onChange={(e) => setFilters({...filters, radius: parseInt(e.target.value)})}
                className="w-full accent-primary"
              />
            </div>
          </div>

          {/* Remote Option */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.remote}
              onChange={(e) => setFilters({...filters, remote: e.target.checked})}
              className="w-5 h-5 rounded accent-primary"
            />
            <span className="text-sm text-gray-700">Solo trabajos remotos</span>
          </label>

          {/* Salary Range */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700">
              <FaDollarSign className="text-secondary" />
              Rango Salarial
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={filters.salaryMin}
                onChange={(e) => setFilters({...filters, salaryMin: parseInt(e.target.value) || 0})}
                placeholder="Mínimo"
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={filters.salaryMax}
                onChange={(e) => setFilters({...filters, salaryMax: parseInt(e.target.value) || 0})}
                placeholder="Máximo"
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Employment Type */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700">
              <FaBriefcase className="text-primary" />
              Tipo de Empleo
            </label>
            <div className="flex flex-wrap gap-2">
              {employmentTypes.map(type => (
                <button
                  key={type}
                  onClick={() => toggleEmploymentType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    filters.employmentType.includes(type)
                      ? 'bg-primary text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Date Posted */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700">
              <FaClock className="text-secondary" />
              Fecha de Publicación
            </label>
            <div className="grid grid-cols-2 gap-2">
              {dateOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilters({...filters, datePosted: option.value})}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filters.datePosted === option.value
                      ? 'bg-secondary text-gray-800'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="w-full py-3 text-red-500 hover:bg-red-50 rounded-lg transition font-medium"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      )}

      {/* Search Results */}
      <div className="p-4">
        <div className="mb-4 text-sm text-gray-600 font-medium">
          {searchQuery 
            ? `${filteredJobs.length} resultados para "${searchQuery}"` 
            : `${filteredJobs.length} ${mode === 'favorites' ? 'favoritos' : mode === 'published' ? 'publicaciones' : 'trabajos disponibles'}`
          }
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <IconComponent className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">{config.emptyMessage}</p>
            <p className="text-sm">{config.emptySubtitle}</p>
          </div>
        ) : (
          /* Result Cards */
          filteredJobs.map((job) => (
            <JobListItem
              key={job.id}
              job={job}
              formatTimeAgo={formatTimeAgo}
              onClick={() => handleJobClick(job)}
              showPublisherBadge={mode === 'published'}
            />
          ))
        )}
      </div>

      {/* Bottom Action */}
      {filteredJobs.length > 0 && (
        <div className="sticky bottom-14 p-4 bg-gradient-to-t from-bg via-bg to-transparent">
          <button
            onClick={onClose}
            className="w-full py-4 bg-primary hover:bg-primary-light text-white rounded-xl font-semibold transition shadow-lg"
          >
            {mode === 'search' 
              ? `Ver ${filteredJobs.length} Resultado${filteredJobs.length !== 1 ? 's' : ''} en Feed`
              : 'Cerrar'
            }
          </button>
        </div>
      )}
    </div>
  );
}