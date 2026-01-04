"use client";
import { useState } from "react";
import { createClient } from "@/lib/client"; // Use your client-side supabase helper
import styles from "@/app/ui/styles/addProduct.module.css";

export default function AddProductSheet({ isOpen, onClose, onRefresh }: any) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    stock_quantity: "",
    category: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("products").insert([
      {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
      },
    ]);

    if (!error) {
      onRefresh(); // Refresh the product list
      onClose();   // Close the sheet
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>Add New Product</h2>
          <button onClick={onClose} className={styles.closeBtn}>&times;</button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.group}>
            <label>Product Name</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. ZYNK Classic Tee"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.group}>
              <label>SKU</label>
              <input 
                type="text" 
                placeholder="ZNK-001"
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
              />
            </div>
            <div className={styles.group}>
              <label>Price ($)</label>
              <input 
                required 
                type="number" 
                step="0.01" 
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
          </div>

          <div className={styles.group}>
            <label>Inventory (Stock)</label>
            <input 
              required 
              type="number" 
              onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
            />
          </div>

          <div className={styles.group}>
            <label>Description</label>
            <textarea 
              rows={4}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Saving..." : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}