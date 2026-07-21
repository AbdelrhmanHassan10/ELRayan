import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ShoppingBag } from 'lucide-react'
import { authApi } from '../../api/auth'
import toast from 'react-hot-toast'

interface ResetForm {
  otp: string
  newPassword: string
  confirmPassword: string
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string })?.email ?? ''
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>()
  const newPassword = watch('newPassword')

  const onSubmit = async (data: ResetForm) => {
    setLoading(true)
    try {
      await authApi.updatePassword({ email, otpAgin: data.otp, newPassword: data.newPassword })
      toast.success('تم إعادة تعيين كلمة المرور بنجاح!')
      navigate('/login')
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'فشل إعادة تعيين كلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-[#1a0a0e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔑</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">إعادة تعيين كلمة المرور</h1>
            <p className="text-gray-400 text-sm">أدخل الرمز المرسل إلى <strong>{email}</strong></p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رمز التحقق</label>
              <input
                {...register('otp', { required: 'الرمز مطلوب', minLength: { value: 4, message: 'أدخل الرمز كاملاً' } })}
                placeholder="أدخل الرمز"
                className="input tracking-widest text-center text-lg font-bold"
                maxLength={6}
                dir="ltr"
              />
              {errors.otp && <p className="text-xs text-red-500 mt-1">{errors.otp.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
              <div className="relative">
                <input
                  {...register('newPassword', {
                    required: 'مطلوب',
                    minLength: { value: 6, message: 'الحد الأدنى 6 أحرف' },
                  })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pe-10"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور</label>
              <input
                {...register('confirmPassword', {
                  required: 'مطلوب',
                  validate: v => v === newPassword || 'كلمتا المرور غير متطابقتين',
                })}
                type="password"
                placeholder="••••••••"
                className="input"
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'إعادة تعيين كلمة المرور'
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            <Link to="/login" className="text-primary font-medium hover:underline">→ العودة لتسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
