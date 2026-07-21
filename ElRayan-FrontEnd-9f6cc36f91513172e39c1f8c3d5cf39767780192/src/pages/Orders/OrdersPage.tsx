import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Clock, X, Eye } from 'lucide-react'
import { ordersApi } from '../../api/orders'
import { OrderSkeleton } from '../../components/Skeleton'
import Pagination from '../../components/Pagination'
import type { OrderStatus } from '../../types'
import toast from 'react-hot-toast'

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-blue-50 text-blue-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  refunded: 'bg-red-50 text-red-600',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
  refunded: 'مسترجع',
}

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'الكل', value: '' },
  { label: 'قيد الانتظار', value: 'pending' },
  { label: 'مؤكد', value: 'confirmed' },
  { label: 'تم الشحن', value: 'shipped' },
  { label: 'تم التوصيل', value: 'delivered' },
  { label: 'ملغي', value: 'cancelled' },
]

const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: 'الدفع عند الاستلام',
  credit_card: 'بطاقة ائتمانية',
  debit_card: 'بطاقة مدى',
  bank_transfer: 'تحويل بنكي',
}

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', page, statusFilter],
    queryFn: () => ordersApi.getMyOrders({ page, limit: 10, status: statusFilter || undefined }),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => ordersApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      toast.success('تم إلغاء الطلب')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'فشل إلغاء الطلب'),
  })

  const orders = data?.data?.data?.data ?? []
  const meta = data?.data?.data?.meta

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">طلباتي</h1>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {STATUS_FILTERS.map(s => (
          <button
            key={s.value}
            onClick={() => { setStatusFilter(s.value); setPage(1) }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
              statusFilter === s.value ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary bg-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <OrderSkeleton key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📦</div>
          <p className="font-medium text-gray-600 text-lg">لا توجد طلبات</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">ستظهر طلباتك هنا بعد الشراء</p>
          <Link to="/shop" className="btn-primary">ابدأ التسوق</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const canCancel = order.status === 'pending'
            return (
              <div key={order.id} className="card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">#{order.orderNumber}</span>
                      <span className={`badge ${STATUS_STYLES[order.status as OrderStatus]} text-xs`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="font-bold text-gray-900">{Number(order.totalAmount).toFixed(2)} ج.م</p>
                    <p className="text-xs text-gray-400">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
                  {order.orderItems?.slice(0, 4).map((item: any) => (
                    <div key={item.id} className="shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      {item.productImages?.[0] ? (
                        <img src={item.productImages[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                  ))}
                  {order.orderItems?.length > 4 && (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-medium text-gray-500">
                      +{order.orderItems.length - 4}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 ms-1">
                    {order.orderItems?.length} منتج
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Link
                    to={`/orders/${order.id}`}
                    className="flex-1 btn-outline text-center py-2 text-sm flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" /> عرض التفاصيل
                  </Link>
                  {canCancel && (
                    <button
                      onClick={() => cancelMutation.mutate(order.id)}
                      disabled={cancelMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" /> إلغاء
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {meta && (
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  )
}
