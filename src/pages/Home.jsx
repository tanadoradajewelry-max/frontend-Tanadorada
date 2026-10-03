import Hero from "../components/Hero";
import CategoryStrip from "../components/CategoryStrip";
import CategoryGrid from "../components/CategoryGrid";
import AboutUs from "../components/AboutUs";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryStrip />

      <section className="normal-flow-section">
        <CategoryGrid />
      </section>

      <AboutUs />
    </>
  );
}
