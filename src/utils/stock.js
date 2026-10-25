// Mismo número que LOW_STOCK_THRESHOLD en backend/src/lib/stock.js.
// Si algún día lo cambias, cámbialo en los dos lugares.
export const LOW_STOCK_THRESHOLD = 10;

// stock vacío (null) = el producto no controla stock
export const isTracked = (product) =>
  product?.stock !== null && product?.stock !== undefined;

export const isSoldOut = (product) =>
  isTracked(product) && Number(product.stock) <= 0;

export const isLowStock = (product) =>
  isTracked(product) &&
  Number(product.stock) > 0 &&
  Number(product.stock) < LOW_STOCK_THRESHOLD;

// Máximo que se puede agregar de una vez: lo que hay, con tope de 99.
export function getMaxQuantity(product) {
  if (!isTracked(product)) return 99;
  return Math.max(0, Math.min(99, Number(product.stock)));
}