import CategoryPage from "./CategoryPage";
import { ringsSample } from "../data/sampleCollections";

export default function RingsCategoryPage() {
  return <CategoryPage title="Anillos" products={ringsSample} />;
}