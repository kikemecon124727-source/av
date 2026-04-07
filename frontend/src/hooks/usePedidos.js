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
  where,
  serverTimestamp
} from 'firebase/firestore';

const PEDIDOS_COLLECTION = 'pedidos';

export const usePedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    const q = query(collection(db, PEDIDOS_COLLECTION), orderBy('fecha', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const pedidosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPedidos(pedidosData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching pedidos:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Generar número de orden único
  const generateNumeroOrden = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${timestamp}${random}`;
  };

  // Crear pedido
  const createPedido = async (pedidoData) => {
    try {
      setLoading(true);
      
      const documentData = {
        tipo: pedidoData.tipo, // 'local' o 'cliente'
        clienteId: pedidoData.clienteId || null,
        clienteNombre: pedidoData.clienteNombre || 'LOCAL',
        productos: pedidoData.productos, // [{productoId, nombre, imagen, colores: [{color, cantidad, precio}], subtotal}]
        totalArticulos: pedidoData.totalArticulos,
        totalConIVA: pedidoData.totalConIVA,
        usuario: pedidoData.usuario, // email del usuario logueado
        numeroOrden: generateNumeroOrden(),
        pagado: pedidoData.pagado || true,
        adeudo: pedidoData.adeudo || 0,
        fecha: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, PEDIDOS_COLLECTION), documentData);

      setLoading(false);
      return { success: true, id: docRef.id, numeroOrden: documentData.numeroOrden };
    } catch (err) {
      console.error('Error creating pedido:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Actualizar pedido
  const updatePedido = async (pedidoId, updates) => {
    try {
      setLoading(true);

      await updateDoc(doc(db, PEDIDOS_COLLECTION, pedidoId), updates);

      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error updating pedido:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Marcar pedido como pagado
  const marcarComoPagado = async (pedidoId) => {
    try {
      await updatePedido(pedidoId, { pagado: true, adeudo: 0 });
      return { success: true };
    } catch (err) {
      console.error('Error marcando pedido como pagado:', err);
      return { success: false, error: err.message };
    }
  };

  // Eliminar pedido
  const deletePedido = async (pedidoId) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, PEDIDOS_COLLECTION, pedidoId));
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error deleting pedido:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Obtener pedidos con adeudo
  const getPedidosConAdeudo = useCallback(() => {
    return pedidos.filter(p => !p.pagado || p.adeudo > 0);
  }, [pedidos]);

  // Obtener pedidos por cliente
  const getPedidosByCliente = useCallback((clienteId) => {
    return pedidos.filter(p => p.clienteId === clienteId);
  }, [pedidos]);

  // Buscar pedidos
  const searchPedidos = useCallback((searchTerm) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return pedidos;

    return pedidos.filter(pedido => 
      pedido.numeroOrden?.toLowerCase().includes(term) ||
      pedido.clienteNombre?.toLowerCase().includes(term)
    );
  }, [pedidos]);

  return {
    pedidos,
    loading,
    error,
    createPedido,
    updatePedido,
    deletePedido,
    marcarComoPagado,
    getPedidosConAdeudo,
    getPedidosByCliente,
    searchPedidos
  };
};

export default usePedidos;
