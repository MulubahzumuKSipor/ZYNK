'use client'

import { createContext, useContext, useState, ReactNode } from "react"

interface CartUIContextType {
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const CartUIContext = createContext<CartUIContextType | undefined>(undefined)

export const CartUIProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)
  const toggleCart = () => setIsOpen(prev => !prev)

  return (
    <CartUIContext.Provider value={{ isOpen, openCart, closeCart, toggleCart }}>
      {children}
    </CartUIContext.Provider>
  )
}

export const useCartUI = () => {
  const context = useContext(CartUIContext)
  if (!context) throw new Error("useCartUI must be used within CartUIProvider")
  return context
}
