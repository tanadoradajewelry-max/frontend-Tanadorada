import { Link, useLocation, useNavigate } from "react-router-dom";

// Para agregar otra pestaña al panel, solo agrega una línea aquí.
const ADMIN_LINKS = [
  { to: "/admin", label: "Productos" },
  { to: "/admin/colecciones", label: "Colecciones" },
  { to: "/admin/contenido", label: "Contenido de página" },
  { to: "/admin/pedidos", label: "Pedidos" },
];

export default function AdminNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("tanadorada_admin_password");
    navigate("/admin/login");
  };

  const linkStyle = (path) => ({
    fontWeight: location.pathname === path ? 700 : 400,
    borderBottom:
      location.pathname === path
        ? "2px solid var(--accent)"
        : "2px solid transparent",
    paddingBottom: 4,
  });

  return (
    <div className="admin-header">
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {ADMIN_LINKS.map((link) => (
          <Link key={link.to} to={link.to} style={linkStyle(link.to)}>
            {link.label}
          </Link>
        ))}
      </div>

      <button type="button" className="product-page-back" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}
