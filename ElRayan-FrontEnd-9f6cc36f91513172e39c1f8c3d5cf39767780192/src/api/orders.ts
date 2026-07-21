import { api } from './client'
import type { ApiResponse, PaginatedData, Order, CreateOrderPayload } from '../types'

export const ordersApi = {
  create: (data: CreateOrderPayload) =>
    api.post<ApiResponse<Order>>('/orders', data),

  getMyOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<PaginatedData<Order>>>('/orders/my-orders', { params }),

  getById: (id: number) =>
    api.get<ApiResponse<Order>>(`/orders/${id}`),

  cancel: (id: number) =>
    api.put<ApiResponse<Order>>(`/orders/${id}/cancel`),
}
