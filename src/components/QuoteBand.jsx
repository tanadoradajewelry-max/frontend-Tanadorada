import Reveal from "./Reveal";

// Frase de respaldo mientras no guardes una desde /admin/contenido.
export const quoteBandDefaults = {
  text: "Cada joya cuenta una historia. Elige la tuya.",
  signature: "",
};

export default function QuoteBand({ data }) {
  // Si dejas la frase vacía en el panel, la franja simplemente desaparece.
  if (!data?.text) return null;

  return (
    <section className="quote-band">
      <Reveal as="div" className="quote-band-inner">
        <span className="quote-band-mark" aria-hidden="true">
          “
        </span>
        <blockquote>{data.text}</blockquote>
        {data.signature && (
          <p className="quote-band-signature">{data.signature}</p>
        )}
      </Reveal>
    </section>
  );
}