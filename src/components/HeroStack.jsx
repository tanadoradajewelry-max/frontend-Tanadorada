import Reveal from "./Reveal";
import { heroSlides } from "../data/storeData";

function HeroSlide({ slide, stackIndex, isFirst }) {
  const HeadingTag = isFirst ? "h1" : "h2";

  return (
    <div className={`card-scrolling-effect stack-${stackIndex}`}>
      <div className="hero-banner-inner">
        <div className="hero-image-wrapper">
          <img src={slide.image} alt={`Tanadorada ${slide.id}`} />
        </div>
        <div className="hero-overlay" />
        <Reveal className="hero-text-content">
          <span className="hero-subheading">{slide.subheading}</span>
          <HeadingTag className="hero-heading">{slide.heading}</HeadingTag>
          <a href={slide.href} className="btn btn--primary">
            {slide.cta}
          </a>
        </Reveal>
      </div>
    </div>
  );
}

export default function HeroStack() {
  return (
    <>
      {heroSlides.map((slide, index) => (
        <HeroSlide
          key={slide.id}
          slide={slide}
          stackIndex={index + 1}
          isFirst={index === 0}
        />
      ))}
    </>
  );
}
