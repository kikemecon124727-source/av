import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { compressAndConvertToWebP } from '../lib/imageCompressor';

const PRODUCTS_COLLECTION = 'productos';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Convertir imagen a base64
  const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Procesar imagen: comprimir y convertir a base64
  const processImage = async (file) => {
    try {
      // Comprimir y convertir a WebP OPTIMIZADO para 10 fotos
      const compressedFile = await compressAndConvertToWebP(file, {
        maxSizeMB: 0.09, // Máximo 90KB por imagen (10 imágenes = ~900KB total)
        maxWidthOrHeight: 1024, // Resolución óptima
        initialQuality: 0.85, // 85% de calidad (buen balance)
      });
      
      // Convertir a base64
      const base64 = await imageToBase64(compressedFile);
      
      return {
        data: base64,
        name: compressedFile.name,
        size: compressedFile.size
      };
    } catch (err) {
      console.error('Error processing image:', err);
      throw err;
    }
  };

  // Calcular tamaño total de un documento en bytes (aproximado)
  const calculateDocumentSize = (data) => {
    // Convertir el objeto a JSON y calcular su tamaño en bytes
    const jsonString = JSON.stringify(data);
    return new Blob([jsonString]).size;
  };

  // Crear producto
  const createProduct = async (productData, imageFiles) => {
    try {
      setLoading(true);
      
      // Procesar imágenes a base64
      const processedImages = [];
      for (const file of imageFiles) {
        const imageData = await processImage(file);
        processedImages.push(imageData);
      }

      // Crear documento de prueba para validar tamaño
      const documentData = {
        nombre: productData.nombre,
        descripcion: productData.descripcion || '',
        colores: productData.colores || [],
        imagenes: processedImages,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Validar que el documento no exceda ~950KB (límite de Firestore es 1MB)
      const documentSize = calculateDocumentSize(documentData);
      const maxSizeBytes = 950 * 1024; // 950KB en bytes
      
      if (documentSize > maxSizeBytes) {
        const sizeInKB = (documentSize / 1024).toFixed(0);
        const errorMsg = `El producto con todas sus imágenes pesa ${sizeInKB}KB. El límite es 950KB. Por favor, reduce el número de imágenes o su calidad.`;
        
        setLoading(false);
        return { 
          success: false, 
          error: errorMsg,
          isSizeError: true 
        };
      }

      // Crear documento en Firestore
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), documentData);

      setLoading(false);
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('Error creating product:', err);
      
      // Detectar error específico de Firestore por límite de tamaño
      let errorMessage = err.message;
      if (err.code === 'resource-exhausted' || err.message.includes('exceeded')) {
        errorMessage = '⚠️ Las imágenes son demasiado pesadas. Firestore tiene un límite de 1MB por producto. Reduce el número de imágenes o intenta con fotos más pequeñas.';
      }
      
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Actualizar producto
  const updateProduct = async (productId, productData, newImageFiles = [], imagesToDelete = []) => {
    try {
      setLoading(true);

      // Procesar nuevas imágenes
      const newProcessedImages = [];
      for (const file of newImageFiles) {
        const imageData = await processImage(file);
        newProcessedImages.push(imageData);
      }

      // Filtrar imágenes existentes (quitar las eliminadas)
      let existingImages = productData.imagenes || [];
      if (imagesToDelete.length > 0) {
        existingImages = existingImages.filter((img, idx) => {
          if (typeof imagesToDelete[0] === 'number') {
            return !imagesToDelete.includes(idx);
          }
          const imgName = img.name || img.path || `img_${idx}`;
          return !imagesToDelete.includes(imgName);
        });
      }

      // Crear documento de prueba para validar tamaño
      const updatedData = {
        nombre: productData.nombre,
        descripcion: productData.descripcion || '',
        colores: productData.colores || [],
        imagenes: [...existingImages, ...newProcessedImages],
        updatedAt: serverTimestamp()
      };

      // Validar tamaño del documento
      const documentSize = calculateDocumentSize(updatedData);
      const maxSizeBytes = 950 * 1024;
      
      if (documentSize > maxSizeBytes) {
        const sizeInKB = (documentSize / 1024).toFixed(0);
        const errorMsg = `El producto actualizado pesa ${sizeInKB}KB. El límite es 950KB. Elimina algunas imágenes o reduce su número.`;
        
        setLoading(false);
        return { 
          success: false, 
          error: errorMsg,
          isSizeError: true 
        };
      }

      // Actualizar documento
      await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), updatedData);

      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error updating product:', err);
      
      let errorMessage = err.message;
      if (err.code === 'resource-exhausted' || err.message.includes('exceeded')) {
        errorMessage = '⚠️ Las imágenes son demasiado pesadas. Firestore tiene un límite de 1MB por producto. Reduce el número de imágenes.';
      }
      
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Eliminar producto
  const deleteProduct = async (productId) => {
    try {
      setLoading(true);

      // Eliminar documento (las imágenes se eliminan con el documento ya que están en base64)
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));

      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Buscar productos
  const searchProducts = useCallback((searchTerm) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return products;

    return products.filter(product => {
      const matchName = product.nombre?.toLowerCase().includes(term);
      const matchColors = product.colores?.some(color => {
        const colorName = typeof color === 'string' ? color : (color?.nombre || '');
        return colorName.toLowerCase().includes(term);
      });
      const matchDesc = product.descripcion?.toLowerCase().includes(term);
      return matchName || matchColors || matchDesc;
    });
  }, [products]);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
  };
};

export default useProducts;
