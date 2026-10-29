import AboutUs from "../components/AboutUs";
import { useSiteContent } from "../hooks/useSiteContent";

export default function AboutPage() {
  const { content, status } = useSiteContent({ about_us: null });

  if (status === "loading") {
    return (
      <section className="normal-flow-section">
        <p className="grid-status">Cargando…</p>
      </section>
    );
  }

  if (status === "error" || !content.about_us) {
    return (
      <section className="normal-flow-section">
        <p className="grid-status grid-status--error">
          No se pudo cargar esta página. Intenta de nuevo en un momento.
        </p>
      </section>
    );
  }

  return <AboutUs data={content.about_us} />;
}
