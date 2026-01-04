"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import CategoryNavigation from "../categoryNav";
import BrandNavigation from "../brandNav";
import styles from "@/app/ui/styles/navigation_sections.module.css";

// Define strict interfaces
export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
}

export interface NavData {
  categories: Category[];
  brands: Brand[];
}

export default function HomeNavigation() {
  // Use NavData interface instead of 'any'
  const [data, setData] = useState<NavData>({
    categories: [],
    brands: [],
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, brandRes] = await Promise.all([
          supabase
            .from("categories")
            .select("id, name, slug")
            .eq("is_active", true)
            .limit(8),
          supabase
            .from("brands")
            .select("id, name, slug, website_url")
            .limit(12),
        ]);

        setData({
          // Cast the response to match our interfaces
          categories: (catRes.data as Category[]) || [],
          brands: (brandRes.data as Brand[]) || [],
        });
      } catch (error) {
        console.error("Error fetching navigation data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className={styles.loader}>Loading...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <CategoryNavigation categories={data.categories} />

      {/* <NewArrivalsPage /> */}

      <BrandNavigation brands={data.brands} />
    </div>
  );
}