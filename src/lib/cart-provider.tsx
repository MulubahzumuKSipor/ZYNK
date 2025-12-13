'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/client'

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
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  // Helper to get headers
  const getHeaders = async (): Promise<HeadersInit> => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.id) headers['x-user-id'] = session.user.id
    return headers
  }

  // Fetch cart (also merges guest cart if logged in)
  const fetchCart = async () => {
    setIsLoading(true)
    try {
      const headers = await getHeaders()
      const res = await fetch('/api/add-to-cart', { headers, credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch cart')
      const data: CartItem[] = await res.json()
      setItems(data)
    } catch (err) {
      console.error('Failed to fetch cart:', err)
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  // Listen for login and merge guest cart automatically
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        await fetchCart()
      }
    })
    return () => authListener?.subscription.unsubscribe()
  }, [])

  // Add to cart
  const addToCart = async (product_variant_id: number, quantity = 1) => {
    try {
      const headers = await getHeaders()
      const res = await fetch('/api/add-to-cart', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ product_variant_id, quantity }),
      })
      if (!res.ok) throw new Error('Failed to add to cart')
      await fetchCart()
      setIsOpen(true)
    } catch (err) {
      console.error(err)
      alert('Could not add item to cart.')
    }
  }

  // Update item quantity
  const updateCartItem = async (cart_item_id: number, quantity: number) => {
    try {
      if (quantity < 1) return removeFromCart(cart_item_id)
      const headers = await getHeaders()
      const res = await fetch('/api/add-to-cart', {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({ cart_item_id, quantity }),
      })
      if (!res.ok) throw new Error('Failed to update cart item')
      await fetchCart()
    } catch (err) {
      console.error(err)
      alert('Could not update item quantity.')
    }
  }

  // Remove item
  const removeFromCart = async (cart_item_id: number) => {
    try {
      const headers = await getHeaders()
      const res = await fetch(`/api/add-to-cart?cart_item_id=${cart_item_id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to remove cart item')
      await fetchCart()
    } catch (err) {
      console.error(err)
      alert('Could not remove item from cart.')
    }
  }

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
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
