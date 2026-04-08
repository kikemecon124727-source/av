import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

const ModalProducto = ({ product, isOpen, onClose, onAddToCart }) => {
  const [selectedColors, setSelectedColors] = useState({});
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState('fijo'); // 'fijo', 'mayoreo', 'caja'
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset cuando se abre el modal
  useEffect(() => {
    if (isOpen && product) {
      setSelectedColors({});
      setPrice('');
      setPriceType('fijo');
      setCurrentImageIndex(0);
    }
  }, [isOpen, product]);

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  // Parser de imágenes de ImgBB
  const getImages = () => {
    if (!product.imagenes || product.imagenes.length === 0) return [];
    return product.imagenes.map(img => {
      if (typeof img === 'object' && img.url) return img.url;
      if (typeof img === 'string') return img;
      return null;
    }).filter(Boolean);
  };

  const images = getImages();

  // Manejar cambio de cantidad de color
  const handleColorChange = (colorName, delta) => {
    setSelectedColors(prev => {
      const current = prev[colorName] || 0;
      const newValue = Math.max(0, current + delta);
      if (newValue === 0) {
        const { [colorName]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [colorName]: newValue };
    });
  };

  // Calcular totales
  const totalItems = Object.values(selectedColors).reduce((sum, qty) => sum + qty, 0);
  const subtotal = parseFloat(price) * totalItems || 0;

  // Navegar carrusel
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Agregar al carrito
  const handleAddToCart = () => {
    if (totalItems === 0) {
      alert('Selecciona al menos un color');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      alert('Ingresa un precio válido');
      return;
    }

    const cartItem = {
      product,
      selectedColors,
      price: parseFloat(price),
      priceType,
      subtotal
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#2d2640] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-white dark:bg-[#2d2640] border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {product.nombre}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a1625] flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-white" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* CARRUSEL DE IMÁGENES */}
          {images.length > 0 && (
            <div className="mb-6 relative">
              <div className="aspect-video bg-gray-100 dark:bg-[#0f0f0f] rounded-xl overflow-hidden relative">
                <img
                  src={images[currentImageIndex]}
                  alt={`${product.nombre} ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                
                {/* Botones navegación */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </>
                )}

                {/* Indicador */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentImageIndex 
                            ? 'bg-white w-4' 
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MENÚ DE COLORES */}
          {product.colores && product.colores.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-white mb-3">
                Seleccionar colores y cantidades
              </h3>
              
              <div className="space-y-2">
                {product.colores.map((color) => {
                  const colorName = typeof color === 'object' ? (color.nombre || color.name) : color;
                  const colorHex = typeof color === 'object' ? (color.hex || color.color) : null;
                  const cantidad = selectedColors[colorName] || 0;

                  return (
                    <div 
                      key={colorName}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1a1625] rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {colorHex && (
                          <span
                            className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-500 shadow-sm"
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
                            onClick={() => handleColorChange(colorName, -1)}
                            className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleColorChange(colorName, -1)}
                            disabled={cantidad === 0}
                            className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-[#2d1f3f] hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                          >
                            <Minus className="w-4 h-4 text-gray-600 dark:text-white" />
                          </button>
                        )}

                        <span className="w-8 text-center font-medium text-gray-800 dark:text-white">
                          {cantidad}
                        </span>

                        <button
                          onClick={() => handleColorChange(colorName, 1)}
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
          )}

          {/* INPUT DE PRECIO */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Precio por unidad
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0f0f] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A96E]"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* 3 BOTONES TOGGLE TIPO DE PRECIO */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Tipo de precio
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPriceType('fijo')}
                className={`py-2.5 rounded-lg font-medium text-sm transition-all ${
                  priceType === 'fijo'
                    ? 'bg-[#C9A96E] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-[#1a1625] text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#2d1f3f]'
                }`}
              >
                Precio Fijo
              </button>
              <button
                onClick={() => setPriceType('mayoreo')}
                className={`py-2.5 rounded-lg font-medium text-sm transition-all ${
                  priceType === 'mayoreo'
                    ? 'bg-[#C9A96E] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-[#1a1625] text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#2d1f3f]'
                }`}
              >
                Mayoreo
              </button>
              <button
                onClick={() => setPriceType('caja')}
                className={`py-2.5 rounded-lg font-medium text-sm transition-all ${
                  priceType === 'caja'
                    ? 'bg-[#C9A96E] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-[#1a1625] text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#2d1f3f]'
                }`}
              >
                Por Caja
              </button>
            </div>
          </div>

          {/* RESUMEN */}
          <div className="p-4 bg-gray-50 dark:bg-[#1a1625] rounded-xl space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-[#c4b5d4]">Cantidad total:</span>
              <span className="font-medium text-gray-800 dark:text-white">{totalItems}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-[#c4b5d4]">Precio unitario:</span>
              <span className="font-medium text-gray-800 dark:text-white">${parseFloat(price || 0).toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-white/10 flex justify-between">
              <span className="font-semibold text-gray-800 dark:text-white">Subtotal:</span>
              <span className="font-semibold text-[#C9A96E] text-lg">
                ${subtotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER - BOTÓN AGREGAR */}
        <div className="border-t border-gray-200 dark:border-white/10 p-6 bg-gray-50 dark:bg-[#0a0a0a]">
          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-[#C9A96E] hover:bg-[#B8986A] text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
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
