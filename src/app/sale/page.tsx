"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import ProductList from "@/app/ui/components/products";
import styles from "@/app/ui/styles/product.module.css";

interface Product {
  product_id?: number;
  title?: string;
  brand?: string | null;
  price?: number | string | null;
  compare_at_price?: number | string | null;
  images?: { image_url?: string | null }[] | null;
  rating?: number | null;
  stock_quantity?: number | null;
  category_name?: string | null;
  isNew?: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        setLoading(true);

        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Failed to fetch products: HTTP ${res.status}`);
        }


        const data: Product[] = await res.json();

        // console.table(
        //   data.map(p => ({
        //     title: p.title,
        //     rating: p.rating,
        //     type: typeof p.rating,
        //   }))
        // );

        const highRatedProducts = Array.isArray(data)
        ? data.filter((product) => {
            const rating = Number(product.rating);
            return Number.isFinite(rating) && rating >= 4.5;
          })
        : [];


        setProducts(highRatedProducts);
      } catch (err) {
        console.error("Products fetch error:", err);
        setError("Could not load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className={styles.centerMessage}>
        <Loader2 className="animate-spin" size={40} color="#1ab26e" />
        <p>Loading products…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centerMessage}>
        <AlertCircle size={48} color="#ef4444" />
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Top Rated Products</h1>
        <div className={styles.centerMessage}>
          <h2>No high-rated products found</h2>
          <p>Only products rated above 4.5 are displayed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Hottest Products</h1>
      <div className={styles.grid}>
        {products.map((p) => (
          <ProductList
            key={p.product_id ?? `${p.title}-${crypto.randomUUID()}`}
            product={{ ...p, isHot: true }}
          />
        ))}
      </div>
    </div>
  );
}
