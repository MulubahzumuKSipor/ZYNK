"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "@/app/ui/styles/navigation_sections.module.css";
import { Brand } from "./shared/categoriesList";

interface BrandNavigationProps {
  brands: Brand[];
}

export default function BrandNavigation({ brands }: BrandNavigationProps) {
  const TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;

  return (
    <section className={styles.brandSection}>
      <h2 className={styles.brandHeading}>Our Trusted Brands</h2>

      <div className={styles.brandFlex}>
        {brands.map((brand) => {
          const domain = brand.website_url || `${brand.slug}.com`;
          const logoUrl = `https://img.logo.dev/${domain}?token=${TOKEN}&size=128`;

          return (
            <Link
              key={brand.id}
              href={`/brand/${brand.slug}`}
              className={styles.brandLogo}
            >
              <div className={styles.logoWrapper}>
                <Image
                  src={logoUrl}
                  alt={brand.name}
                  fill
                  unoptimized
                  style={{ objectFit: "contain", padding: "10px" }}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.style.display = "none"; // hide broken image
                    const fallback = img.parentElement?.querySelector(
                      `.${styles.fallback}`
                    ) as HTMLDivElement;
                    fallback?.classList.add(styles.visible);
                  }}
                />
                <div className={`${styles.fallback}`}>{brand.name.charAt(0)}</div>
              </div>
              <span className={styles.brandName}>{brand.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
