'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/client'
import { API_URL } from '@/app/types/api'

export type CartItem = {
  cart_item_id: number
  product_variant_id: number
  quantity: number
  price: number
  product_title: string
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  isLoading: boolean
  total: number
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  addToCart: (variantId: number, qty?: number) => Promise<void>
  updateCartItem: (cartItemId: number, quantity: number) => Promise<void>
  removeFromCart: (cartItemId: number) => Promise<void>
  refreshCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  // ---------------------------
  // Fetch cart
  // ---------------------------
  const fetchCart = async () => {
    setIsLoading(true)
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      const res = await fetch(`${API_URL}/add-to-cart`, {
        headers,
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Failed to fetch cart')

      const data = await res.json()
      setItems(data)
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  // ---------------------------
  // Add item
  // ---------------------------
  const addToCart = async (product_variant_id: number, quantity = 1) => {
    try {
      const res = await fetch(`${API_URL}/add-to-cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ product_variant_id, quantity }),
      })

      if (!res.ok) throw new Error('Failed to add to cart')

      await fetchCart()
      setIsOpen(true)
    } catch (error) {
      console.error(error)
      alert('Could not add item to cart.')
    }
  }

  // ---------------------------
  // Update quantity
  // ---------------------------
  const updateCartItem = async (cart_item_id: number, quantity: number) => {
    try {
      if (quantity < 1) {
        await removeFromCart(cart_item_id)
        return
      }

      const res = await fetch(`${API_URL}/add-to-cart`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cart_item_id, quantity }),
      })

      if (!res.ok) throw new Error('Failed to update cart item')

      await fetchCart()
    } catch (error) {
      console.error(error)
      alert('Could not update item quantity.')
    }
  }

  // ---------------------------
  // Remove item
  // ---------------------------
  const removeFromCart = async (cart_item_id: number) => {
    try {
      const res = await fetch(
        `${API_URL}/add-to-cart?cart_item_id=${cart_item_id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      )

      if (!res.ok) throw new Error('Failed to remove cart item')

      await fetchCart()
    } catch (error) {
      console.error(error)
      alert('Could not remove item from cart.')
    }
  }

  // ---------------------------
  // UI controls
  // ---------------------------
  const toggleCart = () => setIsOpen(prev => !prev)
  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        isLoading,
        total,
        toggleCart,
        openCart,
        closeCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
