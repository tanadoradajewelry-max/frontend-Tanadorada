import Reveal from "./Reveal";

export default function Hero({ data }) {
  return (
    <div className="hero-minimal">
      <div className="hero-minimal-image-wrapper">
        <img src={data.image} alt="TANADORADA" />
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
    </div>
  );
}
