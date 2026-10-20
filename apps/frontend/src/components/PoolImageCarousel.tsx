import React, { useState } from 'react';

interface PoolImageCarouselProps {
  images: string[];
  label: string;
}

export const PoolImageCarousel: React.FC<PoolImageCarouselProps> = ({ images, label }) => {
  const [index, setIndex] = useState(0);
  if (!images.length) return null;
  return (
    <div className="pool-carousel" aria-label={`Carrusel de imágenes: ${label}`}>
      <img src={images[index]} alt={`${label}, imagen ${index + 1} de ${images.length}`} loading="lazy" />
      {images.length > 1 && (
        <div className="pool-carousel__controls">
          <button type="button" aria-label="Imagen anterior" onClick={() => setIndex((current) => (current - 1 + images.length) % images.length)}>‹</button>
          <span aria-live="polite">{index + 1} / {images.length}</span>
          <button type="button" aria-label="Imagen siguiente" onClick={() => setIndex((current) => (current + 1) % images.length)}>›</button>
        </div>
      )}
    </div>
  );
};
