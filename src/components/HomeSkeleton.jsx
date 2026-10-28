// Pantalla neutra que se ve mientras llega el contenido de la portada.
// No tiene textos ni fotos de respaldo: solo la forma de lo que viene.
export default function HomeSkeleton() {
  return (
    <div className="home-skeleton" aria-busy="true" aria-label="Cargando la tienda">
      <div className="home-skeleton-hero" />
      <div className="home-skeleton-strip">
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}