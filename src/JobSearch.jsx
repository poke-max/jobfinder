import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, X, Star, FileText, Grid3x3, List } from 'lucide-react';
import { collection, query, orderBy, getDocs, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/firebase';
import JobListItem from './JobListItem';
import JobCard from './JobCard';
import { useAnimatedClose } from './hooks/useAnimatedClose';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

export default function JobSearch({
  user,
  mode = 'search',
  onClose
}) {
  const userId = user?.uid;
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [selectedJob, setSelectedJob] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const { handleClose, getAnimationClass } = useAnimatedClose(onClose);

  const getModeConfig = () => {
    switch (mode) {
      case 'favorites':
        return {
          title: 'Mis Favoritos',
          icon: Star,
          emptyMessage: 'No tienes trabajos guardados',
          emptySubtitle: 'Los trabajos que guardes aparecerán aquí'
        };
      case 'published':
        return {
          title: 'Mis Publicaciones',
          icon: FileText,
          emptyMessage: 'No has publicado trabajos',
          emptySubtitle: 'Tus publicaciones aparecerán aquí'
        };
      default:
        return {
          title: 'Buscar Empleos',
          icon: Search,
          emptyMessage: 'No se encontraron resultados',
          emptySubtitle: 'Intenta ajustar tus filtros o búsqueda'
        };
    }
  };

  const config = getModeConfig();

  useEffect(() => {
    loadJobs();
  }, [mode, userId]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, jobs]);

  useEffect(() => {
    loadSavedJobs();
  }, [userId]);

  const loadJobs = async () => {
    if (!userId && (mode === 'favorites' || mode === 'published')) {
      console.log('No hay usuario autenticado');
      return;
    }

    try {
      setLoading(true);
      let jobsData = [];

      if (mode === 'favorites') {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const savedJobIds = userDoc.data().savedJobs || [];

          if (savedJobIds.length > 0) {
            const validJobIds = savedJobIds.filter(id =>
              id && typeof id === 'string' && id.trim().length > 0
            );

            if (validJobIds.length > 0) {
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

  const loadSavedJobs = async () => {
    if (!userId) return;

    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setSavedJobs(userDoc.data().savedJobs || []);
      }
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    }
  };

  const handleSaveJob = async (jobId) => {
    if (!userId) {
      alert('Debes iniciar sesión para guardar trabajos');
      return;
    }

    try {
      // Actualización optimista del UI
      const isCurrentlySaved = savedJobs.includes(jobId);
      const newSaved = isCurrentlySaved
        ? savedJobs.filter(id => id !== jobId)
        : [...savedJobs, jobId];

      setSavedJobs(newSaved); // Actualizar UI inmediatamente

      // Actualizar en Firestore en segundo plano
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { savedJobs: newSaved });

    } catch (error) {
      console.error('Error saving job:', error);
      // Revertir el cambio si falla
      setSavedJobs(savedJobs);
      alert('Error al guardar el trabajo');
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.skills?.some(skill => skill.toLowerCase().includes(query))
      );
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

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  const IconComponent = config.icon;

  // Si hay un trabajo seleccionado, mostrar el JobCard
  if (selectedJob) {
    return (
      <div className="absolute inset-0 mx-auto max-w-7xl bg-bg z-50">
        {/* Botón de cerrar */}
        <button
          onClick={() => setSelectedJob(null)}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all"
          aria-label="Cerrar"
        >
          <ChevronLeft  strokeWidth={1.5} className="w-7 h-7 text-black" />
        </button>

        <JobCard
          job={selectedJob}
          isSaved={savedJobs.includes(selectedJob.id)}
          onSave={() => handleSaveJob(selectedJob.id)}
          onDismiss={() => setSelectedJob(null)}
          showMap={showMap}
          setShowMap={setShowMap}
        />
      </div>
    );
  }

  return (
    <div className={`fixed bg-white inset-0 z-50 mx-auto max-w-4xl overflow-y-auto animate-fadeIn pb-20`}>
      {/* Header */}
      <div className="sticky top-0 bg-bg border-b border-gray-200 p-3 z-10 ">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronLeft  strokeWidth={1.5} className="w-7 h-7 text-gray-600" />
          </button>

          <h2 className="flex-1 text-lg font-semibold text-gray-500 text-center">{config.title}</h2>

          {/* Botones de vista */}
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${viewMode === 'list'
                    ? 'bg-white shadow-sm text-black'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                aria-label="Vista de lista"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${viewMode === 'grid'
                    ? 'bg-white shadow-sm text-black'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                aria-label="Vista de cuadrícula"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={mode === 'search' ? 'Puesto, empresa, o habilidad...' : 'Buscar...'}
            className="w-full h-12 pl-12 pr-12 bg-gray-100 rounded-xl hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-700"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="p-0">
        <div className="mb-2 text-center text-sm text-gray-600 font-medium">
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
        ) : viewMode === 'list' ? (
          // Vista de Lista
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <JobListItem
                key={job.id}
                job={job}
                formatTimeAgo={formatTimeAgo}
                onClick={() => handleJobClick(job)}
                showPublisherBadge={mode === 'published'}
              />
            ))}
          </div>
        ) : (
          // Vista de Cuadrícula con react-photo-view
          <PhotoProvider
            maskOpacity={0.9}
            bannerVisible={false}
          >
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-[0.1em] space-y-3">
              {filteredJobs.map((job) => {
                const imageUrl = job.url || job.flyerImage || job.image;
                return (
                  <div key={job.id} className="relative break-inside-avoid mb-3">
                    {/* Capa clickeable para abrir JobCard */}
                    <div
                      onClick={() => handleJobClick(job)}
                      className="cursor-pointer group relative overflow-hidden shadow-md hover:shadow-xl transition-all bg-gray-100"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={job.title || 'Flyer'}
                          className="w-full h-auto object-contain group-hover:opacity-95 transition-opacity duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      {/* Placeholder cuando no hay imagen */}
                      <div className={`${imageUrl ? 'hidden' : 'flex'} w-full aspect-[2/3] items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200`}>
                        <div className="text-center p-4">
                          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-xs text-gray-500 font-medium">Sin imagen</p>
                        </div>
                      </div>
                      {/* Overlay con info básica al hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                          <p className="font-semibold text-sm line-clamp-2">
                            {job.title}
                          </p>
                          {job.company && (
                            <p className="text-xs opacity-90 line-clamp-1">
                              {job.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </PhotoProvider>
        )}
      </div>
    </div>
  );
}