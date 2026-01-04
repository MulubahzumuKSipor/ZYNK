// app/dashboard/404.tsx
'use client';

import Link from 'next/link';
import styles from '@/app/ui/styles/404.module.css';

export default function Dashboard404() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>Oops! Page Not Found</h2>
        <p className={styles.subtitle}>
          The page you’re looking for doesn’t exist in your dashboard.
        </p>
        <Link href="/" className={styles.button}>
          Back to Home
        </Link>
        <div className={styles.illustration}>
        </div>
      </div>
    </div>
  );
}
