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

  const { register, handleSubmit, watch, setError, clearErrors, setValue, formState: { errors } } = useForm<RegisterForm>()
  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    try {
      let phone = '+20' + data.phoneNumber;

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
      
      if (resData?.errors && Array.isArray(resData.errors)) {
        resData.errors.forEach((err: any) => {
          const path = err.path?.toLowerCase() || '';
          const msg = err.msg || '';
          if (path.includes('email') || msg.includes('بريد') || msg.includes('email')) setError('email', { message: msg });
          else if (path.includes('phone') || msg.includes('هاتف') || msg.includes('phone')) setError('phoneNumber', { message: msg });
          else if (path.includes('password') || msg.includes('مرور') || msg.includes('password')) setError('password', { message: msg });
          else if (path.includes('name') || msg.includes('اسم')) setError('fullName', { message: msg });
          else toast.error(msg);
        });
      } else {
        const msg = Array.isArray(resData?.message) ? resData.message[0] : (resData?.message ?? 'فشل إنشاء الحساب');
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('بريد') || lowerMsg.includes('email')) setError('email', { message: msg });
        else if (lowerMsg.includes('هاتف') || lowerMsg.includes('phone')) setError('phoneNumber', { message: msg });
        else if (lowerMsg.includes('مرور') || lowerMsg.includes('password')) setError('password', { message: msg });
        else toast.error(msg);
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-[#1a0a0e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="Al Rayan" className="h-24 w-auto mx-auto object-contain" />
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
              <div className="relative flex items-center" dir="ltr">
                <span className="absolute left-3 text-gray-500 font-medium z-10" style={{ pointerEvents: 'none' }}>+20</span>
                <input
                  {...register('phoneNumber', {
                    required: 'رقم الهاتف مطلوب',
                    pattern: {
                      value: /^(10|11|12|15)\d{8}$/,
                      message: 'يجب أن يكون 10 أرقام ويبدأ بـ 10, 11, 12, أو 15'
                    },
                    onChange: (e) => {
                      let val = e.target.value.replace(/\D/g, ''); // keep only digits
                      let invalidPrefix = false;
                      if (val.length >= 1 && val[0] !== '1') {
                        val = ''; // first digit must be 1
                        invalidPrefix = true;
                      }
                      if (val.length >= 2 && !['0', '1', '2', '5'].includes(val[1])) {
                        val = val[0]; // second digit must be 0, 1, 2, or 5
                        invalidPrefix = true;
                      }
                      setValue('phoneNumber', val);
                      
                      if (invalidPrefix) {
                        setError('phoneNumber', { type: 'manual', message: 'عذراً، يجب أن يبدأ الرقم بـ 10, 11, 12, أو 15 فقط' });
                      } else {
                        clearErrors('phoneNumber');
                      }
                    }
                  })}
                  type="tel"
                  maxLength={10}
                  autoComplete="off"
                  placeholder="10XXXXXXXX"
                  className="input pl-[3.5rem] text-left"
                />
              </div>
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
