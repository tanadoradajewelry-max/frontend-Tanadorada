const PRICE_RANGES = [
  { id: "all", label: "Todos" },
  { id: "under-500", label: "Menos de L. 500", test: (price) => price < 500 },
  { id: "500-1000", label: "L. 500 – L. 1,000", test: (price) => price >= 500 && price <= 1000 },
  { id: "over-1000", label: "Más de L. 1,000", test: (price) => price > 1000 },
];

export { PRICE_RANGES };

export default function ShopByPrice({ selectedRange, onSelectRange, hideLabel = false }) {
  return (
    <div className="shop-by-price">
      {!hideLabel && <span className="shop-by-price-label">Comprar por precio</span>}
      <div className="shop-by-price-buttons">
        {PRICE_RANGES.map((range) => (
          <button
            key={range.id}
            type="button"
            className={`shop-by-price-btn ${
              selectedRange === range.id ? "shop-by-price-btn--active" : ""
            }`}
            onClick={() => onSelectRange(range.id)}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}