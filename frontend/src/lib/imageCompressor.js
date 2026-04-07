import imageCompression from 'browser-image-compression';

/**
 * Recorta una imagen a formato cuadrado (1:1)
 * @param {File} file - Archivo de imagen original
 * @returns {Promise<File>} - Archivo recortado
 */
const cropToSquare = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Determinar el tamaño del cuadrado (lado más pequeño)
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        
        // Calcular offset para centrar el recorte
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        
        // Dibujar imagen recortada y centrada
        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
        
        // Convertir canvas a blob
        canvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(croppedFile);
          } else {
            reject(new Error('Error al crear blob'));
          }
        }, file.type, 1.0); // Calidad 100%
      };
      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsDataURL(file);
  });
};

/**
 * Convierte una imagen a formato WebP SIN comprimir (calidad máxima) y en formato cuadrado
 * @param {File} file - Archivo de imagen original
 * @param {Object} options - Opciones de conversión
 * @returns {Promise<File>} - Archivo WebP cuadrado
 */
export const compressAndConvertToWebP = async (file, options = {}) => {
  try {
    // Paso 1: Recortar a cuadrado
    console.log('Recortando imagen a formato cuadrado...');
    const squareFile = await cropToSquare(file);
    
    // Paso 2: Convertir a WebP sin comprimir (calidad 100%)
    const defaultOptions = {
      maxSizeMB: 5,            // Límite 5MB (aumentado)
      maxWidthOrHeight: 2048,  // Resolución máxima 2K
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 1.0,     // 100% de calidad - SIN pérdida
      alwaysKeepResolution: true, // Mantener resolución original
    };

    const conversionOptions = { ...defaultOptions, ...options };
    
    // Convertir a WebP
    const webpFile = await imageCompression(squareFile, conversionOptions);
    
    // Crear nuevo archivo con extensión .webp
    const webpFileName = file.name.replace(/\.[^/.]+$/, '.webp');
    const finalFile = new File([webpFile], webpFileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });

    console.log(`✅ Imagen procesada: ${(file.size / 1024).toFixed(2)}KB -> ${(finalFile.size / 1024).toFixed(2)}KB (cuadrada, WebP 100%)`);
    
    return finalFile;
  } catch (error) {
    console.error('Error al procesar imagen:', error);
    throw error;
  }
};

/**
 * Comprime imagen con calidad reducida para cumplir límites
 * @param {File} file - Archivo de imagen original
 * @param {number} quality - Calidad (0.5 - 0.9)
 * @returns {Promise<File>} - Archivo WebP comprimido
 */
export const compressWithReducedQuality = async (file, quality = 0.7) => {
  return compressAndConvertToWebP(file, {
    maxSizeMB: 0.08,         // Más agresivo
    maxWidthOrHeight: 1200,  // Resolución menor
    initialQuality: quality,
  });
};

/**
 * Comprime múltiples imágenes en paralelo
 * @param {FileList|File[]} files - Lista de archivos
 * @param {Function} onProgress - Callback de progreso
 * @returns {Promise<File[]>} - Archivos comprimidos
 */
export const compressMultipleImages = async (files, onProgress = () => {}) => {
  const fileArray = Array.from(files);
  const totalFiles = fileArray.length;
  const compressedFiles = [];

  for (let i = 0; i < totalFiles; i++) {
    const compressed = await compressAndConvertToWebP(fileArray[i]);
    compressedFiles.push(compressed);
    onProgress(((i + 1) / totalFiles) * 100, i + 1, totalFiles);
  }

  return compressedFiles;
};

/**
 * Crea una URL de vista previa para una imagen
 * @param {File} file - Archivo de imagen
 * @returns {string} - URL de objeto
 */
export const createImagePreview = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Revoca una URL de vista previa
 * @param {string} url - URL a revocar
 */
export const revokeImagePreview = (url) => {
  URL.revokeObjectURL(url);
};
