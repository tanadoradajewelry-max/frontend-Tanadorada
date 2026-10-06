import { Link, useLocation, useNavigate } from "react-router-dom";

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
      location.pathname === path ? "2px solid var(--accent)" : "none",
    paddingBottom: 4,
  });

  return (
    <div className="admin-header">
      <div style={{ display: "flex", gap: 24 }}>
        <Link to="/admin" style={linkStyle("/admin")}>
          Productos
        </Link>
                        <Link to="/admin/colecciones" style={linkStyle("/admin/colecciones")}>
          Colecciones
        </Link>
      </div>
      <button type="button" className="product-page-back" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}
