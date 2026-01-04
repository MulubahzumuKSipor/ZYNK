'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/client'

// --- Interfaces ---
export interface CartItem {
  cart_item_id: string;
  product_variant_id: string;
  quantity: number;
  price: number;
  product_title: string;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  isLoading: boolean; // Add this
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
}

interface CartQueryRow {
  id: string;
  variant_id: string;
  quantity: number;
  product_variants: {
    price: number;
    products: { name: string } | null;
  } | null;
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  total: number
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  addToCart: (variantId: string, qty?: number) => Promise<void>
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>
  removeFromCart: (cartItemId: string) => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  // --- Fetch Cart ---
  const fetchCart = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setItems([])
        return
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          variant_id,
          carts!inner(user_id, status),
          product_variants(
            price,
            products(name)
          )
        `)
        .eq('carts.user_id', session.user.id)
        .eq('carts.status', 'active')
        .returns<CartQueryRow[]>()

      if (error) throw error

      if (data) {
        const formatted: CartItem[] = data.map(item => ({
          cart_item_id: item.id,
          product_variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.product_variants?.price ?? 0,
          product_title: item.product_variants?.products?.name ?? "Unknown Product",
        }))
        setItems(formatted)
      }
    } catch (err) {
      console.error('Error fetching cart:', err)
    }
  }

  // --- Merge Guest Cart ---
  const mergeCarts = async (guestUserId: string, permanentUserId: string) => {
    try {
      const { data: guestCart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', guestUserId)
        .eq('status', 'active')
        .maybeSingle()
      if (!guestCart) return

      const { data: userCart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', permanentUserId)
        .eq('status', 'active')
        .maybeSingle()

      if (userCart) {
        const { data: guestItems } = await supabase
          .from('cart_items')
          .select('*')
          .eq('cart_id', guestCart.id)

        if (guestItems?.length) {
          const upserts = guestItems.map(item => ({
            cart_id: userCart.id,
            variant_id: item.variant_id,
            quantity: item.quantity
          }))
          const { error } = await supabase
            .from('cart_items')
            .upsert(upserts, { onConflict: 'cart_id,variant_id' })
          if (error) throw error
        }

        await supabase.from('carts').delete().eq('id', guestCart.id)
      } else {
        await supabase
          .from('carts')
          .update({ user_id: permanentUserId })
          .eq('id', guestCart.id)
      }
    } catch (err) {
      console.error('Merge Cart Error:', err)
    }
  }

  // --- Add to Cart ---
  const addToCart = async (variantId: string, quantity = 1) => {
    try {
      let { data: { session } } = await supabase.auth.getSession()

      // If no session, attempt anonymous sign-in
      if (!session) {
        const { data: anon, error } = await supabase.auth.signInAnonymously()
        if (error) throw error
        session = anon.session
      }
      if (!session) return

      // Store guest ID for merging
      if (session.user.is_anonymous) {
        localStorage.setItem('guest_user_id', session.user.id)
      }

      // Fetch or create active cart
      let cartId: string
      const { data: existingCart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle()
      if (cartError) throw cartError

      if (!existingCart) {
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({ user_id: session.user.id, status: 'active' })
          .select()
          .single()
        if (createError || !newCart) throw new Error('Failed to create cart')
        cartId = newCart.id
      } else {
        cartId = existingCart.id
      }

      // Optimistic UI update
      setItems(prev => {
        const exists = prev.find(i => i.product_variant_id === variantId)
        if (exists) {
          return prev.map(i =>
            i.product_variant_id === variantId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        } else {
          return [...prev, { cart_item_id: '', product_variant_id: variantId, quantity, price: 0, product_title: '' }]
        }
      })
      setIsOpen(true)

      // Upsert cart item
      const { error: upsertError } = await supabase
        .from('cart_items')
        .upsert({ cart_id: cartId, variant_id: variantId, quantity }, { onConflict: 'cart_id,variant_id' })
      if (upsertError) throw upsertError

      await fetchCart()
    } catch (err) {
      console.error('Add to cart failed:', err)
    }
  }

  // --- Update / Remove Cart Items ---
  const updateCartItem = async (id: string, qty: number) => {
    if (qty < 1) return removeFromCart(id)
    setItems(prev => prev.map(item => item.cart_item_id === id ? { ...item, quantity: qty } : item))
    await supabase.from('cart_items').update({ quantity: qty }).eq('id', id)
    await fetchCart()
  }

  const removeFromCart = async (id: string) => {
    setItems(prev => prev.filter(item => item.cart_item_id !== id))
    await supabase.from('cart_items').delete().eq('id', id)
    await fetchCart()
  }

  // --- Auth Listener ---
  useEffect(() => {
    fetchCart()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const guestId = localStorage.getItem('guest_user_id')
        if (guestId && guestId !== session.user.id) {
          await mergeCarts(guestId, session.user.id)
          localStorage.removeItem('guest_user_id')
        }
        await fetchCart()
      } else if (event === 'SIGNED_OUT') {
        setItems([])
        localStorage.removeItem('guest_user_id')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <CartContext.Provider value={{
      items, isOpen, total, isLoading: false,
      toggleCart: () => setIsOpen(prev => !prev),
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addToCart, updateCartItem, removeFromCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
