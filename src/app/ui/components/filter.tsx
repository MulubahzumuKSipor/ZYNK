import React from "react";
import styles from "../styles/filter.module.css";

export interface FilterState {
  categoryId?: string;
  brandId?: string;
  variantId?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface ProductFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onFilterChange?: (filters: FilterState) => void;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  variants?: { id: string; name: string }[];
}

export default function ProductFilters({
  filters,
  setFilters,
  onFilterChange,
  categories,
  brands,
  variants = [],
}: ProductFiltersProps) {
  const updateFilters = (updated: FilterState) => {
    setFilters(updated);
    onFilterChange?.(updated);
  };

  // Handlers
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateFilters({ ...filters, categoryId: e.target.value || undefined });

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateFilters({ ...filters, brandId: e.target.value || undefined });

  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateFilters({ ...filters, variantId: e.target.value || undefined });

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateFilters({ ...filters, minPrice: e.target.value ? parseFloat(e.target.value) : undefined });

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateFilters({ ...filters, maxPrice: e.target.value ? parseFloat(e.target.value) : undefined });

  // Clear handlers
  const clearCategory = () => updateFilters({ ...filters, categoryId: undefined });
  const clearBrand = () => updateFilters({ ...filters, brandId: undefined });
  const clearVariant = () => updateFilters({ ...filters, variantId: undefined });
  const clearMinPrice = () => updateFilters({ ...filters, minPrice: undefined });
  const clearMaxPrice = () => updateFilters({ ...filters, maxPrice: undefined });
  const clearAll = () => updateFilters({});

  return (
    <div className={styles.filtersContainer}>
      <label className={styles.filterLabel}>
        Category
        <select value={filters.categoryId || ""} onChange={handleCategoryChange}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {filters.categoryId && (
          <button className={styles.clearBtn} onClick={clearCategory}>
            ×
          </button>
        )}
      </label>

      <label className={styles.filterLabel}>
        Brand
        <select value={filters.brandId || ""} onChange={handleBrandChange}>
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        {filters.brandId && (
          <button className={styles.clearBtn} onClick={clearBrand}>
            ×
          </button>
        )}
      </label>

      {variants.length > 0 && (
        <label className={styles.filterLabel}>
          Variant
          <select value={filters.variantId || ""} onChange={handleVariantChange}>
            <option value="">All Variants</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          {filters.variantId && (
            <button className={styles.clearBtn} onClick={clearVariant}>
              ×
            </button>
          )}
        </label>
      )}

      <label className={styles.filterLabel}>
        Min Price
        <input type="number" value={filters.minPrice ?? ""} onChange={handleMinPriceChange} placeholder="0" />
        {filters.minPrice && (
          <button className={styles.clearBtn} onClick={clearMinPrice}>
            ×
          </button>
        )}
      </label>

      <label className={styles.filterLabel}>
        Max Price
        <input type="number" value={filters.maxPrice ?? ""} onChange={handleMaxPriceChange} placeholder="0" />
        {filters.maxPrice && (
          <button className={styles.clearBtn} onClick={clearMaxPrice}>
            ×
          </button>
        )}
      </label>

      <button className={styles.clearAllBtn} onClick={clearAll}>
        Clear All
      </button>

      <div className={styles.selectedFilters}>
        Selected:{" "}
        {filters.categoryId
          ? categories.find((c) => c.id === filters.categoryId)?.name
          : "All Categories"}
        ,{" "}
        {filters.brandId
          ? brands.find((b) => b.id === filters.brandId)?.name
          : "All Brands"}
        ,{" "}
        {filters.variantId
          ? variants.find((v) => v.id === filters.variantId)?.name
          : "All Variants"}
        , Min: {filters.minPrice ?? "Any"}, Max: {filters.maxPrice ?? "Any"}
      </div>
    </div>
  );
}
