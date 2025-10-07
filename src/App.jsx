import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import JobFeed from './JobFeed.jsx';
import Login from './Login.jsx';
import { auth } from './firebase/firebase.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios en el estado de autenticación
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    console.log('Estado de auth cambió:', currentUser ? 'Usuario logueado' : 'No hay usuario'); // ← Agrega esto
    setUser(currentUser);
    setLoading(false);
  });

  return () => unsubscribe();
}, []);

  const handleLoginSuccess = (loggedUser) => {
    setUser(loggedUser);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Pantalla de carga
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
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
          <p className="text-white text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar Login o JobFeed según el estado
// En App.jsx, en el return final
return user ? (
  <>
    {console.log('Renderizando JobFeed')}
    <JobFeed user={user} onLogout={handleLogout} />
  </>
) : (
  <>
    {console.log('Renderizando Login')}
    <Login onLoginSuccess={handleLoginSuccess} />
  </>
);
}