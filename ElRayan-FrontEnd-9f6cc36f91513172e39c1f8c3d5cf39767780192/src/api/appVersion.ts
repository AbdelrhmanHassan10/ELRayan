import { api } from './client'
import type { ApiResponse } from '../types'

export const appVersionApi = {
  check: (params?: { platform?: string; version?: string }) =>
    api.get<ApiResponse<any>>('/app-version/check', { params }),

  getDeletionLink: () =>
    api.get<ApiResponse<any>>('/app-version/deletion-link'),

  getPrivacyPolicyLink: () =>
    api.get<ApiResponse<any>>('/app-version/privacy-policy-link'),
}
