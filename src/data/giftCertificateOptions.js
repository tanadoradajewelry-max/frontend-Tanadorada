// Montos que se ofrecen como botones. "Otro monto" abre un campo para
// escribir uno propio.
export const AMOUNT_PRESETS = [600, 800, 1000, 1250, 1500];

// Límites del monto propio. Si los cambias, cámbialos también en
// backend/src/routes/giftcertificates.js (MIN_AMOUNT y MAX_AMOUNT).
export const MIN_CUSTOM_AMOUNT = 600;
export const MAX_AMOUNT = 50000;

export const MAX_MESSAGE_CHARS = 300;

export const RECEIVE_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Correo electrónico" },
];

export const DELIVERY_OPTIONS = [
  { value: "personal", label: "Deseo recibirlo personalmente para entregarlo." },
  { value: "direct", label: "Deseo que se envíe directamente al destinatario." },
];

export const TERMS = [
  "Canjeable en compras en línea y en tienda física.",
  "El certificado puede utilizarse hasta agotar el monto disponible.",
  "No es canjeable por dinero en efectivo.",
  "No se aceptan devoluciones ni reembolsos.",
];

// 1500 -> "L 1,500"
export const formatLempiras = (amount) =>
  `L ${Number(amount).toLocaleString("en-US")}`;