"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Landing.module.css";

// You can keep props if you want to make the text dynamic later,
// otherwise, hardcoding text here is fine for a landing page.
export default function LandingHero() {

  return (
    <section className={styles.heroWrapper}>
      <div className={styles.heroContainer}>

        {/* LEFT SIDE: Text Content (Brand Mission & CTA) */}
        <div className={styles.heroContent}>

          {/* subtle badge above title */}
          <span className={styles.brandBadge}>PREMIUM COLLECTION</span>

          <h1 className={styles.heroTitle}>
            Elevate Your Lifestyle with <span className={styles.accentText}>Quality.</span>
          </h1>

          <p className={styles.heroDescription}>
            Discover our curated selection of premium goods designed to inspire.
            We are dedicated to sustainable craftsmanship and timeless design.
            Join thousands of happy customers today.
          </p>

          <div className={styles.ctaGroup}>
            <Link href="/shop">
              <button className={styles.heroButton}>
                Ready to Shop!
              </button>
            </Link>
            <p className={styles.shippingNote}>
              <span>✓</span> Free Shipping on orders over $100
            </p>
          </div>

          {/* Optional: Trust Signals / Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <strong>10k+</strong>
              <span>Happy Customers</span>
            </div>
            <div className={styles.statItem}>
              <strong>4.9/5</strong>
              <span>Average Rating</span>
            </div>
            <div className={styles.statItem}>
              <strong>24/7</strong>
              <span>Support</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Single "Hero" Image */}
        <div className={styles.heroImageWrapper}>
          {/* Replace '/hero-main.jpg' with your actual brand lifestyle image */}
          <Image
            src="/laptop.avif"
            alt="Brand Lifestyle Shot"
            width={600}
            height={600}
            className={styles.heroImage}
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 90vw, 600px"
            style={{ objectFit: "cover" }}
          />


          {/* Optional: Floating decorative card */}
          <div className={styles.floatingCard}>
             <span>New Arrivals</span>
             <strong>Winter 2024</strong>
          </div>
        </div>

      </div>
    </section>
  );
}