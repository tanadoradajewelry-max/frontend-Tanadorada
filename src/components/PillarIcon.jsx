// Iconos de línea para las ideas del banner. Para agregar otro, suma una
// línea a PILLAR_ICON_OPTIONS y su dibujo en PATHS.
export const PILLAR_ICON_OPTIONS = [
  { value: "gem", label: "Diamante" },
  { value: "heart", label: "Corazón" },
  { value: "sparkles", label: "Brillos" },
  { value: "truck", label: "Envíos" },
  { value: "shield", label: "Calidad" },
  { value: "user", label: "Persona" },
];

const PATHS = {
  gem: (
    <>
      <path d="M6 3h12l4 6-10 12L2 9z" />
      <path d="M2 9h20" />
      <path d="M9 3 7 9l5 12" />
      <path d="M15 3l2 6-5 12" />
    </>
  ),
  heart: (
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  ),
  sparkles: (
    <>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
    </>
  ),
  truck: (
    <>
      <path d="M1 5h13v11H1z" />
      <path d="M14 9h4l4 4v3h-8" />
      <circle cx="6" cy="18.5" r="2" />
      <circle cx="17.5" cy="18.5" r="2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </>
  ),
};

export default function PillarIcon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name] || PATHS.gem}
    </svg>
  );
}