import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useCategories } from "../../hooks/useCategories";
import DashIcon from "../../components/admin/DashIcons";

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

// Cada tarjeta: a dónde lleva, su icono y el dato que muestra abajo.
// "stat" devuelve { text, alert } o null. Un número en null (que el servidor
// no pudo contar) simplemente no se muestra.
const SECTIONS = [
  {
    title: "Tienda",
    cards: [
      {
        to: "/admin/productos",
        icon: "gem",
        title: "Productos",
        text: "Fotos, precios, tallas, stock y la sección de cada uno.",
        stat: ({ summary }) => {
          if (summary?.products == null) return null;

          const alerts = [];
          if (summary.soldOut > 0) {
            alerts.push(plural(summary.soldOut, "agotado", "agotados"));
          }
          if (summary.lowStock > 0) {
            alerts.push(`${summary.lowStock} con poco stock`);
          }

          return {
            text: plural(summary.products, "producto", "productos"),
            alert: alerts.join(" · ") || null,
          };
        },
      },
      {
        to: "/admin/categorias",
        icon: "grid",
        title: "Categorías",
        text: "Anillos, collares, pulseras… crea las que necesites.",
        stat: ({ categoryCount }) => ({
          text: plural(categoryCount, "categoría", "categorías"),
        }),
      },
      {
        to: "/admin/colecciones",
        icon: "layers",
        title: "Colecciones",
        text: "La Dolce Vita, Muza & Gala y las que agregues.",
        stat: ({ summary }) =>
          summary?.collections == null
            ? null
            : { text: plural(summary.collections, "colección", "colecciones") },
      },
    ],
  },
  {
    title: "Portada y menú",
    cards: [
      {
        to: "/admin/contenido",
        icon: "layout",
        title: "Contenido de página",
        text: "Hero, textos, imágenes, monedas y WhatsApp.",
      },
      {
        to: "/admin/menu",
        icon: "menu",
        title: "Menú",
        text: "Los enlaces de arriba y las fotos del menú del celular.",
      },
    ],
  },
  {
    title: "Ventas y solicitudes",
    cards: [
      {
        to: "/admin/pedidos",
        icon: "bag",
        title: "Pedidos",
        text: "Cobros por WhatsApp y el estado de cada pedido.",
        stat: ({ summary }) => {
          if (summary?.pendingOrders == null) return null;
          return summary.pendingOrders > 0
            ? { alert: `${summary.pendingOrders} esperando pago` }
            : { text: "Todo al día" };
        },
      },
      {
        to: "/admin/charm-bar",
        icon: "sparkles",
        title: "Charm Bar",
        text: "Solicitudes de eventos y experiencias.",
        stat: ({ summary }) => {
          if (summary?.newCharmBar == null) return null;
          return summary.newCharmBar > 0
            ? {
                alert: plural(
                  summary.newCharmBar,
                  "solicitud nueva",
                  "solicitudes nuevas"
                ),
              }
            : { text: "Sin solicitudes nuevas" };
        },
      },
      {
        to: "/admin/certificados",
        icon: "gift",
        title: "Certificados",
        text: "Certificados de regalo y su seguimiento.",
        stat: ({ summary }) => {
          if (summary?.newCertificates == null) return null;
          return summary.newCertificates > 0
            ? {
                alert: plural(
                  summary.newCertificates,
                  "solicitud nueva",
                  "solicitudes nuevas"
                ),
              }
            : { text: "Sin solicitudes nuevas" };
        },
      },
    ],
  },
];

function DashCard({ card, index, stat }) {
  // El brillo de la tarjeta sigue al cursor.
  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <Link
      to={card.to}
      className="dash-card glass-surface"
      style={{ "--i": index }}
      onPointerMove={handleMove}
    >
      <span className="dash-card-icon">
        <DashIcon name={card.icon} />
      </span>

      <h3>{card.title}</h3>
      <p>{card.text}</p>

      <div className="dash-card-foot">
        <div className="dash-card-info">
          {stat?.text && <span className="dash-card-stat">{stat.text}</span>}
          {stat?.alert && <span className="dash-card-alert">{stat.alert}</span>}
        </div>

        <span className="dash-card-arrow">
          <DashIcon name="arrow" />
        </span>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .getAdminSummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.message.includes("Contraseña")) {
          localStorage.removeItem("tanadorada_admin_password");
          navigate("/admin/login");
        }
        // Cualquier otro error: las tarjetas se ven igual, sin su número.
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("tanadorada_admin_password");
    navigate("/admin/login");
  };

  const context = { summary, categoryCount: categories.length };
  let cardIndex = 0;

  return (
    <div className="admin-dash-page">
      <section className="admin-dash">
        <header className="admin-dash-top">
          <div>
            <span className="admin-dash-eyebrow">Panel de administración</span>
            <h1 className="admin-dash-title">{greeting()}</h1>
            <p className="admin-dash-sub">¿Qué quieres editar hoy?</p>
          </div>

          <div className="admin-dash-actions">
            <Link to="/" className="admin-dash-pill glass-surface">
              Ver la tienda
            </Link>
            <button
              type="button"
              className="admin-dash-pill glass-surface"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {SECTIONS.map((section) => (
          <div className="admin-dash-group" key={section.title}>
            <h2 className="admin-dash-group-title">{section.title}</h2>

            <div className="admin-dash-grid">
              {section.cards.map((card) => (
                <DashCard
                  key={card.to}
                  card={card}
                  index={(cardIndex += 1)}
                  stat={card.stat ? card.stat(context) : null}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}