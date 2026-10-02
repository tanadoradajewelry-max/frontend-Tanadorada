export default function ScrollTopButton() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      className="btn--scroll-top"
      onClick={scrollToTop}
      aria-label="Volver al inicio"
    >
      &uarr;
    </button>
  );
}
