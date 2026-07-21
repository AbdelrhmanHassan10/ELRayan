import { api } from './client'
import type { ApiResponse, ProductsResponse, Product } from '../types'

export interface ProductFilters {
  page?: number
  limit?: number
  name?: string
  categoryId?: number
  subCategoryId?: number
  isFavorite?: boolean
  mostSold?: boolean
  mostNew?: boolean
  recommended?: boolean
  discounted?: boolean
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export const productsApi = {
  getAll: (params?: ProductFilters) =>
    api.get<ApiResponse<ProductsResponse>>('/product', { params }),

  getById: (id: number) =>
    api.get<ApiResponse<Product>>(`/product/${id}`),

  toggleFavorite: (productId: number) =>
    api.patch<ApiResponse<null>>(`/product/toggle-favorite/${productId}`),
}
