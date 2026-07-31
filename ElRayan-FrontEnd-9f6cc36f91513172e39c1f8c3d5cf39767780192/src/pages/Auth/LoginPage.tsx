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

  const { register, handleSubmit, formState: { errors }, watch, setError } = useForm<{
    identifier: string
    password: string
  }>()


  const onSubmit = async (data: { identifier: string; password: string }) => {
    setLoading(true)
    try {
      let id = data.identifier;
      if (/^01[0125]\d{8}$/.test(id)) {
        id = '+20' + id.substring(1);
      } else if (/^\d+$/.test(id) && !id.startsWith('+')) {
        id = '+' + id;
      }

      const res = await authApi.login({ ...data, identifier: id, playerId: 'web-' + Date.now() })
      const { accessToken } = res.data.data
      await login(accessToken)
      toast.success('أهلاً بعودتك!')
      navigate('/')
    } catch (e: any) {
      try {
        console.error('Login Error:', e?.response?.data || e);
        const resData = e?.response?.data;
        
        if (resData?.errors && Array.isArray(resData.errors) && resData.errors.length > 0) {
          let handled = false;
          resData.errors.forEach((err: any) => {
            if (typeof err === 'string') {
               if (err.toLowerCase().includes('credentials') || err.toLowerCase().includes('password') || err.toLowerCase().includes('مرور')) {
                 setError('password', { type: 'manual', message: 'كلمة المرور غير صحيحة' });
                 toast.error('كلمة المرور غير صحيحة');
                 handled = true;
               } else {
                 toast.error(err);
                 handled = true;
               }
               return;
            }
            
            const path = err.path?.toLowerCase() || '';
            const msg = err.msg || err.message || '';
            
            if (!msg) return; // Ignore if no message to prevent empty toasts
            
            if (path.includes('identifier') || path.includes('phone') || msg.includes('هاتف') || msg.includes('حساب')) {
              setError('identifier', { type: 'manual', message: msg });
              handled = true;
            }
            else if (path.includes('password') || msg.includes('مرور') || msg.includes('password')) {
              setError('password', { type: 'manual', message: msg });
              handled = true;
            }
            else {
              toast.error(msg);
              handled = true;
            }
          });
          
          if (!handled) {
            // Fallback if errors array was empty or had no valid strings
            setError('password', { type: 'manual', message: 'كلمة المرور أو الحساب غير صحيح' });
            toast.error('كلمة المرور أو الحساب غير صحيح');
          }
        } else {
          let rawMsg = resData?.message;
          if (Array.isArray(rawMsg)) rawMsg = rawMsg[0];
          
          const msg = (typeof rawMsg === 'string' && rawMsg.trim().length > 0) 
            ? rawMsg 
            : (rawMsg ? JSON.stringify(rawMsg) : 'فشل تسجيل الدخول');
            
          const lowerMsg = msg.toLowerCase();
          
          if (e?.response?.status === 401 || e?.response?.status === 400 || e?.response?.status === 404 || lowerMsg.includes('invalid credentials') || lowerMsg.includes('unauthorized') || lowerMsg.includes('credentials') || lowerMsg.includes('found')) {
            setError('password', { type: 'manual', message: 'كلمة المرور أو الحساب غير صحيح' });
            toast.error('كلمة المرور أو الحساب غير صحيح');
          } else if (lowerMsg.includes('مرور') || lowerMsg.includes('password') || lowerMsg.includes('سر')) {
            setError('password', { type: 'manual', message: msg });
            toast.error(msg);
          } else if (lowerMsg.includes('هاتف') || lowerMsg.includes('phone') || lowerMsg.includes('حساب') || lowerMsg.includes('user') || lowerMsg.includes('identifier')) {
            setError('identifier', { type: 'manual', message: msg });
            toast.error(msg);
          } else {
            setError('password', { type: 'manual', message: 'كلمة المرور غير صحيحة' });
            toast.error(msg === 'فشل تسجيل الدخول' ? 'كلمة المرور غير صحيحة' : msg);
          }
        }
        if (e?.response?.status === 403) {
          navigate('/verify-otp', { state: { email: data.identifier } })
        }
      } catch (err2) {
        console.error('Error handling login failure:', err2);
        setError('password', { type: 'manual', message: 'كلمة المرور غير صحيحة' });
        toast.error('كلمة المرور غير صحيحة');
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
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="Al Rayan" className="h-24 w-auto mx-auto object-contain" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">أهلاً بعودتك</h1>
          <p className="text-gray-400 text-sm mb-6">سجّل دخولك للمتابعة</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني أو الهاتف</label>
              <input
                {...register('identifier', { 
                  required: 'مطلوب',
                })}
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
                  {...register('password', { required: 'مطلوب' })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pl-10"
                  autoComplete="current-password"
                  dir="ltr"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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
