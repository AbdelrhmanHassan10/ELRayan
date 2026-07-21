import { api } from './client'
import type { ApiResponse, PaginatedData, Notification } from '../types'

export const notificationsApi = {
  getMyNotifications: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedData<Notification>>>('/notifications/me', { params }),

  markAsRead: (id: number) =>
    api.patch<ApiResponse<null>>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch<ApiResponse<null>>('/notifications/mark-all-read'),
}
