import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import AdminNav from "../../components/admin/AdminNav";
import { DEFAULT_CATEGORIES } from "../../data/categories";
import { slugify } from "../../utils/slugify";
import { defaultMenu, cleanMenu } from "../../utils/navMenu";
import {
  MAX_CATEGORIES,
  MAX_CATEGORY_LABEL,
  normalizeCategories,
  useCategoryStore,
} from "../../store/useCategoryStore";

const CONTENT_KEY = "categories";

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

let newRowCounter = 0;

export default function AdminCategories() {
  const navigate = useNavigate();
  const setCategories = useCategoryStore((state) => state.setCategories);

  // [{ uid, slug, label, isNew }] — "isNew": todavía no se ha guardado
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [isSaving, setIsSaving] = useState(false);
  const [checkingUid, setCheckingUid] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api
      .getContentBlock(CONTENT_KEY)
      .then((saved) => {
        const list = normalizeCategories(saved);
        const source = list.length > 0 ? list : DEFAULT_CATEGORIES;
        setRows(source.map((c) => ({ ...c, uid: c.slug, isNew: false })));
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  const handleAuthError = (err) => {
    if (err.message.includes("Contraseña")) {
      localStorage.removeItem("tanadorada_admin_password");
      navigate("/admin/login");
      return true;
    }
    return false;
  };

  const patchRow = (uid, changes) =>
    setRows((current) =>
      current.map((row) => (row.uid === uid ? { ...row, ...changes } : row))
    );

  const moveRow = (index, delta) =>
    setRows((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const addRow = () =>
    setRows((current) =>
      current.length >= MAX_CATEGORIES
        ? current
        : [
            ...current,
            {
              uid: `new-${(newRowCounter += 1)}`,
              slug: "",
              label: "",
              isNew: true,
            },
          ]
    );

  // Quitar: antes de quitar una categoría que ya existe, se revisa que no
  // la esté usando ningún producto ni colección.
  const handleRemove = async (row) => {
    // Una categoría nueva que todavía no se guarda se quita sin preguntar.
    if (row.isNew) {
      setRows((current) => current.filter((r) => r.uid !== row.uid));
      return;
    }

    if (rows.length === 1) {
      alert("Tiene que quedar al menos una categoría");
      return;
    }

    setCheckingUid(row.uid);
    setMessage(null);

    try {
      const [products, collections, savedMenu] = await Promise.all([
        api.getProducts(row.slug),
        api.getCollections(row.slug),
        api.getContentBlock("nav_menu"),
      ]);

      if (products.length > 0 || collections.length > 0) {
        const parts = [];
        if (products.length > 0) {
          parts.push(plural(products.length, "producto", "productos"));
        }
        if (collections.length > 0) {
          parts.push(plural(collections.length, "colección", "colecciones"));
        }

        alert(
          `No se puede quitar "${row.label}": tiene ${parts.join(" y ")}. ` +
            "Cámbialos a otra categoría (o elimínalos) y vuelve a intentarlo."
        );
        return;
      }

      const menuList = cleanMenu(savedMenu);
      const effectiveMenu = menuList.length > 0 ? menuList : defaultMenu();
      const isInMenu = effectiveMenu.some(
        (link) => link.href.split("?")[0] === `/coleccion/${row.slug}`
      );

      const question = isInMenu
        ? `"${row.label}" está en el menú de la tienda. Si la quitas, ese enlace llevará a una página vacía hasta que lo cambies en la pestaña Menú. ¿Quitarla de todas formas?`
        : `¿Quitar la categoría "${row.label}"?`;

      if (!window.confirm(question)) return;

      setRows((current) => current.filter((r) => r.uid !== row.uid));
    } catch (err) {
      if (handleAuthError(err)) return;
      alert("No se pudo comprobar si la categoría está en uso. Intenta de nuevo.");
    } finally {
      setCheckingUid(null);
    }
  };

  const handleSave = async () => {
    setMessage(null);

    if (rows.length === 0) {
      alert("Tiene que haber al menos una categoría");
      return;
    }

    // Direcciones que ya existen y no pueden repetirse.
    const takenSlugs = new Set(rows.filter((r) => !r.isNew).map((r) => r.slug));
    const seenNames = new Set();
    const list = [];

    for (const [i, row] of rows.entries()) {
      const label = row.label.trim();

      if (!label) {
        alert(`Categoría ${i + 1}: escribe el nombre`);
        return;
      }

      const nameKey = slugify(label);
      if (seenNames.has(nameKey)) {
        alert(`"${label}" está repetida`);
        return;
      }
      seenNames.add(nameKey);

      let slug = row.slug;

      if (row.isNew) {
        // La dirección sale del nombre y ya no cambia después.
        slug = slugify(label).slice(0, 50).replace(/-+$/, "");

        if (!slug) {
          alert(`"${label}": el nombre necesita al menos una letra o un número`);
          return;
        }

        if (takenSlugs.has(slug)) {
          alert(
            `"${label}" usaría la dirección /coleccion/${slug}, que ya usa otra categoría. Prueba con otro nombre.`
          );
          return;
        }

        takenSlugs.add(slug);
      }

      list.push({ slug, label });
    }

    setIsSaving(true);
    try {
      await api.updateContent(CONTENT_KEY, list);
      setCategories(list);
      setRows(list.map((c) => ({ ...c, uid: c.slug, isNew: false })));
      setMessage("Categorías guardadas ✓");
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <section className="normal-flow-section">
        <AdminNav />
        <p className="grid-status">Cargando…</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="normal-flow-section">
        <AdminNav />
        <p className="grid-status grid-status--error">
          No se pudo conectar con el backend.
        </p>
      </section>
    );
  }

  return (
    <section className="normal-flow-section">
      <AdminNav />

      <div className="section-header" style={{ textAlign: "left", marginBottom: 30 }}>
        <h2>Categorías</h2>
        <p>Anillos, collares, pulseras… las que quieras agregar a la tienda</p>
      </div>

      {message && <p className="grid-status">{message}</p>}

      <div className="admin-content-block">
        <h3>Categorías de la tienda</h3>

        <p className="admin-currency-hint">
          El orden de esta lista es el orden en los selectores del panel. Al
          crear una categoría, su dirección sale del nombre (por ejemplo
          "Pulseras" queda en /coleccion/pulseras) y ya no cambia: si la
          renombras después, solo cambia el nombre que se ve, así no se rompe
          ningún enlace. No se puede quitar una categoría que tenga productos
          o colecciones. Los cambios se aplican al darle Guardar.
        </p>

        {rows.map((row, index) => {
          const previewSlug = slugify(row.label);

          return (
            <div className="admin-content-subitem" key={row.uid}>
              <div className="admin-menu-row">
                <input
                  type="text"
                  maxLength={MAX_CATEGORY_LABEL}
                  placeholder="Nombre (ej: Pulseras)"
                  value={row.label}
                  onChange={(e) => patchRow(row.uid, { label: e.target.value })}
                />

                <span className="admin-category-slug">
                  {row.isNew
                    ? previewSlug
                      ? `Dirección: /coleccion/${previewSlug}`
                      : "La dirección se crea con el nombre"
                    : `Dirección: /coleccion/${row.slug}`}
                </span>

                <div className="admin-menu-controls">
                  <button
                    type="button"
                    aria-label="Subir"
                    disabled={index === 0}
                    onClick={() => moveRow(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Bajar"
                    disabled={index === rows.length - 1}
                    onClick={() => moveRow(index, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="is-danger"
                    disabled={checkingUid === row.uid}
                    onClick={() => handleRemove(row)}
                  >
                    {checkingUid === row.uid ? "Revisando…" : "Quitar"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {rows.length < MAX_CATEGORIES && (
          <button type="button" className="product-page-back" onClick={addRow}>
            + Agregar categoría
          </button>
        )}

        <button
          type="button"
          className="btn btn--dark"
          disabled={isSaving}
          onClick={handleSave}
        >
          {isSaving ? "Guardando…" : "Guardar categorías"}
        </button>
      </div>
    </section>
  );
}