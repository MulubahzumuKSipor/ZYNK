'use client'

import { useState, useEffect } from "react"
import { useCart } from "@/lib/cart-provider" // Fixed path to match your context
import styles from "@/app/ui/styles/cart_button.module.css"

export default function CartButton() {
  const { items, toggleCart } = useCart()
  const [bump, setBump] = useState(false)

  // Total count of all items in cart
  const count = items.reduce((acc, item) => acc + item.quantity, 0)

  // Trigger "bump" animation on count change
  useEffect(() => {
    if (count === 0) return;

    // We use a small timeout to move the state update out of the
    // synchronous execution of the effect
    const bumpTimer = setTimeout(() => {
      setBump(true);
    }, 0);

    // This timer removes the class after the animation finishes
    const resetTimer = setTimeout(() => {
      setBump(false);
    }, 300);

    return () => {
      clearTimeout(bumpTimer);
      clearTimeout(resetTimer);
    };
  }, [count]);


  return (
    <div className={styles.container}>
      <button
        type="button"
        className={`${styles.cartButton} ${bump ? styles.bump : ""}`}
        onClick={toggleCart}
        aria-label="Toggle cart"
      >
        {/* Shopping Bag Icon */}
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" />
        </svg>

        {/* Floating Badge */}
        {count > 0 && (
          <span className={styles.cartCount}>
            {count}
          </span>
        )}
      </button>
    </div>
  )
}