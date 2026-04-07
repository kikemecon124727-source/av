import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Carrito principal (ventas locales)
  const [carritoLocal, setCarritoLocal] = useState([]);
  
  // Carritos por cliente {clienteId: [...productos]}
  const [carritosClientes, setCarritosClientes] = useState({});

  // Agregar producto al carrito local
  const addToCarritoLocal = useCallback((producto) => {
    setCarritoLocal(prev => {
      // Verificar si el producto con los mismos colores ya existe
      const existingIndex = prev.findIndex(
        item => item.productoId === producto.productoId &&
        JSON.stringify(item.colores) === JSON.stringify(producto.colores)
      );

      if (existingIndex >= 0) {
        // Actualizar cantidad
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          colores: producto.colores,
          subtotal: producto.subtotal
        };
        return updated;
      }

      return [...prev, producto];
    });
  }, []);

  // Agregar producto al carrito de cliente
  const addToCarritoCliente = useCallback((clienteId, producto) => {
    setCarritosClientes(prev => {
      const clienteCart = prev[clienteId] || [];
      
      const existingIndex = clienteCart.findIndex(
        item => item.productoId === producto.productoId &&
        JSON.stringify(item.colores) === JSON.stringify(producto.colores)
      );

      if (existingIndex >= 0) {
        const updated = [...clienteCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          colores: producto.colores,
          subtotal: producto.subtotal
        };
        return { ...prev, [clienteId]: updated };
      }

      return {
        ...prev,
        [clienteId]: [...clienteCart, producto]
      };
    });
  }, []);

  // Eliminar producto del carrito local
  const removeFromCarritoLocal = useCallback((index) => {
    setCarritoLocal(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Eliminar producto del carrito de cliente
  const removeFromCarritoCliente = useCallback((clienteId, index) => {
    setCarritosClientes(prev => {
      const clienteCart = prev[clienteId] || [];
      return {
        ...prev,
        [clienteId]: clienteCart.filter((_, i) => i !== index)
      };
    });
  }, []);

  // Limpiar carrito local
  const clearCarritoLocal = useCallback(() => {
    setCarritoLocal([]);
  }, []);

  // Limpiar carrito de cliente
  const clearCarritoCliente = useCallback((clienteId) => {
    setCarritosClientes(prev => ({
      ...prev,
      [clienteId]: []
    }));
  }, []);

  // Obtener total del carrito local
  const getTotalCarritoLocal = useCallback(() => {
    return carritoLocal.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  }, [carritoLocal]);

  // Obtener total del carrito de cliente
  const getTotalCarritoCliente = useCallback((clienteId) => {
    const clienteCart = carritosClientes[clienteId] || [];
    return clienteCart.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  }, [carritosClientes]);

  // Obtener cantidad de items en carrito local
  const getCountCarritoLocal = useCallback(() => {
    return carritoLocal.reduce((sum, item) => {
      const cantidad = item.colores.reduce((s, c) => s + c.cantidad, 0);
      return sum + cantidad;
    }, 0);
  }, [carritoLocal]);

  // Obtener cantidad de items en carrito de cliente
  const getCountCarritoCliente = useCallback((clienteId) => {
    const clienteCart = carritosClientes[clienteId] || [];
    return clienteCart.reduce((sum, item) => {
      const cantidad = item.colores.reduce((s, c) => s + c.cantidad, 0);
      return sum + cantidad;
    }, 0);
  }, [carritosClientes]);

  const value = {
    // Carrito local
    carritoLocal,
    addToCarritoLocal,
    removeFromCarritoLocal,
    clearCarritoLocal,
    getTotalCarritoLocal,
    getCountCarritoLocal,
    
    // Carritos clientes
    carritosClientes,
    addToCarritoCliente,
    removeFromCarritoCliente,
    clearCarritoCliente,
    getTotalCarritoCliente,
    getCountCarritoCliente
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
