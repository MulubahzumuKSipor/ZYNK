"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/client";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import AddToCartButton from "@/app/ui/components/buttons/add-to-cart";
import ProductFilters, { FilterState } from "@/app/ui/components/filter";
import styles from "@/app/ui/styles/product.module.css";

// --- Types ---
interface SupabaseProductRow {
  id: string;
  name: string;
  slug: string | null;
  brand_id: string | null;
  category_id: string | null;
  brands: { name: string } | null;
  categories: { name: string } | null;
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
  category: string;
  categoryId?: string;
  price: number;
  image: string;
}

interface FilterOption {
  id: string;
  name: string;
}

const PRODUCTS_PER_PAGE = 12;

export default function ShopPage() {
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({});

  // Dynamic filter options
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [brands, setBrands] = useState<FilterOption[]>([]);

  // --- Fetch categories and brands ---
  useEffect(() => {
    async function fetchFilters() {
      try {
        const { data: catData } = await supabase
          .from("categories")
          .select("id, name")
          .eq("is_active", true);
        setCategories(catData ?? []);

        const { data: brandData } = await supabase
          .from("brands")
          .select("id, name");
        setBrands(brandData ?? []);
      } catch (err) {
        console.error("Failed to load filters:", err);
      }
    }

    fetchFilters();
  }, []);

  // --- Fetch products ---
  useEffect(() => {
    async function fetchProducts() {
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
            categories!inner(name),
            product_images(url),
            product_variants(id, price)
          `)
          .order("created_at", { ascending: false })
          .returns<SupabaseProductRow[]>();

        if (sbError) throw sbError;

        if (data) {
          const formatted: ProductDisplay[] = data.map((p) => ({
            id: p.id,
            variantId: p.product_variants?.[0]?.id ?? "",
            title: p.name,
            slug: p.slug ?? p.id,
            brand: p.brands?.name ?? "Brand",
            brandId: p.brand_id ?? undefined,
            category: p.categories?.name ?? "General",
            categoryId: p.category_id ?? undefined,
            price: p.product_variants?.[0]?.price ?? 0,
            image: p.product_images?.[0]?.url ?? "https://via.placeholder.com/400",
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

    fetchProducts();
  }, []);

  // --- Apply filters ---
  useEffect(() => {
    const filtered = products.filter((p) => {
      const matchCategory = !filters.categoryId || p.categoryId === filters.categoryId;
      const matchBrand = !filters.brandId || p.brandId === filters.brandId;
      const matchMinPrice = !filters.minPrice || p.price >= filters.minPrice;
      const matchMaxPrice = !filters.maxPrice || p.price <= filters.maxPrice;
      const matchVariant = !filters.variantId || p.variantId === filters.variantId;

      return matchCategory && matchBrand && matchMinPrice && matchMaxPrice && matchVariant;
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [filters, products]);

  // --- Pagination ---
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  if (loading)
    return (
      <div className={styles.loaderContainer}>
        <Loader2 className="animate-spin" size={40} stroke="#1ab26e" />
      </div>
    );

  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Shop All</h1>
        <p className={styles.subtitle}>Premium quality delivered to your door.</p>
      </header>

      {/* --- Filter Bar --- */}
      <ProductFilters
        filters={filters}
        setFilters={setFilters}
        onFilterChange={(updated) => setFilters(updated)}
        categories={categories}
        brands={brands}
      />

      {/* --- Products Grid --- */}
      <div className={styles.grid}>
        {currentProducts.map((product, index) => (
          <div key={product.id} className={styles.card}>
            <Link href={`/shop/${product.id}`} className={styles.imageLink}>
              <div className={styles.imageWrapper}>
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
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
          </div>
        ))}
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
