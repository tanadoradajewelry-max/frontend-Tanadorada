import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import {
  MAX_DETAILS_CHARS,
  OCCASIONS,
  GUEST_COUNTS,
  VENUES,
  EXPERIENCE_TYPES,
  CUSTOMIZE_OPTIONS,
  DURATIONS,
  SOURCES,
} from "../data/charmBarOptions";

const LAST_REQUEST_KEY = "tanadorada_last_charm_bar";
const LAST_REQUEST_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutos

// Solo se acepta ir a enlaces de WhatsApp, nunca a otro sitio.
const isWhatsappUrl = (url) =>
  typeof url === "string" && url.startsWith("https://wa.me/");

// Se recuerda la última solicitud un rato, por si la clienta vuelve atrás
// desde WhatsApp y necesita abrirlo otra vez. Pasados 30 minutos se olvida,
// para que quien regrese más tarde vea el formulario limpio.
function saveLastRequest(record) {
  try {
    sessionStorage.setItem(
      LAST_REQUEST_KEY,
      JSON.stringify({ ...record, savedAt: Date.now() })
    );
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

function clearLastRequest() {
  try {
    sessionStorage.removeItem(LAST_REQUEST_KEY);
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

function readLastRequest() {
  try {
    const raw = sessionStorage.getItem(LAST_REQUEST_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (!data || typeof data !== "object") return null;

    if (!(Date.now() - Number(data.savedAt) < LAST_REQUEST_MAX_AGE_MS)) {
      clearLastRequest();
      return null;
    }

    return {
      reference: typeof data.reference === "string" ? data.reference : "",
      whatsappUrl: isWhatsappUrl(data.whatsappUrl) ? data.whatsappUrl : null,
    };
  } catch {
    return null;
  }
}

const emptyForm = {
  occasion: "",
  guests: "",
  venueType: "",
  location: "",
  experienceType: "",
  customize: "",
  eventDate: "",
  duration: "",
  budget: "",
  details: "",
  fullName: "",
  company: "",
  phone: "",
  email: "",
  source: "",
  website: "", // campo trampa para bots: las personas nunca lo ven
};

// Fecha de hoy (YYYY-MM-DD) en la zona de la persona, para no dejar elegir días pasados.
function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function SelectField({ label, name, options, value, onChange, required }) {
  return (
    <label>
      {label}
      {required && " *"}
      <select name={name} value={value} onChange={onChange} required={required}>
        <option value="">Selecciona una opción</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function CharmBarPage() {
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
    submittingRef.current = true;

    setError(null);
    setStatus("sending");

    try {
      const result = await api.createCharmBarRequest(form);

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
      setError(
        err.message || "No se pudo enviar la solicitud. Intenta de nuevo."
      );
      setStatus("idle");
      submittingRef.current = false;
    }
  };

  if (lastRequest) {
    return (
      <section className="normal-flow-section charm-page">
        <div className="charm-sent">
          <span className="section-eyebrow">Solicitud enviada</span>
          <h1>Let’s make it personal.</h1>

          {lastRequest.reference && (
            <p>
              Tu solicitud <strong>#{lastRequest.reference}</strong> quedó
              registrada.
            </p>
          )}

          <p>
            Gracias por considerar a Tanadorada para tu celebración. Nos
            encantará crear una experiencia especial contigo.
          </p>

          {lastRequest.whatsappUrl ? (
            <>
              <p>
                Para conversar sobre tu evento, envíanos el mensaje por
                WhatsApp. Si no se abrió, toca el botón.
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
              Nuestro equipo se pondrá en contacto contigo para conversar sobre
              tu evento.
            </p>
          )}

          <p className="charm-note">
            Enviar este formulario no confirma una reservación. Nuestro equipo
            se pondrá en contacto contigo para conversar sobre disponibilidad,
            opciones y cotización.
          </p>

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
        <h1>Charm Bar Experience</h1>
        <p className="charm-subtitle">Make it personal. Make it memorable.</p>
      </header>

      <div className="charm-intro">
        <h2>Solicita tu Charm Bar Experience</h2>
        <p>Celebra a tu manera, con una experiencia diseñada para crear recuerdos.</p>
        <p>
          Lleva la experiencia Charm Bar de Tanadorada a tu próximo evento.
          Creamos momentos especiales en los que cada invitada puede diseñar sus
          propias joyas, elegir sus charms favoritos y llevarse una pieza tan
          única como ella.
        </p>
        <p>
          Desde cumpleaños y bridal showers hasta eventos corporativos y
          celebraciones especiales, personalizamos cada experiencia para que tus
          invitados se lleven mucho más que un recuerdo.
        </p>
        <p>
          Cuéntanos sobre tu evento y nos pondremos en contacto contigo para
          diseñar una propuesta a tu medida.
        </p>
      </div>

      <form className="checkout-form charm-form" onSubmit={handleSubmit}>
        <h3 className="charm-section-title">Sobre tu evento</h3>

        <SelectField
          label="¿Qué ocasión estás celebrando?"
          name="occasion"
          options={OCCASIONS}
          value={form.occasion}
          onChange={handleChange}
          required
        />

        <SelectField
          label="¿Cuántas personas asistirán aproximadamente?"
          name="guests"
          options={GUEST_COUNTS}
          value={form.guests}
          onChange={handleChange}
          required
        />

        <SelectField
          label="¿Dónde se realizará el evento?"
          name="venueType"
          options={VENUES}
          value={form.venueType}
          onChange={handleChange}
          required
        />

        <label>
          Ciudad y lugar del evento
          <input
            type="text"
            name="location"
            maxLength={200}
            value={form.location}
            onChange={handleChange}
          />
        </label>

        <SelectField
          label="¿Cómo te gustaría ofrecer la experiencia Charm Bar?"
          name="experienceType"
          options={EXPERIENCE_TYPES}
          value={form.experienceType}
          onChange={handleChange}
          required
        />

        <SelectField
          label="¿Qué te gustaría personalizar?"
          name="customize"
          options={CUSTOMIZE_OPTIONS}
          value={form.customize}
          onChange={handleChange}
        />

        <div className="charm-row">
          <label>
            ¿Cuál es la fecha de tu evento? *
            <input
              type="date"
              name="eventDate"
              min={todayString()}
              value={form.eventDate}
              onChange={handleChange}
              required
            />
          </label>

          <SelectField
            label="¿Cuánto tiempo te gustaría que durara la experiencia?"
            name="duration"
            options={DURATIONS}
            value={form.duration}
            onChange={handleChange}
          />
        </div>

        <label>
          ¿Cuál es tu presupuesto aproximado?
          <input
            type="text"
            name="budget"
            maxLength={100}
            value={form.budget}
            onChange={handleChange}
          />
        </label>

        <label>
          Cuéntanos un poco más sobre tu evento
          <span className="charm-help">
            Comparte cualquier detalle que debamos conocer: temática, colores,
            cantidad de invitados, ideas de personalización o solicitudes
            especiales.
          </span>
          <textarea
            name="details"
            rows={4}
            maxLength={MAX_DETAILS_CHARS}
            value={form.details}
            onChange={handleChange}
          />
          <span className="charm-counter">
            {form.details.length} / {MAX_DETAILS_CHARS}
          </span>
        </label>

        <h3 className="charm-section-title">Tus datos</h3>

        <div className="charm-row">
          <label>
            Nombre y apellido *
            <input
              type="text"
              name="fullName"
              maxLength={120}
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Nombre de tu empresa o marca (si aplica)
            <input
              type="text"
              name="company"
              maxLength={120}
              value={form.company}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="charm-row">
          <label>
            Número de teléfono / WhatsApp *
            <input
              type="tel"
              name="phone"
              maxLength={25}
              value={form.phone}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Correo electrónico *
            <input
              type="email"
              name="email"
              maxLength={160}
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <SelectField
          label="¿Cómo conociste Tanadorada?"
          name="source"
          options={SOURCES}
          value={form.source}
          onChange={handleChange}
        />

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
          <h3>Let’s make it personal.</h3>
          <p>
            Gracias por considerar a Tanadorada para tu celebración. Nos
            encantará crear una experiencia especial contigo.
          </p>

          {error && <p className="grid-status grid-status--error">{error}</p>}

          <button
            type="submit"
            className="btn btn--dark"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Enviando…" : "Solicitar mi Charm Bar"}
          </button>

          <p className="charm-note">
            Al enviar tu solicitud te llevamos a WhatsApp con el mensaje ya
            escrito, para conversar sobre tu evento. Enviar este formulario no
            confirma una reservación. Nuestro equipo se pondrá en contacto
            contigo para conversar sobre disponibilidad, opciones y cotización.
          </p>
        </div>
      </form>
    </section>
  );
}
