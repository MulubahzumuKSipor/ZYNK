'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { Customer } from '@/app/types/customer';
import styles from '@/app/ui/styles/customers.module.css';

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  order_items: Array<{ count: number }>;
}

interface Props {
  customer: Customer;
  onClose: () => void;
}

export default function CustomerModal({ customer, onClose }: Props) {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('id, created_at, total, status, order_items(count)')
        .eq('user_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, [customer.id]);

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2>{customer.full_name || 'Customer Details'}</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          
          {/* Section 1: At-a-Glance Info */}
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Email</label>
              <p>{customer.email}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Phone</label>
              <p>{customer.phone || 'N/A'}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Total Spent</label>
              <p>${customer.total_spent?.toLocaleString()}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Role</label>
              <p style={{ textTransform: 'capitalize' }}>{customer.role}</p>
            </div>
          </div>

          {/* Section 2: Recent Orders */}
          <div className={styles.recentOrders}>
            <h3>Recent Orders</h3>
            {loading ? (
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Loading history...</p>
            ) : recentOrders.length === 0 ? (
              <p style={{ color: '#666', fontSize: '0.9rem' }}>No orders found.</p>
            ) : (
              <table className={styles.miniOrderTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Items</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`${styles.status} ${order.status === 'paid' ? styles.active : ''}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.order_items[0]?.count || 0} items</td>
                      <td>${order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}