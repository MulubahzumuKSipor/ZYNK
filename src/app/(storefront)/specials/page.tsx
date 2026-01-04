"use client";

import { useEffect, useState } from "react";
import { Loader2, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { supabase } from "@/lib/client";
import styles from "@/app/ui/styles/SpecialProduct.module.css";
import AddToCartButton from "@/app/ui/components/buttons/add-to-cart";
import Image from "next/image";
import Link from "next/link";

// --- Interfaces for Type Safety ---
interface RawSupabaseProduct {
  id: string;
  name: string;
  brands: { name: string } | { name: string }[] | null;
  product_images: { url: string }[] | null;
  product_variants: { id: string; price: number }[] | null;
}

interface ProductDisplay {
  id: string;
  variantId: string;
  title: string;
  brand: string;
  price: number;
  image: string;
}

const PRODUCTS_PER_PAGE = 10;

export default function SpecialProductsPage() {
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchSpecialProducts() {
      try {
        setLoading(true);

        const { data, error: sbError } = await supabase
          .from("products")
          .select(`
            id,
            name,
            brands (name),
            product_images (url),
            product_variants (id, price)
          `)
          .eq("is_specials", true)
          .order("created_at", { ascending: false });

        if (sbError) throw sbError;

        if (data) {
          const formatted: ProductDisplay[] = (data as unknown as RawSupabaseProduct[]).map((p) => {
            const brandData = Array.isArray(p.brands) ? p.brands[0] : p.brands;

            return {
              id: p.id,
              variantId: p.product_variants?.[0]?.id ?? "",
              title: p.name,
              brand: brandData?.name ?? "Exclusive",
              price: p.product_variants?.[0]?.price ?? 0,
              image: p.product_images?.[0]?.url ?? "/placeholder.png",
            };
          });

          setProducts(formatted);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load special collection");
      } finally {
        setLoading(false);
      }
    }

    fetchSpecialProducts();
  }, []);

  if (loading) return (
    <div className={styles.loaderContainer}>
      <Loader2 className="animate-spin" size={40} stroke="#1ab26e" />
    </div>
  );

  if (error) return <div className={styles.container}><p className={styles.error}>{error}</p></div>;

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const currentProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Our Developer&apos;s Choice</h1>
        <p className={styles.subtitle}>Our most exclusive and highly recommended products.</p>
      </header>

      {products.length > 0 ? (
        <>
          <div className={styles.grid}>
            {currentProducts.map((product) => (
              <div key={product.id} className={styles.card}>
                <Link href={`/shop/${product.id}`} className={styles.imageLink}>
                  <div className={styles.imageWrapper}>
                    <div className={styles.specialBadge}>Special</div>
                    <Image
                      src={product.image}
                      alt={product.title}
                      className={styles.image}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </Link>

                <div className={styles.content}>
                  <span className={styles.brand}>{product.brand}</span>
                  <Link href={`/shop/${product.id}`}>
                    <h3 className={styles.productTitle}>{product.title}</h3>
                  </Link>

                  <div className={styles.footer}>
                    <div className={styles.price}>
                      <span className={styles.currency}>$</span>
                      {product.price.toFixed(2)}
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <AddToCartButton variantId={product.variantId} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => {
                  setCurrentPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className={styles.pageBtn}
              >
                <ChevronLeft size={20} />
              </button>
              <span className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => {
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className={styles.pageBtn}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      ) : (
        /* --- FALLBACK CARD --- */
        <div className={styles.noProductsCard}>
          <div className={styles.noProductsIcon}>
            <Sparkles size={48} color="#1ab26e" />
          </div>
          <h2 className={styles.noProductsTitle}>No Special Products Found</h2>
          <p className={styles.noProductsText}>
            Our Super Admin is currently hand-picking new exclusive items.
            Check back soon or explore our main shop!
          </p>
          <Link href="/shop" className={styles.backToShopBtn}>
            Browse All Products
          </Link>
        </div>
      )}
    </main>
  );
}