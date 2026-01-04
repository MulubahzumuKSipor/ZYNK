'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce'; 
import { ProductData } from '@/app/(dashboard)/dashboard/products/page';
import ProductForm from '@/app/ui/components/products/product-form';
import Modal from '@/app/ui/components/modal';
import { deleteProduct } from '@/lib/actions/products';
import styles from '@/app/ui/styles/manage-product.module.css';

interface Props {
  initialProducts: ProductData[];
  categories: { id: string; name: string }[];
  totalPages: number;
}

export default function ProductManager({ initialProducts, categories, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- 1. STATE MANAGEMENT ---
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

  const params = new URLSearchParams(searchParams?.toString() || '');
  const queryTerm = params.get('query') || '';
  const currentPage = Number(params.get('page')) || 1;

  // --- 2. SEARCH & PAGINATION HANDLERS ---
  const handleSearch = useDebouncedCallback((term: string) => {
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    newParams.set('page', '1');
    if (term) newParams.set('query', term);
    else newParams.delete('query');
    router.replace(`${pathname}?${newParams.toString()}`);
  }, 300);

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    newParams.set('page', page.toString());
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  // --- 3. SELECTION HANDLERS ---
  const toggleSelectAll = () => {
    if (selectedIds.size === initialProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(initialProducts.map(p => p.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // --- 4. ACTION HANDLERS ---
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} products?`)) return;

    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteProduct(id)));
      setSelectedIds(new Set());
      router.refresh();
    } catch (error) {
      console.error("Bulk delete failed", error);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: ProductData) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormSuccess = () => {
    closeModal();
    router.refresh();
  };

  // --- 5. DATA HELPERS ---
  const getStock = (p: ProductData) =>
    p.product_variants.reduce((acc, v) => acc + (v.stock_quantity || 0), 0);

  const getPrice = (p: ProductData) =>
    p.product_variants.length ? Math.min(...p.product_variants.map(v => v.price)) : 0;

  return (
    <div className={styles.managerContainer}>
      {/* TOOLBAR */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input 
            className={styles.searchInput}
            placeholder="Search products..."
            defaultValue={queryTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <div className={styles.actionsWrapper}>
          {selectedIds.size > 0 && (
            <button onClick={handleBulkDelete} className={styles.bulkDeleteBtn}>
              Delete Selected ({selectedIds.size})
            </button>
          )}
          <button onClick={openAddModal} className={styles.addBtn}>
            + Add Product
          </button>
        </div>
      </div>

      {/* PRODUCT TABLE */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className="w-10">
                <input 
                  type="checkbox" 
                  onChange={toggleSelectAll}
                  checked={initialProducts.length > 0 && selectedIds.size === initialProducts.length}
                />
              </th>
              <th>Product</th>
              <th>Status</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Category</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialProducts.map((product) => {
              const stock = getStock(product);
              const price = getPrice(product);
              const isLowStock = stock < 10 && product.is_active;

              return (
                <tr key={product.id} className={selectedIds.has(product.id) ? styles.selectedRow : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelectRow(product.id)}
                    />
                  </td>
                  <td>
                    <div className={styles.productCell}>
                      <div className={styles.imgThumb}>
                         {product.product_images[0] ? (
                           <Image
                             src={product.product_images[0].url}
                             alt={product.name}
                             fill
                             className="object-cover rounded"
                           />
                         ) : (
                           <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-400">No Image</div>
                         )}
                      </div>
                      <div>
                        <div className={styles.productName}>{product.name}</div>
                        <div className={styles.productSlug}>{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${product.is_active ? styles.active : styles.draft}`}>
                      {product.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <span className={isLowStock ? styles.textRed : ''}>{stock} units</span>
                    {isLowStock && <span className={styles.lowStockDot} title="Low Stock"></span>}
                  </td>
                  <td>${price.toFixed(2)}</td>
                  <td>{product.category?.name || 'Uncategorized'}</td>
                  <td className="text-right">
                    <button onClick={() => openEditModal(product)} className={styles.editBtn}>
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
            {initialProducts.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.empty}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className={styles.pageBtn}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className={styles.pageBtn}
          >
            Next
          </button>
        </div>
      )}

      {/* FORM MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New Product'}
      >
        <ProductForm
          categories={categories}
          product={editingProduct ? {
            id: editingProduct.id,
            name: editingProduct.name,
            slug: editingProduct.slug,
            description: editingProduct.description || '',
            category_id: editingProduct.category_id || '',
            is_active: editingProduct.is_active,
            product_images: editingProduct.product_images,
            product_variants: editingProduct.product_variants.map(v => ({
              id: v.id, // Explicitly pass ID so server-side upsert works
              sku: v.sku,
              price: v.price,
              stock_quantity: v.stock_quantity
            }))
          } : undefined}
          onSuccess={handleFormSuccess}
        />
      </Modal>
    </div>
  );
}