import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import {
  AMOUNT_PRESETS,
  MIN_CUSTOM_AMOUNT,
  MAX_AMOUNT,
  MAX_MESSAGE_CHARS,
  RECEIVE_OPTIONS,
  DELIVERY_OPTIONS,
  TERMS,
  formatLempiras,
} from "../data/giftCertificateOptions";

const LAST_REQUEST_KEY = "tanadorada_last_gift_certificate";
const CUSTOM = "custom";

// Solo se acepta ir a enlaces de WhatsApp, nunca a otro sitio.
const isWhatsappUrl = (url) =>
  typeof url === "string" && url.startsWith("https://wa.me/");

// Se recuerda la última solicitud mientras la pestaña siga abierta, por si la
// clienta vuelve atrás desde WhatsApp y necesita abrirlo otra vez.
function saveLastRequest(record) {
  try {
    sessionStorage.setItem(LAST_REQUEST_KEY, JSON.stringify(record));
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

function readLastRequest() {
  try {
    const raw = sessionStorage.getItem(LAST_REQUEST_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (!data || typeof data !== "object") return null;
    return {
      reference: typeof data.reference === "string" ? data.reference : "",
      whatsappUrl: isWhatsappUrl(data.whatsappUrl) ? data.whatsappUrl : null,
    };
  } catch {
    return null;
  }
}

function clearLastRequest() {
  try {
    sessionStorage.removeItem(LAST_REQUEST_KEY);
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

const emptyForm = {
  amountChoice: "",
  customAmount: "",
  recipientName: "",
  senderName: "",
  message: "",
  receiveVia: "whatsapp",
  whatsapp: "",
  email: "",
  delivery: "personal",
  website: "", // campo trampa para bots: las personas nunca lo ven
};

function RadioOption({ name, value, checked, onChange, children }) {
  return (
    <label className="radio-option">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span>{children}</span>
    </label>
  );
}

export default function GiftCertificatePage() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle"); // idle | sending
  const [error, setError] = useState(null);
  const [lastRequest, setLastRequest] = useState(readLastRequest);
  const submittingRef = useRef(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startOver = () => {
    clearLastRequest();
    setLastRequest(null);
    setForm(emptyForm);
    setError(null);
    setStatus("idle");
    submittingRef.current = false;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Bloqueo inmediato para que un doble clic no mande dos solicitudes.
    if (submittingRef.current) return;

    setError(null);

    if (!form.amountChoice) {
      setError("Elige el monto del certificado.");
      return;
    }

    const amount =
      form.amountChoice === CUSTOM
        ? Number(form.customAmount)
        : Number(form.amountChoice);

    if (
      !Number.isInteger(amount) ||
      amount < MIN_CUSTOM_AMOUNT ||
      amount > MAX_AMOUNT
    ) {
      setError(
        `El monto debe ser un número entero entre ${formatLempiras(MIN_CUSTOM_AMOUNT)} y ${formatLempiras(MAX_AMOUNT)}.`
      );
      return;
    }

    submittingRef.current = true;
    setStatus("sending");

    try {
      const result = await api.createGiftCertificate({
        amount,
        recipientName: form.recipientName,
        senderName: form.senderName,
        message: form.message,
        receiveVia: form.receiveVia,
        contact: form.receiveVia === "whatsapp" ? form.whatsapp : form.email,
        delivery: form.delivery,
        website: form.website,
      });

      const record = {
        reference: typeof result?.reference === "string" ? result.reference : "",
        whatsappUrl: isWhatsappUrl(result?.whatsappUrl) ? result.whatsappUrl : null,
      };

      saveLastRequest(record);

      // Con WhatsApp configurado, la página se va a WhatsApp con el mensaje
      // ya escrito. (Aquí NO se libera el bloqueo: la página se va.)
      if (record.whatsappUrl) {
        window.location.href = record.whatsappUrl;
        return;
      }

      setLastRequest(record);
      setStatus("idle");
      submittingRef.current = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "No se pudo enviar la solicitud. Intenta de nuevo.");
      setStatus("idle");
      submittingRef.current = false;
    }
  };

  if (lastRequest) {
    return (
      <section className="normal-flow-section charm-page">
        <div className="charm-sent">
          <span className="section-eyebrow">Solicitud registrada</span>
          <h1>Certificado de regalo</h1>

          {lastRequest.reference && (
            <p>
              Tu solicitud <strong>#{lastRequest.reference}</strong> quedó
              registrada.
            </p>
          )}

          {lastRequest.whatsappUrl ? (
            <>
              <p>
                Para recibir tu link de pago con tarjeta, envíanos el mensaje
                por WhatsApp. Si no se abrió, toca el botón.
              </p>
              <a
                href={lastRequest.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--dark"
              >
                Abrir WhatsApp
              </a>
            </>
          ) : (
            <p>
              Nuestro equipo se pondrá en contacto contigo para enviarte el
              link de pago con tarjeta.
            </p>
          )}

          <button type="button" className="product-page-back" onClick={startOver}>
            Hacer otra solicitud
          </button>
          <Link to="/" className="product-page-back">
            &larr; Volver a la tienda
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="normal-flow-section charm-page">
      <header className="charm-title">
        <h1>Certificado de regalo</h1>
        <p className="charm-subtitle">Un regalo especial, elegido con amor.</p>
      </header>

      <form className="checkout-form charm-form" onSubmit={handleSubmit}>
        {/* 1. Monto */}
        <h3 className="charm-section-title gift-heading">
          1. Selecciona el monto del certificado
        </h3>

        <div className="radio-list" role="radiogroup" aria-label="Monto del certificado">
          {AMOUNT_PRESETS.map((value) => (
            <RadioOption
              key={value}
              name="amountChoice"
              value={String(value)}
              checked={form.amountChoice === String(value)}
              onChange={handleChange}
            >
              {formatLempiras(value)}
            </RadioOption>
          ))}

          <RadioOption
            name="amountChoice"
            value={CUSTOM}
            checked={form.amountChoice === CUSTOM}
            onChange={handleChange}
          >
            Otro monto
          </RadioOption>
        </div>

        {form.amountChoice === CUSTOM && (
          <input
            type="number"
            name="customAmount"
            inputMode="numeric"
            min={MIN_CUSTOM_AMOUNT}
            max={MAX_AMOUNT}
            step="1"
            placeholder="Ingresa el monto en lempiras"
            value={form.customAmount}
            onChange={handleChange}
            required
          />
        )}

        {/* 2. Personaliza */}
        <h3 className="charm-section-title gift-heading">
          2. Personaliza tu regalo
        </h3>

        <label>
          Nombre de la persona que recibirá el regalo *
          <input
            type="text"
            name="recipientName"
            maxLength={120}
            placeholder="Nombre completo"
            value={form.recipientName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Nombre de quien envía el regalo *
          <input
            type="text"
            name="senderName"
            maxLength={120}
            placeholder="Tu nombre"
            value={form.senderName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Mensaje personalizado
          <textarea
            name="message"
            rows={4}
            maxLength={MAX_MESSAGE_CHARS}
            placeholder="Escribe un mensaje especial para esa persona..."
            value={form.message}
            onChange={handleChange}
          />
          <span className="charm-counter">
            {form.message.length} / {MAX_MESSAGE_CHARS}
          </span>
        </label>

        {/* 3. Cómo recibirlo */}
        <h3 className="charm-section-title gift-heading">
          3. ¿Cómo deseas recibir tu certificado?
        </h3>

        <div className="radio-list" role="radiogroup" aria-label="Cómo recibir el certificado">
          {RECEIVE_OPTIONS.map((option) => (
            <RadioOption
              key={option.value}
              name="receiveVia"
              value={option.value}
              checked={form.receiveVia === option.value}
              onChange={handleChange}
            >
              {option.label}
            </RadioOption>
          ))}
        </div>

        {form.receiveVia === "whatsapp" ? (
          <label>
            Número de WhatsApp *
            <input
              type="tel"
              name="whatsapp"
              maxLength={40}
              placeholder="+504 9999 9999"
              value={form.whatsapp}
              onChange={handleChange}
              required
            />
          </label>
        ) : (
          <label>
            Correo electrónico *
            <input
              type="email"
              name="email"
              maxLength={160}
              placeholder="tucorreo@ejemplo.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
        )}

        {/* 4. Modalidad de entrega */}
        <h3 className="charm-section-title gift-heading">
          4. Modalidad de entrega
        </h3>

        <div className="radio-list" role="radiogroup" aria-label="Modalidad de entrega">
          {DELIVERY_OPTIONS.map((option) => (
            <RadioOption
              key={option.value}
              name="delivery"
              value={option.value}
              checked={form.delivery === option.value}
              onChange={handleChange}
            >
              {option.label}
            </RadioOption>
          ))}
        </div>

        <p className="charm-help">
          Tu certificado será personalizado con los nombres y el mensaje que nos
          compartas.
        </p>

        {/* Términos */}
        <section className="gift-terms">
          <h3>Términos y condiciones</h3>
          <ul>
            {TERMS.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
        </section>

        {/* Campo trampa: está fuera de pantalla. Si un bot lo llena, la
            solicitud se descarta sin guardarse. */}
        <div className="charm-hp" aria-hidden="true">
          <label>
            No llenes este campo
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="charm-closing">
          {error && <p className="grid-status grid-status--error">{error}</p>}

          <button
            type="submit"
            className="btn btn--dark"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Enviando…" : "Solicitar mi certificado"}
          </button>

          <p className="charm-note">
            Pago con tarjeta: al enviar tu solicitud te llevamos a WhatsApp con
            el mensaje ya escrito. Nosotros te respondemos con tu link de pago.
          </p>
        </div>
      </form>
    </section>
  );
}