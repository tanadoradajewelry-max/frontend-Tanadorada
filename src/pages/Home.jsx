import { useState } from "react";
import Hero from "../components/Hero";
import CategoryStrip from "../components/CategoryStrip";
import CategoryGrid from "../components/CategoryGrid";
import ShopByPrice from "../components/ShopByPrice";
import ProductGrid from "../components/ProductGrid";
import AboutUs from "../components/AboutUs";

export default function Home() {
  const [priceRange, setPriceRange] = useState("all");

  return (
    <>
      <Hero />
      <CategoryStrip />

      <section className="shop-by-price-section">
        <h2>Shop by Price</h2>
        <ShopByPrice selectedRange={priceRange} onSelectRange={setPriceRange} hideLabel />
      </section>

      <section className="normal-flow-section" id="best-sellers">
        <CategoryGrid />
        <ProductGrid priceRange={priceRange} />
      </section>

      <AboutUs />
    </>
  );
}