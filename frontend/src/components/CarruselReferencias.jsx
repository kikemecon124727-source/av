import React, { useState, useEffect, useRef } from 'react';

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
        scrollPositionRef.current += 0.5;
        scrollContainerRef.current.scrollLeft = scrollPositionRef.current;

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

  const displayReferencias = referencias.length < 6 
    ? [...referencias, ...referencias, ...referencias] 
    : [...referencias, ...referencias];

  return (
    <div className="w-full py-6 bg-gray-50 dark:bg-[#0f0b13] border-t border-gray-200 dark:border-[#2d1f3f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Título */}
        <div className="text-center mb-4">
          <h2 className="text-xl sm:text-2xl font-light text-gray-800 dark:text-white mb-1">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-xs font-semibold text-gray-500 dark:text-[#8b7a9f]">
            Toca para detener
          </p>
        </div>

        {/* Carrusel */}
        <div 
          ref={scrollContainerRef}
          onClick={togglePause}
          className="overflow-x-hidden cursor-pointer select-none"
          style={{ scrollBehavior: 'auto' }}
        >
          <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
            {displayReferencias.map((referencia, index) => (
              <div
                key={`${referencia.id}-${index}`}
                className="flex-shrink-0 w-[280px] sm:w-[320px] bg-white dark:bg-[#1a1520] rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 dark:border-[#2d1f3f] overflow-hidden"
              >
                <div className="flex h-[120px]">
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
                        <div className="w-8 h-8 bg-gray-300 dark:bg-[#8b7a9f] rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Info - 60% */}
                  <div className="w-[60%] p-3 flex flex-col justify-center">
                    {/* Nombre cliente */}
                    <p className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                      {referencia.nombreCliente}
                    </p>

                    {/* Comentario */}
                    <p className="text-xs text-gray-600 dark:text-[#c4b5d4] line-clamp-3 leading-relaxed">
                      "{referencia.comentario}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarruselReferencias;
