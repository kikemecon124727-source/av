import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';

const ModalProducto = ({ 
  product, 
  onClose, 
  onAgregarAlCarrito,
  coloresSeleccionados,
  setColoresSeleccionados,
  precioPersonalizado,
  setPrecioPersonalizado,
  usarPrecioEspecial,
  setUsarPrecioEspecial,
  precioEspecialCliente,
  isParaCliente = false
}) => {
  if (!product) return null;

  const handleCantidadChange = (color, delta) => {
    setColoresSeleccionados(prev => {
      const current = prev[color] || 0;
      const newValue = Math.max(0, current + delta);
      
      if (newValue === 0) {
        const { [color]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [color]: newValue };
    });
  };

  const calcularSubtotal = () => {
    const precio = parseFloat(precioPersonalizado) || 0;
    const cantidad = Object.values(coloresSeleccionados).reduce((sum, c) => sum + c, 0);
    return precio * cantidad;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#2d2640] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-white dark:bg-[#2d2640] border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {product.nombre}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a1625] flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Imágenes */}
          {product.imagenes && product.imagenes.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-3 gap-2">
                {product.imagenes.slice(0, 3).map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url || img}
                    alt={`${product.nombre} ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Toggle Precio Especial (solo para clientes) */}
          {isParaCliente && precioEspecialCliente && (
            <div className="mb-4 p-3 bg-[#C9A96E]/10 rounded-lg border border-[#C9A96E]/30">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usarPrecioEspecial}
                  onChange={(e) => {
                    setUsarPrecioEspecial(e.target.checked);
                    if (e.target.checked) {
                      setPrecioPersonalizado(precioEspecialCliente.toString());
                    } else {
                      setPrecioPersonalizado('');
                    }
                  }}
                  className="w-4 h-4 text-[#C9A96E] rounded focus:ring-[#C9A96E]"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-white">
                  Usar precio especial (${precioEspecialCliente})
                </span>
              </label>
            </div>
          )}

          {/* Colores */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-white mb-3">
              Seleccionar colores y cantidades
            </h3>
            
            <div className="space-y-2">
              {(product.colores || []).map((color) => {
                const colorName = typeof color === 'string' ? color : (color.nombre || color.name);
                const colorHex = typeof color === 'string' ? null : (color.hex || color.color);
                const cantidad = coloresSeleccionados[colorName] || 0;

                return (
                  <div 
                    key={colorName}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1a1625] rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {colorHex && (
                        <span
                          className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-500"
                          style={{ background: colorHex }}
                        />
                      )}
                      <span className="text-sm text-gray-700 dark:text-white font-medium">
                        {colorName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {cantidad === 1 ? (
                        <button
                          onClick={() => handleCantidadChange(colorName, -1)}
                          className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCantidadChange(colorName, -1)}
                          disabled={cantidad === 0}
                          className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-[#2d1f3f] hover:bg-gray-300 dark:hover:bg-[#3d2f4f] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                        >
                          <Minus className="w-4 h-4 text-gray-600 dark:text-white" />
                        </button>
                      )}

                      <span className="w-8 text-center font-medium text-gray-800 dark:text-white">
                        {cantidad}
                      </span>

                      <button
                        onClick={() => handleCantidadChange(colorName, 1)}
                        className="w-8 h-8 rounded-lg bg-[#C9A96E] hover:bg-[#B8986A] text-white flex items-center justify-center transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Precio */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Precio por unidad
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precioPersonalizado}
                onChange={(e) => setPrecioPersonalizado(e.target.value)}
                disabled={usarPrecioEspecial}
                className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0f0f] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A96E] disabled:opacity-50"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Resumen */}
          <div className="p-4 bg-gray-50 dark:bg-[#1a1625] rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-[#c4b5d4]">Cantidad total:</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {Object.values(coloresSeleccionados).reduce((sum, c) => sum + c, 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-[#c4b5d4]">Precio unitario:</span>
              <span className="font-medium text-gray-800 dark:text-white">
                ${parseFloat(precioPersonalizado || 0).toFixed(2)}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-white/10 flex justify-between">
              <span className="font-semibold text-gray-800 dark:text-white">Subtotal:</span>
              <span className="font-semibold text-[#C9A96E] text-lg">
                ${calcularSubtotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-white/10 p-6 bg-gray-50 dark:bg-[#0a0a0a]">
          <button
            onClick={onAgregarAlCarrito}
            className="w-full py-3 bg-[#C9A96E] hover:bg-[#B8986A] text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
          >
            <ShoppingCart className="w-5 h-5" />
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalProducto;
