"use client";
import { useState } from "react";
import styles from "@/app/ui/styles/productTable.module.css";

export default function ProductTable({ initialData }: { initialData: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = initialData.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.tableCard}>
      <div className={styles.filterBar}>
        <input 
          type="text" 
          placeholder="Search products..."
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Total Stock</th>
            <th>Price Range</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((product) => {
            // Logic to handle multiple variants
            const variants = product.product_variants || [];
            const totalStock = variants.reduce((sum: number, v: any) => sum + v.stock_quantity, 0);
            const prices = variants.map((v: any) => v.price);
            const minPrice = prices.length ? Math.min(...prices) : 0;
            const maxPrice = prices.length ? Math.max(...prices) : 0;

            return (
              <tr key={product.id}>
                <td className={styles.nameCell}>
                  <strong>{product.name}</strong>
                  <span>{product.slug}</span>
                </td>
                <td>{product.categories?.name || "—"}</td>
                <td>{product.brands?.name || "—"}</td>
                <td>
                  <span className={totalStock < 10 ? styles.lowStock : ""}>
                    {totalStock} units
                  </span>
                </td>
                <td>
                  {minPrice === maxPrice
                    ? `$${minPrice.toFixed(2)}`
                    : `$${minPrice} - $${maxPrice}`}
                </td>
                <td>
                  <span className={product.is_active ? styles.statusActive : styles.statusDraft}>
                    {product.is_active ? "Active" : "Draft"}
                  </span>
                </td>
                <td>
                  <button className={styles.editBtn}>Edit</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}