import React from 'react';
import styles from '../styles/Landing_Skeleton.module.css'; 

const LandingPageSkeleton: React.FC = () => {
  return (
    <div className={`${styles.landing} ${styles.skeletonContainer}`}>
      {/* Search Bar Placeholder */}
      <div>
        <div className={`${styles.productSearchBarPlaceholder} ${styles.skeletonShimmer}`} />
      </div>

      {/* Hero Section Placeholder */}
      <div className={styles.hero}>
        {/* Hero Left (Image) Placeholder */}
        <div className={`${styles.heroLeft} ${styles.skeletonShimmer}`}>
          <div className={styles.heroImagePlaceholder} />
        </div>
        
        {/* Hero Right (Text & Button) Placeholder */}
        <div className={`${styles.textBackground} ${styles.heroRight} ${styles.skeletonShimmer}`}>
          <div className={styles.heroTitlePlaceholder} />
          <div className={styles.heroDescriptionPlaceholder} />
          <div className={styles.heroDescriptionPlaceholder} style={{ width: '60%' }} /> {/* Shorter line for variety */}
          <div className={styles.heroButtonPlaceholder} />
        </div>
      </div>
      
      {/* Bottom Links (Social Media Icons) Placeholder */}
      <div className={styles.bottom_links}>
        {/* Icons are small, simple circular placeholders work best */}
        <div className={`${styles.socialIconPlaceholder} ${styles.skeletonShimmer}`} />
        <div className={`${styles.socialIconPlaceholder} ${styles.skeletonShimmer}`} />
        <div className={`${styles.socialIconPlaceholder} ${styles.skeletonShimmer}`} />
        <div className={`${styles.socialIconPlaceholder} ${styles.skeletonShimmer}`} />
        <div className={`${styles.socialIconPlaceholder} ${styles.skeletonShimmer}`} />
      </div>
    </div>
  );
};

export default LandingPageSkeleton;
