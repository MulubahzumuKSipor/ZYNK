"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/client";
import styles from "../styles/search.module.css";

// Define strict sub-types
interface ProductVariant {
  price: number;
  sku: string;
}

interface ProductImage {
  url: string;
  is_primary: boolean;
}

interface Brand {
  name: string;
}

export type Product = {
  id: string;
  name: string;
  description: string | null;
  product_variants: ProductVariant[];
  product_images: ProductImage[];
  brands: Brand | null;
};

interface ProductSearchProps {
  limit?: number;
}

export default function ProductSearch({ limit = 6 }: ProductSearchProps) {



  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click Outside Logic
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Strict Type-Safe Search Function
  const searchProducts = useCallback(async (text: string) => {
    const cleanQuery = text.trim();
    if (cleanQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // We cast the select query to use our Product type
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          brands (name),
          product_images (url, is_primary),
          product_variants (price, sku)
        `)
        .or(`name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
        .eq("is_active", true)
        .limit(limit);

      if (error) throw error;

      // Type assertion to bridge Supabase's response with our interface
      const formattedData = (data as unknown as Product[]) || [];
      setResults(formattedData);
    } catch (err) {
      console.error("Search Error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query) {
        searchProducts(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, searchProducts]);

  return (
    <div ref={containerRef} className={styles.searchContainer}>
      <div className={styles.inputWrapper}>
        <div className={styles.searchIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </div>

        <input
          type="text"
          className={styles.input}
          placeholder="Search items, Product names, Description, Colors..."
          value={query}
          onFocus={() => setShowSuggestions(true)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
        />

        {query && (
          <button
            className={styles.clearButton}
            onClick={() => { setQuery(""); setResults([]); }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {showSuggestions && query.length >= 2 && (
        <div className={styles.dropdown}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <span>Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <ul className={styles.list}>
              {results.map((product) => {
                // Safe access to nested arrays
                const primaryImg = product.product_images?.find(i => i.is_primary)?.url;
                const fallbackImg = product.product_images?.[0]?.url;
                const displayImg = primaryImg || fallbackImg;

                const displayPrice = product.product_variants?.[0]?.price ?? 0;

                return (
                  <li key={product.id}>
                    <Link
                      href={`/shop/${product.id}`}
                      className={styles.itemLink}
                      onClick={() => setShowSuggestions(false)}
                    >
                      <div className={styles.imageBox}>
                        {displayImg ? (
                          <Image
                            src={displayImg}
                            alt={product.name}
                            fill
                            sizes="40px"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className={styles.noImage}>?</div>
                        )}
                      </div>
                      <div className={styles.content}>
                        <div className={styles.nameRow}>
                          <span className={styles.name}>{product.name}</span>
                          <span className={styles.price}>${displayPrice.toFixed(2)}</span>
                        </div>
                        <div className={styles.brand}>
                          {product.brands?.name || "General"}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={styles.emptyState}>No results for &quot;{query}&quot;</div>
          )}
        </div>
      )}
    </div>
  );
}