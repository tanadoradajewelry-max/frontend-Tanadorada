import { useRef, useState } from "react";

export default function ProductGallery({ images, title, badge }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const total = images.length;

  const goTo = (next) => setIndex(((next % total) + total) % total);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null || total < 2) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    goTo(delta < 0 ? index + 1 : index - 1);
  };

  return (
    <div className="product-gallery">
      <div
        className="product-gallery-main"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {badge && <span className="badge-tag">{badge}</span>}

        <div
          className="product-gallery-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, i) => (
            <div className="product-gallery-slide" key={i}>
              <img src={src} alt={`${title} ${i + 1}`} />
            </div>
          ))}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              className="product-gallery-arrow product-gallery-arrow--prev"
              onClick={() => goTo(index - 1)}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className="product-gallery-arrow product-gallery-arrow--next"
              onClick={() => goTo(index + 1)}
              aria-label="Imagen siguiente"
            >
              ›
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="product-gallery-thumbs">
          {images.map((src, i) => (
            <button
              type="button"
              key={i}
              className={`product-gallery-thumb ${
                i === index ? "product-gallery-thumb--active" : ""
              }`}
              onClick={() => setIndex(i)}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}