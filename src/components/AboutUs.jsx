import Reveal from "./Reveal";

export default function AboutUs() {
  return (
    <section className="about-us">
      <Reveal as="div" className="about-us-inner">
        <div className="about-us-image-wrapper">
          <img src="/img/I.jpeg" alt="Alba Sthella, fundadora de TANADORADA" />
        </div>

        <div className="about-us-text">
          <span className="about-us-eyebrow">Sobre Nosotros</span>
          <h2 className="about-us-title">The story behind TANADORADA</h2>

          <div className="about-us-body">
            <p>
              TANADORADA nace del amor por la moda, el buen gusto y la
              joyería cuidadosamente curada.
            </p>

            <p>
              Soy Alba Sthella, directora creativa y fundadora de TANADORADA.
              Cada colección es seleccionada y curada por mí, inspirada en
              las tendencias y buscando siempre piezas que combinen
              personalidad, versatilidad y estilo.
            </p>

            <p>
              El nombre TANADORADA nace de Aitana, el nombre de mi hija, y
              dorado, mi tono favorito en joyería. Hoy también exploramos
              los mixed tones, combinando diferentes metales como parte de
              nuestra visión contemporánea.
            </p>

            <p>
              A lo largo de los años, hemos colaborado con revistas, figuras
              públicas, marcas y eventos, construyendo algo que va más allá
              de la joyería: <em>una comunidad y una experiencia.</em>
            </p>

            <p>
              Nuestra marca es pionera en crear experiencias como nuestro
              icónico Charm Bar, llevando la joyería a nuevos espacios de
              expresión, conexión y celebración.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}