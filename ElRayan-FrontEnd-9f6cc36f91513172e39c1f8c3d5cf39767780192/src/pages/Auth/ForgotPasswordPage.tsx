import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ShoppingBag } from 'lucide-react'
import { authApi } from '../../api/auth'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>()

  const onSubmit = async (data: { email: string }) => {
    setLoading(true)
    try {
      await authApi.forgetPassword({ email: data.email })
      toast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني')
      navigate('/reset-password', { state: { email: data.email } })
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'فشل إرسال رمز التحقق')
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
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">نسيت كلمة المرور؟</h1>
            <p className="text-gray-400 text-sm">أدخل بريدك الإلكتروني لاستلام رمز التحقق</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <input
                {...register('email', { required: 'مطلوب' })}
                placeholder="email@example.com"
                className="input"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'إرسال رمز التحقق'
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
