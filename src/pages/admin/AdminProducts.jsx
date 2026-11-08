import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { formatPriceLPS } from "../../data/storeData";
import AdminNav from "../../components/admin/AdminNav";
import { useCategories } from "../../hooks/useCategories";
import { getPriceRange } from "../../utils/productSizes";
import { isTracked, isSoldOut, isLowStock } from "../../utils/stock";

const UNCATEGORIZED = "__none__";

// Para buscar sin importar mayúsculas ni acentos: "arete" encuentra "Aréte".
const normalize = (text) =>
  String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

function StockCell({ product }) {
  if (!isTracked(product)) {
    return <span className="stock-pill stock-pill--none">Sin control</span>;
  }

  if (isSoldOut(product)) {
    return <span className="stock-pill stock-pill--out">Agotado</span>;
  }

  return (
    <span
      className={`stock-pill ${
        isLowStock(product) ? "stock-pill--low" : "stock-pill--ok"
      }`}
    >
      {product.stock}
    </span>
  );
}

function ProductRow({ product, collectionName, onDelete }) {
  const range = getPriceRange(product);

  return (
    <tr>
      <td>
        <img src={product.image} alt={product.title} className="admin-table-thumb" />
      </td>
      <td>
        <div className="admin-prod-title">{product.title}</div>
        {collectionName && <span className="admin-prod-pill">{collectionName}</span>}
      </td>
      <td>
        {range.hasRange && "Desde "}
        {formatPriceLPS(range.min)}
      </td>
      <td>{product.badge || "—"}</td>
      <td>
        <StockCell product={product} />
      </td>
      <td className="admin-table-actions">
        <Link to={`/admin/editar/${product.id}`}>Editar</Link>
        <button type="button" onClick={() => onDelete(product)}>
          Eliminar
        </button>
      </td>
    </tr>
  );
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const { categories } = useCategories();

  const [products, setProducts] = useState([]);
  const [collectionNames, setCollectionNames] = useState({});
  const [status, setStatus] = useState("loading");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // all | low | out
  const [activeSection, setActiveSection] = useState("all");
  const [collapsed, setCollapsed] = useState(() => new Set());

  useEffect(() => {
    api
      .getProducts()
      .then((data) => {
        setProducts(data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));

    // Solo para mostrar el nombre de la colección debajo de cada producto.
    api
      .getCollections()
      .then((list) =>
        setCollectionNames(Object.fromEntries(list.map((c) => [c.id, c.name])))
      )
      .catch(() => {});
  }, []);

  const handleDelete = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.title}"?`)) return;

    try {
      await api.deleteProduct(product.id);
      // Se quita de la lista sin recargarla, así no pierdes tu búsqueda ni
      // las secciones que tenías abiertas.
      setProducts((current) => current.filter((p) => p.id !== product.id));
    } catch (err) {
      if (err.message.includes("Contraseña")) {
        localStorage.removeItem("tanadorada_admin_password");
        navigate("/admin/login");
        return;
      }
      alert(err.message);
    }
  };

  const toggleSection = (slug) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const filtering = search.trim() !== "" || stockFilter !== "all";

  // Agrupa los productos que cumplen la búsqueda y el filtro de stock.
  const { groups, total } = useMemo(() => {
    const term = normalize(search);

    const matches = products.filter((product) => {
      if (term && !normalize(product.title).includes(term)) return false;
      if (stockFilter === "out") return isSoldOut(product);
      if (stockFilter === "low") return isLowStock(product);
      return true;
    });

    const byCategory = categories.map((c) => ({
      slug: c.slug,
      label: c.label,
      items: [],
    }));
    const uncategorized = {
      slug: UNCATEGORIZED,
      label: "Sin categoría",
      items: [],
    };

    for (const product of matches) {
      const group = byCategory.find((g) => g.slug === product.category);
      (group || uncategorized).items.push(product);
    }

    // Dentro de cada sección: primero por colección y luego por nombre.
    // Los que no tienen colección quedan al final.
    const collectionOf = (p) =>
      p.collection ? collectionNames[p.collection] || p.collection : "\uffff";

    const all = [...byCategory, uncategorized];

    for (const group of all) {
      group.items.sort(
        (a, b) =>
          collectionOf(a).localeCompare(collectionOf(b), "es") ||
          a.title.localeCompare(b.title, "es")
      );
    }

    return { groups: all, total: matches.length };
  }, [products, categories, collectionNames, search, stockFilter]);

  // Qué secciones se muestran
  const visibleGroups = groups.filter((group) => {
    if (activeSection !== "all") return group.slug === activeSection;
    if (group.slug === UNCATEGORIZED) return group.items.length > 0;
    // Sin filtros se ven también las secciones vacías, para poder agregar
    // el primer producto desde ahí.
    return filtering ? group.items.length > 0 : true;
  });

  const chips = [
    { slug: "all", label: "Todos", count: total },
    ...groups
      .filter(
        (g) =>
          g.slug !== UNCATEGORIZED ||
          g.items.length > 0 ||
          g.slug === activeSection
      )
      .map((g) => ({ slug: g.slug, label: g.label, count: g.items.length })),
  ];

  const soldOutCount = products.filter(isSoldOut).length;
  const lowCount = products.filter(isLowStock).length;

  const alertParts = [];
  if (soldOutCount) {
    alertParts.push(`${soldOutCount} ${soldOutCount === 1 ? "agotado" : "agotados"}`);
  }
  if (lowCount) alertParts.push(`${lowCount} con poco stock`);

  const canCollapse = activeSection === "all";

  return (
    <section className="normal-flow-section">
      <AdminNav />

      <div className="admin-header" style={{ marginTop: -10 }}>
        <div className="section-header" style={{ marginBottom: 0, textAlign: "left" }}>
          <h2>Productos</h2>
          <p>
            {products.length} productos en la tienda
            {alertParts.length > 0 && ` · ${alertParts.join(" · ")}`}
          </p>
        </div>
        <Link to="/admin/nuevo" className="btn btn--dark">
          + Nuevo producto
        </Link>
      </div>

      {status === "loading" && <p className="grid-status">Cargando…</p>}
      {status === "error" && (
        <p className="grid-status grid-status--error">
          No se pudo conectar con el backend.
        </p>
      )}

      {status === "success" && (
        <>
          <div className="admin-prod-controls">
            <input
              type="search"
              className="admin-prod-search"
              placeholder="Buscar un producto…"
              aria-label="Buscar un producto"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="admin-status-select"
              aria-label="Filtrar por stock"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">Todo el stock</option>
              <option value="low">Poco stock</option>
              <option value="out">Agotados</option>
            </select>
          </div>

          <div className="admin-prod-chips" role="tablist" aria-label="Secciones">
            {chips.map((chip) => (
              <button
                type="button"
                key={chip.slug}
                role="tab"
                aria-selected={activeSection === chip.slug}
                className={`admin-chip ${activeSection === chip.slug ? "admin-chip--active" : ""}`}
                onClick={() => setActiveSection(chip.slug)}
              >
                {chip.label}
                <span className="admin-chip-count">{chip.count}</span>
              </button>
            ))}
          </div>

          {canCollapse && visibleGroups.length > 1 && (
            <div className="admin-prod-expand">
              <button
                type="button"
                onClick={() =>
                  setCollapsed(new Set(visibleGroups.map((g) => g.slug)))
                }
              >
                Cerrar todas
              </button>
              <button type="button" onClick={() => setCollapsed(new Set())}>
                Abrir todas
              </button>
            </div>
          )}

          {filtering && total === 0 && (
            <p className="grid-status">Ningún producto coincide con tu búsqueda.</p>
          )}

          {visibleGroups.map((group) => {
            const isOpen = !canCollapse || !collapsed.has(group.slug);
            const count = group.items.length;

            return (
              <section className="admin-prod-section" key={group.slug}>
                <div className="admin-prod-section-bar">
                  {canCollapse ? (
                    <button
                      type="button"
                      className="admin-prod-section-toggle"
                      aria-expanded={isOpen}
                      onClick={() => toggleSection(group.slug)}
                    >
                      <span
                        className={`admin-prod-chevron ${isOpen ? "is-open" : ""}`}
                        aria-hidden="true"
                      >
                        ›
                      </span>
                      <span className="admin-prod-section-title">{group.label}</span>
                      <span className="admin-prod-section-count">{count}</span>
                    </button>
                  ) : (
                    <h3 className="admin-prod-section-title admin-prod-section-title--static">
                      {group.label}
                      <span className="admin-prod-section-count">{count}</span>
                    </h3>
                  )}

                  {group.slug !== UNCATEGORIZED && (
                    <Link
                      to={`/admin/nuevo?categoria=${group.slug}`}
                      className="admin-prod-add"
                    >
                      + Nuevo en {group.label}
                    </Link>
                  )}
                </div>

                {isOpen &&
                  (count === 0 ? (
                    <p className="admin-prod-empty">
                      {filtering
                        ? "Ningún producto coincide aquí."
                        : "Todavía no hay productos en esta sección."}
                    </p>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Producto</th>
                          <th>Precio</th>
                          <th>Badge</th>
                          <th>Stock</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((product) => (
                          <ProductRow
                            key={product.id}
                            product={product}
                            collectionName={
                              product.collection
                                ? collectionNames[product.collection] ||
                                  product.collection
                                : ""
                            }
                            onDelete={handleDelete}
                          />
                        ))}
                      </tbody>
                    </table>
                  ))}
              </section>
            );
          })}
        </>
      )}
    </section>
  );
}
