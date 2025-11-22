import React from 'react';
import styles from "../styles/skeletons.module.css"


/**
 * Represents a single "loading" product card in a vertical layout.
 */
const ProductCardSkeletonVertical = () => (
  // This wrapper (listItemSkeleton) corresponds to styles.listItem or styles.productCard in your final component
  <li className={styles['list-item-skeleton']}>

    {/* Large Image Placeholder */}
    <div className={`${styles['image-skeleton-vertical']} ${styles.skeleton}`}></div>

    {/* Product Details Area (Below the Image) */}
    <div className={styles['details-skeleton-vertical']}>

      {/* Product Title / Name */}
      <div className={`${styles.skeleton} ${styles['skeleton-title-vertical']}`}></div>

      {/* Brand (Smaller text line) */}
      <div className={`${styles.skeleton} ${styles['skeleton-text-small']}`}></div>

      {/* Price / Stock / Rating (A line of shorter blocks) */}
      <div className={styles['stats-skeleton-row']}>
          <div className={`${styles.skeleton} ${styles['skeleton-stat']}`}></div>
          <div className={`${styles.skeleton} ${styles['skeleton-stat']}`}></div>
          <div className={`${styles.skeleton} ${styles['skeleton-stat-small']}`}></div>
      </div>

      {/* Placeholder for the description (if included) */}
      <div className={`${styles.skeleton} ${styles['skeleton-text-long-thin']}`}></div>
      <div className={`${styles.skeleton} ${styles['skeleton-text-long-thin']}`}></div>

    </div>
  </li>
);

/**
 * The main component rendering the list of vertical skeletons.
 */
const FeaturedProductsSkeleton = ({ count = 5 }) => {
  const skeletonCards = [...Array(count)];

  return (
    <div className={styles['list-container-skeleton']}>
      {/* Heading Skeleton */}
      <div className={`${styles.skeleton} ${styles['skeleton-heading']}`}></div>

      {/* Product List Container (UL) */}
      <ul className={styles['product-list-skeleton']}>
        {skeletonCards.map((_, index) => (
          <ProductCardSkeletonVertical key={index} />
        ))}
      </ul>
    </div>
  );
};

export default FeaturedProductsSkeleton;