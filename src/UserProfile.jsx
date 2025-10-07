import React, { useState, useRef, useEffect } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaCamera, 
  FaFileUpload,
  FaBriefcase,
  FaTrash,
  FaEdit,
  FaSave,
  FaTimes,
  FaFileAlt,
  FaCheckCircle
} from 'react-icons/fa';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase/firebase';

export default function UserProfile({ user, onClose, onMyPublications }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: user?.displayName || 'Usuario',
    email: user?.email || '',
    photoUrl: null,
    cvUrl: null,
    defaultMessage: '¡Hola! Me interesa mucho esta oportunidad laboral. Adjunto mi CV para su consideración. Quedo atento a su respuesta.'
  });

  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempMessage, setTempMessage] = useState(profileData.defaultMessage);
  const [tempName, setTempName] = useState(profileData.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const photoInputRef = useRef(null);
  const cvInputRef = useRef(null);

  // Cargar datos del usuario desde Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return;
      
      try {
        console.log('=== Loading User Data ===');
        console.log('User UID:', user.uid);
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('Firestore user data:', data);
          
          setUserData(data);
          setProfileData({
            name: data.displayName || user.displayName || 'Usuario',
            email: data.email || user.email || '',
            photoUrl: data.customPhotoURL || null,
            cvUrl: data.cvUrl || null,
            defaultMessage: data.defaultMessage || '¡Hola! Me interesa mucho esta oportunidad laboral. Adjunto mi CV para su consideración. Quedo atento a su respuesta.'
          });
          setPhotoPreview(data.customPhotoURL || null);
          setTempMessage(data.defaultMessage || profileData.defaultMessage);
          setTempName(data.displayName || user.displayName || 'Usuario');
          
          console.log('customPhotoURL from Firestore:', data.customPhotoURL);
        } else {
          console.log('No user document found in Firestore');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setImageError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Aquí iría la lógica para subir el CV
      setProfileData(prev => ({ ...prev, cvUrl: file.name }));
      alert('CV cargado exitosamente: ' + file.name);
    }
  };

  const saveMessage = async () => {
    setSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        defaultMessage: tempMessage,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setProfileData(prev => ({ ...prev, defaultMessage: tempMessage }));
      setIsEditingMessage(false);
      alert('Mensaje guardado exitosamente');
    } catch (error) {
      console.error('Error saving message:', error);
      alert('Error al guardar el mensaje');
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        displayName: tempName,
        customPhotoURL: photoPreview,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setProfileData(prev => ({ ...prev, name: tempName, photoUrl: photoPreview }));
      setIsEditingProfile(false);
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    // Aquí iría la lógica de eliminación de cuenta
    setTimeout(() => {
      alert('Cuenta eliminada');
      setSaving(false);
      if (onClose) onClose();
    }, 2000);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="bg-white w-full pb-20 h-full max-w-2xl overflow-hidden shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
          >
            <FaTimes className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-1">Mi Perfil</h2>
          <p className="text-blue-100 text-sm">Gestiona tu información personal</p>
        </div>

        <div className="p-2 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Profile Photo & Name Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-6">
              {/* Profile Photo */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg">
                  {photoPreview && !imageError ? (
                    <img 
                      src={photoPreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        console.error('❌ Error loading image:', photoPreview);
                        console.error('Error event:', e);
                        setImageError(true);
                      }}
                      onLoad={() => {
                        console.log('✓ Image loaded successfully:', photoPreview);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-white text-3xl font-bold">
                      {profileData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition shadow-lg"
                >
                  <FaCamera className="w-4 h-4" />
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              {/* Name & Email */}
              <div className="flex-1">
                {isEditingProfile ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 ring-primary"
                      placeholder="Nombre de usuario"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <FaSave className="w-4 h-4" />
                        {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setTempName(profileData.name);
                          setPhotoPreview(profileData.photoUrl);
                        }}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-gray-800">{profileData.name}</h3>
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="p-2 text-primary hover:bg-primary hover:bg-opacity-10 rounded-lg transition"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaEnvelope className="w-4 h-4" />
                      <span className="text-sm">{profileData.email}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* CV Upload Section */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6 hover:border-primary transition">
            {profileData.cvUrl ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FaFileAlt className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">Curriculum Vitae</h4>
                    <p className="text-sm text-gray-500">
                      {profileData.cvUrl.split('/').pop().split('?')[0].replace(/%2F/g, '/').split('/').pop()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={profileData.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-center font-medium"
                  >
                    Ver CV
                  </a>
                  <button
                    onClick={() => cvInputRef.current?.click()}
                    className="flex-1 px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition font-medium"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FaFileUpload className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Curriculum Vitae</h4>
                    <p className="text-sm text-gray-500">Sube tu CV en formato PDF</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
                  Subir
                </button>
              </label>
            )}
            <input
              ref={cvInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleCVUpload}
              className="hidden"
            />
          </div>

          {/* Default Message Section */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaEdit className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-gray-800">Mensaje Predeterminado</h4>
              </div>
              <button
                onClick={() => setIsEditingMessage(!isEditingMessage)}
                className="px-3 py-1 text-primary hover:bg-primary hover:bg-opacity-10 rounded-lg transition text-sm font-semibold"
              >
                {isEditingMessage ? 'Cancelar' : 'Editar'}
              </button>
            </div>
            
            {isEditingMessage ? (
              <div className="space-y-3">
                <textarea
                  value={tempMessage}
                  onChange={(e) => setTempMessage(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 ring-primary resize-none"
                  placeholder="Escribe tu mensaje predeterminado..."
                />
                <button
                  onClick={saveMessage}
                  disabled={saving}
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FaSave className="w-4 h-4" />
                  {saving ? 'Guardando...' : 'Guardar Mensaje'}
                </button>
              </div>
            ) : (
              <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                {profileData.defaultMessage}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* My Publications */}
            <button 
              onClick={() => {
                if (onMyPublications) onMyPublications();
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary hover:bg-opacity-5 transition group"
            >
              <div className="p-3 bg-green-50 group-hover:bg-primary group-hover:bg-opacity-10 rounded-lg transition">
                <FaBriefcase className="w-5 h-5 text-green-600 group-hover:text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-800">Mis Publicaciones</h4>
                <p className="text-sm text-gray-500">Ver y gestionar trabajos publicados</p>
              </div>
            </button>

            {/* Delete Account */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 p-4 bg-white border-2 border-red-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition group"
            >
              <div className="p-3 bg-red-50 group-hover:bg-red-100 rounded-lg transition">
                <FaTrash className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-red-500">Eliminar Cuenta</h4>
                <p className="text-sm text-red-400">Esta acción es permanente</p>
              </div>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 rounded-2xl">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl animate-fadeIn">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                ¿Eliminar cuenta?
              </h3>
              <p className="text-gray-600 text-center mb-6 text-sm">
                Esta acción no se puede deshacer. Se eliminarán todos tus datos y publicaciones.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={saving}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={saving}
                  className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50"
                >
                  {saving ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .ring-primary {
          --tw-ring-color: #3b82f6;
        }
      `}</style>
    </div>
  );
}