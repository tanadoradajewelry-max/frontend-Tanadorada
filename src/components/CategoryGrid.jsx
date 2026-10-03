import { Link } from "react-router-dom";
import Reveal from "./Reveal";
import { categories } from "../data/storeData";

export default function CategoryGrid() {
  return (
    <>
      <Reveal as="div" className="section-header">
        <span className="section-eyebrow">Explora</span>
        <h2>Colecciones por Estilo</h2>
        <p>Diseños atemporales para complementar tu día a día</p>
      </Reveal>

      <div className="categories-grid">
        {categories.map((category) => {
          const isInternal = category.href.startsWith("/");
          const Wrapper = isInternal ? Link : "a";
          const linkProps = isInternal
            ? { to: category.href }
            : { href: category.href };

          return (
            <Reveal as="div" className="category-box" key={category.id}>
              <Wrapper {...linkProps} style={{ display: "block", height: "100%" }}>
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
              </Wrapper>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
