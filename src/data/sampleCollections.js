// Datos de EJEMPLO mientras no tengas el campo de categoría conectado a
// productos reales en la base de datos.

export const ringsSample = [
  { id: "sample-ring-1", image: "/img/7.jpeg", title: "Anillo Chunky Pavé", price: 1310.0 },
  { id: "sample-ring-2", image: "/img/8.jpeg", title: "Anillo Ola Diamante", price: 1250.0 },
  { id: "sample-ring-3", image: "/img/9.jpeg", title: "Anillo Dorado con Pavé", price: 1790.0 },
  { id: "sample-ring-4", image: "/img/10.jpeg", title: "Anillo Bandas Cruzadas", price: 2840.0 },
];

export const necklacesSample = [
  { id: "sample-necklace-1", image: "/img/4.jpg", title: "Collar Serpentina Dorada", price: 1450.0 },
];

// Franja de categorías rápidas debajo del hero. Para agregar Aretes o
// Pulseras más adelante, solo agrega un objeto más aquí.
export const categoryStrip = [
  { label: "Rings", image: "/img/7.jpeg", href: "/coleccion/anillos" },
  { label: "Necklaces", image: "/img/4.jpg", href: "/coleccion/collares" },
];