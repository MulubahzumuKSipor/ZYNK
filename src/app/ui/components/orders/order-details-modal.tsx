'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus, addInternalNote } from '@/lib/actions/order';
import styles from '@/app/ui/styles/order-details.module.css';
import { Order, OrderItem, InternalNote } from '@/app/types/order'; // Adjust path accordingly

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const router = useRouter();
  const [newNote, setNewNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      router.refresh();
      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await addInternalNote(order.id, newNote);
      setNewNote('');
      router.refresh();
    } catch (error) {
      alert('Failed to add note');
    }
  };

  const getStatusClass = (status: string) => {
    return `${styles.badge} ${styles[status.toLowerCase()] || styles.pending}`;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.headerTitle}>
              Order #{order.order_number || order.id.slice(0, 8)}
            </h2>
            <p className={styles.headerSubtitle}>
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>✕</button>
        </div>

        <div className={styles.content}>
          {/* Status & Quick Actions */}
          <div className={styles.statusBanner}>
            <div>
              <span className={styles.label}>Current Status:</span>
              <span className={`ml-2 ${getStatusClass(order.status)}`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleStatusUpdate('processing')}
                disabled={isUpdating}
                className={styles.btn}
                style={{ backgroundColor: '#2563eb', opacity: isUpdating ? 0.5 : 1, color: 'white' }}
              >
                Mark Processing
              </button>
              <button
                onClick={() => handleStatusUpdate('shipped')}
                disabled={isUpdating}
                className={styles.btn}
                style={{ backgroundColor: '#9333ea', opacity: isUpdating ? 0.5 : 1, color: 'white' }}
              >
                Mark Shipped
              </button>
              <button
                onClick={() => handleStatusUpdate('delivered')}
                disabled={isUpdating}
                className={styles.btn}
                style={{ backgroundColor: '#16a34a', opacity: isUpdating ? 0.5 : 1, color: 'white' }}
              >
                Mark Delivered
              </button>
            </div>
          </div>

          <div className={styles.grid}>
            {/* Customer Info */}
            <div className={styles.sectionBox}>
              <h3 className={styles.value} style={{ marginBottom: '0.75rem' }}>Customer Information</h3>
              <div style={{ marginBottom: '0.75rem' }}>
                <p className={styles.label}>Name</p>
                <p className={styles.value}>{order.user?.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className={styles.label}>Email</p>
                <p className={styles.value}>{order.user?.email}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className={styles.sectionBox}>
              <h3 className={styles.value} style={{ marginBottom: '0.75rem' }}>Payment Information</h3>
              <div style={{ marginBottom: '0.5rem' }}>
                <p className={styles.label}>Method</p>
                <p className={styles.value}>{order.payments?.[0]?.payment_method || 'N/A'}</p>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <p className={styles.label}>Status</p>
                <span className={`${styles.badge} ${styles.delivered}`}>
                  {order.payments?.[0]?.status || 'PENDING'}
                </span>
              </div>
              <div>
                <p className={styles.label}>Total Amount</p>
                <p className={styles.headerTitle}>${order.total_amount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className={styles.sectionBox}>
            <h3 className={styles.value} style={{ marginBottom: '0.75rem' }}>Order Items</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items?.map((item: OrderItem) => (
                  <tr key={item.id}>
                    <td className={styles.value}>{item.name || item.product_variant?.product?.name}</td>
                    <td className={styles.headerSubtitle}>{item.product_variant?.sku || 'N/A'}</td>
                    <td className={styles.value} style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td className={styles.value} style={{ textAlign: 'right' }}>
                      ${item.price_at_purchase.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div className={styles.sectionBox}>
            <h3 className={styles.value} style={{ marginBottom: '0.75rem' }}>Internal Notes</h3>
            <div style={{ marginBottom: '1rem' }}>
              {order.internal_notes?.map((note: InternalNote, idx: number) => (
                <div key={idx} className={styles.noteBubble}>
                  <p className={styles.value} style={{ fontSize: '0.875rem' }}>{note.text}</p>
                  <p className={styles.headerSubtitle} style={{ fontSize: '0.75rem' }}>
                    {note.created_by} • {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add internal note..."
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  backgroundColor: 'transparent'
                }}
              />
              <button
                onClick={handleAddNote}
                className={styles.btn}
                style={{ backgroundColor: '#2563eb', color: 'white' }}
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}