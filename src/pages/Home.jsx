import Hero from "../components/Hero";
import CategoryStrip from "../components/CategoryStrip";
import CategoryGrid from "../components/CategoryGrid";
import AboutBanner from "../components/AboutBanner";
import InstagramCarousel from "../components/InstagramCarousel"; 
import QuoteBand, { quoteBandDefaults } from "../components/QuoteBand";
import HomeSkeleton from "../components/HomeSkeleton";
import { useSiteContent } from "../hooks/useSiteContent";
import { aboutBannerDefaults } from "../data/aboutBannerDefaults";

const defaults = {
  hero: null,
  category_strip: [],
  category_strip_header: null,
  category_grid: { eyebrow: "", title: "", subtitle: "", items: [] },
  about_banner: aboutBannerDefaults,
  about_us: null, 
  instagram: { title: "", subtitle: "", handle: "", items: [] },
  quote_band: quoteBandDefaults,
};

export default function Home() {
  const { content, status } = useSiteContent(defaults);

  if (status === "loading") {
    return <HomeSkeleton />;
  }

  if (status === "error") {
    return (
      <section className="normal-flow-section home-error">
        <div className="section-header">
          <h2>No pudimos cargar la tienda</h2>
          <p>Revisa tu conexión e intenta de nuevo</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            className="btn btn--dark"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* 1. Hero (Banner principal) */}
      {content.hero && <Hero data={content.hero} />}
      
      {/* 2. Las 2 imágenes grandes (La Dolce Vita, Muza & Gala) */}
      <section className="normal-flow-section" id="colecciones-por-estilo">
        <CategoryGrid data={content.category_grid} />
      </section>

      {/* 3. Las 4 imágenes (Anillos, Collares, Aretes, Pulseras) */}
      <CategoryStrip
        items={content.category_strip}
        header={content.category_strip_header}
      />

      {/* 4. Carrusel de Instagram */}
      <InstagramCarousel data={content.instagram} />

      {/* 5. Banner de 3 columnas (Envios, The Art of Choosing...) */}
      <AboutBanner data={content.about_banner} />
      
      {/* 6. Frase final */}
      <QuoteBand data={content.quote_band} />
    </>
  );
}
