import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatPriceLPS } from "../../data/storeData";
import AdminNav from "../../components/admin/AdminNav";
import { isTracked, isSoldOut, isLowStock } from "../../utils/stock";

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

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();

  const loadProducts = () => {
    setStatus("loading");
    api
      .getProducts()
      .then((data) => {
        setProducts(data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(loadProducts, []);

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`¿Eliminar "${product.title}"?`);
    if (!confirmed) return;

    try {
      await api.deleteProduct(product.id);
      loadProducts();
    } catch (err) {
      if (err.message.includes("Contraseña")) {
        localStorage.removeItem("tanadorada_admin_password");
        navigate("/admin/login");
        return;
      }
      alert(err.message);
    }
  };

  const soldOutCount = products.filter(isSoldOut).length;
  const lowCount = products.filter(isLowStock).length;

  const stockParts = [];
  if (soldOutCount) {
    stockParts.push(
      `${soldOutCount} ${soldOutCount === 1 ? "agotado" : "agotados"}`
    );
  }
  if (lowCount) stockParts.push(`${lowCount} con poco stock`);

  return (
    <section className="normal-flow-section">
      <AdminNav />

      <div className="admin-header" style={{ marginTop: -10 }}>
        <div className="section-header" style={{ marginBottom: 0, textAlign: "left" }}>
          <h2>Productos</h2>
          <p>{products.length} productos en la tienda</p>
        </div>
        <Link to="/admin/nuevo" className="btn btn--dark">
          + Nuevo producto
        </Link>
      </div>

      {status === "success" && stockParts.length > 0 && (
        <p className="admin-stock-summary">
          Atención: <strong>{stockParts.join(" · ")}</strong>
        </p>
      )}

      {status === "loading" && <p className="grid-status">Cargando…</p>}
      {status === "error" && (
        <p className="grid-status grid-status--error">
          No se pudo conectar con el backend.
        </p>
      )}

      {status === "success" && (
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Título</th>
              <th>Precio</th>
              <th>Badge</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <img
                    src={product.image}
                    alt={product.title}
                    className="admin-table-thumb"
                  />
                </td>
                <td>{product.title}</td>
                <td>{formatPriceLPS(product.price)}</td>
                <td>{product.badge || "—"}</td>
                <td>
                  <StockCell product={product} />
                </td>
                <td className="admin-table-actions">
                  <Link to={`/admin/editar/${product.id}`}>Editar</Link>
                  <button type="button" onClick={() => handleDelete(product)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
