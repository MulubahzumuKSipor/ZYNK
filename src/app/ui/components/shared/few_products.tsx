"use client";

import React, { useState, useEffect } from 'react';
import { Product, ProductImage } from '@/app/types/product';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/app/ui/styles/few_products.module.css';
import FeaturedProductsSkeleton from '@/app/ui/skeletons/few_product_skeleton';
import { getRandomProducts } from '@/app/utilities/fetchRandom';

const API_URL = 'http://localhost:3000/api/products';

const LimitedProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();

        if (!Array.isArray(json)) {
          throw new Error("Invalid data format: expected an array of products.");
        }

        const data: Product[] = getRandomProducts(json, 4);
        setProducts(data);
        setError(null);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <FeaturedProductsSkeleton />;
  if (error) return <div className={styles.error}>Error fetching data: {error}</div>;

  const formatCurrency = (amount: number | string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));

  return (
    <div className={styles.listContainer}>
      <h2>Recommended Products</h2>
      <div className={styles.productList}>
        {products.map((product) => {
          const mainImage: ProductImage | null =
            product.images && product.images.length > 0 ? product.images[0] : null;

          return (
            <div key={product.product_id} className={styles.card}>
              <Link href={`/shop/${product.product_id}`} className='link'>
                <div className={styles.image_wrapper}>
                  {mainImage ? (
                    <Image
                      loading="lazy"
                      src={mainImage.image_url}
                      alt={product.title}
                      width={150}
                      height={150}
                      className={styles.productImage}
                    />
                  ) : (
                    <div className={styles.placeholderImage}>No Image</div>
                  )}
                </div>

                <div className={styles["bottom-section"]}>
                  <span className={styles.title}>{product.title}</span>

                  <div className={`${styles.row} ${styles.row1}`}>
                    <div className={styles.item}>
                      <span className={styles["big-text"]}>In Stock</span>
                      <span className={styles["regular-text"]}>{product.stock_quantity ?? 0}</span>
                    </div>

                    <div className={styles.item}>
                      <span className={styles["big-text"]}>Price</span>
                      <span className={styles["regular-text"]}>{formatCurrency(product.price)}</span>
                    </div>

                    <div className={styles.item}>
                      <span className={styles["big-text"]}>Rating</span>
                      <span className={styles["regular-text"]}>⭐{product.rating ?? 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LimitedProductList;
