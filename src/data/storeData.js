// Los productos YA NO viven acá — vienen del backend real vía
// src/hooks/useProducts.js y useProduct.js. Este archivo se queda solo
// con lo que todavía no tiene su propio modelo en la base de datos
// (hero slides, categorías destacadas, links de navegación).

export const heroSlides = [
  {
    id: 1,
    image: "/img/1.jpg",
    subheading: "Novedades",
    heading: "Elevated Jewelry",
    cta: "Ver Colección",
    href: "#",
  },
  {
    id: 2,
    image: "/img/2.jpg",
    subheading: "Símbolos & Protección",
    heading: "Piezas con Intención",
    cta: "Explorar Fe",
    href: "#",
  },
  {
    id: 3,
    image: "/img/3.jpg",
    subheading: "Básicos Imprescindibles",
    heading: "Especiales en Oro",
    cta: "Comprar Ahora",
    href: "#",
  },
  {
    id: 4,
    image: "/img/4.jpg",
    subheading: "Colección Verano",
    heading: "Diseños Atemporales",
    cta: "Descubrir Más",
    href: "#",
  },
  {
    id: 5,
    image: "/img/5.jpg",
    subheading: "Edición Limitada",
    heading: "Piezas Exclusivas",
    cta: "Ver Catálogo",
    href: "#",
  },
];

export const categories = [
  { id: "aretes-statement", image: "/img/1.jpg", title: "Aretes Statement" },
  { id: "beach-edit", image: "/img/2.jpg", title: "The Beach Edit" },
  { id: "anillos-chunky", image: "/img/3.jpg", title: "Anillos Chunky" },
];

export const navLinks = [
  { label: "Novedades", href: "#" },
  { label: "Collares", href: "#" },
  { label: "Aretes", href: "#" },
  { label: "Anillos", href: "/coleccion/anillos", preview: ["/img/7.jpeg", "/img/8.jpeg", "/img/9.jpeg", "/img/10.jpeg"] },
];

export function formatPriceLPS(amount) {
  return `$${amount.toFixed(2)} LPS`;
}
