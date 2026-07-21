import { api } from './client'
import type { ApiResponse, Category, SubCategory } from '../types'

export const categoriesApi = {
  // Returns { data: Category[] } or direct Category[]  – we normalise in usage
  getAll: () =>
    api.get<ApiResponse<Category[] | { data: Category[] }>>('/category'),

  getById: (id: number) =>
    api.get<ApiResponse<Category>>(`/category/${id}`),

  getAllSubCategories: () =>
    api.get<ApiResponse<SubCategory[] | { data: SubCategory[] }>>('/sub-categories'),

  getSubCategoryById: (id: number) =>
    api.get<ApiResponse<SubCategory>>(`/sub-categories/${id}`),
}
