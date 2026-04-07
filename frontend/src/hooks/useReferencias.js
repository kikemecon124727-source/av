import { useState, useEffect, useCallback } from 'react';
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

const REFERENCIAS_COLLECTION = 'referencias';

export const useReferencias = () => {
  const [referencias, setReferencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    const q = query(collection(db, REFERENCIAS_COLLECTION), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const referenciasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReferencias(referenciasData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching referencias:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Procesar y subir imagen a ImgBB
  const processImage = async (file) => {
    try {
      // Comprimir y convertir a WebP (3MB máximo, 95% calidad)
      const compressedFile = await compressAndConvertToWebP(file);
      
      // Subir a ImgBB
      const imgbbResult = await uploadToImgBB(compressedFile);
      
      return {
        url: imgbbResult.display_url,
        thumb_url: imgbbResult.thumb_url,
        delete_url: imgbbResult.delete_url,
        name: compressedFile.name,
        size: imgbbResult.size
      };
    } catch (err) {
      console.error('Error processing image:', err);
      throw err;
    }
  };

  // Crear referencia
  const createReferencia = async (referenciaData, imageFile) => {
    try {
      setLoading(true);
      
      // Procesar y subir imagen a ImgBB
      let imagenData = null;
      if (imageFile) {
        imagenData = await processImage(imageFile);
      }

      // Crear documento en Firestore
      const documentData = {
        nombreCliente: referenciaData.nombreCliente,
        comentario: referenciaData.comentario || '',
        imagen: imagenData,
        activo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, REFERENCIAS_COLLECTION), documentData);

      setLoading(false);
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('Error creating referencia:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Actualizar referencia
  const updateReferencia = async (referenciaId, referenciaData, newImageFile = null) => {
    try {
      setLoading(true);

      // Procesar nueva imagen si existe
      let imagenData = referenciaData.imagen; // Mantener imagen existente
      if (newImageFile) {
        imagenData = await processImage(newImageFile);
      }

      // Actualizar documento
      const updatedData = {
        nombreCliente: referenciaData.nombreCliente,
        comentario: referenciaData.comentario || '',
        imagen: imagenData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, REFERENCIAS_COLLECTION, referenciaId), updatedData);

      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error updating referencia:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Eliminar referencia
  const deleteReferencia = async (referenciaId) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, REFERENCIAS_COLLECTION, referenciaId));
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error deleting referencia:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return {
    referencias,
    loading,
    error,
    createReferencia,
    updateReferencia,
    deleteReferencia
  };
};

export default useReferencias;
