import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

const SLIDE_INTERVAL_MS = 5000;

export default function AboutUs({ data }) {
  // Si el bloque no tiene lista de imágenes (contenido viejo), usa la única.
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
    <section className="about-us">
      <Reveal as="div" className="about-us-inner">
        <div
          className="about-us-image-wrapper"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="about-us-track"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map((src, i) => (
              <div className="about-us-slide" key={i}>
                <img src={src} alt={data.title} />
              </div>
            ))}
          </div>

          {total > 1 && (
            <div className="about-us-dots">
              {slides.map((_, i) => (
                <button
                  type="button"
                  key={i}
                  className={`about-us-dot ${
                    i === current ? "about-us-dot--active" : ""
                  }`}
                  onClick={() => setIndex(i)}
                  aria-label={`Ir a la imagen ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="about-us-text">
          <span className="about-us-eyebrow">{data.eyebrow}</span>
          <h2 className="about-us-title">{data.title}</h2>

          <div className="about-us-body">
            {data.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
