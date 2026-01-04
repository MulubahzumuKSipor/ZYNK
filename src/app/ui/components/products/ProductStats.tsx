"use client";
import styles from "@/app/ui/styles/productStat.module.css";

interface ProductStatsProps {
  data: {
    status: string;
    stock_quantity: number;
  }[];
}

export default function ProductStats({ data }: ProductStatsProps) {
  // Calculate stats from the data array
  const totalProducts = data.length;
  const lowStock = data.filter(p => p.stock_quantity > 0 && p.stock_quantity < 10).length;
  const outOfStock = data.filter(p => p.stock_quantity === 0).length;
  const activeProducts = data.filter(p => p.status === 'active').length;

  const stats = [
    { label: "Total Products", value: totalProducts, color: "#4f46e5" },
    { label: "Active", value: activeProducts, color: "#10b981" },
    { label: "Low Stock", value: lowStock, color: "#f59e0b" },
    { label: "Out of Stock", value: outOfStock, color: "#ef4444" },
  ];

  return (
    <div className={styles.statsGrid}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.statCard}>
          <span className={styles.statLabel}>{stat.label}</span>
          <div className={styles.statValue} style={{ color: stat.color }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}