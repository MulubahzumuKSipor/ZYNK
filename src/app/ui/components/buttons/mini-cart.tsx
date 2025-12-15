'use client'

import { useCart } from "@/lib/cart-provider"
import Link from "next/link"
import styles from "@/app/ui/styles/cart_button.module.css"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, updateCartItem, removeFromCart } = useCart()
  
  return (
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
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <div className={styles.miniCartBody}>
        {items.length === 0 ? (
          <p className={styles.emptyText}>Your cart is empty.</p>
        ) : (
          <ul className={styles.itemsList}>
            {items.map(item => (
              <li key={item.cart_item_id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemTitle}>{item.product_title}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>

                <div className={styles.itemControls}>
                  <button
                    disabled={item.quantity <= 1}
                    onClick={() => updateCartItem(item.cart_item_id, item.quantity - 1)}
                    className={styles.quantityButton}
                  >
                    -
                  </button>
                  <span className={styles.quantity}>{item.quantity}</span>
                  <button
                    onClick={() => updateCartItem(item.cart_item_id, item.quantity + 1)}
                    className={styles.quantityButton}
                  >
                    +
                  </button>

                  <button
                    onClick={() => removeFromCart(item.cart_item_id)}
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className={styles.miniCartFooter}>
          <Link href="/cart">
            <button className={styles.viewCartButton}>View cart</button>
          </Link>
          <Link href="/checkout">
            <button className={styles.checkoutButton}>Checkout</button>
          </Link>
        </div>
      )}
    </aside>
  )
}
