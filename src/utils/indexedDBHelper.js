// Operaciones simples con IndexedDB
const DB_NAME = 'JobFeedDB';
const STORE_NAME = 'userProgress';
const DB_VERSION = 2; // ✅ CAMBIADO de 1 a 2

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.error('❌ [IndexedDB] Error opening database:', request.error);
      
      // Manejo defensivo de VersionError
      if (request.error.name === 'VersionError') {
        console.log('🔄 [IndexedDB] Conflicto de versión detectado, limpiando...');
        indexedDB.deleteDatabase(DB_NAME).onsuccess = () => {
          console.log('✅ [IndexedDB] Base de datos eliminada, reintentando...');
          // Reintentar después de eliminar
          openDB().then(resolve).catch(reject);
        };
      } else {
        reject(request.error);
      }
    };
    
    request.onsuccess = () => {
      console.log('✅ [IndexedDB] Base de datos abierta correctamente');
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      console.log('🔧 [IndexedDB] Actualizando esquema de base de datos...');
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log('📦 [IndexedDB] Creando object store:', STORE_NAME);
        db.createObjectStore(STORE_NAME, { keyPath: 'userId' });
      }
    };
  });
};

export const saveProgress = async (userId, jobId, index, jobCreatedAt) => {
  try {
    console.log('💾 [IndexedDB] Guardando progreso:', { userId, jobId, index, jobCreatedAt });
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    const data = {
      userId,
      lastJobId: jobId,
      lastIndex: index,
      timestamp: Date.now(),
      jobCreatedAt
    };
    
    await store.put(data);
    console.log('✅ [IndexedDB] Progreso guardado exitosamente');
    
    return tx.complete;
  } catch (error) {
    console.error('❌ [IndexedDB] Error guardando progreso:', error);
    throw error;
  }
};

export const getProgress = async (userId) => {
  try {
    console.log('📖 [IndexedDB] Leyendo progreso para userId:', userId);
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve) => {
      const request = store.get(userId);
      request.onsuccess = () => {
        const result = request.result || null;
        console.log('✅ [IndexedDB] Progreso leído:', result);
        resolve(result);
      };
      request.onerror = () => {
        console.error('❌ [IndexedDB] Error leyendo progreso:', request.error);
        resolve(null);
      };
    });
  } catch (error) {
    console.error('❌ [IndexedDB] Error en getProgress:', error);
    return null;
  }
};