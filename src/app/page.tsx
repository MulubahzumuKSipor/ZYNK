import Landing from "./ui/components/landing_page";
import CategoryList from "./ui/components/shared/categoriesList";
import LimitedProductList from "./ui/components/shared/few_products";


export default function Home() {
  return (
    <>
      <Landing />
      <LimitedProductList />
      <CategoryList/>

    </>
  );
}
