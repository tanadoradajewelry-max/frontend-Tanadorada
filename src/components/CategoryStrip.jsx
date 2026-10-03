import { Link } from "react-router-dom";

export default function CategoryStrip({ items }) {
  return (
    <div className="category-strip">
      {items.map((category) => (
        <Link to={category.href} className="category-strip-item" key={category.label}>
          <div className="category-strip-image">
            <img src={category.image} alt={category.label} />
          </div>
          <span className="category-strip-label">{category.label}</span>
        </Link>
      ))}
    </div>
  );
}
