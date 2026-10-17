// Ayudas para leer las tallas de un producto en cualquier página.

export function getSizes(product) {
  return Array.isArray(product?.sizes) ? product.sizes : [];
}

// Precio más bajo y más alto. "hasRange" es true cuando las tallas no
// cuestan lo mismo (entonces se muestra "Desde").
export function getPriceRange(product) {
  const sizes = getSizes(product);

  if (sizes.length === 0) {
    const price = Number(product?.price) || 0;
    return { min: price, max: price, hasRange: false };
  }

  const prices = sizes.map((size) => Number(size.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max, hasRange: max > min };
}