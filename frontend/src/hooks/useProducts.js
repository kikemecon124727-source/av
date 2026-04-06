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
import { uploadToImgBB } from '../lib/imgbbUploader';

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

  // Procesar y subir imagen a ImgBB
  const processImage = async (file) => {
    try {
      // Comprimir y convertir a WebP (1MB máximo, 95% calidad)
      const compressedFile = await compressAndConvertToWebP(file);
      
      // Subir a ImgBB
      const imgbbResult = await uploadToImgBB(compressedFile);
      
      return {
        url: imgbbResult.display_url,     // URL principal para mostrar
        thumb_url: imgbbResult.thumb_url, // Miniatura
        delete_url: imgbbResult.delete_url, // Para eliminar si es necesario
        name: compressedFile.name,
        size: imgbbResult.size,
        position: 'center' // Posición por defecto
      };
    } catch (err) {
      console.error('Error processing image:', err);
      throw err;
    }
  };

  // Crear producto
  const createProduct = async (productData, imageFiles) => {
    try {
      setLoading(true);
      
      // Procesar y subir imágenes a ImgBB
      const processedImages = [];
      for (const file of imageFiles) {
        const imageData = await processImage(file);
        processedImages.push(imageData);
      }

      // Crear documento en Firestore (solo URLs, mucho más ligero)
      const documentData = {
        nombre: productData.nombre,
        descripcion: productData.descripcion || '',
        colores: productData.colores || [],
        imagenes: processedImages, // Array de objetos con URLs
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), documentData);

      setLoading(false);
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Actualizar producto
  const updateProduct = async (productId, productData, newImageFiles = [], imagesToDelete = []) => {
    try {
      setLoading(true);

      // Procesar y subir nuevas imágenes a ImgBB
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

      // Actualizar documento
      const updatedData = {
        nombre: productData.nombre,
        descripcion: productData.descripcion || '',
        colores: productData.colores || [],
        imagenes: [...existingImages, ...newProcessedImages],
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), updatedData);

      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
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
