import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { navLinks } from "../data/storeData";
import { useCartStore } from "../store/useCartStore";
import { api } from "../api/client";

// Logo de la tienda (archivo en frontend/public/img).
const LOGO_SRC = "/img/logo.jpeg";
// Opcional: versión del logo en BLANCO y con fondo transparente (PNG) para
// la portada, por ejemplo "/img/logo-blanco.png". Si lo dejas vacío, en la
// portada el logo se muestra sobre una etiqueta crema.
const LOGO_LIGHT_SRC = "";

// "/coleccion/anillos" -> "anillos"
function getCategorySlug(href) {
  return href.startsWith("/coleccion/") ? href.split("/")[2] : null;
}

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // null = todavía no se pidieron; {} = pedidas (o falló: se usan las de siempre)
  const [navPreviews, setNavPreviews] = useState(null);
  const [collections, setCollections] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());

  const toggleMenu = () => setIsDrawerOpen((open) => !open);
  const closeMenu = () => setIsDrawerOpen(false);

  // Detecta si ya se bajó un poco, para pasar de transparente a crema.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  // Las colecciones llenan el menú desplegable del escritorio.
  useEffect(() => {
    api
      .getCollections()
      .then(setCollections)
      .catch(() => {});
  }, []);

  // Las fotos del submenú del celular se piden UNA vez, al abrirlo.
  useEffect(() => {
    if (!isDrawerOpen || navPreviews !== null) return;
    api
      .getContentBlock("nav_previews")
      .then((data) => setNavPreviews(data || {}))
      .catch(() => setNavPreviews({}));
  }, [isDrawerOpen, navPreviews]);

  const getPreview = (link) => {
    if (navPreviews === null) return undefined;
    const saved = navPreviews[link.href];
    return Array.isArray(saved) ? saved : link.preview;
  };

  // Colecciones que pertenecen a la categoría de este link del menú.
  const getDropdownItems = (link) => {
    const slug = getCategorySlug(link.href);
    return slug ? collections.filter((c) => c.category === slug) : [];
  };

  const hasOpenDropdown = navLinks.some(
    (link) => openMenu === link.label && getDropdownItems(link).length > 0
  );

  // Transparente solo en la portada, arriba del todo y sin menú abierto.
  const isTransparent = isHome && !scrolled && !hasOpenDropdown;
  const useLightLogo = isTransparent && Boolean(LOGO_LIGHT_SRC);

  const wrapperClass = [
    "header-wrapper",
    isHome ? "header-wrapper--home" : "",
    isTransparent ? "header-wrapper--transparent" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const logoClass = [
    "header-logo",
    "header-logo--image",
    useLightLogo ? "header-logo--light" : "",
    isTransparent && !useLightLogo ? "header-logo--label" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className="announcement-bar">
        ENVÍOS GRATIS A TODO EL PAÍS EN COMPRAS MAYORES
      </div>

      <div className={wrapperClass}>
        <header className="header-container">
          <button
            className="mobile-menu-toggle"
            aria-label="Abrir menú"
            onClick={toggleMenu}
          >
            &#9776;
          </button>

          <Link to="/" className={logoClass} aria-label="TANADORADA">
            <img src={useLightLogo ? LOGO_LIGHT_SRC : LOGO_SRC} alt="TANADORADA" />
          </Link>

          <ul className="nav-menu">
            {navLinks.map((link) => {
              const dropdownItems = getDropdownItems(link);
              const isOpen = openMenu === link.label && dropdownItems.length > 0;

              return (
                <li
                  className="nav-item"
                  key={link.label}
                  onMouseEnter={() => setOpenMenu(link.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                  onFocus={() => setOpenMenu(link.label)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setOpenMenu(null);
                    }
                  }}
                >
                  {link.href.startsWith("/") ? (
                    <Link to={link.href}>{link.label}</Link>
                  ) : (
                    <a href={link.href}>{link.label}</a>
                  )}

                  {isOpen && (
                    <div className="nav-dropdown">
                      <Link to={link.href} onClick={() => setOpenMenu(null)}>
                        View all
                      </Link>
                      {dropdownItems.map((col) => (
                        <Link
                          key={col.id}
                          to={`${link.href}?coleccion=${col.id}`}
                          onClick={() => setOpenMenu(null)}
                        >
                          {col.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
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
