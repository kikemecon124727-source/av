import React from 'react';
import { X, Trash2, FileText, Printer } from 'lucide-react';

const ModalCarrito = ({
  isOpen,
  onClose,
  carrito,
  clienteNombre,
  onEliminarItem,
  onGenerarTicket,
  total
}) => {
  if (!isOpen) return null;

  const totalArticulos = carrito.reduce((sum, item) => {
    return sum + item.colores.reduce((s, c) => s + c.cantidad, 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#2d2640] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-white dark:bg-[#2d2640] border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Carrito de Compras
            </h2>
            <span className="px-3 py-1 bg-[#C9A96E]/20 text-[#C9A96E] rounded-full text-sm font-medium">
              {clienteNombre || 'LOCAL'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onGenerarTicket}
              disabled={carrito.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#C9A96E] hover:bg-[#B8986A] text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Generar Ticket</span>
            </button>
            
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a1625] flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {carrito.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-white/60">
                El carrito está vacío
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {carrito.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-gray-50 dark:bg-[#1a1625] rounded-xl"
                >
                  {/* Imagen */}
                  {item.imagen && (
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                      {item.nombre}
                    </h3>
                    
                    <div className="space-y-1">
                      {item.colores.map((colorData, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-[#c4b5d4]">
                          <span>{colorData.color}</span>
                          <span>×</span>
                          <span>{colorData.cantidad}</span>
                          <span>@</span>
                          <span>${colorData.precio.toFixed(2)}</span>
                          <span className="ml-auto font-medium text-gray-800 dark:text-white">
                            ${(colorData.cantidad * colorData.precio).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-[#c4b5d4]">
                        Subtotal:
                      </span>
                      <span className="font-semibold text-[#C9A96E]">
                        ${item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Eliminar */}
                  <button
                    onClick={() => onEliminarItem(index)}
                    className="self-start p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Totales */}
        {carrito.length > 0 && (
          <div className="border-t border-gray-200 dark:border-white/10 p-6 bg-gray-50 dark:bg-[#0a0a0a] space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-[#c4b5d4]">Total de artículos:</span>
              <span className="font-medium text-gray-800 dark:text-white">{totalArticulos}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-[#c4b5d4]">Subtotal:</span>
              <span className="font-medium text-gray-800 dark:text-white">${total.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-[#c4b5d4]">IVA (16%):</span>
              <span className="font-medium text-gray-800 dark:text-white">${(total * 0.16).toFixed(2)}</span>
            </div>
            
            <div className="pt-3 border-t border-gray-200 dark:border-white/10 flex justify-between">
              <span className="font-semibold text-lg text-gray-800 dark:text-white">Total:</span>
              <span className="font-bold text-2xl text-[#C9A96E]">
                ${(total * 1.16).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalCarrito;
