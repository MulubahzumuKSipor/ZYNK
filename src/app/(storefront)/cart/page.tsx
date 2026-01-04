'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart-provider'
import styles from '@/app/ui/styles/cart_page.module.css'


export default function CartPage() {
  const { items, total, isLoading, updateCartItem, removeFromCart } = useCart()

  // Track which specific item is currently communicating with the database
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleUpdateQuantity = async (id: string, newQty: number) => {
    if (newQty < 1) return;
    setProcessingId(id);
    try {
      await updateCartItem(id, newQty);
    } catch (error) {
      console.error("Failed to update quantity", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemove = async (id: string) => {
    setProcessingId(id);
    try {
      await removeFromCart(id);
    } catch (error) {
      console.error("Failed to remove item", error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Shopping Cart</h1>

        {isLoading && items.length === 0 ? (
          <div className={styles.loadingCart}>
            <div className={styles.spinner}></div>
            <p>Loading your cart...</p>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyCart}>
            <h2>Your cart is empty</h2>
            <p>{"Looks like you haven't added anything to your cart yet."}</p>
            <Link href="/shop" className={styles.checkoutButton}>Start Shopping</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {/* Cart Table Section */}
            <section className={styles.cartSection}>
              <div className={styles.tableContainer}>
                <table className={styles.cartTable}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => {
                      const isProcessing = processingId === item.cart_item_id;

                      return (
                        <tr key={item.cart_item_id} className={isProcessing ? styles.rowProcessing : ''}>
                          <td>
                            <div className={styles.productCell}>
                              <Link href={`/product/${item.product_variant_id}`} className={styles.productLink}>
                                {item.product_title}
                              </Link>
                            </div>
                          </td>
                          <td>
                            <div className={styles.quantityControl}>
                              <button
                                className={item.quantity <= 1 || isProcessing ? styles.quantityButtonDisabled : styles.quantityButton}
                                disabled={item.quantity <= 1 || isProcessing}
                                onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                              >
                                —
                              </button>

                              <span className={styles.quantityValue}>
                                {isProcessing ? '...' : item.quantity}
                              </span>

                              <button
                                className={isProcessing ? styles.quantityButtonDisabled : styles.quantityButton}
                                disabled={isProcessing}
                                onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className={styles.priceCell}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                          <td>
                            <button
                              className={styles.removeButton}
                              disabled={isProcessing}
                              onClick={() => handleRemove(item.cart_item_id)}
                            >
                              {isProcessing ? '...' : 'Remove'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Order Summary Section */}
            <section className={styles.orderSummarySection}>
              <div className={styles.orderSummaryContainer}>
                <h2 className={styles.summaryTitle}>Order Summary</h2>

                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span className={styles.freeLabel}>FREE</span>
                </div>
                <div className={styles.summaryRowTotal}>
                  <span>Order Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Link
                  href="/checkout"
                  className={`${styles.checkoutButton} ${items.length === 0 ? styles.checkoutButtonDisabled : ''}`}
                >
                  Proceed to Checkout
                </Link>

                <div className={styles.continueShopping}>
                  or <Link href="/shop">Continue Shopping →</Link>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}