import Landing from "@/app/ui/components/landing_page";
import ProductGrid from "@/app/ui/components/product_list";
import CategoryList from "@/app/ui/components/shared/categoriesList";
// import NewArrivalsList from "@/app/ui/components/shared/newArrivals";
// import TopRatedProducts from "@/app/ui/components/toprated";
import NewsletterSection from "@/app/ui/components/shared/news-letter";


export default function Home() {
  return (
    <>
      <Landing />
      <ProductGrid limit={4} title="Featured Products" shuffle={true} />
      <CategoryList/>
      {/* <TopRatedProducts limit={5} />
      <NewArrivalsList limit={8} title="🔥 Top 8 Latest Items"/> */}
      <NewsletterSection />
    </>
  );
}
