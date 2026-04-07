import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { useClientes } from '../hooks/useClientes';
import { usePedidos } from '../hooks/usePedidos';
import { useCart } from '../context/CartContext';
import { ThemeToggle } from './ThemeToggle';
import { useToastCustom } from './Toast';
import { openTicketPDF } from '../lib/ticketGenerator';
import SeccionProductos from './ventas/SeccionProductos';
import SeccionClientes from './ventas/SeccionClientes';
import SeccionPedidos from './ventas/SeccionPedidos';
import ModalProducto from './ventas/ModalProducto';
import ModalCarrito from './ventas/ModalCarrito';
import ModalCliente from './ventas/ModalCliente';
import ModalEliminarCliente from './ventas/ModalEliminarCliente';
import { 
  LogOut, Search, ShoppingCart, ChevronDown, Filter, Package
} from 'lucide-react';

const PanelVentas = () => {
  const { logout, user } = useAuth();
  const { products, loading: loadingProducts } = useProducts();
  const { clientes, createCliente, updateCliente, deleteCliente, incrementarPedidos } = useClientes();
  const { pedidos, createPedido, getPedidosConAdeudo } = usePedidos();
  const { 
    carritoLocal, addToCarritoLocal, removeFromCarritoLocal, clearCarritoLocal, getTotalCarritoLocal, getCountCarritoLocal,
    carritosClientes, addToCarritoCliente, removeFromCarritoCliente, clearCarritoCliente, getTotalCarritoCliente, getCountCarritoCliente
  } = useCart();
  const { toast } = useToastCustom();

  // Estados UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Productos');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Modales
  const [isCarritoOpen, setIsCarritoOpen] = useState(false);
  const [carritoActual, setCarritoActual] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteStep, setDeleteStep] = useState(0);

  // Estados de formularios
  const [coloresSeleccionados, setColoresSeleccionados] = useState({});
  const [precioPersonalizado, setPrecioPersonalizado] = useState('');
  const [usarPrecioEspecial, setUsarPrecioEspecial] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const getFilteredData = () => {
    if (!searchTerm) {
      if (filterType === 'Productos') return products;
      if (filterType === 'Clientes') return clientes;
      if (filterType === 'Pedidos') return pedidos;
      if (filterType === 'Deudores') return getPedidosConAdeudo();
    }

    const term = searchTerm.toLowerCase();
    if (filterType === 'Productos') {
      return products.filter(p => p.nombre.toLowerCase().includes(term));
    }
    if (filterType === 'Clientes') {
      return clientes.filter(c => c.nombre.toLowerCase().includes(term));
    }
    if (filterType === 'Pedidos' || filterType === 'Deudores') {
      return pedidos.filter(p => 
        p.numeroOrden?.includes(term) || 
        p.clienteNombre?.toLowerCase().includes(term)
      );
    }
    return [];
  };

  // Abrir modal de producto
  const openProductModal = (product, clienteId = null) => {
    setSelectedProduct(product);
    setSelectedCliente(clienteId);
    setColoresSeleccionados({});
    setPrecioPersonalizado('');
    setUsarPrecioEspecial(false);
    setIsProductModalOpen(true);
  };

  // Agregar al carrito
  const handleAgregarAlCarrito = () => {
    if (!selectedProduct) return;

    const coloresArray = Object.entries(coloresSeleccionados)
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([color, cantidad]) => ({
        color,
        cantidad,
        precio: parseFloat(precioPersonalizado) || 0
      }));

    if (coloresArray.length === 0) {
      toast.error('Selecciona al menos un color');
      return;
    }

    if (!precioPersonalizado || parseFloat(precioPersonalizado) <= 0) {
      toast.error('Ingresa un precio válido');
      return;
    }

    const subtotal = coloresArray.reduce((sum, c) => sum + (c.cantidad * c.precio), 0);

    const productoParaCarrito = {
      productoId: selectedProduct.id,
      nombre: selectedProduct.nombre,
      imagen: selectedProduct.imagenes?.[0]?.url || selectedProduct.imagenes?.[0] || null,
      colores: coloresArray,
      subtotal
    };

    if (selectedCliente) {
      addToCarritoCliente(selectedCliente, productoParaCarrito);
      const cliente = clientes.find(c => c.id === selectedCliente);
      toast.success(`Añadido al carrito de ${cliente?.nombre}`);
    } else {
      addToCarritoLocal(productoParaCarrito);
      toast.success('Añadido al carrito local');
    }

    setIsProductModalOpen(false);
  };

  // Abrir carrito
  const openCarrito = (clienteId = null) => {
    setCarritoActual(clienteId);
    setIsCarritoOpen(true);
  };

  // Generar ticket
  const handleGenerarTicket = async () => {
    const carrito = carritoActual ? carritosClientes[carritoActual] || [] : carritoLocal;
    
    if (carrito.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    const totalArticulos = carrito.reduce((sum, item) => {
      return sum + item.colores.reduce((s, c) => s + c.cantidad, 0);
    }, 0);

    const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);
    const totalConIVA = total * 1.16;

    const clienteData = carritoActual ? clientes.find(c => c.id === carritoActual) : null;

    const pedidoData = {
      tipo: carritoActual ? 'cliente' : 'local',
      clienteId: carritoActual,
      clienteNombre: clienteData?.nombre || 'LOCAL',
      productos: carrito,
      totalArticulos,
      totalConIVA,
      usuario: user?.email || 'Desconocido',
      pagado: true,
      adeudo: 0
    };

    const result = await createPedido(pedidoData);
    
    if (result.success) {
      if (carritoActual) {
        await incrementarPedidos(carritoActual);
      }

      openTicketPDF({ ...pedidoData, numeroOrden: result.numeroOrden, fecha: new Date() });
      
      if (carritoActual) {
        clearCarritoCliente(carritoActual);
      } else {
        clearCarritoLocal();
      }
      
      setIsCarritoOpen(false);
      toast.success('Ticket generado exitosamente');
    } else {
      toast.error('Error al generar ticket');
    }
  };

  // CRUD Clientes
  const handleCrearCliente = () => {
    setEditingCliente(null);
    setIsClienteModalOpen(true);
  };

  const handleEditarCliente = (cliente) => {
    setEditingCliente(cliente);
    setIsClienteModalOpen(true);
  };

  const handleGuardarCliente = async (nombre) => {
    if (editingCliente) {
      const result = await updateCliente(editingCliente.id, { nombre });
      if (result.success) {
        toast.success('Cliente actualizado');
        setIsClienteModalOpen(false);
      } else {
        toast.error('Error al actualizar cliente');
      }
    } else {
      const result = await createCliente(nombre);
      if (result.success) {
        toast.success('Cliente creado');
        setIsClienteModalOpen(false);
      } else {
        toast.error('Error al crear cliente');
      }
    }
  };

  const handleEliminarCliente = (cliente) => {
    setDeleteConfirm(cliente);
    setDeleteStep(0);
  };

  const handleConfirmarEliminar = async () => {
    if (!deleteConfirm) return;

    if (deleteStep < 2) {
      setDeleteStep(deleteStep + 1);
      return;
    }

    const result = await deleteCliente(deleteConfirm.id);
    if (result.success) {
      toast.success('Cliente eliminado');
      setDeleteConfirm(null);
      setDeleteStep(0);
    } else {
      toast.error('Error al eliminar cliente');
    }
  };

  const handleCrearPedido = (cliente) => {
    setSelectedCliente(cliente.id);
  };

  const handleEditarPrecios = (cliente) => {
    toast.info('Función de precios especiales en desarrollo');
  };

  const handleVerPedido = (pedido) => {
    if (pedido.numeroOrden) {
      openTicketPDF(pedido);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FAFAF8] via-[#F5F0E8] to-[#EDE6DB] dark:from-[#0a0a0a] dark:via-[#1a1520] dark:to-[#000000]">
      {/* Header */}
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
              <button
                onClick={() => openCarrito(null)}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-[#2d1f3f] rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-white" />
                {getCountCarritoLocal() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C9A96E] text-white text-xs rounded-full flex items-center justify-center">
                    {getCountCarritoLocal()}
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Buscar ${filterType.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] transition-all text-sm"
            />
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-[#333333] rounded-xl text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#2d1f3f] transition-all text-sm"
            >
              <Filter className="w-4 h-4" />
              {filterType}
              <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a1520] rounded-xl shadow-xl border border-gray-200 dark:border-[#2d1f3f] overflow-hidden z-50">
                {['Productos', 'Clientes', 'Pedidos', 'Deudores'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setFilterType(filter);
                      setIsFilterOpen(false);
                      setSearchTerm('');
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-[#2d1f3f] transition-colors text-gray-700 dark:text-white text-sm"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Las 3 secciones - SIN OVERFLOW HIDDEN */}
        <div className="space-y-8">
          {/* SECCIÓN 1: PRODUCTOS */}
          <div className="bg-white dark:bg-[#2d2640] rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-[#C9A96E]" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Productos</h2>
            </div>
            <SeccionProductos 
              products={filterType === 'Productos' ? getFilteredData() : products}
              loading={loadingProducts}
              onProductClick={(product) => openProductModal(product, selectedCliente)}
            />
          </div>

          {/* SECCIÓN 2: CLIENTES */}
          <div className="bg-white dark:bg-[#2d2640] rounded-2xl p-6 shadow-lg">
            <SeccionClientes 
              clientes={filterType === 'Clientes' ? getFilteredData() : clientes}
              loading={false}
              onCrearCliente={handleCrearCliente}
              onEditarCliente={handleEditarCliente}
              onEliminarCliente={handleEliminarCliente}
              onCrearPedido={handleCrearPedido}
              onEditarPrecios={handleEditarPrecios}
            />
          </div>

          {/* SECCIÓN 3: PEDIDOS */}
          <div className="bg-white dark:bg-[#2d2640] rounded-2xl p-6 shadow-lg">
            <SeccionPedidos 
              pedidos={filterType === 'Pedidos' ? getFilteredData() : pedidos}
              pedidosConAdeudo={getPedidosConAdeudo()}
              loading={false}
              onVerPedido={handleVerPedido}
            />
          </div>
        </div>
      </main>

      {/* Modales */}
      <ModalProducto 
        product={selectedProduct}
        onClose={() => setIsProductModalOpen(false)}
        onAgregarAlCarrito={handleAgregarAlCarrito}
        coloresSeleccionados={coloresSeleccionados}
        setColoresSeleccionados={setColoresSeleccionados}
        precioPersonalizado={precioPersonalizado}
        setPrecioPersonalizado={setPrecioPersonalizado}
        usarPrecioEspecial={usarPrecioEspecial}
        setUsarPrecioEspecial={setUsarPrecioEspecial}
        isParaCliente={!!selectedCliente}
      />

      <ModalCarrito 
        isOpen={isCarritoOpen}
        onClose={() => setIsCarritoOpen(false)}
        carrito={carritoActual ? carritosClientes[carritoActual] || [] : carritoLocal}
        clienteNombre={carritoActual ? clientes.find(c => c.id === carritoActual)?.nombre : 'LOCAL'}
        onEliminarItem={(index) => {
          if (carritoActual) {
            removeFromCarritoCliente(carritoActual, index);
          } else {
            removeFromCarritoLocal(index);
          }
        }}
        onGenerarTicket={handleGenerarTicket}
        total={carritoActual ? getTotalCarritoCliente(carritoActual) : getTotalCarritoLocal()}
      />

      <ModalCliente 
        isOpen={isClienteModalOpen}
        onClose={() => setIsClienteModalOpen(false)}
        cliente={editingCliente}
        onGuardar={handleGuardarCliente}
      />

      <ModalEliminarCliente 
        isOpen={!!deleteConfirm}
        cliente={deleteConfirm}
        step={deleteStep}
        onConfirmar={handleConfirmarEliminar}
        onCancelar={() => {
          setDeleteConfirm(null);
          setDeleteStep(0);
        }}
      />
    </div>
  );
};

export default PanelVentas;
