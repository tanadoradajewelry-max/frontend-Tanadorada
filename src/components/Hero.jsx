import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

const SLIDE_INTERVAL_MS = 5000;

export default function Hero({ data }) {
  // Si el hero no tiene lista de imágenes (contenido viejo), usa la única.
  const slides = data.images?.length ? data.images : data.image ? [data.image] : [];
  const total = slides.length;

  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const current = total ? index % total : 0;

  // Avanza solo cada 5 segundos. Depende de "index", así que si la persona
  // toca un punto o desliza, el reloj arranca de nuevo.
  useEffect(() => {
    if (total < 2) return undefined;
    const timer = setTimeout(
      () => setIndex((i) => (i + 1) % total),
      SLIDE_INTERVAL_MS
    );
    return () => clearTimeout(timer);
  }, [index, total]);

  const goTo = (next) => setIndex(((next % total) + total) % total);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null || total < 2) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    goTo(delta < 0 ? current + 1 : current - 1);
  };

  return (
    <div
      className="hero-minimal"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero-minimal-image-wrapper">
        <div
          className="hero-minimal-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((src, i) => (
            <div className="hero-minimal-slide" key={i}>
              <img src={src} alt="TANADORADA" />
            </div>
          ))}
        </div>
      </div>
      <div className="hero-minimal-overlay" />

      <Reveal as="div" className="hero-minimal-content">
        <span className="hero-minimal-eyebrow">{data.eyebrow}</span>
        <h1 className="hero-minimal-headline">{data.headline}</h1>
        <p className="hero-minimal-subtext">{data.subtext}</p>
        <a href={data.buttonHref} className="btn btn--primary">
          {data.buttonText}
        </a>
      </Reveal>

      {total > 1 && (
        <div className="hero-minimal-dots">
          {slides.map((_, i) => (
            <button
              type="button"
              key={i}
              className={`hero-minimal-dot ${
                i === current ? "hero-minimal-dot--active" : ""
              }`}
              onClick={() => setIndex(i)}
              aria-label={`Ir a la imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
