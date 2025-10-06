import React, { useState } from 'react';
import { 
  FaBriefcase, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaDollarSign, 
  FaFileAlt, 
  FaUsers, 
  FaEnvelope, 
  FaPhone, 
  FaGlobe, 
  FaImage,
  FaTimes,
  FaCheckCircle
} from 'react-icons/fa';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase/firebase';
import { useAnimatedClose } from './hooks/useAnimatedClose';

export default function PublishComponent({ userId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const { handleClose, getAnimationClass } = useAnimatedClose(onClose);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requeriments: '',
    position: '',
    city: '',
    direction: '',
    salary_range: '',
    email: '',
    phoneNumber: '',
    website: '',
    vacancies: 1,
    type: 'Empleo',
    source: 'app',
    isActive: true
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 4 - imageFiles.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    if (filesToAdd.length > 0) {
      setImageFiles(prev => [...prev, ...filesToAdd]);
      
      filesToAdd.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
    
    if (files.length > remainingSlots) {
      alert(`Solo puedes subir hasta 4 imágenes. Se agregaron ${remainingSlots} de ${files.length} seleccionadas.`);
    }
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    
    const uploadPromises = imageFiles.map(async (file, index) => {
      const timestamp = Date.now();
      const storageRef = ref(storage, `jobs/${userId}_${timestamp}_${index}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    });
    
    return await Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      alert('Por favor completa al menos el título y la descripción');
      return;
    }

    try {
      setLoading(true);
      
      const imageUrls = await uploadImages();
      
      const jobData = {
        ...formData,
        images: imageUrls,
        url: imageUrls[0] || '',
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ubication: {
          lat: 0,
          lng: 0
        }
      };

      await addDoc(collection(db, 'jobs'), jobData);
      
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error publishing job:', error);
      alert('Error al publicar el trabajo. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-fadeIn">
          <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Publicado!</h3>
          <p className="text-gray-600">Tu oferta de trabajo ha sido publicada exitosamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-opacity-50 z-50 overflow-y-auto">
        <div className={`bg-white rounded-2xl w-full ${getAnimationClass()}`}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500 bg-opacity-10 rounded-xl">
                  <FaBriefcase className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Publicar Trabajo</h2>
                  <p className="text-sm text-gray-500">Completa la información del puesto</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <FaTimes className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Image Upload - Multiple Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Imágenes del Trabajo (Hasta 4)
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-40 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
                      {index + 1}/4
                    </div>
                  </div>
                ))}
                
                {imagePreviews.length < 4 && (
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 cursor-pointer transition bg-gray-50">
                    <FaImage className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 text-center px-2">
                      {imagePreviews.length === 0 ? 'Agregar imágenes' : 'Agregar más'}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      {imagePreviews.length}/4
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaBriefcase className="text-blue-500" />
                  Título del Puesto *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Desarrollador Full Stack"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaBuilding className="text-blue-500" />
                  Empresa
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Nombre de la empresa"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaFileAlt className="text-blue-500" />
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe el puesto y responsabilidades..."
                rows="4"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaFileAlt className="text-green-500" />
                Requisitos
              </label>
              <textarea
                value={formData.requeriments}
                onChange={(e) => handleInputChange('requeriments', e.target.value)}
                placeholder="Lista los requisitos y habilidades necesarias..."
                rows="3"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaMapMarkerAlt className="text-blue-500" />
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Ej: Asunción"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaMapMarkerAlt className="text-green-500" />
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direction}
                  onChange={(e) => handleInputChange('direction', e.target.value)}
                  placeholder="Dirección específica"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Salary and Vacancies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaDollarSign className="text-green-500" />
                  Rango Salarial
                </label>
                <input
                  type="text"
                  value={formData.salary_range}
                  onChange={(e) => handleInputChange('salary_range', e.target.value)}
                  placeholder="Ej: $2000 - $3000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaUsers className="text-blue-500" />
                  Vacantes
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.vacancies}
                  onChange={(e) => handleInputChange('vacancies', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaEnvelope className="text-blue-500" />
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contacto@empresa.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaPhone className="text-green-500" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+595 xxx xxx xxx"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaGlobe className="text-blue-500" />
                Sitio Web
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.empresa.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Position Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaBriefcase className="text-green-500" />
                Tipo de Posición
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Ej: Tiempo completo, Remoto"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Active Status */}
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-5 h-5 rounded accent-blue-500"
              />
              <div>
                <span className="text-sm font-semibold text-gray-700">Publicar como activo</span>
                <p className="text-xs text-gray-500">El trabajo será visible inmediatamente</p>
              </div>
            </label>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Publicando...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="w-5 h-5" />
                    Publicar Trabajo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      
    </div>
  );
}