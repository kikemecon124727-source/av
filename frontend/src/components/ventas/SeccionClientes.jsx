import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Edit2, Trash2, DollarSign, ShoppingBag, Users } from 'lucide-react';

const SeccionClientes = ({ 
  clientes, 
  loading,
  onCrearCliente,
  onEditarCliente,
  onEliminarCliente,
  onCrearPedido,
  onEditarPrecios
}) => {
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isMenuButton = event.target.closest('[data-menu-button]');
      const isMenu = event.target.closest('[data-menu-dropdown]');
      
      if (!isMenuButton && !isMenu) {
        setMenuAbierto(null);
      }
    };

    if (menuAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuAbierto]);

  const abrirMenu = (clienteId, event) => {
    event.stopPropagation();
    
    if (menuAbierto === clienteId) {
      setMenuAbierto(null);
      return;
    }

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    setMenuPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.right - 200
    });
    
    setMenuAbierto(clienteId);
  };

  const cerrarMenuYEjecutar = (accion) => {
    setMenuAbierto(null);
    if (accion) accion();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5" />
          Clientes Fijos
        </h3>
        <button
          onClick={onCrearCliente}
          className="flex items-center gap-2 px-4 py-2 bg-[#C9A96E] hover:bg-[#B8986A] text-white rounded-lg transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Añadir Cliente
        </button>
      </div>

      {clientes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#2d2640] rounded-xl">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/60">No hay clientes registrados</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-[#2d2640] rounded-xl overflow-visible relative">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-[#1a1625] border-b border-gray-200 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-[#c4b5d4]">
              <div className="col-span-5">NOMBRE</div>
              <div className="col-span-3 text-center">PEDIDOS TOTALES</div>
              <div className="col-span-4 text-center">ACCIONES</div>
            </div>

            <div className={`divide-y divide-gray-200 dark:divide-white/10 ${clientes.length > 10 ? 'max-h-96 overflow-y-auto' : ''}`}>
              {clientes.map((cliente) => (
                <div key={cliente.id} className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-[#1a1625] transition-colors relative">
                  <div className="col-span-5 font-medium text-gray-800 dark:text-white truncate">
                    {cliente.nombre}
                  </div>
                  
                  <div className="col-span-3 text-center text-gray-600 dark:text-[#c4b5d4]">
                    {cliente.pedidosTotales || 0}
                  </div>
                  
                  <div className="col-span-4 flex justify-center">
                    <button
                      onClick={(e) => abrirMenu(cliente.id, e)}
                      data-menu-button
                      className="p-2 hover:bg-gray-100 dark:hover:bg-[#2d1f3f] rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600 dark:text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Menu con FIXED position y z-index alto */}
          {menuAbierto && (
            <div
              data-menu-dropdown
              className="fixed w-48 bg-white dark:bg-[#1a1520] rounded-xl shadow-2xl border border-gray-200 dark:border-[#2d1f3f] overflow-hidden"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
                zIndex: 9999
              }}
            >
              <button
                onClick={() => cerrarMenuYEjecutar(() => {
                  const cliente = clientes.find(c => c.id === menuAbierto);
                  if (cliente) onEditarCliente(cliente);
                })}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-[#2d1f3f] transition-colors flex items-center gap-3 text-gray-700 dark:text-white text-sm"
              >
                <Edit2 className="w-4 h-4 text-blue-500" />
                <span>Editar</span>
              </button>
              
              <button
                onClick={() => cerrarMenuYEjecutar(() => {
                  const cliente = clientes.find(c => c.id === menuAbierto);
                  if (cliente) onCrearPedido(cliente);
                })}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-[#2d1f3f] transition-colors flex items-center gap-3 text-gray-700 dark:text-white text-sm border-t border-gray-100 dark:border-[#2d1f3f]"
              >
                <ShoppingBag className="w-4 h-4 text-green-500" />
                <span>Crear Pedido</span>
              </button>
              
              <button
                onClick={() => cerrarMenuYEjecutar(() => {
                  const cliente = clientes.find(c => c.id === menuAbierto);
                  if (cliente) onEditarPrecios(cliente);
                })}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-[#2d1f3f] transition-colors flex items-center gap-3 text-gray-700 dark:text-white text-sm border-t border-gray-100 dark:border-[#2d1f3f]"
              >
                <DollarSign className="w-4 h-4 text-yellow-500" />
                <span>Precios</span>
              </button>
              
              <button
                onClick={() => cerrarMenuYEjecutar(() => {
                  const cliente = clientes.find(c => c.id === menuAbierto);
                  if (cliente) onEliminarCliente(cliente);
                })}
                className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3 text-red-600 dark:text-red-400 text-sm border-t border-gray-100 dark:border-[#2d1f3f]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SeccionClientes;
