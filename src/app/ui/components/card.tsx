// components/ui/KPICard.tsx
'use client';
import React from 'react';
import styles from '@/app/ui/styles/card.module.css';
import { useDashboardTheme } from '@/app/ui/components/shared/themeProvider'; // Assuming you have your theme context

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string; // e.g., "vs last period"
  isCurrency?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, isCurrency = false }) => {
  const { theme } = useDashboardTheme();

  // Format value as currency if needed
  const formattedValue =
    isCurrency && typeof value === 'number' ? `$${value.toFixed(2)}` : value;

  return (
    <div className={`${styles.card} ${theme === 'dark' ? styles.dark : styles.light}`}>
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.value}>{formattedValue}</p>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
};

export default KPICard;
