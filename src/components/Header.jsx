import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { navLinks as defaultNavLinks } from "../data/storeData";
import { useNavMenu } from "../hooks/useNavMenu";
import { useCartStore } from "../store/useCartStore";
import { useCurrencyStore } from "../store/useCurrencyStore";
import { useCurrency } from "../hooks/useCurrency";
import CurrencySelector from "./CurrencySelector";
import { SearchIcon, BagIcon, MenuIcon } from "./HeaderIcons";
import { api } from "../api/client";

// "/coleccion/anillos" -> "anillos"
function getCategorySlug(href) {
  return href.startsWith("/coleccion/")
    ? href.split("/")[2].split("?")[0]
    : null;
}

// Las fotos del submenú de siempre, por si todavía no guardas otras.
const defaultPreviewByHref = Object.fromEntries(
  defaultNavLinks
    .filter((link) => link.preview)
    .map((link) => [link.href, link.preview])
);

// Enlace del menú: interno (sin recargar), ancla, o externo (otra pestaña).
function MenuLink({ href, className, onClick, children }) {
  if (href.startsWith("/")) {
    return (
      <Link className={className} to={href} onClick={onClick}>
        {children}
      </Link>
    );
  }

  const isExternal = /^https?:\/\//i.test(href);

  return (
    <a
      className={className}
      href={href}
      onClick={onClick}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const menu = useNavMenu();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // null = todavía no se pidieron; {} = pedidas (o falló: se usan las de siempre)
  const [navPreviews, setNavPreviews] = useState(null);
  const [collections, setCollections] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());

  const { currency, currencies } = useCurrency();
  const selectCurrency = useCurrencyStore((state) => state.selectCurrency);
  const loadCurrencies = useCurrencyStore((state) => state.loadCurrencies);

  const toggleMenu = () => setIsDrawerOpen((open) => !open);
  const closeMenu = () => setIsDrawerOpen(false);

  // Trae las monedas configuradas en el panel.
  useEffect(() => {
    loadCurrencies();
  }, [loadCurrencies]);

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

  // Fotos guardadas desde el panel; si no hay para ese enlace, las de siempre.
  // Mientras cargan no se muestra nada, para que no parpadeen las viejas.
  const getPreview = (link) => {
    if (navPreviews === null) return undefined;
    const saved = navPreviews[link.href];
    return Array.isArray(saved) ? saved : defaultPreviewByHref[link.href];
  };

  // Colecciones que pertenecen a la categoría de este enlace del menú.
  const getDropdownItems = (link) => {
    const slug = getCategorySlug(link.href);
    return slug ? collections.filter((c) => c.category === slug) : [];
  };

  const hasOpenDropdown = menu.some(
    (link) => openMenu === link.href && getDropdownItems(link).length > 0
  );

  // Transparente solo en la portada, arriba del todo y sin menú abierto.
  const isTransparent = isHome && !scrolled && !hasOpenDropdown;

  const headerClass = [
    "site-header",
    isHome ? "site-header--home" : "",
    isTransparent ? "site-header--transparent" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className="announcement-bar">
       10% OFF EN TU PRIMERA COMPRA ONLINE
      </div>

      <div className={headerClass}>
        <header className="site-header-inner">
          <div className="site-header-left">
            <button
              type="button"
              className="mobile-menu-toggle"
              aria-label="Abrir menú"
              aria-expanded={isDrawerOpen}
              onClick={toggleMenu}
            >
              <MenuIcon />
            </button>

            <CurrencySelector />
          </div>

          <Link to="/" className="site-logo">
            TANADORADA
          </Link>

          <div className="site-actions">
            <button
              type="button"
              className="site-icon-button"
              aria-label="Buscar"
              title="Buscar"
            >
              <SearchIcon />
            </button>

            <Link
              to="/carrito"
              className="site-icon-button"
              aria-label={`Bolsa, ${itemCount} ${
                itemCount === 1 ? "producto" : "productos"
              }`}
            >
              <BagIcon />
              {itemCount > 0 && (
                <span className="site-cart-badge">{itemCount}</span>
              )}
            </Link>
          </div>

          <nav className="site-nav" aria-label="Principal">
            <ul className="site-nav-list">
              {menu.map((link, index) => {
                const dropdownItems = getDropdownItems(link);
                const isOpen =
                  openMenu === link.href && dropdownItems.length > 0;

                return (
                  <li
                    className="site-nav-item"
                    key={`${link.href}-${index}`}
                    onMouseEnter={() => setOpenMenu(link.href)}
                    onMouseLeave={() => setOpenMenu(null)}
                    onFocus={() => setOpenMenu(link.href)}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setOpenMenu(null);
                      }
                    }}
                  >
                    <MenuLink href={link.href} className="site-nav-link">
                      {link.label}
                    </MenuLink>

                    {isOpen && (
                      <div className="site-nav-dropdown">
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
          </nav>
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
          {menu.map((link, index) => {
            const preview = getPreview(link);

            return (
              <li key={`${link.href}-${index}`}>
                <MenuLink href={link.href} onClick={closeMenu}>
                  {link.label}
                </MenuLink>

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

        {currencies.length > 1 && (
          <label className="mobile-nav-currency">
            <span className="mobile-nav-account-label">Moneda</span>
            <select
              value={currency.code}
              onChange={(e) => selectCurrency(e.target.value)}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label} ({c.code} {c.symbol})
                </option>
              ))}
            </select>
          </label>
        )}

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
