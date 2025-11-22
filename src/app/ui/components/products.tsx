"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/app/types/product";
import Image from "next/image";
import styles from "../styles/products.module.css";
import Link from "next/link";

export const API_URL = "http://localhost:3000/api/products";

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const json = await response.json();
        console.log(json);
        const data: Product[] = Array.isArray(json.products) ? json.products : json;

        setProducts(data);
        setError(null);
      } catch (e) {
        if (e instanceof Error) setError(e.message);
        else setError("An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div className={styles.error}>Error fetching data: {error}</div>;

  return (
    <div className={styles.listContainer}>
      <h2>Product Catalog</h2>

      <ol className={styles.productList}>
        {products.map((product) => {
          const variant = product.variants?.[0];
          const imageObj = product.images?.[0];

          return (
            <li key={product.product_id} className={styles.listItem}>
              <Link href={`/shop/${product.product_id}`} className="link">
                <div className={styles.productCard}>
                  {/* --- Image --- */}
                  <div className={styles.imageWrapper}>
                    {imageObj ? (
                      <Image
                        src={imageObj.image_url}
                        alt={product.title}
                        width={150}
                        height={150}
                        style={{ objectFit: "cover" }}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.placeholderImage}>No Image</div>
                    )}
                  </div>

                  {/* --- Product Details --- */}
                  <div className={styles.productDetails}>
                    <span className={styles.productName}>{product.title}</span>
                    <span className={styles.brand}>
                        by {product.brand ?? product?.sku}
                    </span>


                    <div className={styles.pricingAndStats}>
                      <span className={styles.price}>
                        ${product?.price ?? "N/A"}
                      </span>
                      <span className={styles.stock}>
                        Stock: {product?.stock_quantity ?? "N/A"}
                      </span>
                      <span className={styles.rating}>
                        ⭐ {product.rating ?? "N/A"}
                      </span>
                    </div>

                    <p className={styles.descriptionSnippet}>
                      {product.description?.slice(0, 150)}...
                    </p>

                    {/* Optional: Categories */}
                    {product.categories && product.categories.length > 0 && (
                      <div className={styles.categories}>
                        Categories: {product.categories.map(c => c.name).join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default ProductList;
