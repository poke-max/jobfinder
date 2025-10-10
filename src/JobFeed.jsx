import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Keyboard, Virtual } from 'swiper/modules'; // ← Agregado Virtual
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Home, Map, PlusCircle, Star, User, MapPin, Search, MessageCircle, FileText, Bookmark, MoreHorizontal, GalleryHorizontalEnd, Building2 } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/virtual'; // ← Agregado CSS para virtual
import { saveProgress, getProgress } from './utils/indexedDBHelper';
import { collection, query, limit, startAfter, getDoc, getDocs, doc, setDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { FaTimes, FaSearch, FaMapPin } from 'react-icons/fa';

import JobMapView from './JobMapView';
import JobContactView from './JobContactView';
import JobCard from './JobCard';
import JobChatView from './JobChatView';
import SideBar from './SideBar';
import JobSearch from './JobSearch';
import MapboxComponent from './MapboxComponent';
import PublishComponent from './PublishComponent';
import { db } from './firebase/firebase';

export default function JobFeed({ user, onLogout }) {
  const userId = user?.uid;
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [jobStates, setJobStates] = useState({});
  const [showDetails, setShowDetails] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showGeneralMap, setShowGeneralMap] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [currentTab, setCurrentTab] = useState('inicio');
  const [showSearch, setShowSearch] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showPublished, setShowPublished] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dominantColors, setDominantColors] = useState({});
  const [showSearchBar, setShowSearchBar] = useState(false);
  const swiperEnabledRef = useRef(true);
  const swiperRef = useRef(null);
  const previousIndexRef = useRef(0);
  const lastSavedIndexRef = useRef(0);
  const saveTimerRef = useRef(null);
  const isRestoringRef = useRef(false);
  const handleColorChange = useCallback((jobId, color) => {
    console.log('Color recibido:', color, 'para job:', jobId);
    setDominantColors(prev => ({
      ...prev,
      [jobId]: color
    }));
  }, []);

  // Función para determinar si usar texto blanco o negro
  const getTextColor = (color) => {
    if (!color) return '#ffffff';

    // Extraer valores RGB del string rgba
    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!rgbaMatch) return '#ffffff';

    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);

    // Calcular luminosidad (fórmula estándar)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Si la luminosidad es alta (color claro), usar texto negro, sino blanco
    return luminance > 0.8 ? '#000000' : '#ffffff';
  };

  const toggleSwiper = useCallback(() => {
    if (swiperRef.current) {
      if (swiperEnabledRef.current) {
        // Desactivar
        swiperRef.current.disable();
        swiperEnabledRef.current = false;
      } else {
        // Activar
        swiperRef.current.enable();
        swiperEnabledRef.current = true;
      }
    }
  }, []);
  // ==================== FETCH JOBS ====================
  const {
    data: infiniteJobsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ['jobs'],
    queryFn: async ({ pageParam = null }) => {
      const jobsRef = collection(db, 'jobs');
      const batchSize = 50;

      let q;
      if (pageParam) {
        q = query(jobsRef, orderBy('createdAt', 'desc'), startAfter(pageParam), limit(batchSize));
      } else {
        q = query(jobsRef, orderBy('createdAt', 'desc'), limit(batchSize));
      }

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { jobs: [], nextCursor: null };
      }

      const fetchedJobs = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      return {
        jobs: fetchedJobs,
        nextCursor: snapshot.docs[snapshot.docs.length - 1]
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: Infinity,
    gcTime: Infinity, // ← Cambiado de cacheTime
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const jobs = useMemo(() =>
    infiniteJobsData?.pages.flatMap(page => page.jobs) || [],
    [infiniteJobsData]
  );

  // ==================== FETCH USER DATA ====================
  const { data: userData } = useQuery({
    queryKey: ['userData', userId],
    queryFn: async () => {
      if (!userId) return { saved: [] };
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? { saved: userDoc.data().savedJobs || [] } : { saved: [] };
    },
    enabled: !!userId,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const savedJobs = useMemo(() =>
    new Set(userData?.saved || []),
    [userData?.saved]
  );

  // ==================== MUTATIONS ====================
  const dismissMutation = useMutation({
    mutationFn: async (jobId) => {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      const currentDismissed = userDoc.exists() ? (userDoc.data().dismissedJobs || []) : [];

      if (!currentDismissed.includes(jobId)) {
        currentDismissed.push(jobId);
      }

      await setDoc(userDocRef, {
        dismissedJobs: currentDismissed,
        updatedAt: serverTimestamp()
      }, { merge: true });

      return jobId;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async ({ jobId, isSaved }) => {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      let currentSaved = userDoc.exists() ? (userDoc.data().savedJobs || []) : [];

      if (isSaved) {
        currentSaved = currentSaved.filter(id => id !== jobId);
      } else {
        if (!currentSaved.includes(jobId)) {
          currentSaved.push(jobId);
        }
      }

      await setDoc(userDocRef, {
        savedJobs: currentSaved,
        updatedAt: serverTimestamp()
      }, { merge: true });

      return { jobId, isSaved: !isSaved };
    },
    onMutate: async ({ jobId, isSaved }) => {
      await queryClient.cancelQueries(['userData', userId]);
      const previousData = queryClient.getQueryData(['userData', userId]);

      queryClient.setQueryData(['userData', userId], (old) => {
        const saved = old?.saved || [];
        return {
          ...old,
          saved: isSaved ? saved.filter(id => id !== jobId) : [...saved, jobId]
        };
      });

      setJobStates(prev => ({
        ...prev,
        [jobId]: { ...prev[jobId], justSaved: !isSaved }
      }));

      setTimeout(() => {
        setJobStates(prev => ({
          ...prev,
          [jobId]: { ...prev[jobId], justSaved: false }
        }));
      }, 600);

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['userData', userId], context.previousData);
    },
  });

  // ==================== HANDLERS (Memoizados) ====================
  const handleDismiss = useCallback((jobId) => {
    dismissMutation.mutate(jobId);
  }, [dismissMutation]);

  const handleSave = useCallback((jobId) => {
    const isSaved = savedJobs.has(jobId);
    saveMutation.mutate({ jobId, isSaved });
  }, [savedJobs, saveMutation]);

  const saveProgressDebounced = useCallback((index, jobId) => {
    // Solo guardar si avanzó al menos 2 slides
    if (Math.abs(index - lastSavedIndexRef.current) < 1) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        // Guardar en IndexedDB (inmediato)
        await saveProgress(userId, jobId, index, currentJob?.createdAt); // ← Pasar createdAt
        lastSavedIndexRef.current = index;

        // Guardar en Firestore cada 10 slides (backup)
        if (index % 1 === 0) {
          const userDocRef = doc(db, 'users', userId);
          await setDoc(userDocRef, {
            lastViewedJob: {
              jobId,
              index,
              timestamp: Date.now(),
              jobCreatedAt: currentJob?.createdAt || null  // ← NUEVO CAMPO
            }
          }, { merge: true });
        }
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }, 1000); // Debounce de 1 segundo
  }, [userId, jobs]);

  const handleSlideChange = useCallback((swiper) => {
    if (isRestoringRef.current) return; // No procesar durante restauración

    const newIndex = swiper.activeIndex;
    const previousIndex = previousIndexRef.current;

    if (newIndex === previousIndex + 1 && jobs[previousIndex]) {
      handleDismiss(jobs[previousIndex].id);
    }

    setCurrentIndex(newIndex);
    previousIndexRef.current = newIndex;

    // Guardar progreso
    if (jobs[newIndex]) {
      saveProgressDebounced(newIndex, jobs[newIndex].id);
    }

    // Prefetch más agresivo
    if (newIndex >= jobs.length - 30 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }

    // Limpiar estados antiguos (memoria)
    if (newIndex > 20) {
      setJobStates(prev => {
        const newStates = { ...prev };
        Object.keys(newStates).forEach(key => {
          const jobIndex = jobs.findIndex(j => j.id === key);
          if (jobIndex !== -1 && jobIndex < newIndex - 20) {
            delete newStates[key];
          }
        });
        return newStates;
      });

      setShowDetails(prev => {
        const newDetails = { ...prev };
        Object.keys(newDetails).forEach(key => {
          const jobIndex = jobs.findIndex(j => j.id === key);
          if (jobIndex !== -1 && jobIndex < newIndex - 20) {
            delete newDetails[key];
          }
        });
        return newDetails;
      });
    }
  }, [jobs, hasNextPage, isFetchingNextPage, fetchNextPage, handleDismiss, saveProgressDebounced]);

  const handleTabChange = useCallback((tab) => {
    setCurrentTab(tab);
    setShowGeneralMap(false);
    setShowPublish(false);
    setShowSearch(false);
    setShowFavorites(false);
    setShowPublished(false);

    switch (tab) {
      case 'mapa':
        setShowGeneralMap(true);
        break;
      case 'publicar':
        setShowPublish(true);
        break;
      case 'favoritos':
        setShowFavorites(true);
        break;
      case 'buscar':
        setShowSearch(true);
        break;
      case 'publicaciones':
        setShowPublished(true);
        break;
      default:
        break;
    }
  }, []);

  // ==================== SEARCH ====================
  const searchInFirebase = useCallback(async (searchText) => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const allJobsForSearch = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      const keywords = searchText.toLowerCase().split(' ').filter(k => k.trim());

      const filtered = allJobsForSearch.filter(job => {
        const searchableText = [
          job.title,
          job.company,
          job.description,
          job.city,
          job.direction,
          job.position,
          job.type
        ].filter(Boolean).join(' ').toLowerCase();

        return keywords.every(keyword => searchableText.includes(keyword));
      });

      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching:', error);
    }
    setIsSearching(false);
  }, []);

  const getFilteredJobs = useCallback(() => {
    if (!searchQuery.trim()) return jobs;
    return searchResults;
  }, [searchQuery, jobs, searchResults]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchInFirebase(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchInFirebase]);

  // Después de tus otros useEffect
  useEffect(() => {
    const preloadImages = async () => {
      // Solo precarga los próximos 3-5 slides (los que realmente puede ver)
      const preloadCount = 5; // ← Ajustable

      for (let i = currentIndex + 1; i <= Math.min(currentIndex + preloadCount, jobs.length - 1); i++) {
        const job = jobs[i];
        if (job?.imageUrl) {
          const img = new Image();
          img.src = job.imageUrl;
        }
      }
    };
    preloadImages();
  }, [currentIndex, jobs]);



  // Restaurar posición al cargar
  useEffect(() => {
    const restorePosition = async () => {
      if (!userId || !swiperRef.current || jobs.length === 0) return;

      try {
        isRestoringRef.current = true;

        // 1. Leer de IndexedDB primero (rápido)
        const localProgress = await getProgress(userId);

        // 2. Leer de Firestore (backup)
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        const firestoreProgress = userDoc.exists() ? userDoc.data().lastViewedJob : null;

        // 3. Usar el más reciente
        let progressToUse = localProgress;
        if (firestoreProgress && (!localProgress || firestoreProgress.timestamp > localProgress.timestamp)) {
          progressToUse = firestoreProgress;
        }

        if (!progressToUse) {
          isRestoringRef.current = false;
          return;
        }

        // 4. Buscar el job por ID
        const foundIndex = jobs.findIndex(j => j.id === progressToUse.lastJobId);

        if (foundIndex !== -1) {
          // Job encontrado, ir a esa posición
          swiperRef.current.slideTo(foundIndex, 0); // 0 = sin animación
          setCurrentIndex(foundIndex);
          previousIndexRef.current = foundIndex;
          lastSavedIndexRef.current = foundIndex;
        } else if (progressToUse.lastIndex < jobs.length) {
          // Job no encontrado, usar índice como fallback
          swiperRef.current.slideTo(progressToUse.lastIndex, 0);
          setCurrentIndex(progressToUse.lastIndex);
          previousIndexRef.current = progressToUse.lastIndex;
          lastSavedIndexRef.current = progressToUse.lastIndex;
        }

        // Pequeño delay para asegurar que Swiper procesó el cambio
        setTimeout(() => {
          isRestoringRef.current = false;
        }, 100);

      } catch (error) {
        console.error('Error restoring position:', error);
        isRestoringRef.current = false;
      }
    };

    // Solo ejecutar cuando los jobs estén cargados
    if (jobs.length > 0 && !isRestoringRef.current) {
      restorePosition();
    }
  }, [jobs.length, userId]); // Dependencias mínimas

  // Guardar progreso al cerrar/salir
useEffect(() => {
  const saveCurrentProgress = async () => {
    if (jobs[currentIndex]) {
      const currentJob = jobs[currentIndex];
      await saveProgress(userId, currentJob.id, currentIndex, currentJob.createdAt);
      
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        lastViewedJob: {
          jobId: currentJob.id,
          index: currentIndex,
          timestamp: Date.now(),
          jobCreatedAt: currentJob.createdAt || null
        }
      }, { merge: true });
    }
  };

  // Para móviles (más confiable)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      saveCurrentProgress();
    }
  };

  // Para desktop (backup)
  const handleBeforeUnload = () => {
    saveCurrentProgress();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [currentIndex, jobs, userId]);

  // ==================== RENDER ====================
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center text-white p-4">
          <p className="text-xl mb-2">Usuario no autenticado</p>
          <p className="text-sm text-gray-400">Por favor inicia sesión para continuar</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center text-white p-4">
          <FaTimes className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl mb-2">Error al cargar empleos</p>
          <p className="text-sm text-gray-400">{error?.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="flex z-50 inset-0 items-center justify-center min-h-screen"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)'
        }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderTopColor: 'white'
            }}
          ></div>
          <p className="text-white text-sm">Cargando empleos...</p>
        </div>
      </div>
    );
  }

  const filteredJobs = getFilteredJobs();

  if (filteredJobs.length === 0 && !searchQuery) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center text-gray-700">
          <p className="text-xl mb-2">No hay empleos disponibles</p>
          <p className="text-sm text-gray-400">Vuelve más tarde</p>
        </div>
      </div>
    );
  }

  const currentJob = filteredJobs[currentIndex];
  const isSaved = currentJob ? savedJobs.has(currentJob.id) : false;
  const justSaved = currentJob ? jobStates[currentJob.id]?.justSaved : false;
  const currentJobColor = dominantColors[currentJob?.id] || 'rgba(255, 255, 255, 1)';
  const headerTextColor = getTextColor(currentJobColor);
  return (
    <>
      <div className="relative w-full mx-auto h-dvh overflow-hidden flex flex-col animate-fadeIn">
        {/* Header con nombre de app y búsqueda */}

        <div className="flex overflow-hidden m-0">
          <Swiper
            direction="vertical"
            slidesPerView={1}
            mousewheel={true}
            keyboard={{ enabled: true }}
            onSlideChange={handleSlideChange}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            modules={[Mousewheel, Keyboard, Virtual]} // ← Agregado Virtual
            virtual={{
              enabled: true,
              addSlidesBefore: 2,
              addSlidesAfter: 2,
            }}
            className="w-full h-full m-0 p-0"
            resistance={true}
            resistanceRatio={0.85}

          >
            {filteredJobs.map((job, index) => {
              const isSavedJob = savedJobs.has(job.id);
              const justSavedJob = jobStates[job.id]?.justSaved;

              return (
                <SwiperSlide key={job.id} virtualIndex={index}>
                  <div className="flex items-center justify-center h-full m-0 ">
                    <JobCard
                      job={job}
                      isSaved={isSavedJob}
                      justSaved={justSavedJob}
                      showDetails={showDetails[job.id]}
                      onToggleDetails={() =>
                        setShowDetails(prev => ({ ...prev, [job.id]: !prev[job.id] }))
                      }
                      onDismiss={() => handleDismiss(job.id)}
                      onSave={() => handleSave(job.id)}
                      showMap={showMap}
                      setShowMap={setShowMap}
                      onColorChange={(color) => handleColorChange(job.id, color)}
                      parentSwiperRef={swiperRef}
                    />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>


        {/* 
        {currentTab === 'inicio' && (
          <>
            {showMap && (
              <JobMapView job={currentJob} onClose={() => setShowMap(false)} />
            )}
            {showChat && (
              <JobContactView job={currentJob} onClose={() => setShowChat(false)} />
            )}
          </>
        )}
 */}
        {isFetchingNextPage && (
          <div className="absolute bottom-24 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <div className="bg-primary text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-pulse">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span className="font-medium">Cargando más trabajos...</span>
            </div>
          </div>
        )}

        {!hasNextPage && filteredJobs.length > 0 && !searchQuery && (
          <div className="absolute bottom-24 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <div className="bg-gray-700 text-white px-6 py-3 rounded-full shadow-lg">
              <span className="text-sm">Has visto todos los trabajos disponibles</span>
            </div>
          </div>
        )}

        <div className="flex-shrink-0  z-90 h-[4em] lg:h-[0em] z-0"></div>

        {searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-0">
            <div className="text-center p-6">
              <FaMapPin className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <p className="text-xl text-gray-800 font-semibold mb-2">
                No se encontraron resultados
              </p>
              <p className="text-gray-500">para "{searchQuery}"</p>
            </div>
          </div>
        )}

        {showSearch && (
          <JobSearch
            user={user}
            mode="search"
            onClose={() => {
              setShowSearch(false);
              setCurrentTab('inicio');
            }}
          />
        )}

        {showFavorites && (
          <JobSearch
            user={user}
            mode="favorites"
            onClose={() => {
              setShowFavorites(false);
              setCurrentTab('inicio');
            }}
          />
        )}

        {showPublished && (
          <JobSearch
            user={user}
            mode="published"
            onClose={() => {
              setShowPublished(false);
              setCurrentTab('inicio');
            }}
          />
        )}

        {showGeneralMap && (
          <MapboxComponent
            onClose={() => {
              setShowGeneralMap(false);
              setCurrentTab('inicio');
            }}
          />
        )}

        {showPublish && (
          <PublishComponent
            userId={userId}
            onClose={() => {
              setShowPublish(false);
              setCurrentTab('inicio');
            }}
            onSuccess={() => {
              queryClient.invalidateQueries(['jobs']);
            }}
          />
        )}
      </div>

      <SideBar
        activeTab={currentTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}  // ← Agrega esto
        user={user}
      />

      {!showMap && (


        <div className="job-search-header">
          {showSearchBar ? (
            <div className="job-search-wrapper">
              <div className="job-search-input-container">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar empleos..."
                  style={{
                    color: headerTextColor,
                    '--placeholder-color': headerTextColor,
                    '--placeholder-opacity': 0.6
                  }}
                  className="job-search-input"
                  autoFocus
                />
                <Search
                  className="job-search-icon"
                  style={{ color: headerTextColor }}
                />
                <div className="job-search-actions">
                  {isSearching && (
                    <div
                      className="job-search-spinner"
                      style={{ borderBottomColor: headerTextColor }}
                    ></div>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchBar(false);
                    }}
                    className="job-search-close"
                    aria-label="Cerrar búsqueda"
                  >
                    <X style={{ color: headerTextColor }} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="job-search-collapsed">
              <h2 style={{ color: headerTextColor }} className="job-search-title pl-2">
                AppName
              </h2>
              <button
                onClick={() => setShowSearchBar(true)}
                className="job-search-toggle"
              >
                <Search size={24} strokeWidth={1.5} style={{ color: headerTextColor }} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}