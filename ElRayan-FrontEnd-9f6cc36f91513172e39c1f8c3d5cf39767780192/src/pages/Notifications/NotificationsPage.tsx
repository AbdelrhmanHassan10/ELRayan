import { useQuery, useMutation } from '@tanstack/react-query'
import { Bell, Check, CheckCheck, Clock } from 'lucide-react'
import { notificationsApi } from '../../api/notifications'
import { PageSpinner } from '../../components/Spinner'
import toast from 'react-hot-toast'
import { useState } from 'react'
import Pagination from '../../components/Pagination'

export default function NotificationsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationsApi.getMyNotifications({ page, limit: 20 }),
  })

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => refetch(),
  })

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => { refetch(); toast.success('تم تعليم الكل كمقروء') },
  })

  const notifications = data?.data?.data?.data ?? []
  const meta = data?.data?.data?.meta
  const unreadCount = notifications.filter((n: any) => !n.isRead).length

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
          {unreadCount > 0 && (
            <span className="badge bg-primary text-white">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <CheckCheck className="w-4 h-4" /> تعليم الكل كمقروء
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-600">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(notifications as any[]).map((notif: any) => (
            <div
              key={notif.id}
              className={`card p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                !notif.isRead ? 'border-s-4 border-s-primary' : ''
              }`}
              onClick={() => !notif.isRead && markReadMutation.mutate(notif.id)}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                notif.isRead ? 'bg-gray-100' : 'bg-primary/10'
              }`}>
                <Bell className={`w-4 h-4 ${notif.isRead ? 'text-gray-400' : 'text-primary'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${notif.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                  {notif.title}
                </p>
                <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{notif.body}</p>
                <p className="text-xs text-gray-300 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(notif.createdAt).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              {notif.isRead && <Check className="w-4 h-4 text-gray-300 shrink-0 mt-1" />}
            </div>
          ))}
          {meta && (
            <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={setPage} />
          )}
        </div>
      )}
    </div>
  )
}
