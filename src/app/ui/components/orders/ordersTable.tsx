'use client';

import styles from '@/app/ui/styles/ordersTable.module.css';
import { Order, OrderItemWithStock } from '@/app/types/order'; // Import your types

interface OrdersTableProps {
  orders: Order[];
  selectedIds: Set<string>;
  onSelectAll: () => void;
  onSelectRow: (id: string) => void;
  onViewDetails: (order: Order) => void;
}

export default function OrdersTable({
  orders,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onViewDetails
}: OrdersTableProps) {

  const getStatusClass = (status: string) => {
    const key = `status_${status.toLowerCase()}`;
    return `${styles.badge} ${styles[key] || styles.status_pending}`;
  };

  const getPaymentStatusClass = (status: string) => {
    const key = `status_${status.toLowerCase()}`;
    return `${styles.badge} ${styles[key] || styles.status_pending}`;
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.scrollWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th} style={{ width: '3rem' }}>
                <input
                  type="checkbox"
                  checked={orders.length > 0 && selectedIds.size === orders.length}
                  onChange={onSelectAll}
                />
              </th>
              <th className={styles.th}>Order ID</th>
              <th className={styles.th}>Customer</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Payment</th>
              <th className={styles.th}>Total</th>
              <th className={styles.th}>Date</th>
              <th className={`${styles.th} text-right`} style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {orders.map((order: Order) => {
              const paymentStatus = order.payments?.[0]?.status || 'pending';

              // Correctly typed low stock check
              const isLowStock = (order.order_items as OrderItemWithStock[])?.some(
                (item) => (item.product_variant?.stock_quantity ?? 100) < 5
              );

              const isSelected = selectedIds.has(order.id);

              return (
                <tr
                  key={order.id}
                  className={`${styles.tr} ${isSelected ? styles.selectedRow : ''}`}
                >
                  <td className={styles.td}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectRow(order.id)}
                    />
                  </td>
                  <td className={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={styles.textMain}>
                        #{order.order_number || order.id.slice(0, 8)}
                      </span>
                      {isLowStock && (
                        <span className={styles.lowStockAlert} title="Low stock alert">
                          ⚠️ Low Stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div>
                      <div className={styles.textMain}>
                        {order.user?.full_name || 'N/A'}
                      </div>
                      <div className={styles.textSub}>
                        {order.user?.email}
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={getStatusClass(order.status)}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span className={getPaymentStatusClass(paymentStatus)}>
                      {paymentStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className={`${styles.td} ${styles.textMain}`}>
                    ${order.total_amount.toFixed(2)}
                  </td>
                  <td className={`${styles.td} ${styles.textSub}`}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className={styles.td} style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => onViewDetails(order)}
                      className={styles.viewButton}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}

            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.emptyState}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}