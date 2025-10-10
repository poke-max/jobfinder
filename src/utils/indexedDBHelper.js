// Operaciones simples con IndexedDB
const DB_NAME = 'JobFeedDB';
const STORE_NAME = 'userProgress';
const DB_VERSION = 1;

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'userId' });
      }
    };
  });
};

export const saveProgress = async (userId, jobId, index) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  await store.put({
    userId,
    lastJobId: jobId,
    lastIndex: index,
    timestamp: Date.now()
  });
  
  return tx.complete;
};

export const getProgress = async (userId) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  
  return new Promise((resolve) => {
    const request = store.get(userId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
};