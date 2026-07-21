import { api } from './client'
import type { Cart } from '../types'

export const cartApi = {
  getCart: () =>
    api.get<Cart>('/cart'),

  addItem: (productId: number, quantity: number = 1) =>
    api.post<Cart>('/cart/items', { productId, quantity }),

  updateItem: (itemId: number, quantity: number) =>
    api.patch<Cart>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: number) =>
    api.delete<Cart>(`/cart/items/${itemId}`),

  clearCart: () =>
    api.delete<void>('/cart/clear'),

  applyCoupon: (code: string) =>
    api.post<Cart>('/cart/coupon', { code }),

  removeCoupon: () =>
    api.delete<Cart>('/cart/coupon'),
}
