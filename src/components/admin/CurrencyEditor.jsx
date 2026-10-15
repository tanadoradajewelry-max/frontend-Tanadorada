import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { normalizeCurrencies } from "../../store/useCurrencyStore";

const CONTENT_KEY = "currencies";
const MAX_CURRENCIES = 8;

export default function CurrencyEditor() {
  const navigate = useNavigate();
  // Solo las monedas extra: los lempiras siempre existen y no se editan.
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api
      .getContentBlock(CONTENT_KEY)
      .then((saved) => {
        const extras = normalizeCurrencies(saved)
          .slice(1)
          .map((c) => ({ ...c, hnlPerUnit: String(c.hnlPerUnit) }));
        setRows(extras);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  const patchRow = (index, changes) =>
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...changes } : row))
    );

  const addRow = () =>
    setRows((current) => [
      ...current,
      { label: "", code: "", symbol: "", hnlPerUnit: "" },
    ]);

  const removeRow = (index) =>
    setRows((current) => current.filter((_, i) => i !== index));

  const handleSave = async () => {
    setMessage(null);

    const seen = new Set();
    const list = [];

    for (const [i, row] of rows.entries()) {
      const code = row.code.trim().toUpperCase();
      const symbol = row.symbol.trim();
      const rate = Number(row.hnlPerUnit);

      if (!/^[A-Z]{3}$/.test(code)) {
        alert(`Moneda ${i + 1}: el código debe tener 3 letras (ej: USD)`);
        return;
      }
      if (code === "HNL") {
        alert("Los lempiras ya están incluidos, no hace falta agregarlos");
        return;
      }
      if (seen.has(code)) {
        alert(`El código ${code} está repetido`);
        return;
      }
      if (!symbol) {
        alert(`Moneda ${i + 1}: falta el símbolo (ej: $)`);
        return;
      }
      if (!(rate > 0)) {
        alert(`Moneda ${i + 1}: escribe cuántos lempiras vale 1 ${code}`);
        return;
      }

      seen.add(code);
      list.push({
        code,
        label: row.label.trim() || code,
        symbol,
        hnlPerUnit: rate,
      });
    }

    setIsSaving(true);
    try {
      await api.updateContent(CONTENT_KEY, list);
      setMessage("Monedas guardadas ✓");
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

  if (status === "loading") {
    return (
      <div className="admin-content-block">
        <h3>Monedas (selector del header)</h3>
        <p className="grid-status">Cargando…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="admin-content-block">
        <h3>Monedas (selector del header)</h3>
        <p className="grid-status grid-status--error">
          No se pudo cargar este bloque.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-content-block">
      <h3>Monedas (selector del header)</h3>

      <p className="admin-currency-hint">
        Los precios siempre se guardan y se cobran en lempiras (HNL). Estas
        monedas solo cambian cómo se muestran. Mientras no agregues ninguna,
        el selector no aparece en la tienda. Mantén los tipos de cambio al día;
        puedes consultar el de referencia del Banco Central de Honduras.
      </p>

      {rows.map((row, index) => {
        const rate = Number(row.hnlPerUnit);
        const code = row.code.trim().toUpperCase() || "—";
        const preview =
          rate > 0
            ? `${row.symbol || ""}${(1000 / rate).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ${code}`
            : null;

        return (
          <div className="admin-content-subitem" key={index}>
            <div className="admin-currency-grid">
              <label>
                País o nombre
                <input
                  type="text"
                  value={row.label}
                  placeholder="Estados Unidos"
                  onChange={(e) => patchRow(index, { label: e.target.value })}
                />
              </label>

              <label>
                Código
                <input
                  type="text"
                  maxLength={3}
                  value={row.code}
                  placeholder="USD"
                  onChange={(e) => patchRow(index, { code: e.target.value })}
                />
              </label>

              <label>
                Símbolo
                <input
                  type="text"
                  maxLength={4}
                  value={row.symbol}
                  placeholder="$"
                  onChange={(e) => patchRow(index, { symbol: e.target.value })}
                />
              </label>
            </div>

            <label>
              ¿Cuántos lempiras vale 1 {code}? (si 1 {code} son 25 lempiras,
              escribe 25)
              <input
                type="number"
                min="0.0001"
                step="0.0001"
                value={row.hnlPerUnit}
                onChange={(e) => patchRow(index, { hnlPerUnit: e.target.value })}
              />
            </label>

            {preview && (
              <span className="admin-currency-hint">
                Un producto de L1,000.00 HNL se verá como {preview}
              </span>
            )}

            <button
              type="button"
              className="admin-content-remove"
              onClick={() => removeRow(index)}
            >
              Quitar esta moneda
            </button>
          </div>
        );
      })}

      {rows.length === 0 && (
        <p className="admin-currency-hint">
          Todavía no hay otras monedas. Agrega una para que aparezca el
          selector.
        </p>
      )}

      {rows.length < MAX_CURRENCIES && (
        <button type="button" className="product-page-back" onClick={addRow}>
          + Agregar moneda
        </button>
      )}

      {message && <p className="grid-status">{message}</p>}

      <button
        type="button"
        className="btn btn--dark"
        disabled={isSaving}
        onClick={handleSave}
      >
        {isSaving ? "Guardando…" : "Guardar monedas"}
      </button>
    </div>
  );
}