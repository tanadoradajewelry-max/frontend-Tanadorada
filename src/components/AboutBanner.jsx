import { Link } from "react-router-dom";
import Reveal from "./Reveal";
import PillarIcon from "./PillarIcon";

export default function AboutBanner({ data }) {
  const pillars = data.pillars || [];
  const href = data.linkHref || "";
  const isInternal = href.startsWith("/");

  return (
    <section className="about-banner">
      <div className="about-banner-hero">
        {data.image && <img src={data.image} alt={data.title} />}
        <div className="about-banner-overlay" />

        <Reveal as="div" className="about-banner-content">
          <h2>{data.title}</h2>

          {data.linkText &&
            href &&
            (isInternal ? (
              <Link to={href} className="about-banner-link">
                {data.linkText}
              </Link>
            ) : (
              <a href={href} className="about-banner-link">
                {data.linkText}
              </a>
            ))}
        </Reveal>
      </div>

      {pillars.length > 0 && (
        <div className="about-banner-pillars">
          {pillars.map((pillar, index) => (
            <div className="about-banner-pillar" key={index}>
              <PillarIcon name={pillar.icon} />
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}