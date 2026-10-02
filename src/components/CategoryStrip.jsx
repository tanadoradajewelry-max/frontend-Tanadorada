import { Link } from "react-router-dom";
import { categoryStrip } from "../data/sampleCollections";

export default function CategoryStrip() {
  return (
    <div className="category-strip">
      {categoryStrip.map((category) => (
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