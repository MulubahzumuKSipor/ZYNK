'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce'; // make sure to run: npm install use-debounce
import { Customer } from '@/app/types/customer';
import CustomerModal from './modal';
import styles from '@/app/ui/styles/customers.module.css';

interface Props {
  initialCustomers: Customer[];
  totalPages: number;
}

export default function CustomersManager({ initialCustomers, totalPages }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // State to track which customer is currently selected for the modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Search Logic: Debounced to prevent database flooding while typing
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    // Reset to page 1 when search changes
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  // Pagination Logic
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const currentPage = Number(searchParams.get('page')) || 1;

  return (
    <div className={styles.wrapper}>

      {/* 1. Header & Search Filter */}
      <div className={styles.headerActions}>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('query')?.toString()}
        />
      </div>

      {/* 2. Customers Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact Info</th>
              <th>Status</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {initialCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                  No customers found matching your criteria.
                </td>
              </tr>
            ) : (
              initialCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{customer.full_name || 'Guest'}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{customer.email}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{customer.phone}</div>
                  </td>
                  <td>
                    <span className={`${styles.status} ${customer.is_active ? styles.active : styles.inactive}`}>
                      {customer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{customer.total_orders}</td>
                  <td>${customer.total_spent.toLocaleString()}</td>
                  <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={styles.viewBtn}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Pagination Controls */}
      <div className={styles.pagination}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className={styles.viewBtn}
            disabled={currentPage <= 1}
            onClick={() => router.push(createPageURL(currentPage - 1))}
            style={{ opacity: currentPage <= 1 ? 0.5 : 1 }}
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            className={styles.viewBtn}
            disabled={currentPage >= totalPages}
            onClick={() => router.push(createPageURL(currentPage + 1))}
            style={{ opacity: currentPage >= totalPages ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      </div>

      {/* 4. Detail Modal (Conditionally Rendered) */}
      {selectedCustomer && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

    </div>
  );
}