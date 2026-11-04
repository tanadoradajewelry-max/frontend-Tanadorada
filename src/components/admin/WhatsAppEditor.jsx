import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

const CONTENT_KEY = "whatsapp";
const MAX_INTRO = 300;

const DEFAULT_INTRO =
  "Hola Tanadorada 👋 Quiero pagar mi pedido con tarjeta. ¿Me pueden enviar el link de pago, por favor?";

// Mismo criterio que usa el servidor: solo dígitos con código de país.
// Un número de 8 dígitos se toma como de Honduras (+504).
function normalizeNumber(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  const full = digits.length === 8 ? `504${digits}` : digits;
  return full.length >= 10 && full.length <= 15 ? full : null;
}

export default function WhatsAppEditor() {
  const navigate = useNavigate();
  const [number, setNumber] = useState("");
  const [intro, setIntro] = useState(DEFAULT_INTRO);
  const [status, setStatus] = useState("loading");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api
      .getContentBlock(CONTENT_KEY)
      .then((saved) => {
        if (saved?.number) setNumber(String(saved.number));
        if (saved?.intro) setIntro(String(saved.intro));
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  const normalized = normalizeNumber(number);

  const handleSave = async () => {
    setMessage(null);

    if (!normalized) {
      alert(
        "Escribe un número de WhatsApp válido, con el código de país (por ejemplo +504 9850 9853)."
      );
      return;
    }

    setIsSaving(true);
    try {
      await api.updateContent(CONTENT_KEY, {
        number: normalized,
        intro: intro.trim() || DEFAULT_INTRO,
      });
      setNumber(normalized);
      setMessage("WhatsApp guardado ✓");
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
        <h3>WhatsApp para pedidos</h3>
        <p className="grid-status">Cargando…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="admin-content-block">
        <h3>WhatsApp para pedidos</h3>
        <p className="grid-status grid-status--error">
          No se pudo cargar este bloque.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-content-block">
      <h3>WhatsApp para pedidos</h3>

      <p className="admin-currency-hint">
        Cuando una clienta termina su pedido, se abre WhatsApp con un mensaje
        dirigido a este número para que le mandes el link de pago con tarjeta.
        Mientras no guardes un número, la tienda no recibe pedidos.
      </p>

      <label>
        Número de WhatsApp de la tienda
        <input
          type="tel"
          placeholder="+504 9850 9853"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
      </label>

      <span className="admin-currency-hint">
        {number.trim() === ""
          ? "Escribe el número con el código de país. Un número de 8 dígitos se toma como de Honduras (+504)."
          : normalized
            ? `Se usará el número: +${normalized}`
            : "Ese número no parece válido."}
      </span>

      <label>
        Saludo del mensaje
        <textarea
          rows={3}
          maxLength={MAX_INTRO}
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
        />
        <span className="charm-counter">
          {intro.length} / {MAX_INTRO}
        </span>
      </label>

      {/* 👇 TEXTO ACTUALIZADO 👇 */}
      <span className="admin-currency-hint">
        Después del saludo, el mensaje agrega automáticamente el número de pedido, los productos, el total, el nombre y la <strong>dirección de envío</strong> de la clienta.
      </span>

      {normalized && (
        <a
          className="admin-detail-links"
          href={`https://wa.me/${normalized}?text=${encodeURIComponent(intro)}`}
          target="_blank"
          rel="noreferrer"
        >
          Probar en WhatsApp →
        </a>
      )}

      {message && <p className="grid-status">{message}</p>}

      <button
        type="button"
        className="btn btn--dark"
        disabled={isSaving}
        onClick={handleSave}
      >
        {isSaving ? "Guardando…" : "Guardar WhatsApp"}
      </button>
    </div>
  );
}
