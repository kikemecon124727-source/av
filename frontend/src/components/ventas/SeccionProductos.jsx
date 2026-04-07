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

  /**
   * Parser mejorado para URLs de imágenes
   * Soporta múltiples formatos: objeto {url}, string directo, o array de URLs
   */
  const getImageUrl = (image) => {
    if (!image) return null;
    
    // Si es un objeto con propiedad url
    if (typeof image === 'object' && image !== null) {
      if (image.url) return image.url;
      if (image.src) return image.src;
      if (image.href) return image.href;
    }
    
    // Si es un string directo (URL)
    if (typeof image === 'string' && image.trim() !== '') {
      return image;
    }
    
    return null;
  };

  // Scroll condicional: solo si hay más de 10 productos
  const shouldScroll = products.length > 10;

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${shouldScroll ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
      {products.map((product) => {
        const imageUrl = getImageUrl(product.imagenes?.[0]);
        
        return (
          <button
            key={product.id}
            onClick={() => onProductClick(product)}
            className="group bg-white dark:bg-[#1a1625] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all text-left border border-gray-100 dark:border-white/5 hover:border-[#C9A96E] dark:hover:border-[#C9A96E]"
          >
            {/* Imagen */}
            <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-[#0f0f0f] relative">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={product.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      console.warn(`Error cargando imagen para ${product.nombre}:`, imageUrl);
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.fallback-icon');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="fallback-icon hidden w-full h-full absolute inset-0 flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                </>
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
                        className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-500 shadow-sm"
                        style={{ background: colorHex }}
                        title={typeof color === 'string' ? color : (color.nombre || color.name)}
                      />
                    ) : null;
                  })}
                  {product.colores.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-[#8b7a9f] self-center">
                      +{product.colores.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SeccionProductos;
