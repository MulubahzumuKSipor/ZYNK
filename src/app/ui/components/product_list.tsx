"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/client";
import styles from "@/app/ui/styles/LandingProduct.module.css";
import AddToCartButton from "@/app/ui/components/buttons/add-to-cart";
import Image from "next/image";
import Link from "next/link";

// --- Interfaces for Type Safety ---
interface ProductVariant {
  id: string;
  price: number;
}

interface ProductImage {
  url: string;
}

// This interface matches exactly what Supabase returns
interface SupabaseProductResponse {
  id: string;
  name: string;
  slug: string;
  brands: { name: string } | null;
  categories: { name: string } | null;
  product_images: ProductImage[] | null;
  product_variants: ProductVariant[] | null;
}

interface ProductDisplay {
  id: string;
  variantId: string;
  title: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  image: string;
}

interface ProductGridProps {
  limit?: number;
  title?: string;
  shuffle?: boolean;
  className?: string; // <-- optional className for custom styling
}

export default function ProductGrid({
  limit,
  title,
  shuffle = false,
  className,
}: ProductGridProps) {
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: sbError } = await supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            brands (name),
            categories (name),
            product_images (url),
            product_variants (id, price)
          `)
          .returns<SupabaseProductResponse[]>();

        if (sbError) throw sbError;

        if (data) {
          let formatted: ProductDisplay[] = data.map((p: SupabaseProductResponse) => ({
            id: p.id,
            variantId: p.product_variants?.[0]?.id ?? "",
            title: p.name,
            slug: p.slug,
            brand: p.brands?.name ?? "Brand",
            category: p.categories?.name ?? "General",
            price: p.product_variants?.[0]?.price ?? 0,
            image: p.product_images?.[0]?.url ?? "/placeholder-product.png",
          }));

          if (shuffle) {
            formatted = [...formatted].sort(() => Math.random() - 0.5);
          }

          if (limit) {
            formatted = formatted.slice(0, limit);
          }

          setProducts(formatted);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [limit, shuffle]);

  if (loading)
    return (
      <div className={styles.loaderContainer}>
        <Loader2 className="animate-spin" size={30} stroke="#1ab26e" />
      </div>
    );

  if (error)
    return (
      <div className={styles.loaderContainer}>
        <AlertCircle size={30} color="#ef4444" />
        <p>{error}</p>
      </div>
    );

  return (
    <section className={`${limit ? styles.limitedSection : styles.fullSection} ${className ?? ""}`}>
      {title && (
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          {limit && (
            <Link href="/shop" className={styles.viewAll}>
              View All →
            </Link>
          )}
        </div>
      )}

      {/* Use the provided className if available, otherwise fallback to default grid */}
      <div className={className ? className : styles.grid}>
        {products.map((product) => (
          <div key={product.id} className={styles.card}>
            <Link href={`/shop/${product.id}`} className={styles.imageLink}>
              <div className={styles.imageWrapper}>
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
              <div className={styles.meta}>
                <span className={styles.brand}>{product.brand}</span>
              </div>
              <h3 className={styles.productTitle}>{product.title}</h3>

              <div className={styles.footer}>
                <span className={styles.price}>${product.price.toFixed(2)}</span>
                <AddToCartButton variantId={product.variantId} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
