import Hero from "../components/Hero";
import CategoryStrip from "../components/CategoryStrip";
import CategoryGrid from "../components/CategoryGrid";
import AboutBanner from "../components/AboutBanner";
import AboutUs from "../components/AboutUs";
import QuoteBand, { quoteBandDefaults } from "../components/QuoteBand";
import { useSiteContent } from "../hooks/useSiteContent";
import { aboutBannerDefaults } from "../data/aboutBannerDefaults";

// Valores por defecto, por si la petición todavía no responde o falla —
// así la portada nunca se ve vacía o rota.
const defaults = {
  hero: {
    image: "/img/1.jpg",
    eyebrow: "Nueva Colección",
    headline: "Brilla. Luce. Repite.",
    subtext: "Piezas atemporales en oro, pensadas para el día a día",
    buttonText: "Explorar Colección",
    buttonHref: "#",
  },
  category_strip: [],
  category_grid: { eyebrow: "", title: "", subtitle: "", items: [] },
  about_banner: aboutBannerDefaults,
  about_us: null, // el carrusel con tu historia: aparece cuando llega del servidor
  quote_band: quoteBandDefaults,
};

export default function Home() {
  const { content } = useSiteContent(defaults);

  return (
    <>
      <Hero data={content.hero} />
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
