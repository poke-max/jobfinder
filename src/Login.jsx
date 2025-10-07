import React, { useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { MdWorkspacePremium } from 'react-icons/md';

// Asumiendo que ya tienes Firebase inicializado en otro lugar
const auth = getAuth();
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

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

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      
      console.log('Usuario autenticado:', user.displayName);
      
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
      className="flex flex-col items-center justify-between p-6"
      style={{
        minHeight: '100dvh',
        height: '100dvh',
        background: 'linear-gradient(180deg, var(--color-primary) 0%, var(--color-secondary) 100%)'
      }}
    >
      {/* Logo y título superior */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-center pt-12">
        <div className="text-center mb-12">
          <div 
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl bg-white"
          >
            <MdWorkspacePremium className="text-6xl" style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 className="text-white text-5xl font-bold tracking-tight mb-3">
            jobfinder
          </h1>
          <p className="text-white text-lg font-medium opacity-90">
            Encuentra tu empleo ideal en todo Paraguay
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div 
            className="mb-4 p-4 rounded-2xl text-sm text-center bg-white shadow-lg"
            style={{ 
              color: 'var(--color-primary-dark)',
              animation: 'shake 0.3s ease-in-out'
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Botones de login en la parte inferior */}
      <div className="w-full max-w-md space-y-4 pb-8">
        {/* Botón de Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white rounded-full py-4 px-6 flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
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
              <span className="text-gray-700 font-bold text-lg">
                Iniciando sesión...
              </span>
            </>
          ) : (
            <>
              <FcGoogle className="text-2xl" />
              <span className="font-bold text-lg text-gray-800">
                Continuar con Google
              </span>
            </>
          )}
        </button>

        {/* Botón de Facebook */}
        <button
          onClick={handleFacebookLogin}
          disabled={loading}
          className="w-full bg-white rounded-full py-4 px-6 flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <FaFacebook className="text-2xl text-blue-600" />
          <span className="font-bold text-lg text-gray-800">
            Continuar con Facebook
          </span>
        </button>

        {/* Enlace de problemas */}
        <button className="w-full text-white text-center py-3 font-semibold hover:underline transition-all">
          ¿No consigues iniciar sesión?
        </button>

        {/* Texto legal */}
        <p className="text-xs text-white text-center px-4 opacity-90 leading-relaxed mt-4">
          Al pulsar "Iniciar sesión", estás aceptando nuestros{' '}
          <a href="#" className="underline font-semibold">Términos</a>. Obtén más información sobre cómo procesamos tus datos en nuestra{' '}
          <a href="https://www.termsfeed.com/live/67a514a4-84e9-456e-b348-b21756fcdef4" className="underline font-semibold">Política de privacidad</a> y{' '}
          <a href="#" className="underline font-semibold">Política de cookies</a>.
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}