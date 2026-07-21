import { api } from './client'
import type { ApiResponse, Banner } from '../types'

export const bannersApi = {
  // API returns: { success, message, data: Banner[] }
  getAll: () =>
    api.get<ApiResponse<Banner[]>>('/banners'),

  getById: (id: number) =>
    api.get<ApiResponse<Banner>>(`/banners/${id}`),
}
