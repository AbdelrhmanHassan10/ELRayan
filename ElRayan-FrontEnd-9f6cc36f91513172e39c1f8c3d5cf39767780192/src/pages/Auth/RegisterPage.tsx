import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ShoppingBag } from 'lucide-react'
import { authApi } from '../../api/auth'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface RegisterForm {
  email: string
  fullName: string
  phoneNumber?: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>()
  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    try {
      let phone = data.phoneNumber;
      if (phone && phone.startsWith('01') && phone.length === 11) {
        phone = '+20' + phone.substring(1);
      } else if (phone && !phone.startsWith('+')) {
        phone = '+' + phone;
      }

      await authApi.signUp({
        email: data.email,
        fullName: data.fullName,
        phoneNumber: phone,
        password: data.password,
        playerId: 'web-' + Date.now(),
      })
      toast.success('تم إنشاء الحساب! يرجى تفعيل بريدك الإلكتروني.')
      navigate('/verify-otp', { state: { email: data.email } })
    } catch (e: any) {
      console.error('Register Error:', e?.response?.data);
      const resData = e?.response?.data;
      const msg = Array.isArray(resData?.message) ? resData.message.join(' | ') : (resData?.message ?? 'فشل إنشاء الحساب');
      toast.error(msg)
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
            <div>
              <p className="text-white font-bold text-2xl">Al Rayan</p>
              <p className="text-primary text-sm font-medium">متجر الريان</p>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">إنشاء حساب</h1>
          <p className="text-gray-400 text-sm mb-6">انضم لمتجر الريان وابدأ التسوق</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
              <input
                {...register('fullName', { required: 'الاسم الكامل مطلوب', maxLength: { value: 200, message: 'الحد الأقصى 200 حرف' } })}
                placeholder="اسمك الكامل"
                className="input"
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني *</label>
              <input
                {...register('email', { required: 'البريد الإلكتروني مطلوب', pattern: { value: /^\S+@\S+\.\S+$/, message: 'بريد إلكتروني غير صالح' } })}
                type="email"
                placeholder="email@example.com"
                className="input"
                autoComplete="off"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف *</label>
              <input
                {...register('phoneNumber', {
                  required: 'رقم الهاتف مطلوب',
                  pattern: {
                    value: /^(010|011|012|015)\d{8}$/,
                    message: 'يجب أن يكون رقم مصري صحيح (مثال: 01012345678)'
                  }
                })}
                type="tel"
                autoComplete="off"
                placeholder="01X XXXX XXXX"
                className="input text-left"
                dir="ltr"
              />
              {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور *</label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'كلمة المرور مطلوبة',
                    minLength: { value: 8, message: 'الحد الأدنى 8 أحرف أو أرقام' },
                    maxLength: { value: 128, message: 'الحد الأقصى 128 حرفاً' },
                  })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pl-10"
                  autoComplete="new-password"
                  dir="ltr"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور *</label>
              <input
                {...register('confirmPassword', {
                  required: 'يرجى تأكيد كلمة المرور',
                  validate: v => v === password || 'كلمتا المرور غير متطابقتين',
                })}
                type="password"
                placeholder="••••••••"
                className="input"
                autoComplete="new-password"
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'إنشاء حساب'
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
