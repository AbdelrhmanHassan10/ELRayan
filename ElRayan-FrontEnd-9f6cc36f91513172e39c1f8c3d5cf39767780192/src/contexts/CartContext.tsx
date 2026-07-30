import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Cart } from '../types'
import { cartApi } from '../api/cart'
import { useAuth } from './AuthContext'

interface CartContextType {
  cart: Cart | null
  isLoading: boolean
  cartCount: number
  fetchCart: () => Promise<void>
  addItem: (productId: number, quantity?: number) => Promise<void>
  updateItem: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearCart: () => Promise<void>
  applyCoupon: (code: string) => Promise<void>
  removeCoupon: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setCart(null); return }
    setIsLoading(true)
    try {
      const res = await cartApi.getCart()
      setCart(res.data)
    } catch {
      setCart(null)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addItem = async (productId: number, quantity = 1) => {
    const res = await cartApi.addItem(productId, quantity)
    setCart(res.data)
  }

  const updateItem = async (itemId: number, quantity: number) => {
    const res = await cartApi.updateItem(itemId, quantity)
    setCart(res.data)
  }

  const removeItem = async (itemId: number) => {
    const res = await cartApi.removeItem(itemId)
    setCart(res.data)
  }

  const clearCart = async () => {
    await cartApi.clearCart()
    setCart(null)
  }

  const applyCoupon = async (code: string) => {
    await cartApi.applyCoupon(code)
    await fetchCart()
  }

  const removeCoupon = async () => {
    await cartApi.removeCoupon()
    await fetchCart()
  }

  const cartCount = cart?.items?.length ?? 0

  return (
    <CartContext.Provider value={{
        cart, isLoading, cartCount,
        fetchCart, addItem, updateItem, removeItem, clearCart, applyCoupon, removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
