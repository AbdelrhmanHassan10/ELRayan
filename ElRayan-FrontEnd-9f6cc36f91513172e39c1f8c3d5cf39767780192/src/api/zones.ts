import { api } from './client'
import type { ApiResponse } from '../types'

export const zonesApi = {
  getAll: () =>
    api.get<ApiResponse<any>>('/zones'),

  validateAddress: (data: { lat: number; lng: number }) =>
    api.post<ApiResponse<any>>('/zones/validate-address', data),
}
