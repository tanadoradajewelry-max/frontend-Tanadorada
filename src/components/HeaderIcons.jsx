// Iconos de línea del header. Heredan el color del texto (currentColor),
// así pasan solos de blanco a oscuro cuando el header cambia.
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

export function SearchIcon() {
  return (
    <svg {...base}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}

// Bolso de mujer: cuerpo, solapa curva y asa.
export function BagIcon() {
  return (
    <svg {...base}>
      <path d="M4 10.5A1.5 1.5 0 0 1 5.5 9h13a1.5 1.5 0 0 1 1.5 1.5v8.2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M8 9V7.8a4 4 0 0 1 8 0V9" />
      <path d="M4 12.4c3.6 2.8 12.4 2.8 16 0" />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg {...base}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}