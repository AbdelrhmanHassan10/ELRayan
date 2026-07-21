import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ShoppingBag } from 'lucide-react'
import { authApi } from '../../api/auth'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<{
    identifier: string
    password: string
  }>()

  const onSubmit = async (data: { identifier: string; password: string }) => {
    setLoading(true)
    try {
      const res = await authApi.login({ ...data, playerId: 'web-' + Date.now() })
      const { accessToken } = res.data.data
      await login(accessToken)
      toast.success('أهلاً بعودتك!')
      navigate('/')
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'فشل تسجيل الدخول'
      toast.error(msg)
      if (e?.response?.status === 403) {
        navigate('/verify-otp', { state: { email: data.identifier } })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-[#1a0a0e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-2xl">Al Rayan</p>
              <p className="text-primary text-sm font-medium">متجر الريان</p>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">أهلاً بعودتك</h1>
          <p className="text-gray-400 text-sm mb-6">سجّل دخولك للمتابعة</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني أو الهاتف</label>
              <input
                {...register('identifier', { required: 'مطلوب' })}
                placeholder="email@example.com أو الهاتف"
                className="input"
                autoComplete="username"
              />
              {errors.identifier && <p className="text-xs text-red-500 mt-1">{errors.identifier.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">كلمة المرور</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">نسيت كلمة المرور؟</Link>
              </div>
              <div className="relative">
                <input
                  {...register('password', { required: 'مطلوب', minLength: { value: 6, message: 'الحد الأدنى 6 أحرف' } })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pe-10"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'تسجيل الدخول'
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">إنشاء حساب</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
