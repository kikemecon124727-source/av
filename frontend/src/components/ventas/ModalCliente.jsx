import React, { useState, useEffect } from 'react';
import { X, Check, User } from 'lucide-react';

const ModalCliente = ({ isOpen, onClose, cliente, onGuardar }) => {
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    if (cliente) {
      setNombre(cliente.nombre || '');
    } else {
      setNombre('');
    }
  }, [cliente]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nombre.trim()) {
      onGuardar(nombre.trim());
      setNombre('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#2d2640] rounded-2xl max-w-md w-full shadow-2xl">
        <div className="bg-white dark:bg-[#2d2640] border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a1625] flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0f0f] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A96E]"
              placeholder="Ej: María González"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-[#C9A96E] hover:bg-[#B8986A] text-white rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {cliente ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCliente;
