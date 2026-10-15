import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Solo se aceptan links que empiecen con http(s).
const safeUrl = (url) => (/^https?:\/\//i.test(url || "") ? url : "");

export default function InstagramCarousel({ data }) {
  const items = (data?.items || []).filter((item) => item.image);
  const handle = (data?.handle || "").replace(/^@/, "").trim();
  const profileUrl = handle ? `https://www.instagram.com/${handle}/` : "";

  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);
    return () => observer.disconnect();
  }, [items.length]);

  const scrollByPage = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  // Sin fotos guardadas no se muestra nada.
  if (items.length === 0) return null;

  return (
    <section className="instagram-section">
      <Reveal as="div" className="instagram-header">
        <h2 className="instagram-title">
          {data.title || "Síguenos en"}{" "}
          {handle && (
            <a href={profileUrl} target="_blank" rel="noopener noreferrer">
              @{handle}
            </a>
          )}
        </h2>
      </Reveal>

      <div className="instagram-carousel">
        {!atStart && (
          <button
            type="button"
            className="instagram-arrow instagram-arrow--prev"
            onClick={() => scrollByPage(-1)}
            aria-label="Anteriores"
          >
            ‹
          </button>
        )}

        <div className="instagram-track" ref={trackRef} onScroll={updateArrows}>
          {items.map((item, index) => {
            const href = safeUrl(item.link) || profileUrl;
            const content = (
              <>
                <img
                  src={item.image}
                  alt={`Foto ${index + 1} de Instagram`}
                  loading="lazy"
                />
                <span className="instagram-item-overlay">
                  <InstagramIcon />
                </span>
              </>
            );

            return href ? (
              <a
                key={index}
                className="instagram-item"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver en Instagram"
              >
                {content}
              </a>
            ) : (
              <div key={index} className="instagram-item">
                {content}
              </div>
            );
          })}
        </div>

        {!atEnd && (
          <button
            type="button"
            className="instagram-arrow instagram-arrow--next"
            onClick={() => scrollByPage(1)}
            aria-label="Siguientes"
          >
            ›
          </button>
        )}
      </div>
    </section>
  );
}