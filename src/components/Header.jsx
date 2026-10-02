import { useState } from "react";
import { Link } from "react-router-dom";
import { navLinks } from "../data/storeData";
import { useCartStore } from "../store/useCartStore";

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());

  const toggleMenu = () => setIsDrawerOpen((open) => !open);
  const closeMenu = () => setIsDrawerOpen(false);

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
                <a href={link.href}>{link.label}</a>
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
          {navLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} onClick={closeMenu}>
                {link.label}
              </a>

              {link.preview && (
                <div className="mobile-nav-preview">
                  {link.preview.map((src) => (
                    <img key={src} src={src} alt={`${link.label} preview`} />
                  ))}
                </div>
              )}
            </li>
          ))}
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