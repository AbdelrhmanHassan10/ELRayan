import { api } from './client'
import type { ApiResponse, PaginatedData, Coupon } from '../types'

export const couponsApi = {
  getMyCoupons: () =>
    api.get<ApiResponse<Coupon[]>>('/coupons/my'),

  getActive: () =>
    api.get<ApiResponse<Coupon[]>>('/coupons/active'),

  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedData<Coupon>>>('/coupons', { params }),
}
