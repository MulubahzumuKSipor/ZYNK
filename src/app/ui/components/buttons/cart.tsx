'use client';
import React, { useState } from "react";
import styles from '@/app/ui/styles/cart_button.module.css';
import Link from "next/link";

interface CartButtonProps {
  /** Number of items in cart (optional). */
  count?: number;
  /** Optional callback fired when the mini-cart opens. */
  onOpen?: () => void;
}

/**
 * CartButton.tsx
 * Next.js / React (TypeScript) cart button with SVG, accessible badge and optional mini-cart slide-out.
 * Usage:
 *  <CartButton count={3} onOpen={() => {}} />
 */
const CartButton: React.FC<CartButtonProps> = ({ count = 0, onOpen = () => {} }) => {
  const [open, setOpen] = useState<boolean>(false);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) onOpen();
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.cartButton}
        aria-label={`Shopping cart, ${count} item${count === 1 ? "" : "s"}`}
        aria-expanded={open}
        onClick={toggleOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        className={styles.cartIcon}><path fill="currentColor" d="M17 18a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2c0-1.11.89-2 2-2M1 2h3.27l.94 2H20a1 1 0 0 1 1 1c0 .17-.05.34-.12.5l-3.58 6.47c-.34.61-1 1.03-1.75 1.03H8.1l-.9 1.63l-.03.12a.25.25 0 0 0 .25.25H19v2H7a2 2 0 0 1-2-2c0-.35.09-.68.24-.96l1.36-2.45L3 4H1zm6 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2c0-1.11.89-2 2-2m9-7l2.78-5H6.14l2.36 5z"/></svg>

        {count > 0 && (
          <span className={styles.cartCount} aria-hidden="true">
            {count}
          </span>
        )}
      </button>

      {/* Mini cart panel (simple, accessible) */}
      <aside
        className={`${styles.miniCart} ${open ? styles.open : ""}`}
        role="region"
        aria-label="Mini shopping cart"
      >
        <div className={styles.miniCartHeader}>
          <strong>Your cart</strong>
          <button
            className={styles.closeButton}
            aria-label="Close cart"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className={styles.miniCartBody}>
          {count === 0 ? (
            <p className={styles.emptyText}>Your cart is empty.</p>
          ) : (
            <p className={styles.itemsText}>{`You have ${count} item${count === 1 ? "" : "s"} in your cart.`}</p>
          )}
        </div>

        <div className={styles.miniCartFooter}>
          <Link href="/cart"><button className={styles.viewCartButton}>View cart</button></Link>
          <button className={styles.checkoutButton}>Checkout</button>
        </div>
      </aside>
    </div>
  );
};

export default CartButton;

