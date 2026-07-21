import { api } from './client'
import type { ApiResponse, Address, CreateAddressPayload } from '../types'

export const addressesApi = {
  getAll: () =>
    api.get<ApiResponse<Address[]>>('/address'),

  getById: (id: number) =>
    api.get<ApiResponse<Address>>(`/address/${id}`),

  create: (data: CreateAddressPayload) =>
    api.post<ApiResponse<Address>>('/address', data),

  update: (id: number, data: Partial<CreateAddressPayload>) =>
    api.patch<ApiResponse<Address>>(`/address/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/address/${id}`),

  setDefault: (id: number) =>
    api.patch<ApiResponse<Address>>(`/address/set-default/${id}`),
}
