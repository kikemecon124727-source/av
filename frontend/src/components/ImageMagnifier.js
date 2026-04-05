import React, { useState, useRef } from 'react';

/**
 * Componente de zoom tipo lupa (estilo Mercado Libre)
 * Muestra un círculo magnificador que sigue el cursor
 */
const ImageMagnifier = ({ src, alt, zoomLevel = 2.5 }) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const imgRef = useRef(null);

  const handleMouseEnter = (e) => {
    const elem = e.currentTarget;
    const { width, height } = elem.getBoundingClientRect();
    setImgSize({ width, height });
    setShowMagnifier(true);
  };

  const handleMouseMove = (e) => {
    const elem = e.currentTarget;
    const { top, left } = elem.getBoundingClientRect();

    // Calcular posición del cursor relativa a la imagen
    const x = e.pageX - left - window.pageXOffset;
    const y = e.pageY - top - window.pageYOffset;

    setMagnifierPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  const magnifierSize = 150; // Tamaño del círculo de la lupa

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full h-full object-contain cursor-crosshair"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {/* Círculo de la lupa */}
      {showMagnifier && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            height: `${magnifierSize}px`,
            width: `${magnifierSize}px`,
            top: `${magnifierPosition.y - magnifierSize / 2}px`,
            left: `${magnifierPosition.x - magnifierSize / 2}px`,
            opacity: '1',
            border: '3px solid rgba(255, 255, 255, 0.9)',
            backgroundColor: 'white',
            backgroundImage: `url('${src}')`,
            backgroundRepeat: 'no-repeat',
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            
            // Cálculo para mostrar la parte ampliada
            backgroundSize: `${imgSize.width * zoomLevel}px ${imgSize.height * zoomLevel}px`,
            backgroundPositionX: `${-magnifierPosition.x * zoomLevel + magnifierSize / 2}px`,
            backgroundPositionY: `${-magnifierPosition.y * zoomLevel + magnifierSize / 2}px`,
          }}
        />
      )}

      {/* Indicador */}
      {!showMagnifier && (
        <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
          Pasa el cursor para zoom
        </div>
      )}
    </div>
  );
};

export default ImageMagnifier;
