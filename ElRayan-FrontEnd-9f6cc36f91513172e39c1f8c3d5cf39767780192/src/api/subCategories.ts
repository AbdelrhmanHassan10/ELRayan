import { api } from './client'
import type { ApiResponse } from '../types'

export const subCategoriesApi = {
  getAll: (params?: { categoryId?: number; page?: number; limit?: number }) =>
    api.get<ApiResponse<any>>('/sub-categories', { params }),

  getById: (id: number) =>
    api.get<ApiResponse<any>>(`/sub-categories/${id}`),
}
