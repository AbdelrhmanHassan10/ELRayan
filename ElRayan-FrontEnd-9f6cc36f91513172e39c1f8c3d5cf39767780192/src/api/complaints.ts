import { api } from './client'
import type { ApiResponse, ProductsResponse, ComplaintSuggestion, CreateComplaintPayload } from '../types'

// Complaints API uses same items/metadata shape as products
type ComplaintsResponse = {
  items: ComplaintSuggestion[]
  metadata: { totalItems: number; itemsPerPage: number; totalPages: number; currentPage: number }
  links?: { hasNext: boolean }
}

export const complaintsApi = {
  create: (data: CreateComplaintPayload) =>
    api.post<ApiResponse<ComplaintSuggestion>>('/complaints-suggestions', data),

  getMyRequests: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<ComplaintsResponse>>('/complaints-suggestions/my-requests', { params }),

  getById: (id: number) =>
    api.get<ApiResponse<ComplaintSuggestion>>(`/complaints-suggestions/${id}`),
}
