"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/client";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import AddToCartButton from "@/app/ui/components/buttons/add-to-cart";
import ProductFilters, { FilterState } from "@/app/ui/components/filter";
import styles from "@/app/ui/styles/product.module.css";

// --- Interfaces ---
interface SupabaseProductRow {
  id: string;
  name: string;
  slug: string | null;
  brand_id: string | null;
  category_id: string | null;
  brands: { name: string } | null;
  categories: { name: string; slug: string } | null;
  product_images: { url: string }[] | null;
  product_variants: { id: string; price: number }[] | null;
}

interface ProductDisplay {
  id: string;
  variantId: string;
  title: string;
  slug: string;
  brand: string;
  brandId?: string;
  price: number;
  image: string;
}

interface FilterOption {
  id: string;
  name: string;
}

const PRODUCTS_PER_PAGE = 12;

export default function CategoryPage() {
  const { slug } = useParams();

  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({});
  const [brands, setBrands] = useState<FilterOption[]>([]);

  // 1. Fetch Brands for the Filter Sidebar
  useEffect(() => {
    async function fetchFilterData() {
      try {
        const { data: brandData } = await supabase
          .from("brands")
          .select("id, name");
        setBrands(brandData ?? []);
      } catch (err) {
        console.error("Failed to load brands:", err);
      }
    }
    fetchFilterData();
  }, []);

  // 2. Fetch Category-Specific Products via Slug
  useEffect(() => {
    async function fetchCategoryProducts() {
      if (!slug) return;

      try {
        setLoading(true);
        const { data, error: sbError } = await supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            brand_id,
            category_id,
            brands!inner(name),
            categories!inner(name, slug),
            product_images(url),
            product_variants(id, price)
          `)
          .eq("categories.slug", slug)
          .order("created_at", { ascending: false })
          .returns<SupabaseProductRow[]>();

        if (sbError) throw sbError;

        if (data) {
          if (data.length > 0) {
            setCategoryName(data[0].categories?.name ?? "");
          }

          const formatted: ProductDisplay[] = data.map((p) => ({
            id: p.id,
            variantId: p.product_variants?.[0]?.id ?? "",
            title: p.name,
            slug: p.slug ?? p.id,
            brand: p.brands?.name ?? "Brand",
            brandId: p.brand_id ?? undefined,
            price: p.product_variants?.[0]?.price ?? 0,
            image: p.product_images?.[0]?.url ?? "/placeholder-perfume.png",
          }));

          setProducts(formatted);
          setFilteredProducts(formatted);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryProducts();
  }, [slug]);

  // 3. Client-side Filtering Logic
  useEffect(() => {
    const filtered = products.filter((p) => {
      const matchBrand = !filters.brandId || p.brandId === filters.brandId;
      const matchMinPrice = !filters.minPrice || p.price >= filters.minPrice;
      const matchMaxPrice = !filters.maxPrice || p.price <= filters.maxPrice;
      return matchBrand && matchMinPrice && matchMaxPrice;
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [filters, products]);

  // 4. Pagination Calculations
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  if (loading)
    return (
      <div className={styles.loaderContainer}>
        <Loader2 className={styles.spinner} size={40} />
      </div>
    );

  if (error) return <div className={styles.container}><p className={styles.error}>{error}</p></div>;

  return (
    <main className={styles.container}>
      {/* --- Breadcrumb & Header --- */}
      <header className={styles.header}>
        <Link href="/shop" className={styles.backLink}>
          <ArrowLeft size={14} className="mr-2" /> All Collections
        </Link>
        <h1 className={styles.title}>
          {categoryName || (slug as string).replace('-', ' ')}
        </h1>
        <p className={styles.subtitle}>
          Explore our curated selection of premium {categoryName.toLowerCase() || 'products'}.
        </p>
      </header>

      {/* --- Global Filter Component --- */}
      <ProductFilters
        filters={filters}
        setFilters={setFilters}
        onFilterChange={(updated) => setFilters(updated)}
        categories={[]} // Hidden because we are in a specific category
        brands={brands}
      />

      {/* --- Product Grid --- */}
      <div className={styles.grid}>
        {currentProducts.length > 0 ? (
          currentProducts.map((product, index) => (
            <article key={product.id} className={styles.card}>
              <Link href={`/shop/${product.id}`} className={styles.imageLink}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    className={styles.image}
                    priority={index < 4}
                  />
                </div>
              </Link>

              <div className={styles.content}>
                <div className={styles.meta}>
                  <span className={styles.brand}>{product.brand}</span>
                </div>

                <Link href={`/shop/${product.id}`}>
                  <h3 className={styles.productTitle}>{product.title}</h3>
                </Link>

                <div className={styles.footer}>
                  <div className={styles.price}>
                    <span className={styles.currency}>$</span>
                    {product.price.toFixed(2)}
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    {product.variantId ? (
                      <AddToCartButton variantId={product.variantId} />
                    ) : (
                      <button className={styles.disabledBtn} disabled>
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No products found in this collection.</p>
            <Link href="/shop" className={styles.resetLink}>View all products</Link>
          </div>
        )}
      </div>

      {/* --- Pagination --- */}
      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={styles.pageBtn}
          >
            <ChevronLeft size={20} />
          </button>

          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={styles.pageBtn}
          >
            <ChevronRight size={20} />
          </button>
        </nav>
      )}
    </main>
  );
}