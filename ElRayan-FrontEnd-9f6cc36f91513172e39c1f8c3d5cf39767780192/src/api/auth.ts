import { api } from './client'
import type {
  LoginPayload, SignUpPayload, VerifyOtpPayload, ResendOtpPayload,
  ForgetPasswordPayload, UpdatePasswordPayload, ChangePasswordPayload,
  EditProfilePayload, ApiResponse, User, AuthTokens,
} from '../types'

export const authApi = {
  login: (data: LoginPayload) =>
    api.post<ApiResponse<AuthTokens>>('/auth/login', data),

  signUp: (data: SignUpPayload) =>
    api.post<ApiResponse<User>>('/auth/sign-up', data),

  getMe: () =>
    api.get<ApiResponse<User>>('/auth/get-me'),

  verifyOtp: (data: VerifyOtpPayload) =>
    api.post<ApiResponse<null>>('/auth/verify-otp', data),

  resendOtp: (data: ResendOtpPayload) =>
    api.post<ApiResponse<null>>('/auth/resend-otp', data),

  forgetPassword: (data: ForgetPasswordPayload) =>
    api.post<ApiResponse<null>>('/auth/forget-password', data),

  updatePassword: (data: UpdatePasswordPayload) =>
    api.post<ApiResponse<null>>('/auth/update-password', data),

  changePassword: (data: ChangePasswordPayload) =>
    api.post<ApiResponse<null>>('/auth/change-password', data),

  editProfile: (data: EditProfilePayload) =>
    api.patch<ApiResponse<User>>('/auth/edit-profile', data),

  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout'),

  logoutAll: () =>
    api.post<ApiResponse<null>>('/auth/logout-all'),
}
