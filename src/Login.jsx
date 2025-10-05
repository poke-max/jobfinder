import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import firebaseConfig from './firebase/firebaseConfig';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export default function Login({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('Usuario autenticado:', user.displayName);
      
      // Llamar callback de éxito
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/popup-closed-by-user':
        return 'Cerraste la ventana de inicio de sesión';
      case 'auth/cancelled-popup-request':
        return 'Solicitud cancelada';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu internet';
      default:
        return 'Error al iniciar sesión. Intenta nuevamente';
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)'
      }}
    >
      <div className="w-full max-w-md">
        {/* Tarjeta de Login */}
        <div 
          className="rounded-3xl shadow-2xl p-8 backdrop-blur-sm"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          {/* Logo/Icono */}
          <div className="text-center mb-8">
            <div 
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)'
              }}
            >
              <span className="text-4xl">💼</span>
            </div>
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: 'var(--color-primary-dark)' }}
            >
              Bienvenido
            </h1>
            <p className="text-gray-600">
              Encuentra tu próximo trabajo ideal
            </p>
          </div>

          {/* Botón de Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 rounded-full py-4 px-6 flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed group"
            style={{
              borderColor: loading ? '#e5e7eb' : 'var(--color-primary-light)'
            }}
          >
            {loading ? (
              <>
                <div 
                  className="w-6 h-6 border-3 rounded-full animate-spin"
                  style={{ 
                    border: '3px solid var(--color-primary)',
                    borderTopColor: 'transparent'
                  }}
                ></div>
                <span className="text-gray-700 font-semibold">
                  Iniciando sesión...
                </span>
              </>
            ) : (
              <>
                <FcGoogle className="text-2xl" />
                <span 
                  className="font-semibold transition-colors"
                  style={{ color: 'var(--color-primary-dark)' }}
                >
                  Continuar con Google
                </span>
              </>
            )}
          </button>

          {/* Mensaje de error */}
          {error && (
            <div 
              className="mt-4 p-4 rounded-xl text-sm text-center"
              style={{ 
                backgroundColor: 'rgba(248, 87, 138, 0.1)',
                color: 'var(--color-primary-dark)',
                border: '1px solid var(--color-primary-light)',
                animation: 'shake 0.3s ease-in-out'
              }}
            >
              {error}
            </div>
          )}

          {/* Texto legal */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Al continuar, aceptas nuestros{' '}
            <a 
              href="#" 
              className="underline hover:no-underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Términos de Servicio
            </a>
            {' '}y{' '}
            <a 
              href="#" 
              className="underline hover:no-underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Política de Privacidad
            </a>
          </p>
        </div>

        {/* Decoraciones */}
        <div className="mt-8 flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: i === 1 ? 'var(--color-secondary)' : 'var(--color-primary)',
                animationDelay: `${i * 0.2}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}