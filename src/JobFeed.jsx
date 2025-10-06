import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Keyboard } from 'swiper/modules';


import 'swiper/css';
import 'swiper/css/pagination';

import { getFirestore, collection, query, limit, startAfter, getDoc, getDocs, doc, setDoc, serverTimestamp, where, orderBy } from 'firebase/firestore';
import { FaTimes, FaRegPaperPlane, FaRegMap, FaRegStar, FaStepBackward, FaComments, FaPaperPlane, FaRobot, FaStar, FaMapPin, FaLocationArrow, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { IoArrowUndoSharp } from "react-icons/io5";

import JobMapView from './JobMapView';
import JobCard from './JobCard';
import JobChatView from './JobChatView';
import SideBar from './SideBar';
import JobSearch from './JobSearch';
import MapboxComponent from './MapboxComponent';
import PublishComponent from './PublishComponent';
import JobContactView from './JobContactView';
import { db } from './firebase/firebase';


export default function JobFeed({ user, onLogout }) {
  const userId = user?.uid;

  const [jobs, setJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [jobStates, setJobStates] = useState({});
  const [showDetails, setShowDetails] = useState({});
  const [lastDoc, setLastDoc] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [dismissedJobs, setDismissedJobs] = useState(new Set());
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGeneralMap, setShowGeneralMap] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [currentTab, setCurrentTab] = useState('inicio');
  const [showSearch, setShowSearch] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showPublished, setShowPublished] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showButtonsAnimation, setShowButtonsAnimation] = useState(true);

  const swiperRef = useRef(null);
  const viewTimerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus en input al abrir chat
  useEffect(() => {
    if (showChat) {
      inputRef.current?.focus();
    }
  }, [showChat]);

  // Cargar interacciones cuando hay userId
  useEffect(() => {
    if (userId) {
      loadUserInteractions(userId);
      loadJobs();
    }
  }, [userId]);

  // Cargar trabajos desde Firestore
  const loadJobs = async () => {
    try {
      setLoading(true);

      const jobsRef = collection(db, 'jobs');

      let q;
      if (lastDoc) {
        q = query(
          jobsRef,
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(10)
        );
      } else {
        q = query(
          jobsRef,
          orderBy('createdAt', 'desc'),
          limit(10)
        );
      }

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('No hay más trabajos disponibles');
        setLoading(false);
        return;
      }

      const newJobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const filteredJobs = newJobs.filter(job => !dismissedJobs.has(job.id));

      setJobs(prev => lastDoc ? [...prev, ...filteredJobs] : filteredJobs);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setLoading(false);

    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Error al cargar trabajos: ' + error.message);
      setLoading(false);
    }
  };

  // Cargar interacciones del usuario
  const loadUserInteractions = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        const dismissedArray = userData.dismissedJobs || [];
        setDismissedJobs(new Set(dismissedArray));

        const savedArray = userData.savedJobs || [];
        setSavedJobs(new Set(savedArray));
      }
    } catch (error) {
      console.error('Error loading interactions:', error);
    }
  };

  // Detectar cuando el trabajo es visible
  useEffect(() => {
    if (!jobs[currentIndex] || !userId) return;

    const jobId = jobs[currentIndex].id;

    viewTimerRef.current = setTimeout(() => {
      markAsViewed(jobId);
    }, 3000);

    return () => {
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
      }
    };
  }, [currentIndex, userId]);

  // Marcar como visto
  const markAsViewed = async (jobId) => {
    if (jobStates[jobId]?.viewed) return;

    setJobStates(prev => ({
      ...prev,
      [jobId]: { ...prev[jobId], viewed: true }
    }));

    try {
      const interactionRef = doc(db, 'user_interactions', `${userId}_${jobId}`);
      await setDoc(interactionRef, {
        userId,
        jobId,
        viewed: true,
        viewedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error marking as viewed:', error);
    }
  };

  // Descartar trabajo
  const handleDismiss = async (jobId) => {
    setDismissedJobs(prev => new Set([...prev, jobId]));

    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      let currentDismissed = [];
      if (userDoc.exists()) {
        currentDismissed = userDoc.data().dismissedJobs || [];
      }

      if (!currentDismissed.includes(jobId)) {
        currentDismissed.push(jobId);

        await setDoc(userDocRef, {
          dismissedJobs: currentDismissed,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      const interactionRef = doc(db, 'user_interactions', `${userId}_${jobId}`);
      await setDoc(interactionRef, {
        userId,
        jobId,
        dismissed: true,
        dismissedAt: serverTimestamp()
      }, { merge: true });

      // Ir al siguiente slide
      if (swiperRef.current) {
        swiperRef.current.slideNext();
      }
    } catch (error) {
      console.error('Error dismissing:', error);
    }
  };

  // Guardar trabajo
  const handleSave = async (jobId) => {
    const isSaved = savedJobs.has(jobId);

    if (isSaved) {
      setSavedJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    } else {
      setSavedJobs(prev => new Set([...prev, jobId]));

      setJobStates(prev => ({
        ...prev,
        [jobId]: { ...prev[jobId], justSaved: true }
      }));

      setTimeout(() => {
        setJobStates(prev => ({
          ...prev,
          [jobId]: { ...prev[jobId], justSaved: false }
        }));
      }, 600);
    }

    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      let currentSaved = [];
      if (userDoc.exists()) {
        currentSaved = userDoc.data().savedJobs || [];
      }

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

      const interactionRef = doc(db, 'user_interactions', `${userId}_${jobId}`);
      await setDoc(interactionRef, {
        userId,
        jobId,
        saved: !isSaved,
        savedAt: !isSaved ? serverTimestamp() : null
      }, { merge: true });
    } catch (error) {
      console.error('Error saving:', error);
    }
  };


  // Enviar mensaje
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    setIsTyping(true);
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'Gracias por tu pregunta. Esta es una versión demo del chat. Pronto podrás interactuar con información real del empleo.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTabChange = (tab) => {
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
  };

  // Handler cuando cambia el slide
  const loadJobsDebounced = useRef(null);

  const handleSlideChange = (swiper) => {
    const newIndex = swiper.activeIndex;
    setCurrentIndex(newIndex);

    // Ocultar botones temporalmente y reiniciar animación
    setShowButtonsAnimation(false);
    setTimeout(() => {
      setShowButtonsAnimation(true);
    }, 50); // Pequeño delay para forzar re-render

    // Cargar más trabajos con debounce
    if (newIndex >= jobs.length - 2) {
      if (loadJobsDebounced.current) {
        clearTimeout(loadJobsDebounced.current);
      }
      loadJobsDebounced.current = setTimeout(() => {
        loadJobs();
      }, 300);
    }
  };


  const searchInFirebase = async (searchText) => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const allJobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const keywords = searchText.toLowerCase().split(' ').filter(k => k.trim());

      const filtered = allJobs.filter(job => {
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
  };

  // Modificar getFilteredJobs para usar resultados de búsqueda
  // ✅ CORRECTO
  const getFilteredJobs = () => {
    if (!searchQuery.trim()) return jobs;
    return searchResults; // Retorna searchResults directamente (puede estar vacío si no hay coincidencias)
  };


  // Usar con debounce en el input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchInFirebase(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center text-white p-4">
          <FaTimes className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl mb-2">Error</p>
          <p className="text-sm text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Cargando empleos...</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center text-white">
          <p className="text-2xl mb-4">👀</p>
          <p className="text-lg mb-2">No hay trabajos disponibles</p>
          <p className="text-sm text-gray-400">Vuelve pronto para ver nuevas oportunidades</p>
          <button
            onClick={() => loadJobs()}
            className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  const currentJob = jobs[currentIndex];
  const isSaved = savedJobs.has(currentJob?.id);
  const justSaved = jobStates[currentJob?.id]?.justSaved;

  return (
    <>
      <div className="relative w-full h-dvh bg-bg overflow-hidden flex flex-col">
        {/* Barra de búsqueda FIJA arriba */}
        <div className="flex-shrink-0 z-50 p-4">
          <div className="relative max-w-lg mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar empleos..."
              className="w-full h-12 pl-12 pr-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary text-gray-700 border border-gray-200"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>

        {/* Swiper Container - Ocupa el espacio disponible entre las barras */}
        <div className="flex-1 overflow-hidden">
          <Swiper
            direction="vertical"
            slidesPerView={1}
            mousewheel={true}
            keyboard={{
              enabled: true,
            }}
            onSlideChange={handleSlideChange}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            modules={[Mousewheel, Keyboard]}
            className="w-full h-full"
            resistance={true}
            resistanceRatio={0.85}
            enabled={!showMap && !showChat}
          >
            {getFilteredJobs().map((job, index) => {
              const isSavedJob = savedJobs.has(job.id);
              const justSavedJob = jobStates[job.id]?.justSaved;

              return (
                <SwiperSlide key={job.id}>
                  <div className="flex items-center justify-center h-full ">
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
                    />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Espacio reservado para el Sidebar - evita que el contenido quede detrás */}
        <div className="flex-shrink-0 h-20"></div>

        {searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
            <div className="text-center p-6">
              <FaMapPin className="w-32 h-32 mx-auto mb-6 text-gray-300" />
              <p className="text-xl text-gray-800 font-semibold mb-2">
                No se encontraron resultados
              </p>
              <p className="text-gray-500">
                para "{searchQuery}"
              </p>
            </div>
          </div>
        )}

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

        {/* Modales */}
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
              loadJobs();
            }}
          />
        )}
      </div>

      {/* Sidebar FIJA abajo - fuera del contenedor principal */}
      <SideBar
        activeTab={currentTab}
        onTabChange={handleTabChange}
      />
    </>
  );
}