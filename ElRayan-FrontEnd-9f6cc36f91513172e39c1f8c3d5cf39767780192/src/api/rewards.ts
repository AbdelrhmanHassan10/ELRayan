import { api } from './client'
import type { ApiResponse, Reward, SpinResult } from '../types'

export const rewardsApi = {
  getActive: () =>
    api.get<ApiResponse<Reward[]>>('/rewards/active'),

  spin: () =>
    api.post<ApiResponse<SpinResult>>('/rewards/spin'),
}
