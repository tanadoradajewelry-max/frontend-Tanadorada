import { Link } from "react-router-dom";
import Reveal from "./Reveal";

export default function CategoryGrid({ data }) {
  return (
    <>
      <Reveal as="div" className="section-header">
        <span className="section-eyebrow">{data.eyebrow}</span>
        <h2>{data.title}</h2>
        <p>{data.subtitle}</p>
      </Reveal>

      <div className="categories-grid">
        {data.items.map((category) => {
          const isInternal = category.href.startsWith("/");
          const Wrapper = isInternal ? Link : "a";
          const linkProps = isInternal
            ? { to: category.href }
            : { href: category.href };

          return (
            <Reveal as="div" className="category-box" key={category.title}>
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
