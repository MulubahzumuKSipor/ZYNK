'use client';

import { useState } from 'react';
import styles from '@/app/ui/styles/payments.module.css';

interface PaymentStats {
  total_revenue: number;
  revenue_30_days: number;
  recent_failures: number;
  average_order_value: number;
}

interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  provider: string;
  transaction_ref: string;
  paid_at: string;
}

export default function PaymentDashboard({ 
  stats, 
  initialPayments 
}: { 
  stats: PaymentStats, 
  initialPayments: Payment[] 
}) {
  const [filter, setFilter] = useState('all');

  // Filter Logic
  const filteredPayments = initialPayments.filter(p =>
    filter === 'all' ? true : p.status === filter
  );

  return (
    <div className={styles.wrapper}>
      
      {/* 1. Stats Grid (New Premium Look) */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Revenue</span>
          <span className={styles.statValue}>${stats.total_revenue.toLocaleString()}</span>
          <span className={`${styles.statSubtext} ${styles.positive}`}>Lifetime Earnings</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Last 30 Days</span>
          <span className={styles.statValue}>${stats.revenue_30_days.toLocaleString()}</span>
          <span className={`${styles.statSubtext} ${styles.neutral}`}>Rolling Revenue</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg. Order Value</span>
          <span className={styles.statValue}>${stats.average_order_value.toFixed(2)}</span>
          <span className={`${styles.statSubtext} ${styles.neutral}`}>Per Transaction</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Failed (24h)</span>
          <span className={styles.statValue}>{stats.recent_failures}</span>
          <span className={`${styles.statSubtext} ${stats.recent_failures > 0 ? styles.negative : styles.positive}`}>
            {stats.recent_failures > 0 ? 'Action Required' : 'Healthy'}
          </span>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className={styles.filterBar}>
        {['all', 'success', 'pending', 'failed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`${styles.filterBtn} ${filter === f ? styles.active : styles.inactive}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* 3. Transactions Table (Matches Customers Table) */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Amount</th>
              <th>Reference ID</th>
              <th>Provider</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
               <tr>
                 <td colSpan={5} style={{textAlign: 'center', padding: '3rem', color: '#64748b'}}>
                   No transactions found.
                 </td>
               </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[payment.status]}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className={styles.amountColumn}>
                    ${payment.amount.toFixed(2)}
                  </td>
                  <td>
                    <span style={{fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b'}}>
                      {payment.transaction_ref || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={styles.provider}>
                      {payment.provider || 'Manual'}
                    </span>
                  </td>
                  <td>
                    <div style={{fontWeight: 500}}>
                      {new Date(payment.paid_at).toLocaleDateString()}
                    </div>
                    <div style={{fontSize: '0.75rem', color: '#94a3b8'}}>
                      {new Date(payment.paid_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}