import { api } from './client'
import type { ApiResponse, PaginatedData, Coupon } from '../types'

export const couponsApi = {
  // ─── User Endpoints ──────────────────────────────────────────────────────────

  getMyCoupons: () =>
    api.get<ApiResponse<Coupon[]>>('/coupons/my'),

  getActive: () =>
    api.get<ApiResponse<Coupon[]>>('/coupons/active'),

  // ─── Admin Endpoints ─────────────────────────────────────────────────────────

  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedData<Coupon>>>('/coupons', { params }),

  create: (data: Partial<Coupon>) =>
    api.post<ApiResponse<Coupon>>('/coupons', data),

  update: (id: number, data: Partial<Coupon>) =>
    api.patch<ApiResponse<Coupon>>(`/coupons/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/coupons/${id}`),

  getAnalytics: (id: number) =>
    api.get<ApiResponse<any>>(`/coupons/${id}/analytics`),
}
