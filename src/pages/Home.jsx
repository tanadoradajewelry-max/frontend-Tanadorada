import Hero from "../components/Hero";
import CategoryStrip from "../components/CategoryStrip";
import CategoryGrid from "../components/CategoryGrid";
import AboutBanner from "../components/AboutBanner";
import QuoteBand, { quoteBandDefaults } from "../components/QuoteBand";
import HomeSkeleton from "../components/HomeSkeleton";
import InstagramSection from "../components/InstagramSection"; 
import { useSiteContent } from "../hooks/useSiteContent";
import { aboutBannerDefaults } from "../data/aboutBannerDefaults";

const defaults = {
  hero: null,
  category_strip: [],
  category_grid: { eyebrow: "", title: "", subtitle: "", items: [] },
  about_banner: aboutBannerDefaults,
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
      
      {/* 2. Las 4 imágenes (Anillos, Collares, Aretes, Pulseras) */}
      <CategoryStrip items={content.category_strip} />

      {/* 3. Las 2 imágenes grandes (La Dolce Vita, Muza & Gala) */}
      <section className="normal-flow-section" id="colecciones-por-estilo">
        <CategoryGrid data={content.category_grid} />
      </section>

      {/* 4. Banner de 3 columnas (Envios, The Art of Choosing...) */}
      <AboutBanner data={content.about_banner} />
      
      {/* 5. Sección de Instagram (Las fotos de las mujeres) */}
      <InstagramSection /> 
      
      {/* 6. Frase final antes del pie de página */}
      <QuoteBand data={content.quote_band} />
    </>
  );
}
