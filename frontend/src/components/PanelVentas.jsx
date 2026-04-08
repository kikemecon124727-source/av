import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { ThemeToggle } from './ThemeToggle';
import { LogOut, ShoppingCart, Package } from 'lucide-react';
import ModalProducto from './ventas/ModalProducto';

const PanelVentas = () => {
  const { logout, user } = useAuth();
  const { products, loading } = useProducts();
  
  // Estados del modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cart, setCart] = useState([]);

  const handleLogout = async () => {
    await logout();
  };

  // Abrir modal de producto
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Agregar al carrito
  const handleAddToCart = (cartItem) => {
    setCart(prev => [...prev, cartItem]);
    console.log('Producto agregado al carrito:', cartItem);
    // Por ahora solo lo guardamos en estado
  };

  /**
   * Parser de imágenes de ImgBB
   * Las imágenes están en formato: imagenes: [{ url: "https://i.ibb.co/..." }, ...]
   */
  const getImageUrl = (product) => {
    if (!product.imagenes || product.imagenes.length === 0) return null;
    
    const firstImage = product.imagenes[0];
    
    // Si es objeto con url
    if (typeof firstImage === 'object' && firstImage.url) {
      return firstImage.url;
    }
    
    // Si es string directo
    if (typeof firstImage === 'string') {
      return firstImage;
    }
    
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FAFAF8] via-[#F5F0E8] to-[#EDE6DB] dark:from-[#0a0a0a] dark:via-[#1a1520] dark:to-[#000000]">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-100 dark:border-[#2d1f3f]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-2xl font-light tracking-wider text-gray-800 dark:text-white" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                jessicaalesuarez
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#9d8fb3]">Panel de Ventas</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-[#2d1f3f] rounded-lg transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-white" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C9A96E] text-white text-xs rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>

              <span className="text-xs text-gray-500 dark:text-[#9d8fb3] hidden md:inline truncate max-w-[150px]">
                {user?.email}
              </span>
              
              <ThemeToggle inline />
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-gray-600 dark:text-white hover:text-red-500 dark:hover:text-red-400 transition-all text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* CUADRO 1: PRODUCTOS */}
        <div className="bg-white dark:bg-[#2d2640] rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-[#C9A96E]" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Productos</h2>
            <span className="text-sm text-gray-500 dark:text-[#9d8fb3]">
              ({products.length})
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Sin productos */}
          {!loading && products.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-white/60">No hay productos disponibles</p>
            </div>
          )}

          {/* Grid de productos */}
          {!loading && products.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => {
                const imageUrl = getImageUrl(product);
                
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="group bg-white dark:bg-[#1a1625] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 dark:border-white/5 hover:border-[#C9A96E] dark:hover:border-[#C9A96E] cursor-pointer"
                  >
                    {/* Imagen */}
                    <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-[#0f0f0f] relative">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            console.error('Error cargando imagen:', imageUrl);
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ESin imagen%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-12 h-12" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-800 dark:text-white truncate">
                        {product.nombre}
                      </h3>
                      
                      {/* Colores */}
                      {product.colores && product.colores.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.colores.slice(0, 4).map((color, idx) => {
                            const colorHex = typeof color === 'object' ? (color.hex || color.color) : null;
                            return colorHex ? (
                              <span
                                key={idx}
                                className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-500 shadow-sm"
                                style={{ background: colorHex }}
                              />
                            ) : null;
                          })}
                          {product.colores.length > 4 && (
                            <span className="text-xs text-gray-500 dark:text-[#8b7a9f] self-center">
                              +{product.colores.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE PRODUCTO */}
      <ModalProducto 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default PanelVentas;
