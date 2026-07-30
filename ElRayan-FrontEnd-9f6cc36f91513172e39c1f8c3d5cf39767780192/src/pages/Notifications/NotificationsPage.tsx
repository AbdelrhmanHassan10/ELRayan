import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, CheckCheck, Clock } from 'lucide-react'
import { notificationsApi } from '../../api/notifications'
import { PageSpinner } from '../../components/Spinner'
import toast from 'react-hot-toast'
import { useState } from 'react'
import Pagination from '../../components/Pagination'

export default function NotificationsPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationsApi.getMyNotifications({ page, limit: 20 }),
    refetchInterval: 15000,
  })

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      refetch()
      queryClient.invalidateQueries({ queryKey: ['notifications-navbar'] })
    },
  })

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => { 
      refetch()
      queryClient.invalidateQueries({ queryKey: ['notifications-navbar'] })
      toast.success('تم تعليم الكل كمقروء') 
    },
  })

  const rawData = data?.data?.data as any
  const notifications = rawData?.items || []
  const meta = rawData?.metadata
  const unreadCount = rawData?.unreadCount ?? 0

  const handleNotificationClick = (notif: any) => {
    const isRead = notif.recipients?.[0]?.isRead ?? true
    if (!isRead) {
      markReadMutation.mutate(notif.id)
    }

    const navData = notif.navigationData || {}
    const screen = navData.screen
    const params = navData.params || {}

    if (screen === 'ProductDetails' && params.productId) {
      navigate(`/product/${params.productId}`)
    } else if (screen === 'Home') {
      navigate('/')
    } else if (screen === 'Cart') {
      navigate('/cart')
    } else if (screen === 'Offers') {
      navigate('/offers')
    } else if (screen === 'Orders') {
      navigate('/orders')
    } else if (screen === 'Profile') {
      navigate('/profile')
    }
  }

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm">
              {unreadCount}
            </span>
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
          {(notifications as any[]).map((notif: any) => {
            const isRead = notif.recipients?.[0]?.isRead ?? true
            return (
              <div
                key={notif.id}
                className={`group relative p-5 rounded-2xl flex items-start gap-4 cursor-pointer transition-all duration-300 ${
                  !isRead 
                    ? 'bg-white shadow-lg border border-primary/20 border-s-4 border-s-primary transform hover:-translate-y-1' 
                    : 'bg-gray-50 border border-gray-200 hover:bg-white hover:shadow-md'
                }`}
                onClick={() => handleNotificationClick(notif)}
              >
                {/* Unread Indicator Dot */}
                {!isRead && (
                  <div className="absolute top-0 end-0 w-3 h-3 rounded-bl-full bg-primary" />
                )}

                {/* Icon Container */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm ${
                  !isRead ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white text-gray-400 border border-gray-100 group-hover:text-primary/70'
                }`}>
                  <Bell className="w-6 h-6" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 pt-1 text-start flex gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className={`text-lg font-bold ${!isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notif.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0 mt-1 bg-black/5 px-2.5 py-1 rounded-md border border-black/5">
                        <Clock className="w-3.5 h-3.5" />
                        <span dir="ltr" className="font-medium">
                          {new Date(notif.createdAt).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <p className={`text-base leading-relaxed ${!isRead ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                      {notif.message || notif.body}
                    </p>
                  </div>
                  
                  {/* Read Checkmark */}
                  {isRead && (
                    <div className="flex flex-col justify-center shrink-0">
                      <div className="bg-green-50 text-green-500 p-2 rounded-full border border-green-100" title="مقروء">
                        <CheckCheck className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {meta && (
            <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={setPage} />
          )}
        </div>
      )}
    </div>
  )
}
