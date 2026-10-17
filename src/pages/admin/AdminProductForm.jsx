import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../../api/client";
import { CATEGORIES } from "../../data/categories";
import { compressImage } from "../../utils/compressImage";

const MAX_PRODUCT_IMAGES = 3;
const MAX_SIZES = 12;

// Para no escribir las tallas una por una. Después se pueden editar.
const SIZE_PRESETS = [
  { name: "Anillo 5 al 10", labels: ["5", "6", "7", "8", "9", "10"] },
  { name: "S / M / L", labels: ["S", "M", "L"] },
];

const emptyForm = {
  title: "",
  price: "",
  badge: "",
  category: "",
  collection: "",
};

export default function AdminProductForm() {
  const { productId } = useParams();
  const isEditing = Boolean(productId);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [gallery, setGallery] = useState([]);
  // [{ label, price }] — el precio se guarda como texto mientras se escribe
  const [sizes, setSizes] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  // Las colecciones disponibles dependen de la categoría elegida.
  useEffect(() => {
    if (!form.category) {
      setCollections([]);
      return;
    }

    api
      .getCollections(form.category)
      .then((data) => {
        setCollections(data);
        setForm((prev) =>
          data.some((c) => c.id === prev.collection)
            ? prev
            : { ...prev, collection: "" }
        );
      })
      .catch(() => setCollections([]));
  }, [form.category]);

  useEffect(() => {
    if (!isEditing) return;

    api
      .getProduct(productId)
      .then((product) => {
        setForm({
          title: product.title,
          price: product.price,
          badge: product.badge || "",
          category: product.category || "",
          collection: product.collection || "",
        });
        setGallery(product.images?.length ? product.images : [product.image]);
        setSizes(
          (product.sizes || []).map((s) => ({
            label: s.label,
            price: String(s.price),
          }))
        );
        setIsLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar el producto");
        setIsLoading(false);
      });
  }, [productId, isEditing]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthError = (err) => {
    if (err.message.includes("Contraseña")) {
      localStorage.removeItem("tanadorada_admin_password");
      navigate("/admin/login");
      return true;
    }
    return false;
  };

  // --- Tallas ---
  const addSize = () =>
    setSizes((current) =>
      current.length >= MAX_SIZES
        ? current
        : [
            ...current,
            { label: "", price: form.price ? String(form.price) : "" },
          ]
    );

  const updateSize = (index, changes) =>
    setSizes((current) =>
      current.map((size, i) => (i === index ? { ...size, ...changes } : size))
    );

  const removeSize = (index) =>
    setSizes((current) => current.filter((_, i) => i !== index));

  // Rellena las tallas con el precio que tengas puesto arriba.
  const applyPreset = (labels) => {
    if (
      sizes.length > 0 &&
      !window.confirm("Esto reemplaza las tallas que ya escribiste. ¿Continuar?")
    ) {
      return;
    }

    setSizes(
      labels.map((label) => ({
        label,
        price: form.price ? String(form.price) : "",
      }))
    );
  };

  // --- Fotos ---
  // Sube las fotos elegidas (comprimidas) y las agrega a la galería.
  const handleAddImages = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    const room = MAX_PRODUCT_IMAGES - gallery.length;
    const toUpload = files.slice(0, room);
    if (toUpload.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const urls = [];
      for (const file of toUpload) {
        const compressed = await compressImage(file);
        const uploaded = await api.uploadImage(compressed);
        urls.push(uploaded.url);
      }
      setGallery((prev) => [...prev, ...urls].slice(0, MAX_PRODUCT_IMAGES));
    } catch (err) {
      if (handleAuthError(err)) return;
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) =>
    setGallery((prev) => prev.filter((_, i) => i !== index));

  const makeMain = (index) =>
    setGallery((prev) => [prev[index], ...prev.filter((_, i) => i !== index)]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (isUploading) {
      setError("Espera a que termine de subirse la imagen");
      return;
    }
    if (gallery.length === 0) {
      setError("Debes subir al menos una imagen");
      return;
    }

    // Validar las tallas antes de guardar.
    const cleanedSizes = sizes.map((size) => ({
      label: size.label.trim(),
      price: Number(size.price),
    }));

    const seen = new Set();
    for (const [i, size] of cleanedSizes.entries()) {
      if (!size.label) {
        setError(`Talla ${i + 1}: escribe el nombre de la talla`);
        return;
      }
      if (!(size.price > 0)) {
        setError(`Talla "${size.label}": escribe un precio mayor a 0`);
        return;
      }
      const key = size.label.toLowerCase();
      if (seen.has(key)) {
        setError(`La talla "${size.label}" está repetida`);
        return;
      }
      seen.add(key);
    }

    if (cleanedSizes.length === 0 && !(Number(form.price) > 0)) {
      setError("Escribe el precio del producto");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title: form.title,
        // Con tallas, el precio del producto es el de la más barata
        // (el servidor también lo calcula así).
        price: cleanedSizes.length
          ? Math.min(...cleanedSizes.map((s) => s.price))
          : Number(form.price),
        sizes: cleanedSizes,
        badge: form.badge || null,
        image: gallery[0],
        images: gallery,
        category: form.category || null,
        collection: form.collection || null,
      };

      if (isEditing) {
        await api.updateProduct(productId, payload);
      } else {
        await api.createProduct(payload);
      }

      navigate("/admin");
    } catch (err) {
      if (handleAuthError(err)) return;
      setError(err.message);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="normal-flow-section">
        <p className="grid-status">Cargando…</p>
      </section>
    );
  }

  return (
    <section className="normal-flow-section">
      <div className="section-header">
        <h2>{isEditing ? "Editar producto" : "Nuevo producto"}</h2>
        <p>Los cambios se reflejan de inmediato en la tienda</p>
      </div>

      <form
        className="checkout-form"
        style={{ maxWidth: 480, margin: "0 auto" }}
        onSubmit={handleSubmit}
      >
        <label>
          Título
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Precio (LPS)
          <input
            type="number"
            name="price"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            required={sizes.length === 0}
          />
        </label>

        <div className="admin-sizes">
          <span className="admin-gallery-label">Tallas y precios (opcional)</span>
          <p className="admin-currency-hint">
            Si el producto tiene tallas, cada una puede tener su propio
            precio. Sin tallas, se usa el precio de arriba. Con tallas, ese
            campo solo sirve para rellenar tallas nuevas, y el precio que se
            muestra sale de las tallas.
          </p>

          {sizes.map((size, index) => (
            <div className="admin-size-row" key={index}>
              <input
                type="text"
                maxLength={30}
                placeholder="Talla (ej: 7)"
                value={size.label}
                onChange={(e) => updateSize(index, { label: e.target.value })}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Precio LPS"
                value={size.price}
                onChange={(e) => updateSize(index, { price: e.target.value })}
              />
              <button
                type="button"
                aria-label={`Quitar talla ${size.label || index + 1}`}
                onClick={() => removeSize(index)}
              >
                Quitar
              </button>
            </div>
          ))}

          <div className="admin-size-actions">
            {sizes.length < MAX_SIZES && (
              <button type="button" className="product-page-back" onClick={addSize}>
                + Agregar talla
              </button>
            )}

            {SIZE_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset.name}
                className="product-page-back"
                onClick={() => applyPreset(preset.labels)}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <label>
          Categoría
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="">Sin categoría</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Colección
          <select
            name="collection"
            value={form.collection}
            onChange={handleChange}
            disabled={!form.category}
          >
            <option value="">
              {form.category ? "Sin colección" : "Primero elige una categoría"}
            </option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Badge (opcional: "Nuevo", "Popular"…)
          <input
            type="text"
            name="badge"
            value={form.badge}
            onChange={handleChange}
          />
        </label>

        <div className="admin-gallery">
          <span className="admin-gallery-label">
            Imágenes (hasta {MAX_PRODUCT_IMAGES}) — la primera es la principal
          </span>

          <div className="admin-gallery-grid">
            {gallery.map((src, i) => (
              <div className="admin-gallery-item" key={i}>
                <img src={src} alt={`Imagen ${i + 1}`} />
                {i === 0 && (
                  <span className="admin-gallery-main-tag">Principal</span>
                )}
                <div className="admin-gallery-actions">
                  {i > 0 && (
                    <button type="button" onClick={() => makeMain(i)}>
                      Hacer principal
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(i)}>
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {gallery.length < MAX_PRODUCT_IMAGES && (
            <label className="admin-gallery-add">
              {isUploading ? "Subiendo…" : "+ Agregar imagen(es)"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handleAddImages}
                disabled={isUploading}
              />
            </label>
          )}
        </div>

        {error && <p className="grid-status grid-status--error">{error}</p>}

        <button
          type="submit"
          className="btn btn--dark"
          disabled={isSaving || isUploading}
        >
          {isSaving ? "Guardando…" : "Guardar"}
        </button>

        <Link to="/admin" className="product-page-back">
          &larr; Volver al listado
        </Link>
      </form>
    </section>
  );
}
