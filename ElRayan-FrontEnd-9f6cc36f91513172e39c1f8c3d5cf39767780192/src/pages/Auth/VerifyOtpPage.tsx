import { useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { authApi } from '../../api/auth'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const email = (location.state as { email?: string })?.email ?? ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) refs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      refs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 6) { toast.error('أدخل الرمز المكون من 6 أرقام'); return }
    setLoading(true)
    try {
      await authApi.verifyOtp({ email, otpCode: code })
      toast.success('تم التحقق من البريد الإلكتروني!')
      navigate('/login')
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'رمز غير صالح أو منتهي الصلاحية')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    try {
      await authApi.resendOtp({ email,"forgetPassword": true })
      toast.success('تم إرسال رمز جديد إلى بريدك الإلكتروني')
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'فشل إعادة الإرسال')
    } finally {
      setResending(false)
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
            <div className="text-4xl mb-3">📧</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">تحقق من بريدك الإلكتروني</h1>
            <p className="text-gray-400 text-sm">
              أرسلنا رمزاً مكوناً من 6 أرقام إلى<br />
              <span className="text-gray-700 font-medium">{email || 'بريدك الإلكتروني'}</span>
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste} dir="ltr">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { refs.current[idx] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className="w-11 h-12 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length < 6}
            className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 mb-4"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : 'تحقق من البريد الإلكتروني'
            }
          </button>

          <p className="text-center text-sm text-gray-400">
            لم تستلم الرمز؟{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-primary font-medium hover:underline disabled:opacity-50"
            >
              {resending ? 'جاري الإرسال...' : 'إعادة الإرسال'}
            </button>
          </p>

          <p className="text-center text-sm text-gray-400 mt-3">
            <Link to="/login" className="text-gray-500 hover:text-primary">→ العودة لتسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
