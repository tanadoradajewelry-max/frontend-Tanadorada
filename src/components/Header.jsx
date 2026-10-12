import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { navLinks } from "../data/storeData";
import { useCartStore } from "../store/useCartStore";
import { api } from "../api/client";

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // null = todavía no se pidieron; {} = pedidas (o falló: se usan las de siempre)
  const [navPreviews, setNavPreviews] = useState(null);
  const itemCount = useCartStore((state) => state.getItemCount());

  const toggleMenu = () => setIsDrawerOpen((open) => !open);
  const closeMenu = () => setIsDrawerOpen(false);

  // Las fotos del submenú se piden UNA vez, la primera vez que se abre.
  useEffect(() => {
    if (!isDrawerOpen || navPreviews !== null) return;
    api
      .getContentBlock("nav_previews")
      .then((data) => setNavPreviews(data || {}))
      .catch(() => setNavPreviews({}));
  }, [isDrawerOpen, navPreviews]);

  // Fotos guardadas desde el panel; si no hay, las de siempre (storeData).
  // Mientras cargan no se muestra nada, para que no parpadeen las viejas.
  const getPreview = (link) => {
    if (navPreviews === null) return undefined;
    const saved = navPreviews[link.href];
    return Array.isArray(saved) ? saved : link.preview;
  };

  return (
    <>
      <div className="announcement-bar">
        ENVÍOS GRATIS A TODO EL PAÍS EN COMPRAS MAYORES
      </div>

      <div className="header-wrapper">
        <header className="header-container">
          <button
            className="mobile-menu-toggle"
            aria-label="Abrir menú"
            onClick={toggleMenu}
          >
            &#9776;
          </button>

          <Link to="/" className="header-logo">
            TANADORADA
          </Link>

          <ul className="nav-menu">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.label}>
                {link.href.startsWith("/") ? (
                  <Link to={link.href}>{link.label}</Link>
                ) : (
                  <a href={link.href}>{link.label}</a>
                )}
              </li>
            ))}
          </ul>

          <div className="header-icons">
            <a href="#">Buscar</a>
            <Link to="/carrito">Bolsa ({itemCount})</Link>
          </div>
        </header>
      </div>

      <div
        className={`overlay-backdrop ${isDrawerOpen ? "is-active" : ""}`}
        onClick={closeMenu}
      />

      <aside className={`mobile-nav-drawer ${isDrawerOpen ? "is-active" : ""}`}>
        <button
          type="button"
          className="mobile-nav-close"
          aria-label="Cerrar menú"
          onClick={closeMenu}
        >
          &times;
        </button>

        <ul className="mobile-nav-list">
          {navLinks.map((link) => {
            const preview = getPreview(link);

            return (
              <li key={link.label}>
                {link.href.startsWith("/") ? (
                  <Link to={link.href} onClick={closeMenu}>
                    {link.label}
                  </Link>
                ) : (
                  <a href={link.href} onClick={closeMenu}>
                    {link.label}
                  </a>
                )}

                {preview?.length > 0 && (
                  <div className="mobile-nav-preview">
                    {preview.map((src, i) => (
                      <img key={i} src={src} alt={`${link.label} preview`} />
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mobile-nav-account">
          <span className="mobile-nav-account-label">Mi Cuenta</span>
          <Link
            to="/cuenta/iniciar-sesion"
            className="btn btn--dark mobile-nav-login"
            onClick={closeMenu}
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/cuenta/registro"
            className="mobile-nav-register"
            onClick={closeMenu}
          >
            Registrarse
          </Link>
        </div>
      </aside>
    </>
  );
}
