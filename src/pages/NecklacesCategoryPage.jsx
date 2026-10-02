import CategoryPage from "./CategoryPage";
import { necklacesSample } from "../data/sampleCollections";

export default function NecklacesCategoryPage() {
  return <CategoryPage title="Collares" products={necklacesSample} />;
}