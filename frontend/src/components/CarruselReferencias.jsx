import React, { useState, useEffect, useRef } from 'react';
import { Star } from 'lucide-react';

const CarruselReferencias = ({ referencias }) => {
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef(null);
  const animationRef = useRef(null);
  const scrollPositionRef = useRef(0);

  // Auto-scroll continuo
  useEffect(() => {
    if (!scrollContainerRef.current || referencias.length === 0) return;

    const scroll = () => {
      if (!isPaused && scrollContainerRef.current) {
        scrollPositionRef.current += 0.5; // Velocidad suave
        scrollContainerRef.current.scrollLeft = scrollPositionRef.current;

        // Reset cuando llega al final (scroll infinito)
        const container = scrollContainerRef.current;
        if (scrollPositionRef.current >= container.scrollWidth - container.clientWidth) {
          scrollPositionRef.current = 0;
        }
      }
      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, referencias]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  if (!referencias || referencias.length === 0) {
    return null;
  }

  // Duplicar referencias para efecto infinito
  const displayReferencias = referencias.length < 6 
    ? [...referencias, ...referencias, ...referencias] 
    : [...referencias, ...referencias];

  return (
    <div className="w-full py-12 bg-gray-50 dark:bg-[#0f0b13] border-t border-gray-200 dark:border-[#2d1f3f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Título */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-light text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-2">
            <Star className="w-6 h-6 text-[#C9A96E] fill-[#C9A96E]" />
            Lo Que Dicen Nuestros Clientes
            <Star className="w-6 h-6 text-[#C9A96E] fill-[#C9A96E]" />
          </h2>
          <p className="text-sm text-gray-500 dark:text-[#8b7a9f] mt-2">
            {isPaused ? 'Toca para continuar' : 'Toca para detener'}
          </p>
        </div>

        {/* Carrusel */}
        <div 
          ref={scrollContainerRef}
          onClick={togglePause}
          className="overflow-x-hidden cursor-pointer select-none"
          style={{ scrollBehavior: 'auto' }}
        >
          <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
            {displayReferencias.map((referencia, index) => (
              <div
                key={`${referencia.id}-${index}`}
                className="flex-shrink-0 w-[340px] sm:w-[380px] bg-white dark:bg-[#1a1520] rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-[#2d1f3f] overflow-hidden"
              >
                <div className="flex h-full">
                  {/* Imagen - 40% */}
                  <div className="w-[40%] relative overflow-hidden bg-gray-100 dark:bg-[#2d1f3f]">
                    {referencia.imagen?.url ? (
                      <img
                        src={referencia.imagen.url}
                        alt={referencia.nombreCliente}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Star className="w-12 h-12 text-gray-300 dark:text-[#8b7a9f]" />
                      </div>
                    )}
                  </div>

                  {/* Info - 60% */}
                  <div className="w-[60%] p-4 sm:p-5 flex flex-col justify-center">
                    {/* Estrellas */}
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-4 h-4 text-[#C9A96E] fill-[#C9A96E]" 
                        />
                      ))}
                    </div>

                    {/* Comentario */}
                    <p className="text-sm text-gray-600 dark:text-[#c4b5d4] mb-3 line-clamp-3 leading-relaxed">
                      "{referencia.comentario}"
                    </p>

                    {/* Nombre cliente */}
                    <p className="text-base font-medium text-gray-800 dark:text-white">
                      {referencia.nombreCliente}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicador de estado */}
        <div className="text-center mt-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs ${
            isPaused 
              ? 'bg-gray-200 dark:bg-[#2d1f3f] text-gray-600 dark:text-[#8b7a9f]' 
              : 'bg-[#C9A96E]/10 text-[#C9A96E]'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-gray-400' : 'bg-[#C9A96E] animate-pulse'}`} />
            {isPaused ? 'Pausado' : 'Desplazándose'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarruselReferencias;
