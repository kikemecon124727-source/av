import axios from 'axios';

const IMGBB_API_KEY = '565bfd923ef367e0a4de22ec987bc64e';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

/**
 * Sube una imagen a ImgBB y devuelve la URL
 * @param {File} file - Archivo de imagen
 * @returns {Promise<Object>} - Objeto con URLs de la imagen
 */
export const uploadToImgBB = async (file) => {
  try {
    // Convertir archivo a base64
    const base64 = await fileToBase64(file);
    
    // Eliminar el prefijo data:image/...;base64,
    const base64Data = base64.split(',')[1];

    // Crear FormData
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64Data);
    formData.append('name', file.name.replace(/\.[^/.]+$/, '')); // Nombre sin extensión

    // Subir a ImgBB
    const response = await axios.post(IMGBB_UPLOAD_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.success) {
      return {
        url: response.data.data.url,           // URL principal
        display_url: response.data.data.display_url, // URL de visualización
        thumb_url: response.data.data.thumb.url,     // URL de miniatura
        delete_url: response.data.data.delete_url,   // URL para eliminar
        size: response.data.data.size,               // Tamaño en bytes
      };
    } else {
      throw new Error('Error al subir imagen a ImgBB');
    }
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    throw error;
  }
};

/**
 * Sube múltiples imágenes a ImgBB
 * @param {File[]} files - Array de archivos
 * @param {Function} onProgress - Callback de progreso
 * @returns {Promise<Object[]>} - Array de objetos con URLs
 */
export const uploadMultipleToImgBB = async (files, onProgress = () => {}) => {
  const totalFiles = files.length;
  const uploadedImages = [];

  for (let i = 0; i < totalFiles; i++) {
    const result = await uploadToImgBB(files[i]);
    uploadedImages.push(result);
    onProgress(((i + 1) / totalFiles) * 100, i + 1, totalFiles);
  }

  return uploadedImages;
};

/**
 * Convierte un File a base64
 * @param {File} file - Archivo
 * @returns {Promise<string>} - String base64
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
