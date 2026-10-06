import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import AdminNav from "../../components/admin/AdminNav";

export default function AdminCollections() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [status, setStatus] = useState("loading");
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const load = () => {
    setStatus("loading");
    api
      .getCollections()
      .then((data) => {
        setCollections(data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!newName.trim()) return;
    setIsSaving(true);
    try {
      await api.createCollection(newName.trim());
      setNewName("");
      load();
    } catch (err) {
      if (err.message.includes("Contraseña")) {
        localStorage.removeItem("tanadorada_admin_password");
        navigate("/admin/login");
        return;
      }
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (collection) => {
    const confirmed = window.confirm(
      `¿Eliminar "${collection.name}"? Los productos que la tengan asignada se quedan sin colección, no se borran.`
    );
    if (!confirmed) return;

    try {
      await api.deleteCollection(collection.id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="normal-flow-section">
      <AdminNav />

      <div className="section-header" style={{ textAlign: "left", marginBottom: 24 }}>
        <h2>Colecciones</h2>
        <p>Como "La Dolce Vita" o "Muza & Gala" — agrúpalas como quieras</p>
      </div>

      <form
        onSubmit={handleAdd}
        style={{ display: "flex", gap: 10, maxWidth: 420, marginBottom: 30 }}
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre de la colección"
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-small)",
          }}
        />
        <button type="submit" className="btn btn--dark" disabled={isSaving}>
          {isSaving ? "Agregando…" : "+ Agregar"}
        </button>
      </form>

      {status === "loading" && <p className="grid-status">Cargando…</p>}
      {status === "error" && (
        <p className="grid-status grid-status--error">
          No se pudo conectar con el backend.
        </p>
      )}

      {status === "success" && collections.length === 0 && (
        <p className="grid-status">Todavía no tienes ninguna colección.</p>
      )}

      {status === "success" && collections.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => (
              <tr key={collection.id}>
                <td>{collection.name}</td>
                <td className="admin-table-actions">
                  <button type="button" onClick={() => handleDelete(collection)}>
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