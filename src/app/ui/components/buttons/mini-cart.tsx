'use client'

import { useCart } from '@/lib/cart-provider'
import styles from '@/app/ui/styles/cart_drawer.module.css'
import { X, Trash2, ShoppingBag, Minus, Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateCartItem, removeFromCart } = useCart()

  if (!isOpen) return null

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <div className={styles.wrapper}>
      {/* Backdrop with fade-in effect */}
      <div className={styles.backdrop} onClick={closeCart} />

      <aside className={styles.drawer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <h2>Shopping Bag</h2>
            <span className={styles.itemCount}>{items.length} items</span>
          </div>
          <button onClick={closeCart} className={styles.closeBtn} aria-label="Close cart">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Item Area */}
        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <ShoppingBag size={40} />
              </div>
              <h3>Your bag is empty</h3>
              <p>{"Looks like you haven't added anything yet."}</p>
              <button onClick={closeCart} className={styles.continueBtn}>
                Explore Shop
              </button>
            </div>
          ) : (
            <ul className={styles.itemList}>
              {items.map((item) => (
                <li key={item.cart_item_id} className={styles.itemCard}>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.product_title}</span>
                      <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
                    </div>

                    <div className={styles.itemActions}>
                      <div className={styles.qtySelector}>
                        <button
                          onClick={() => updateCartItem(item.cart_item_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateCartItem(item.cart_item_id, item.quantity + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cart_item_id)}
                        className={styles.removeBtn}
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sticky Footer */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span className={styles.subtotalAmount}>${subtotal.toFixed(2)}</span>
            </div>
            <p className={styles.taxNote}>Shipping and taxes calculated at checkout.</p>
            <Link href="/cart" onClick={closeCart} className={styles.checkoutBtn}>
              Cart
              <ChevronRight size={18} />
            </Link>
            <Link href="/checkout" onClick={closeCart} className={styles.checkoutBtn}>
              Checkout Now
              <ChevronRight size={18} />
            </Link>
          </div>
        )}
      </aside>
    </div>
  )
}