'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import OrdersTable from './ordersTable';
import OrderDetailsModal from './order-details-modal';
import { updateOrderStatus, exportOrdersToCSV } from '@/lib/actions/order';
import styles from '@/app/ui/styles/order-manage.module.css';
import { Order, OrdersManagerProps } from '@/app/types/order';

export default function OrdersManager({ initialOrders, totalPages }: OrdersManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const params = new URLSearchParams(searchParams?.toString() || '');
  const currentPage = Number(params.get('page')) || 1;
  const currentStatus = params.get('status') || 'all';
  const queryTerm = params.get('query') || '';

  const handleSearch = useDebouncedCallback((term: string) => {
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    newParams.set('page', '1');
    if (term) newParams.set('query', term);
    else newParams.delete('query');
    router.replace(`${pathname}?${newParams.toString()}`);
  }, 300);

  const handleStatusFilter = (status: string) => {
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    newParams.set('page', '1');
    if (status === 'all') newParams.delete('status');
    else newParams.set('status', status);
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    newParams.set('page', page.toString());
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === initialOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(initialOrders.map((o: Order) => o.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (!confirm(`Update ${selectedIds.size} orders to ${newStatus}?`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => updateOrderStatus(id, newStatus)));
      setSelectedIds(new Set());
      router.refresh();
    } catch (error) {
      alert('Failed to update orders');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const orderIds = selectedIds.size > 0 ? Array.from(selectedIds) : null;
      await exportOrdersToCSV(orderIds);
    } finally {
      setIsExporting(false);
    }
  };

  const ORDER_STATUSES = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'on_hold', label: 'On Hold' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.controlsRow}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name, or Email..."
              defaultValue={queryTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.inputField}
            />
          </div>

          <select
            value={currentStatus}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className={styles.selectField}
          >
            {ORDER_STATUSES.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          {selectedIds.size > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) handleBulkStatusUpdate(e.target.value);
                e.target.value = '';
              }}
              className={styles.selectField}
            >
              <option value="">Bulk Update ({selectedIds.size})</option>
              <option value="processing">→ Processing</option>
              <option value="shipped">→ Shipped</option>
              <option value="delivered">→ Delivered</option>
              <option value="cancelled">→ Cancelled</option>
            </select>
          )}

          <button
            onClick={handleExport}
            disabled={isExporting}
            className={styles.exportButton}
          >
            {isExporting ? 'Exporting...' : '📥 Export CSV'}
          </button>
        </div>
      </div>

      <OrdersTable
        orders={initialOrders}
        selectedIds={selectedIds}
        onSelectAll={toggleSelectAll}
        onSelectRow={toggleSelectRow}
        onViewDetails={setSelectedOrder}
      />

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={styles.pageButton}
          >
            Previous
          </button>
          <span className={styles.pageLabel}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={styles.pageButton}
          >
            Next
          </button>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}