import Hero from "../components/Hero";
import CategoryStrip from "../components/CategoryStrip";
import CategoryGrid from "../components/CategoryGrid";
import AboutBanner from "../components/AboutBanner";
import AboutUs from "../components/AboutUs";
import QuoteBand, { quoteBandDefaults } from "../components/QuoteBand";
import HomeSkeleton from "../components/HomeSkeleton";
import { useSiteContent } from "../hooks/useSiteContent";
import { aboutBannerDefaults } from "../data/aboutBannerDefaults";

// Solo se usan para los bloques que todavía no has guardado en el panel.
// El hero ya NO tiene texto ni foto de respaldo: se muestra únicamente lo
// que guardaste en /admin/contenido.
const defaults = {
  hero: null,
  category_strip: [],
  category_grid: { eyebrow: "", title: "", subtitle: "", items: [] },
  about_banner: aboutBannerDefaults,
  about_us: null,
  quote_band: quoteBandDefaults,
};

export default function Home() {
  const { content, status } = useSiteContent(defaults);

  // Mientras llega el contenido, una pantalla neutra: nada de respaldo.
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
      {content.hero && <Hero data={content.hero} />}
      <CategoryStrip items={content.category_strip} />

      <section className="normal-flow-section" id="colecciones-por-estilo">
        <CategoryGrid data={content.category_grid} />
      </section>

      <AboutBanner data={content.about_banner} />
      {content.about_us && <AboutUs data={content.about_us} />}
      <QuoteBand data={content.quote_band} />
    </>
  );
}
