import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { User, Phone, Mail, Lock, Eye, EyeOff, Save } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../api/auth'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'info' | 'password'>('info')
  const [saving, setSaving] = useState(false)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const { register: regProfile, handleSubmit: handleProfile, reset: resetProfile, formState: { errors: errProfile } } = useForm({
    defaultValues: {
      fullName: user?.fullName ?? '',
      phoneNumber: user?.phoneNumber ?? '',
      gender: user?.gender ?? '',
    },
  })

  useEffect(() => {
    if (user) {
      resetProfile({
        fullName: user.fullName ?? '',
        phoneNumber: user.phoneNumber ?? '',
        gender: user.gender ?? '',
      })
    }
  }, [user, resetProfile])

  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, watch, formState: { errors: errPwd } } = useForm<{
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }>()
  const newPwd = watch('newPassword')

  const onProfileSave = async (data: { fullName: string; gender: string }) => {
    setSaving(true)
    try {

      const payload: any = { fullName: data.fullName };
      // NOTE: Backend currently rejects `gender`.
      if (data.gender) payload.gender = data.gender;

      await authApi.editProfile(payload)
      
      await refreshUser()
      toast.success('تم تحديث الملف الشخصي!')
    } catch (e: any) {
      console.error('Profile Edit Error:', e?.response?.data);
      const resData = e?.response?.data;
      const msg = Array.isArray(resData?.message) ? resData.message.join(' | ') : (resData?.message ?? 'فشل تحديث الملف الشخصي');
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const onPasswordSave = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    setSaving(true)
    try {
      const payload = { 
        currentPassword: data.currentPassword, 
        newPassword: data.newPassword,
      };
      await authApi.changePassword(payload as any)
      resetPwd()
      toast.success('تم تغيير كلمة المرور بنجاح!')
    } catch (e: any) {
      console.error('Password Edit Error:', e?.response?.data);
      const resData = e?.response?.data;
      let msg = resData?.message ?? 'فشل تغيير كلمة المرور';
      
      if (resData?.errors && Array.isArray(resData.errors)) {
        msg = resData.errors.map((err: any) => {
          if (typeof err === 'string') return err;
          if (err.constraints) return Object.values(err.constraints).join(' و ');
          if (err.message) return err.message;
          if (err.msg) return err.msg;
          return JSON.stringify(err);
        }).join(' | ');
      } else if (resData?.errors) {
        msg = Object.values(resData.errors).flat().join(' | ');
      }
      
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ملفي الشخصي</h1>

      {/* Avatar card */}
      <div className="card p-6 mb-6 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/30">
            {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
          </div>
        </div>
        <div>
          <p className="font-bold text-xl text-gray-900">{user?.fullName}</p>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            {user?.isEmailVerified ? (
              <span className="badge bg-green-50 text-green-600 text-xs">✓ موثّق</span>
            ) : (
              <span className="badge bg-yellow-50 text-yellow-600 text-xs">⚠ غير موثّق</span>
            )}
            <span className="badge bg-gray-100 text-gray-500 text-xs capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'info', label: 'المعلومات الشخصية', icon: User },
          { id: 'password', label: 'تغيير كلمة المرور', icon: Lock },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as 'info' | 'password')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <form onSubmit={handleProfile(onProfileSave)} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                {...regProfile('fullName', { required: 'مطلوب', maxLength: { value: 200, message: 'الحد الأقصى 200 حرف' } })}
                className="input pr-9"
                placeholder="اسمك الكامل"
              />
            </div>
            {errProfile.fullName && <p className="text-xs text-red-500 mt-1">{errProfile.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={user?.email ?? ''} disabled className="input pr-9 bg-gray-50 cursor-not-allowed" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={user?.phoneNumber ?? ''}
                disabled
                className="input pr-9 text-left bg-gray-50 cursor-not-allowed"
                dir="ltr"
                placeholder="01X XXXX XXXX"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
            <select {...regProfile('gender')} className="input">
              <option value="">أفضل عدم الإفصاح</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Save className="w-4 h-4" />
              }
              حفظ التغييرات
            </button>
          </div>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePwd(onPasswordSave as any)} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الحالية</label>
            <div className="relative">
              <input
                {...regPwd('currentPassword', { required: 'مطلوب' })}
                type={showOld ? 'text' : 'password'}
                className="input pl-10"
                placeholder="••••••••"
                dir="ltr"
              />
              <button type="button" onClick={() => setShowOld(v => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errPwd.currentPassword && <p className="text-xs text-red-500 mt-1">{errPwd.currentPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
            <div className="relative">
              <input
                {...regPwd('newPassword', { required: 'مطلوب', minLength: { value: 8, message: 'الحد الأدنى 8 أحرف' } })}
                type={showNew ? 'text' : 'password'}
                className="input pl-10"
                placeholder="••••••••"
                dir="ltr"
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errPwd.newPassword && <p className="text-xs text-red-500 mt-1">{errPwd.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور الجديدة</label>
            <input
              {...regPwd('confirmPassword', {
                required: 'مطلوب',
                validate: (v: string) => v === newPwd || 'كلمتا المرور غير متطابقتين',
              })}
              type="password"
              className="input"
              placeholder="••••••••"
              dir="ltr"
            />
            {errPwd.confirmPassword && <p className="text-xs text-red-500 mt-1">{errPwd.confirmPassword.message}</p>}
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Lock className="w-4 h-4" />
              }
              تغيير كلمة المرور
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
