import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { MessageSquare, Plus, Clock } from 'lucide-react'
import { complaintsApi } from '../../api/complaints'
import type { CreateComplaintPayload } from '../../types'
import toast from 'react-hot-toast'
import Pagination from '../../components/Pagination'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  in_progress: 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-600',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  in_progress: 'قيد المعالجة',
  resolved: 'تم الحل',
  rejected: 'مرفوض',
}

const TYPE_LABELS: Record<string, string> = {
  complaint: 'شكوى',
  suggestion: 'اقتراح',
  inquiry: 'استفسار',
}

export default function ComplaintsPage() {
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-complaints', page],
    queryFn: () => complaintsApi.getMyRequests({ page, limit: 10 }),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateComplaintPayload>({
    defaultValues: { type: 'complaint' },
  })

  const complaints = data?.data?.data?.items ?? []
  const meta = data?.data?.data?.metadata

  const onSubmit = async (formData: CreateComplaintPayload) => {
    setSubmitting(true)
    try {
      await complaintsApi.create(formData)
      reset()
      setShowForm(false)
      refetch()
      toast.success('تم تقديم طلبك بنجاح!')
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'فشل الإرسال')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">الدعم والشكاوى</h1>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="btn-primary flex items-center gap-2 py-2 text-sm"
        >
          <Plus className="w-4 h-4" /> طلب جديد
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 border-2 border-primary/20">
          <h2 className="font-bold text-gray-900 mb-4">تقديم طلب</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
              <select {...register('type', { required: 'مطلوب' })} className="input">
                <option value="complaint">شكوى</option>
                <option value="suggestion">اقتراح</option>
                <option value="inquiry">استفسار</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العنوان *</label>
              <input
                {...register('title', { required: 'العنوان مطلوب' })}
                placeholder="عنوان مختصر لطلبك"
                className="input"
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوصف *</label>
              <textarea
                {...register('description', { required: 'الوصف مطلوب', minLength: { value: 10, message: 'الحد الأدنى 10 أحرف' } })}
                rows={4}
                placeholder="اشرح مشكلتك أو اقتراحك بالتفصيل..."
                className="input resize-none"
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowForm(false); reset() }} className="btn-ghost text-sm">إلغاء</button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary text-sm flex items-center gap-2 py-2"
              >
                {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                إرسال الطلب
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-600">لا توجد طلبات مقدمة</p>
          <p className="text-sm text-gray-400 mt-1">استخدم الزر أعلاه لتقديم شكوى أو اقتراح</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(complaints as any[]).map((req: any) => (
            <div key={req.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{req.title}</span>
                    <span className="badge bg-gray-100 text-gray-500 text-xs">{TYPE_LABELS[req.type] ?? req.type}</span>
                    <span className={`badge text-xs ${STATUS_STYLES[req.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {STATUS_LABELS[req.status] ?? req.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{req.description}</p>
                  <p className="text-xs text-gray-300 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(req.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {meta && (
            <Pagination currentPage={page} totalPages={meta.totalPages ?? 1} onPageChange={setPage} />
          )}
        </div>
      )}
    </div>
  )
}
