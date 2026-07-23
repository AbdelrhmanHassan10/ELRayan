import { api } from './client'
import type { ApiResponse, PaginatedData, Review, CreateReviewPayload, ReviewStats } from '../types'

export const reviewsApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedData<Review>>>('/reviews', { params }),

  getStats: () =>
    api.get<ApiResponse<ReviewStats>>('/reviews/stats'),

  getById: (id: number) =>
    api.get<ApiResponse<Review>>(`/reviews/${id}`),

  create: (data: CreateReviewPayload) =>
    api.post<ApiResponse<Review>>('/reviews', data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/reviews/${id}`),
}
