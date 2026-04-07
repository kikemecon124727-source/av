import React from 'react';
import { FileText, DollarSign, AlertCircle } from 'lucide-react';

const SeccionPedidos = ({ 
  pedidos, 
  pedidosConAdeudo,
  loading,
  onVerPedido 
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pedidosPagados = pedidos.filter(p => p.pagado && (!p.adeudo || p.adeudo === 0));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Pedidos Normales */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          PEDIDOS
        </h3>
        
        <div className="bg-white dark:bg-[#2d2640] rounded-xl overflow-hidden">
          {pedidosPagados.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-white/60 text-sm">No hay pedidos</p>
            </div>
          ) : (
            <div className={`divide-y divide-gray-200 dark:divide-white/10 ${pedidosPagados.length > 10 ? 'max-h-96 overflow-y-auto' : ''}`}>
              {pedidosPagados.map((pedido) => (
                <button
                  key={pedido.id}
                  onClick={() => onVerPedido(pedido)}
                  className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#1a1625] transition-colors text-left"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">
                        No. {pedido.numeroOrden?.slice(-6) || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#8b7a9f] mt-1">
                        {pedido.clienteNombre || 'LOCAL'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#C9A96E] text-sm">
                        ${pedido.totalConIVA?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#8b7a9f] mt-1">
                        {pedido.totalArticulos || 0} arts.
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pedidos con Adeudo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          PEDIDOS CON ADEUDO
        </h3>
        
        <div className="bg-white dark:bg-[#2d2640] rounded-xl overflow-hidden">
          {pedidosConAdeudo.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-white/60 text-sm">No hay adeudos</p>
            </div>
          ) : (
            <div className={`divide-y divide-gray-200 dark:divide-white/10 ${pedidosConAdeudo.length > 10 ? 'max-h-96 overflow-y-auto' : ''}`}>
              {pedidosConAdeudo.map((pedido) => (
                <button
                  key={pedido.id}
                  onClick={() => onVerPedido(pedido)}
                  className="w-full px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors text-left"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">
                        No. {pedido.numeroOrden?.slice(-6) || 'N/A'}
                      </p>
                      <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mt-1">
                        {pedido.clienteNombre || 'LOCAL'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-600 dark:text-orange-400 text-sm">
                        Adeudo: ${pedido.adeudo?.toFixed(2) || pedido.totalConIVA?.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#8b7a9f] mt-1">
                        {pedido.totalArticulos || 0} arts.
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeccionPedidos;
