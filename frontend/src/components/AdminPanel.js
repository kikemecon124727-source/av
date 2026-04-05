import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { ThemeToggle } from './ThemeToggle';
import { useToastCustom } from './Toast';
import { compressMultipleImages, createImagePreview, revokeImagePreview } from '../lib/imageCompressor';
import { getColorValue } from '../lib/colorDictionary';
import axios from 'axios';
import { 
  LogOut, Plus, Trash2, Edit2, X, Upload, Search,
  Image as ImageIcon, Loader2, Check, AlertCircle, Sparkles
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const MAX_IMAGES = 10;

const AdminPanel = () => {
  const { logout, user } = useAuth();
  const { products, loading, createProduct, updateProduct, deleteProduct, searchProducts } = useProducts();
  const { toast } = useToastCustom();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    colores: [],
  });
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  
  // Color input
  const [colorInput, setColorInput] = useState('');
  const [isDetectingColor, setIsDetectingColor] = useState(false);

  // Nuevo estado para vista de imagen y confirmación de eliminación
  const [viewingImage, setViewingImage] = useState(null);
  const [imageToDelete, setImageToDelete] = useState(null);
  
  // Estado para ajuste de imagen
  const [adjustingImage, setAdjustingImage] = useState(null);
  const [imagePositions, setImagePositions] = useState({});

  const filteredProducts = searchTerm ? searchProducts(searchTerm) : products;

  // Get image URL
  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.url) return image.url;
    if (image.data) return image.data;
    if (typeof image === 'string') return image;
    return null;
  };

  const handleLogout = async () => {
    await logout();
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ nombre: '', descripcion: '', colores: [] });
    setNewImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    // Normalizar colores - quitar números y formato legacy
    const normalizedColors = (product.colores || []).map(color => {
      let colorName = typeof color === 'string' ? color : (color?.nombre || color?.name || '');
      // Limpiar nombres como "Azul 500", "Rojo 900" etc
      colorName = colorName.replace(/\s*\d+$/, '').trim();
      const colorHex = typeof color === 'string' ? getColorValue(colorName) : (color?.hex || color?.color || getColorValue(colorName));
      return { nombre: colorName, hex: colorHex || '#808080' };
    }).filter(c => c.nombre);
    
    setFormData({
      nombre: product.nombre || '',
      descripcion: product.descripcion || '',
      colores: normalizedColors,
    });
    setExistingImages(product.imagenes || []);
    setNewImages([]);
    setImagePreviews([]);
    setImagesToDelete([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    imagePreviews.forEach(preview => revokeImagePreview(preview.url));
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ nombre: '', descripcion: '', colores: [] });
    setNewImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setColorInput('');
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    const currentTotal = existingImages.length - imagesToDelete.length + newImages.length;
    const availableSlots = MAX_IMAGES - currentTotal;
    
    if (files.length > availableSlots) {
      toast.warning(`Solo puedes agregar ${availableSlots} imagen(es) más. Máximo ${MAX_IMAGES} por producto.`);
      return;
    }

    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      const compressedFiles = await compressMultipleImages(files, (progress) => {
        setCompressionProgress(Math.round(progress));
      });

      const newPreviews = compressedFiles.map((file, index) => ({
        id: `new_${Date.now()}_${index}`,
        url: createImagePreview(file),
        file
      }));

      setNewImages(prev => [...prev, ...compressedFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
      toast.success(`${compressedFiles.length} imagen(es) comprimida(s) correctamente`);
    } catch (error) {
      console.error('Error compressing images:', error);
      toast.error('Error al comprimir las imágenes');
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  const removeNewImage = (index) => {
    revokeImagePreview(imagePreviews[index].url);
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const markExistingImageForDeletion = (imageIndex) => {
    setImagesToDelete(prev => [...prev, imageIndex]);
  };

  const unmarkImageForDeletion = (imageIndex) => {
    setImagesToDelete(prev => prev.filter(i => i !== imageIndex));
  };

  // Nuevas funciones para ver imagen y eliminar con confirmación
  const handleViewImage = (image) => {
    setViewingImage(image);
  };

  const handleDeleteImageClick = (index) => {
    setImageToDelete(index);
  };

  const confirmDeleteImage = () => {
    if (imageToDelete !== null) {
      markExistingImageForDeletion(imageToDelete);
      setImageToDelete(null);
    }
  };

  const cancelDeleteImage = () => {
    setImageToDelete(null);
  };

  // Funciones para ajuste de imagen
  const handleAdjustImage = (image, index) => {
    const currentPosition = image.position || 'center';
    setAdjustingImage({ image, index });
    setImagePositions(prev => ({
      ...prev,
      [index]: currentPosition
    }));
  };

  const handlePositionChange = (position) => {
    if (adjustingImage) {
      setImagePositions(prev => ({
        ...prev,
        [adjustingImage.index]: position
      }));
    }
  };

  const saveImagePosition = () => {
    if (adjustingImage) {
      // Actualizar la posición de la imagen existente
      const updatedImages = [...existingImages];
      if (updatedImages[adjustingImage.index]) {
        updatedImages[adjustingImage.index] = {
          ...updatedImages[adjustingImage.index],
          position: imagePositions[adjustingImage.index] || 'center'
        };
        setExistingImages(updatedImages);
      }
      toast.success('Posición guardada');
    }
    setAdjustingImage(null);
  };


  // Detect color using AI
  const detectColor = async () => {
    if (!colorInput.trim()) return;
    
    setIsDetectingColor(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/detect-color`, {
        text: colorInput.trim()
      });
      
      const { color_name, hex_code } = response.data;
      
      const exists = formData.colores.some(
        c => c.nombre.toLowerCase() === color_name.toLowerCase()
      );
      
      if (!exists) {
        setFormData(prev => ({
          ...prev,
          colores: [...prev.colores, { nombre: color_name, hex: hex_code }]
        }));
        toast.success(`Color "${color_name}" detectado`);
      } else {
        toast.info('Este color ya está agregado');
      }
      setColorInput('');
    } catch (error) {
      console.error('Error detecting color:', error);
      // Fallback
      const colorName = colorInput.trim();
      const exists = formData.colores.some(
        c => c.nombre.toLowerCase() === colorName.toLowerCase()
      );
      if (!exists) {
        setFormData(prev => ({
          ...prev,
          colores: [...prev.colores, { nombre: colorName, hex: getColorValue(colorName) || '#808080' }]
        }));
      }
      setColorInput('');
    } finally {
      setIsDetectingColor(false);
    }
  };

  const handleColorKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      detectColor();
    }
  };

  const removeColor = (colorName) => {
    setFormData(prev => ({
      ...prev,
      colores: prev.colores.filter(c => c.nombre !== colorName)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre del producto es requerido');
      return;
    }

    const totalImages = existingImages.length - imagesToDelete.length + newImages.length;
    if (totalImages === 0) {
      toast.error('Debes agregar al menos una imagen');
      return;
    }

    setIsSubmitting(true);

    try {
      const coloresForFirebase = formData.colores.map(c => ({
        nombre: c.nombre,
        hex: c.hex
      }));

      const remainingExistingImages = existingImages.filter((_, idx) => !imagesToDelete.includes(idx));

      let result;
      
      if (editingProduct) {
        result = await updateProduct(
          editingProduct.id,
          { ...formData, colores: coloresForFirebase, imagenes: remainingExistingImages },
          newImages,
          []
        );
      } else {
        result = await createProduct({ ...formData, colores: coloresForFirebase }, newImages);
      }

      // Verificar si hubo error
      if (!result.success) {
        // Si es un error de tamaño, mostrar mensaje específico
        if (result.isSizeError) {
          toast.error(result.error, { duration: 8000 });
        } else {
          toast.error(result.error || 'Error al guardar el producto');
        }
        setIsSubmitting(false);
        return;
      }

      // Éxito
      toast.success(editingProduct ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error inesperado al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    try {
      await deleteProduct(product.id);
      toast.success('Producto eliminado');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };

  const renderColorBadge = (color, removable = false) => {
    let colorName = typeof color === 'string' ? color : (color?.nombre || color?.name || '');
    // Limpiar nombres como "Azul 500", "Rojo 900" etc - quitar números al final
    colorName = colorName.replace(/\s*\d+$/, '').trim();
    
    const colorHex = typeof color === 'string' ? getColorValue(colorName) : (color?.hex || color?.color || getColorValue(colorName));
    
    if (!colorName) return null;
    
    return (
      <span
        key={colorName}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200"
      >
        {colorHex && (
          <span
            className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-500 shadow-sm"
            style={{ background: colorHex }}
          />
        )}
        {colorName}
        {removable && (
          <button
            type="button"
            onClick={() => removeColor(typeof color === 'string' ? color : (color?.nombre || color?.name))}
            className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FAFAF8] via-[#F5F0E8] to-[#EDE6DB] dark:from-[#0a0a0a] dark:via-[#1a1520] dark:to-[#000000]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-100 dark:border-[#2d1f3f]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-2xl font-light tracking-wider text-gray-800 dark:text-white" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                <span className="hidden sm:inline">jessicaalesuarez</span>
                <span className="sm:hidden">jessica</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#9d8fb3] hidden sm:block">Panel de Administración</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] transition-all text-sm"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C9A96E] hover:bg-[#B8986A] text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-white/60">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos. ¡Crea el primero!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group bg-white dark:bg-[#2d2640] rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl dark:shadow-gray-900/20 transition-all animate-fadeIn"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Product Image */}
                <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-[#1a1625] relative">
                  {product.imagenes && product.imagenes.length > 0 ? (
                    <img
                      src={getImageUrl(product.imagenes[0])}
                      alt={product.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-[#555555]">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => openEditModal(product)}
                      className="w-8 h-8 bg-white dark:bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-600 dark:text-[#d1d1d1]" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product)}
                      className="w-8 h-8 bg-white dark:bg-[#2d2640] rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>

                  {product.imagenes && product.imagenes.length > 1 && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded-full text-white text-xs">
                      {product.imagenes.length}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4 space-y-2">
                  <h3 className="font-medium text-sm text-gray-800 dark:text-white truncate">
                    {product.nombre}
                  </h3>
                  
                  {product.colores && product.colores.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.colores.map(color => renderColorBadge(color))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer - Always at bottom */}
      <footer className="bg-white/80 dark:bg-[#1a1625]/95 border-t border-gray-200 dark:border-white/5 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-gray-600 dark:text-white/60 text-sm">© 2026 jessicaalesuarez</p>
          <p className="text-gray-500 dark:text-white/50 text-xs italic">Gracias por su preferencia ♥</p>
        </div>
      </footer>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="min-h-full flex items-start sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white dark:bg-[#2d2640] w-full sm:max-w-lg sm:rounded-2xl overflow-hidden shadow-2xl animate-slideIn">
              <div className="sticky top-0 bg-white dark:bg-[#2d2640] border-b border-gray-200 dark:border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a1625] flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1.5">
                    Nombre del producto *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej. Consola de videojuegos"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1625] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A96E] transition-all text-sm"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1.5">
                    Descripción <span className="text-gray-400">(opcional)</span>
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Describe el producto..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1625] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A96E] transition-all text-sm resize-none"
                  />
                </div>

                {/* Colores con IA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1.5">
                    Colores
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-[#C9A96E]">
                      <Sparkles className="w-3 h-3" /> IA
                    </span>
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      onKeyDown={handleColorKeyDown}
                      placeholder="Ej: madera, cielo, neón rosa..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1625] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A96E] transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={detectColor}
                      disabled={isDetectingColor || !colorInput.trim()}
                      className="px-4 py-2.5 bg-[#C9A96E] hover:bg-[#B8986A] text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                      {isDetectingColor ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {formData.colores.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.colores.map((color) => renderColorBadge(color, true))}
                    </div>
                  )}
                </div>

                {/* Imágenes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1.5">
                    Imágenes * <span className="text-gray-400">(máx. {MAX_IMAGES})</span>
                  </label>

                  {/* Existing + New Images Grid - BOTONES REDISEÑADOS */}
                  {(existingImages.length > 0 || imagePreviews.length > 0) && (
                    <div className="grid grid-cols-4 gap-4 mb-3">
                      {existingImages.map((image, idx) => (
                        <div
                          key={`existing-${idx}`}
                          className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 dark:border-white/10 group"
                        >
                          <img
                            src={getImageUrl(image)}
                            alt={`Imagen ${idx + 1}`}
                            className={`w-full h-full object-cover transition-all ${
                              imagesToDelete.includes(idx) ? 'opacity-30' : ''
                            }`}
                          />
                          
                          {/* Overlay con botones - Solo si NO está marcada para eliminar */}
                          {!imagesToDelete.includes(idx) && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                              {/* Botones en la parte inferior */}
                              <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleViewImage(image)}
                                  className="flex-1 py-2.5 bg-white/95 hover:bg-white text-gray-800 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg hover:scale-105 active:scale-95"
                                  title="Ver imagen"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  <span className="text-xs font-medium">Ver</span>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => handleAdjustImage(image, idx)}
                                  className="flex-1 py-2.5 bg-purple-500/95 hover:bg-purple-500 text-white rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg hover:scale-105 active:scale-95"
                                  title="Ajustar"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                  </svg>
                                  <span className="text-xs font-medium">Ajustar</span>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => handleDeleteImageClick(idx)}
                                  className="flex-1 py-2.5 bg-red-500/95 hover:bg-red-500 text-white rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg hover:scale-105 active:scale-95"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="text-xs font-medium">Borrar</span>
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {/* Botón de deshacer - SIN opacidad */}
                          {imagesToDelete.includes(idx) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                              <button
                                type="button"
                                onClick={() => unmarkImageForDeletion(idx)}
                                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg shadow-xl hover:scale-110 active:scale-95 transition-all"
                              >
                                ↺ Deshacer
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {imagePreviews.map((preview, idx) => (
                        <div
                          key={preview.id}
                          className="relative aspect-square rounded-xl overflow-hidden border-2 border-green-500 group"
                        >
                          <img
                            src={preview.url}
                            alt={`Nueva ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <button
                                type="button"
                                onClick={() => removeNewImage(idx)}
                                className="w-full py-2.5 bg-red-500/95 hover:bg-red-500 text-white rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg hover:scale-105 active:scale-95"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-xs font-medium">Borrar</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Compression Progress */}
                  {isCompressing && (
                    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          Comprimiendo... {compressionProgress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${compressionProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  {(existingImages.length - imagesToDelete.length + newImages.length) < MAX_IMAGES && (
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        disabled={isCompressing}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-[#C9A96E] transition-all group">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1 group-hover:text-[#C9A96E] transition-colors" />
                        <p className="text-gray-500 dark:text-white/60 text-xs">
                          Haz clic para subir imágenes
                        </p>
                      </div>
                    </label>
                  )}

                  <p className="text-xs text-gray-400 mt-1.5">
                    {existingImages.length - imagesToDelete.length + newImages.length} / {MAX_IMAGES}
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="w-full py-3 px-4 bg-[#C9A96E] hover:bg-[#B8986A] text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#2d2640] rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-slideIn">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Eliminar producto</h3>
                <p className="text-xs text-gray-500 dark:text-white/60">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-white/80 text-sm mb-4">
              ¿Eliminar <strong>{deleteConfirm.nombre}</strong>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white/80 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1a1625] transition-all text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Ver Imagen */}
      {viewingImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-fadeIn"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative w-full h-full max-w-6xl max-h-[95vh] flex items-center justify-center">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={getImageUrl(viewingImage)}
              alt="Vista previa"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación de Imagen */}
      {imageToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#2d2640] rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-slideIn">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Eliminar imagen</h3>
                <p className="text-xs text-gray-500 dark:text-white/60">¿Estás seguro?</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-white/80 text-sm mb-4">
              Esta imagen será eliminada cuando guardes el producto.
            </p>
            <div className="flex gap-2">
              <button
                onClick={cancelDeleteImage}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white/80 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1a1625] transition-all text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteImage}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all text-sm"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ajuste de Imagen - REDISEÑADO ELEGANTE */}
      {adjustingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-[#1a1520] rounded-3xl w-full max-w-5xl shadow-2xl animate-slideIn overflow-hidden">
            
            {/* Header Elegante */}
            <div className="relative bg-gradient-to-r from-[#C9A96E] to-[#B8986A] p-6">
              <h3 className="text-2xl font-light text-white tracking-wide">Ajustar Encuadre</h3>
              <p className="text-white/80 text-sm mt-1">Elige qué parte de la imagen mostrar en el catálogo</p>
              <button
                onClick={() => setAdjustingImage(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Contenido Principal */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Vista Previa Grande */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-white/80 uppercase tracking-wider">
                      Vista Previa
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-white/60">
                      Así se verá en el catálogo
                    </span>
                  </div>
                  
                  {/* Preview Box Grande */}
                  <div className="relative w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#0a0a0a] dark:to-[#1a1520] rounded-2xl overflow-hidden shadow-inner border-4 border-gray-200 dark:border-[#2d1f3f]">
                    <img
                      src={getImageUrl(adjustingImage.image)}
                      alt="Preview"
                      className="w-full h-full object-cover transition-all duration-500"
                      style={{
                        objectPosition: imagePositions[adjustingImage.index] || 'center'
                      }}
                    />
                    {/* Overlay con cruz centrada */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30"></div>
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#C9A96E] shadow-lg"></div>
                    </div>
                  </div>
                </div>

                {/* Controles de Posición Elegantes */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-white/80 uppercase tracking-wider mb-4">
                      Posición del Encuadre
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-white/60 mb-6">
                      Selecciona hacia dónde centrar la imagen
                    </p>
                  </div>

                  {/* Grid de Posiciones 3x3 - MÁS ESPACIADO */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { pos: 'top left', label: '↖', desc: 'Superior Izq' },
                      { pos: 'top center', label: '↑', desc: 'Superior' },
                      { pos: 'top right', label: '↗', desc: 'Superior Der' },
                      { pos: 'center left', label: '←', desc: 'Izquierda' },
                      { pos: 'center', label: '●', desc: 'Centro' },
                      { pos: 'center right', label: '→', desc: 'Derecha' },
                      { pos: 'bottom left', label: '↙', desc: 'Inferior Izq' },
                      { pos: 'bottom center', label: '↓', desc: 'Inferior' },
                      { pos: 'bottom right', label: '↘', desc: 'Inferior Der' }
                    ].map(({ pos, label, desc }) => {
                      const isSelected = !imagePositions[adjustingImage.index] 
                        ? pos === 'center' 
                        : imagePositions[adjustingImage.index] === pos;
                      
                      return (
                        <button
                          key={pos}
                          onClick={() => handlePositionChange(pos)}
                          className={`group relative py-6 rounded-xl border-2 transition-all duration-300 ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#C9A96E] to-[#B8986A] border-[#C9A96E] shadow-lg scale-105'
                              : 'border-gray-300 dark:border-white/20 hover:border-[#C9A96E] hover:shadow-md hover:scale-105'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <span className={`text-3xl font-light transition-colors ${
                              isSelected ? 'text-white' : 'text-gray-400 dark:text-white/40 group-hover:text-[#C9A96E]'
                            }`}>
                              {label}
                            </span>
                            <span className={`text-xs font-medium transition-colors ${
                              isSelected ? 'text-white' : 'text-gray-500 dark:text-white/60 group-hover:text-[#C9A96E]'
                            }`}>
                              {desc}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3 text-[#C9A96E]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Info adicional */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800/30">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">Consejo</p>
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                          Usa las flechas para centrar la parte más importante del producto
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con Botones */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-[#2d1f3f] bg-gray-50 dark:bg-[#0a0a0a]">
              <button
                onClick={() => setAdjustingImage(null)}
                className="flex-1 py-3.5 px-6 border-2 border-gray-300 dark:border-white/20 text-gray-700 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={saveImagePosition}
                className="flex-1 py-3.5 px-6 bg-gradient-to-r from-[#C9A96E] to-[#B8986A] hover:from-[#B8986A] hover:to-[#A88759] text-white rounded-xl transition-all text-sm font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Guardar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
