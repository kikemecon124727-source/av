import React from 'react';
import { Package, ImageIcon } from 'lucide-react';

const SeccionProductos = ({ products, loading, onProductClick }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-white/60">No hay productos</p>
      </div>
    );
  }

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.url) return image.url;
    if (typeof image === 'string') return image;
    return null;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onProductClick(product)}
          className="group bg-white dark:bg-[#2d2640] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all text-left"
        >
          {/* Imagen */}
          <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-[#1a1625] relative">
            {product.imagenes && product.imagenes.length > 0 ? (
              <img
                src={getImageUrl(product.imagenes[0])}
                alt={product.nombre}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIcon className="w-10 h-10" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3">
            <h3 className="font-medium text-sm text-gray-800 dark:text-white truncate">
              {product.nombre}
            </h3>
            
            {product.colores && product.colores.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {product.colores.slice(0, 3).map((color, idx) => {
                  const colorHex = typeof color === 'string' ? null : (color.hex || color.color);
                  return colorHex ? (
                    <span
                      key={idx}
                      className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-500"
                      style={{ background: colorHex }}
                    />
                  ) : null;
                })}
                {product.colores.length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-[#8b7a9f]">
                    +{product.colores.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default SeccionProductos;
