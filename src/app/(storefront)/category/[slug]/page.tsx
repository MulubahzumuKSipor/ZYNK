"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/client";
import Image from "next/image";
import Link from "next/link";
import styles from "@/app/ui/styles/category_page.module.css";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  slug: string;
}

interface CategoryInfo {
  name: string;
  description: string;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategoryData() {
      try {
        setLoading(true);

        // 1. Get Category Details
        const { data: catData } = await supabase
          .from("categories")
          .select("id, name, description")
          .eq("slug", slug)
          .single();

        if (catData) {
          setCategory(catData);

          // 2. Get Products for this Category
          // Note: This assumes a foreign key 'category_id' in your products table
          const { data: prodData } = await supabase
            .from("products")
            .select("id, name, price, image_url, slug")
            .eq("category_id", catData.id);

          setProducts(prodData || []);
        }
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchCategoryData();
  }, [slug]);

  if (loading) return <div className={styles.loader}>Loading products...</div>;
  if (!category) return <div className={styles.error}>Category not found.</div>;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{category.name}</h1>
        {category.description && <p className={styles.desc}>{category.description}</p>}
      </header>

      <div className={styles.productGrid}>
        {products.length > 0 ? (
          products.map((product) => (
            <Link href={`/product/${product.slug}`} key={product.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={product.image_url || "/placeholder-product.png"}
                  alt={product.name}
                  fill
                  className={styles.productImg}
                />
              </div>
              <div className={styles.info}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.price}>${product.price.toFixed(2)}</p>
              </div>
            </Link>
          ))
        ) : (
          <p className={styles.empty}>No products found in this category.</p>
        )}
      </div>
    </main>
  );
}