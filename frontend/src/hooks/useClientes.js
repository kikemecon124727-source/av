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

const CLIENTES_COLLECTION = 'clientes';

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    const q = query(collection(db, CLIENTES_COLLECTION), orderBy('nombre', 'asc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const clientesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClientes(clientesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching clientes:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Crear cliente
  const createCliente = async (nombre) => {
    try {
      setLoading(true);
      
      const documentData = {
        nombre: nombre.trim(),
        pedidosTotales: 0,
        preciosEspeciales: {}, // {productoId: precio}
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, CLIENTES_COLLECTION), documentData);

      setLoading(false);
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('Error creating cliente:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Actualizar cliente
  const updateCliente = async (clienteId, updates) => {
    try {
      setLoading(true);

      const updatedData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, CLIENTES_COLLECTION, clienteId), updatedData);

      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error updating cliente:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Actualizar precio especial de producto para cliente
  const setPrecioEspecial = async (clienteId, productoId, precio) => {
    try {
      const cliente = clientes.find(c => c.id === clienteId);
      if (!cliente) return { success: false, error: 'Cliente no encontrado' };

      const preciosEspeciales = { ...cliente.preciosEspeciales };
      preciosEspeciales[productoId] = precio;

      await updateCliente(clienteId, { preciosEspeciales });
      return { success: true };
    } catch (err) {
      console.error('Error setting precio especial:', err);
      return { success: false, error: err.message };
    }
  };

  // Incrementar contador de pedidos
  const incrementarPedidos = async (clienteId) => {
    try {
      const cliente = clientes.find(c => c.id === clienteId);
      if (!cliente) return { success: false, error: 'Cliente no encontrado' };

      await updateCliente(clienteId, { 
        pedidosTotales: (cliente.pedidosTotales || 0) + 1 
      });
      return { success: true };
    } catch (err) {
      console.error('Error incrementando pedidos:', err);
      return { success: false, error: err.message };
    }
  };

  // Eliminar cliente
  const deleteCliente = async (clienteId) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, CLIENTES_COLLECTION, clienteId));
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error deleting cliente:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Buscar clientes
  const searchClientes = useCallback((searchTerm) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return clientes;

    return clientes.filter(cliente => 
      cliente.nombre?.toLowerCase().includes(term)
    );
  }, [clientes]);

  return {
    clientes,
    loading,
    error,
    createCliente,
    updateCliente,
    deleteCliente,
    setPrecioEspecial,
    incrementarPedidos,
    searchClientes
  };
};

export default useClientes;
