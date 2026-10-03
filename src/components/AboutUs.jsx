import Reveal from "./Reveal";

export default function AboutUs({ data }) {
  return (
    <section className="about-us">
      <Reveal as="div" className="about-us-inner">
        <div className="about-us-image-wrapper">
          <img src={data.image} alt={data.title} />
        </div>

        <div className="about-us-text">
          <span className="about-us-eyebrow">{data.eyebrow}</span>
          <h2 className="about-us-title">{data.title}</h2>

          <div className="about-us-body">
            {data.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
