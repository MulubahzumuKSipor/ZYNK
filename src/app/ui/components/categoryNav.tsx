"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "@/app/ui/styles/navigation_sections.module.css";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CategoryNavigation({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section className={styles.categorySection}>
      <h2 className={styles.sectionTitle}>Shop by Category</h2>
      <div className={styles.categoryGrid}>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/category/${cat.slug}`} className={styles.categoryCard}>
            <div className={styles.iconCircle}>
              <Image
                src={`/${cat.name.toLowerCase()}.svg`}
                alt={cat.name}
                width={32}
                height={32}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/placeholder-icon.svg";
                }}
              />
            </div>
            <span>{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}