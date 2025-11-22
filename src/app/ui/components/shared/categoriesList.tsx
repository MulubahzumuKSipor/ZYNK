"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/app/ui/styles/categories.module.css";
import Image from "next/image";

type Category = {
  id: number;
  name: string;
  description?: string | null;
  categories_images: string;
};

export default function CategoryList({ className = "" }: { className?: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/categories");
        const data: Category[] = await res.json();
        if (!cancelled) setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading categories...</div>;
  }

  return (
    <div className={`${styles.grid} ${className}`}>
      {categories.map((c) => (
        <Link key={c.id} href={`/category/${c.id}`} className={styles.card}>
          <div className={styles.title}>{c.name.toUpperCase()}</div>

          <Image
            src={c.categories_images}
            alt={c.name}
            width={180}
            height={180}
            unoptimized   // Google Drive images require this to avoid errors
          />
        </Link>
      ))}
    </div>
  );
}
