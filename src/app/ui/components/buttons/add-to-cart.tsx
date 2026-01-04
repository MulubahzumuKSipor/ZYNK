'use client'

import { useState } from 'react'
import { Check, Loader2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-provider'
import styles from '@/app/ui/styles/add-to-cart.module.css'

interface AddToCartButtonProps {
  variantId: string
}

export default function AddToCartButton({ variantId }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [loading, setLoading] = useState<boolean>(false)
  const [done, setDone] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault()

    if (!variantId) {
      setError('Please select a variant')
      setTimeout(() => setError(null), 3000)
      return
    }

    setLoading(true)
    setError(null)

    try {
      await addToCart(variantId, 1)
      setDone(true)
      setTimeout(() => setDone(false), 2000)
    } catch (err) {
      console.error('Error adding to cart:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to cart'
      setError(errorMessage)
      setTimeout(() => setError(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        onClick={handleAdd}
        disabled={loading || !variantId}
        className={styles.button}
        type="button"
        aria-label="Add to cart"
      >
        {loading ? (
          <>
            <Loader2 className={styles.spinner} size={18} aria-hidden="true" />
            <span>Adding...</span>
          </>
        ) : done ? (
          <>
            <Check size={18} aria-hidden="true" />
            <span>Added!</span>
          </>
        ) : (
          <>
            <ShoppingBag size={18} aria-hidden="true" />
          </>
        )}
      </button>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
    </div>
  )
}