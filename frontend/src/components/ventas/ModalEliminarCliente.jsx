import React from 'react';
import { X, AlertCircle, Trash2 } from 'lucide-react';

const ModalEliminarCliente = ({ 
  isOpen, 
  cliente, 
  step, 
  onConfirmar, 
  onCancelar 
}) => {
  if (!isOpen || !cliente) return null;

  const mensajes = [
    '¿Estás seguro de eliminar este cliente?',
    '¿Realmente deseas eliminar este cliente?',
    'ÚLTIMA CONFIRMACIÓN: ¿Eliminar definitivamente?'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#2d2640] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
          {step < 2 ? (
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          ) : (
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center mb-2">
          {step < 2 ? 'Confirmar Eliminación' : 'ÚLTIMA ADVERTENCIA'}
        </h3>

        <p className="text-sm text-gray-600 dark:text-white/70 text-center mb-4">
          {mensajes[step]}
        </p>

        <p className="text-sm font-semibold text-gray-800 dark:text-white text-center mb-6 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {cliente.nombre}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {step < 2 ? 'Continuar' : 'Eliminar'}
          </button>
        </div>

        {step > 0 && (
          <p className="text-xs text-center text-gray-500 dark:text-[#8b7a9f] mt-3">
            Confirmación {step + 1} de 3
          </p>
        )}
      </div>
    </div>
  );
};

export default ModalEliminarCliente;
