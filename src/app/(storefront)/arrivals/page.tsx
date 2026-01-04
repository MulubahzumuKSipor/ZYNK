"use client";

import { useEffect, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/client";
import styles from "@/app/ui/styles/NewProduct.module.css";
import AddToCartButton from "@/app/ui/components/buttons/add-to-cart";
import Image from "next/image";
import Link from "next/link";


// --- Interfaces ---
interface ProductDisplay {
  id: string;
  variantId: string;
  title: string;
  brand: string;
  price: number;
  image: string;
  isNewArrival: boolean;
}

interface SupabaseResponse {
  id: string;
  name: string;
  created_at: string;
  brands: { name: string } | { name: string }[] | null;
  product_images: { url: string }[] | null;
  product_variants: { id: string; price: number }[] | null;
}

const ITEMS_PER_PAGE = 10;

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const checkIfNew = (dateString: string) => {
    const createdDate = new Date(dateString);
    const today = new Date();
    const diffInDays = (today.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
    return diffInDays <= 7;
  };

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        setLoading(true);
        const from = currentPage * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        const { data, error, count } = await supabase
          .from("products")
          .select(`
            id, name, created_at,
            brands (name),
            product_images (url),
            product_variants (id, price)
          `, { count: 'exact' })
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) throw error;

        if (data) {
          const rawData = data as unknown as SupabaseResponse[];
          const formatted: ProductDisplay[] = rawData.map((p) => {
            // Handle relationship type mismatch
            let brandName = "Brand";
            if (p.brands) {
              brandName = Array.isArray(p.brands) ? p.brands[0]?.name : p.brands.name;
            }

            return {
              id: p.id,
              variantId: p.product_variants?.[0]?.id ?? "",
              title: p.name,
              brand: brandName ?? "Brand",
              price: p.product_variants?.[0]?.price ?? 0,
              image: p.product_images?.[0]?.url ?? "https://via.placeholder.com/400",
              isNewArrival: checkIfNew(p.created_at),
            };
          });

          setProducts(formatted);
          if (count !== null) setTotalCount(count);

          // Scroll to top on page change
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNewArrivals();
  }, [currentPage]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading) return (
    <div className={styles.loaderContainer}>
      <Loader2 className="animate-spin" size={40} stroke="#1ab26e" />
    </div>
  );

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>New Arrivals</h1>
        <p className={styles.subtitle}>Our latest premium collection, updated weekly.</p>
      </header>

      <div className={styles.grid}>
        {products.map((product) => (
          <div key={product.id} className={styles.card}>
            <Link href={`/shop/${product.id}`} className={styles.imageLink}>
              <div className={styles.imageWrapper}>
                {product.isNewArrival && <span className={styles.newBadge}>New</span>}
                <Image
                  src={product.image}
                  alt={product.title}
                  className={styles.image}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </Link>

            <div className={styles.content}>
              <span className={styles.brand}>{product.brand}</span>
              <Link href={`/shop/${product.id}`} style={{textDecoration: 'none'}}>
                <h3 className={styles.productTitle} >{product.title}</h3>
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className={styles.pageBtn}
          >
            <ChevronLeft size={20} />
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className={styles.pageBtn}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </main>
  );
}