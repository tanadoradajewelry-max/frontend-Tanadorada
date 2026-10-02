import Reveal from "./Reveal";

export default function Hero() {
  return (
    <div className="hero-minimal">
      <div className="hero-minimal-image-wrapper">
        <img src="/img/1.jpg" alt="TANADORADA" />
      </div>
      <div className="hero-minimal-overlay" />

      <Reveal as="div" className="hero-minimal-content">
        <span className="hero-minimal-eyebrow">Nueva Colección</span>
        <h1 className="hero-minimal-headline">Brilla. Luce. Repite.</h1>
        <p className="hero-minimal-subtext">
          Piezas atemporales en oro, pensadas para el día a día
        </p>
        <a href="#best-sellers" className="btn btn--primary">
          Explorar Colección
        </a>
      </Reveal>
    </div>
  );
}