import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, query, limit, startAfter, getDoc, getDocs, doc, setDoc, serverTimestamp, where, orderBy } from 'firebase/firestore';
import { FaTimes, FaStepBackward, FaComments, FaPaperPlane, FaRobot, FaStar, FaMapPin, FaLocationArrow, FaSearch} from 'react-icons/fa';
import { IoArrowUndoSharp } from "react-icons/io5";

import JobMapView from './JobMapView';
import JobCard from './JobCard';
import JobChatView from './JobChatView';
import SideBar from './SideBar';
import JobSearch from './JobSearch';
import MapboxComponent from './MapboxComponent';
import PublishComponent from './PublishComponent';
import { db } from './firebase/firebase';


export default function JobFeed({ user, onLogout }) {
  const userId = user?.uid;
  
  // Debug: verificar que el user llegue correctamente
  useEffect(() => {
    console.log('User object:', user);
    console.log('UserId:', userId);
  }, [user, userId]);
  
  const [jobs, setJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [jobStates, setJobStates] = useState({});
  const [showDetails, setShowDetails] = useState({});
  const [lastDoc, setLastDoc] = useState(null);
  const [swipeStart, setSwipeStart] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
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

  const jobCardRef = useRef(null);
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
      loadJobs(); // Cargar trabajos al iniciar
    }
  }, [userId]);

  // Cargar trabajos desde Firestore
  const loadJobs = async () => {
    try {
      setLoading(true);
      
      // Ajusta 'jobs' al nombre de tu colección en Firestore
      const jobsRef = collection(db, 'jobs');
      
      let q;
      if (lastDoc) {
        // Paginación: cargar siguientes trabajos
        q = query(
          jobsRef,
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(10)
        );
      } else {
        // Primera carga
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
      
      // Filtrar trabajos ya descartados
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
        
        // Cargar trabajos descartados
        const dismissedArray = userData.dismissedJobs || [];
        setDismissedJobs(new Set(dismissedArray));
        
        // Cargar trabajos guardados
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
  }, [currentIndex, jobs, userId]);

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
      
      // Agregar el nuevo jobId si no existe
      if (!currentDismissed.includes(jobId)) {
        currentDismissed.push(jobId);
        
        await setDoc(userDocRef, {
          dismissedJobs: currentDismissed,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      
      // También registrar en user_interactions para historial
      const interactionRef = doc(db, 'user_interactions', `${userId}_${jobId}`);
      await setDoc(interactionRef, {
        userId,
        jobId,
        dismissed: true,
        dismissedAt: serverTimestamp()
      }, { merge: true });
      
      nextJob();
    } catch (error) {
      console.error('Error dismissing:', error);
    }
  };

  // Guardar trabajo
  const handleSave = async (jobId) => {
    const isSaved = savedJobs.has(jobId);
    
    if (isSaved) {
      // Quitar de guardados
      setSavedJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    } else {
      // Agregar a guardados
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
      
      // Actualizar array de savedJobs
      if (isSaved) {
        // Quitar el jobId
        currentSaved = currentSaved.filter(id => id !== jobId);
      } else {
        // Agregar el jobId si no existe
        if (!currentSaved.includes(jobId)) {
          currentSaved.push(jobId);
        }
      }
      
      await setDoc(userDocRef, {
        savedJobs: currentSaved,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // También registrar en user_interactions para historial
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

  // Navegar al siguiente trabajo
  const nextJob = () => {
    if (currentIndex < jobs.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
    
    if (currentIndex >= jobs.length - 2) {
      loadJobs();
    }
  };

  // Navegar al trabajo anterior
  const previousJob = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Abrir chat
  const openChat = () => {
    setShowChat(true);
    if (!messages.length) {
      setMessages([{
        id: 1,
        type: 'bot',
        text: `¡Hola! Soy tu asistente virtual. Puedo ayudarte con información sobre ${jobs[currentIndex]?.title || 'este trabajo'}. ¿Qué te gustaría saber?`,
        timestamp: new Date()
      }]);
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
    
    // Simular respuesta del bot
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
    
    // Resetear todos los estados
    setShowGeneralMap(false);
    setShowPublish(false);
    setShowSearch(false);
    setShowFavorites(false);
    setShowPublished(false);
    
    // Activar el estado correspondiente según el tab
    switch(tab) {
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
      case 'inicio':
        // Vista por defecto
        break;
      default:
        break;
    }
};

  // Swipe gestures
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setSwipeStart({ x: touch.clientX, y: touch.clientY });
    setSwipeDirection(null);
  };

  const handleTouchMove = (e) => {
    if (!swipeStart) return;
    
    const touch = e.touches[0];
    const diffX = touch.clientX - swipeStart.x;
    const diffY = touch.clientY - swipeStart.y;
    
    if (!swipeDirection && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      if (Math.abs(diffY) > Math.abs(diffX)) {
        setSwipeDirection('vertical');
      } else {
        setSwipeDirection('horizontal');
      }
    }
    
    if (swipeDirection === 'horizontal') {
      setSwipeOffset(diffX);
    } else if (swipeDirection === 'vertical') {
      setSwipeOffset(diffY);
    }
  };

  const handleTouchEnd = () => {
    if (!swipeDirection) {
      setSwipeOffset(0);
      setSwipeStart(null);
      return;
    }
    
    if (swipeDirection === 'horizontal' && Math.abs(swipeOffset) > 100) {
      if (swipeOffset < 0) {
        handleDismiss(jobs[currentIndex].id);
      } else {
        handleSave(jobs[currentIndex].id);
      }
    } else if (swipeDirection === 'vertical') {
      if (swipeOffset > 150) {
        setShowMap(true);
      } else if (swipeOffset < -150) {
        openChat();
      }
    }
    
    setSwipeOffset(0);
    setSwipeStart(null);
    setSwipeDirection(null);
  };

  // Validación de userId - solo mostrar error si definitivamente no hay user
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center text-white p-4">
          <p className="text-xl mb-2">Usuario no autenticado</p>
          <p className="text-sm text-gray-400">Por favor inicia sesión para continuar</p>
          <p className="text-xs text-gray-500 mt-2">User object: {JSON.stringify(user)}</p>
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
  const isSaved = savedJobs.has(currentJob.id);
  const isViewed = jobStates[currentJob.id]?.viewed;
  const justSaved = jobStates[currentJob.id]?.justSaved;

  return (
    <div className="fixed inset-0 bg-bg overflow-hidden">
      {/* Contador superior */}
{/*       <div className="absolute top-0 left-0 right-0 z-50 p-4 ">
        <div className="flex justify-between items-center text-white text-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={previousJob}
              disabled={currentIndex === 0}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
              title="Trabajo anterior"
            >
              <IoArrowUndoSharp className="w-4 h-4" />
            </button>
            <span>{currentIndex + 1} / {jobs.length}</span>
          </div>
          
        </div>
      </div> */}

      {/* Contenedor de tarjeta/chat/mapa */}
      <div 
        key={currentJob.id}
        ref={jobCardRef}
        className="absolute inset-0 flex flex-col items-center justify-start p-4 pt-20 overflow-y-auto transition-transform duration-200 z-30"
        style={{ 
          transform: !showMap && !showChat && swipeDirection === 'horizontal' 
            ? `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.02}deg)`
            : !showMap && !showChat && swipeDirection === 'vertical'
            ? `translateY(${swipeOffset}px)`
            : 'none'
        }}
        onTouchStart={!showMap && !showChat ? handleTouchStart : undefined}
        onTouchMove={!showMap && !showChat ? handleTouchMove : undefined}
        onTouchEnd={!showMap && !showChat ? handleTouchEnd : undefined}
      >
        {/* Vista de Mapa / Chat / Tarjeta */}
        {showMap ? (
          <JobMapView job={currentJob} onClose={() => setShowMap(false)} />
        ) : showChat ? (
          <JobChatView job={currentJob} onClose={() => setShowChat(false)} />
        ) : (
          <JobCard
            job={currentJob}
            isSaved={isSaved}
            justSaved={justSaved}
            showDetails={showDetails[currentJob.id]}
            onToggleDetails={() =>
              setShowDetails(prev => ({ ...prev, [currentJob.id]: !prev[currentJob.id] }))
            }
            onDismiss={() => handleDismiss(currentJob.id)}
            onSave={() => handleSave(currentJob.id)}
          />
        )}

        {/* Botones debajo de la tarjeta */}
        {!showMap && !showChat && (

          
          <div className="flex items-center justify-center gap-4 transform -translate-y-1/2">
            <button
              onClick={previousJob}
              className="w-13 h-13 bg-white rounded-full text-yellow-500 hover:bg-gray-100 flex items-center justify-center transition shadow-lg focus:outline-none border-none disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentIndex === 0}
            >
              <IoArrowUndoSharp className="text-2xl" />
            </button>

            <button
              onClick={() => handleDismiss(currentJob.id)}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition shadow-lg focus:outline-none border-none"
            >
              <FaTimes className="text-2xl" />
            </button>

            <button
              onClick={() => handleSave(currentJob.id)}
              className={`w-13 h-13 bg-white rounded-full flex items-center justify-center transition shadow-lg focus:outline-none border-none ${
                isSaved
                  ? 'bg-teal-400 hover:bg-teal-400 text-white'
                  : 'bg-transparent text-teal-400 hover:bg-teal-100/10'
              }`}
            >
              <FaStar className="text-2xl" />
            </button>

            <button
              onClick={openChat}
              className="w-13 h-13 bg-white rounded-full text-purple-400 hover:bg-purple-100/10 flex items-center justify-center transition shadow-lg"
            >
              <FaComments className="text-2xl" />
            </button>

            <button
              onClick={() => setShowMap(true)}
              className="w-13 h-13 bg-white rounded-full text-blue-400 hover:bg-blue-100/10 flex items-center justify-center transition shadow-lg"
            >
              <FaLocationArrow className="text-2xl" />
            </button>
          </div>
        )}

        {/* Botón flotante de búsqueda - esquina superior derecha */}
        <button
          onClick={() => setShowSearch(true)}
          className="fixed top-4 right-4 z-40 w-12 h-12 bg-primary hover:bg-primary-light text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        >
          <FaSearch className="w-5 h-5" />
        </button>
      </div>

      <SideBar 
        activeTab={currentTab}
        onTabChange={handleTabChange}
      />

      {/* Modal de Búsqueda */}
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

      {/* Modal de Favoritos */}
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

      {/* Modal de Publicaciones */}
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

      {/* Modal del Mapa General */}
      {showGeneralMap && (
        <MapboxComponent 
          onClose={() => {
            setShowGeneralMap(false);
            setCurrentTab('inicio');
          }}
        />
      )}

      {/* Modal de Publicar Trabajo */}
      {showPublish && (
        <PublishComponent 
          userId={userId}
          onClose={() => {
            setShowPublish(false);
            setCurrentTab('inicio');
          }}
          onSuccess={() => {
            loadJobs(); // Recargar trabajos después de publicar
          }}
        />
      )}
    </div>
  );
}