import Reveal from "./Reveal";
import { categories } from "../data/storeData";

export default function CategoryGrid() {
  return (
    <>
      <Reveal as="div" className="section-header">
        <h2>Colecciones por Estilo</h2>
        <p>Diseños atemporales para complementar tu día a día</p>
      </Reveal>

      <div className="categories-grid">
        {categories.map((category) => (
          <Reveal as="a" href="#best-sellers" className="category-box" key={category.id}>
            <img src={category.image} alt={category.title} />
            <div className="category-box-info">
              <h3>{category.title}</h3>
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                Explorar &rarr;
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}