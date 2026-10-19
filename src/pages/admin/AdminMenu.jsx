import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import AdminNav from "../../components/admin/AdminNav";
import ImageListEditor from "../../components/admin/ImageListEditor";
import { compressImage } from "../../utils/compressImage";
import { navLinks } from "../../data/storeData";
import { CATEGORIES } from "../../data/categories";
import {
  MAX_MENU_ITEMS,
  MAX_LABEL_CHARS,
  defaultMenu,
  cleanMenu,
  isSafeHref,
  writeMenuCache,
} from "../../utils/navMenu";

const MENU_KEY = "nav_menu";
const PREVIEWS_KEY = "nav_previews";
const MAX_PREVIEW_IMAGES = 4;
const CUSTOM = "__custom__";

// A dónde puede llevar un enlace del menú. Las categorías salen solas de
// data/categories.js: si agregas una allá, aparece aquí.
const DESTINATIONS = [
  { value: "/", label: "Inicio" },
  ...CATEGORIES.map((c) => ({
    value: `/coleccion/${c.slug}`,
    label: `Categoría: ${c.label}`,
  })),
  { value: "/charm-bar", label: "Charm Bar Experience" },
  { value: "/sobre-nosotros", label: "Sobre nosotros" },
  { value: "#", label: "Sin destino todavía" },
];

const isKnownDestination = (href) =>
  DESTINATIONS.some((destination) => destination.value === href);

// "custom" solo sirve en esta pantalla (para mostrar el cuadro de enlace
// propio); no se guarda.
const withCustomFlag = (list) =>
  list.map((item) => ({ ...item, custom: !isKnownDestination(item.href) }));

// Fotos del submenú de siempre, por si todavía no guardas otras.
const defaultPreviewByHref = Object.fromEntries(
  navLinks.filter((link) => link.preview).map((link) => [link.href, link.preview])
);

export default function AdminMenu() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(() => withCustomFlag(defaultMenu()));
  const [previews, setPreviews] = useState({});
  const [status, setStatus] = useState("loading");
  const [savingKey, setSavingKey] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    Promise.all([
      api.getContentBlock(MENU_KEY),
      api.getContentBlock(PREVIEWS_KEY),
    ])
      .then(([savedMenu, savedPreviews]) => {
        const cleaned = cleanMenu(savedMenu);
        if (cleaned.length > 0) setMenu(withCustomFlag(cleaned));
        setPreviews(savedPreviews || {});
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

  // ---------- Enlaces del menú ----------
  const patchItem = (index, changes) =>
    setMenu((current) =>
      current.map((item, i) => (i === index ? { ...item, ...changes } : item))
    );

  const moveItem = (index, delta) =>
    setMenu((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const removeItem = (index) =>
    setMenu((current) => current.filter((_, i) => i !== index));

  const addItem = () =>
    setMenu((current) =>
      current.length >= MAX_MENU_ITEMS
        ? current
        : [...current, { label: "", href: "/", custom: false }]
    );

  const handleDestinationChange = (index, value) =>
    patchItem(
      index,
      value === CUSTOM
        ? { custom: true, href: "" }
        : { custom: false, href: value }
    );

  const handleSaveMenu = async () => {
    setMessage(null);

    if (menu.length === 0) {
      alert("El menú necesita al menos un enlace");
      return;
    }

    for (const [i, item] of menu.entries()) {
      if (!item.label.trim()) {
        alert(`Enlace ${i + 1}: escribe el nombre que se verá en el menú`);
        return;
      }
      if (!isSafeHref(item.href)) {
        alert(
          `Enlace ${i + 1} ("${item.label}"): el destino no es válido. ` +
            "Usa algo como /coleccion/anillos, #, o https://tu-sitio.com"
        );
        return;
      }
    }

    const list = menu.map(({ label, href }) => ({
      label: label.trim(),
      href: href.trim(),
    }));

    setSavingKey("menu");
    try {
      await api.updateContent(MENU_KEY, list);
      writeMenuCache(list);
      setMessage("Menú guardado ✓");
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    } finally {
      setSavingKey(null);
    }
  };

  // ---------- Fotos del menú del celular ----------
  // Una por cada enlace que lleva a una categoría (sin repetir).
  const categoryLinks = menu.filter(
    (item, index, all) =>
      item.href.startsWith("/coleccion/") &&
      all.findIndex((other) => other.href === item.href) === index
  );

  // Miniaturas: 500px de lado bastan y pesan muy poco.
  const uploadFile = async (file) => {
    const compressed = await compressImage(file, { maxSize: 500, quality: 0.8 });
    const uploaded = await api.uploadImage(compressed);
    return uploaded.url;
  };

  const handleUploadError = (err) => {
    if (handleAuthError(err)) return;
    alert("No se pudo subir la imagen: " + err.message);
  };

  const handleSavePreviews = async () => {
    setSavingKey("previews");
    setMessage(null);
    try {
      await api.updateContent(PREVIEWS_KEY, previews);
      setMessage("Fotos del menú guardadas ✓");
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    } finally {
      setSavingKey(null);
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
        <h2>Menú</h2>
        <p>Los enlaces de arriba de la tienda y las fotos del menú del celular</p>
      </div>

      {message && <p className="grid-status">{message}</p>}

      {/* --- Enlaces --- */}
      <div className="admin-content-block">
        <h3>Enlaces del menú</h3>

        <p className="admin-currency-hint">
          Estos enlaces se ven en una fila arriba en la computadora y en el
          menú de hamburguesa del celular. Máximo {MAX_MENU_ITEMS}: con más no
          caben en una sola fila. Si un enlace lleva a una categoría que tiene
          colecciones, en la computadora se despliegan solas. Las categorías
          nuevas se agregan una vez en <code>data/categories.js</code> y
          aparecen aquí.
        </p>

        {menu.map((item, index) => (
          <div className="admin-content-subitem" key={index}>
            <div className="admin-menu-row">
              <input
                type="text"
                maxLength={MAX_LABEL_CHARS}
                placeholder="Nombre en el menú"
                value={item.label}
                onChange={(e) => patchItem(index, { label: e.target.value })}
              />

              <select
                value={item.custom ? CUSTOM : item.href}
                onChange={(e) => handleDestinationChange(index, e.target.value)}
              >
                {DESTINATIONS.map((destination) => (
                  <option key={destination.value} value={destination.value}>
                    {destination.label}
                  </option>
                ))}
                <option value={CUSTOM}>Otro enlace…</option>
              </select>

              <div className="admin-menu-controls">
                <button
                  type="button"
                  aria-label="Subir"
                  disabled={index === 0}
                  onClick={() => moveItem(index, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Bajar"
                  disabled={index === menu.length - 1}
                  onClick={() => moveItem(index, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="is-danger"
                  onClick={() => removeItem(index)}
                >
                  Quitar
                </button>
              </div>
            </div>

            {item.custom && (
              <input
                type="text"
                placeholder="/coleccion/anillos   o   https://instagram.com/tu_cuenta"
                value={item.href}
                onChange={(e) => patchItem(index, { href: e.target.value })}
              />
            )}
          </div>
        ))}

        {menu.length < MAX_MENU_ITEMS && (
          <button type="button" className="product-page-back" onClick={addItem}>
            + Agregar enlace
          </button>
        )}

        <button
          type="button"
          className="btn btn--dark"
          disabled={savingKey === "menu"}
          onClick={handleSaveMenu}
        >
          {savingKey === "menu" ? "Guardando…" : "Guardar menú"}
        </button>
      </div>

      {/* --- Fotos del celular --- */}
      <div className="admin-content-block">
        <h3>Fotos del menú del celular</h3>

        {categoryLinks.length === 0 && (
          <p className="admin-currency-hint">
            Ningún enlace del menú lleva a una categoría, así que no hay fotos
            que editar.
          </p>
        )}

        {categoryLinks.map((link) => (
          <ImageListEditor
            key={link.href}
            label={`${link.label || link.href} (hasta ${MAX_PREVIEW_IMAGES} fotos)`}
            firstLabel="Primera"
            aspectRatio="1 / 1"
            images={previews[link.href] ?? defaultPreviewByHref[link.href] ?? []}
            max={MAX_PREVIEW_IMAGES}
            onChange={(next) =>
              setPreviews((prev) => ({ ...prev, [link.href]: next }))
            }
            uploadFile={uploadFile}
            onError={handleUploadError}
            onBusyChange={setIsBusy}
          />
        ))}

        {categoryLinks.length > 0 && (
          <button
            type="button"
            className="btn btn--dark"
            disabled={savingKey === "previews" || isBusy}
            onClick={handleSavePreviews}
          >
            {savingKey === "previews" ? "Guardando…" : "Guardar fotos del menú"}
          </button>
        )}
      </div>
    </section>
  );
}
