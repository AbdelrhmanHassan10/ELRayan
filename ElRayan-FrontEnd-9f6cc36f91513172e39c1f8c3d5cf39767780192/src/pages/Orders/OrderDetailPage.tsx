import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Package, MapPin, CreditCard, Tag, Clock, X } from 'lucide-react'
import { ordersApi } from '../../api/orders'
import { PageSpinner } from '../../components/Spinner'
import type { OrderStatus } from '../../types'
import toast from 'react-hot-toast'

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-100',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  delivered: 'bg-green-50 text-green-700 border-green-100',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
  refunded: 'bg-red-50 text-red-600 border-red-100',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
  refunded: 'مسترجع',
}

const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: 'قيد الانتظار' },
  { key: 'confirmed', label: 'مؤكد' },
  { key: 'shipped', label: 'تم الشحن' },
  { key: 'delivered', label: 'تم التوصيل' },
]

const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: 'الدفع عند الاستلام',
  credit_card: 'بطاقة ائتمانية',
  debit_card: 'بطاقة مدى',
  bank_transfer: 'تحويل بنكي',
  paid: 'مدفوع',
  unpaid: 'غير مدفوع',
  pending: 'قيد المعالجة',
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(Number(id)),
    enabled: !!id,
  })

  const cancelMutation = useMutation({
    mutationFn: () => ordersApi.cancel(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      toast.success('تم إلغاء الطلب')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'فشل الإلغاء'),
  })

  if (isLoading) return <PageSpinner />

  const extractOrder = (res: any): any => {
    if (!res) return null;
    if (res.data && !Array.isArray(res.data) && typeof res.data === 'object' && (res.data.orderNumber || res.data.order_number)) return res.data;
    if (res.order) return res.order;
    if (res.result) return res.result;
    if (res.payload) return res.payload;
    if (res.data?.data) return res.data.data;
    if (res.data?.order) return res.data.order;
    if (res.orderNumber || res.order_number) return res;
    return res.data;
  }

  const order = extractOrder(data?.data)
  if (!order) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">الطلب غير موجود.</p>
        <Link to="/orders" className="btn-primary">طلباتي</Link>
      </div>
    )
  }

  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === order.status)
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded'

  const orderNum = order.orderNumber || order.order_number || order.id
  const dateStr = order.createdAt || order.created_at
  const total = order.totalAmount || order.total_amount || order.total || 0
  const subtotal = order.subtotal || order.sub_total || 0
  const discount = order.discountAmount || order.discount_amount || order.discount || 0
  const shipping = order.shippingAmount || order.shipping_amount || order.shipping || 0
  const pMethod = order.paymentMethod || order.payment_method || 'cash_on_delivery'
  const pStatus = order.paymentStatus || order.payment_status || 'pending'
  const items = order.orderItems || order.order_items || order.items || []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary mb-6 transition-colors">
        <ArrowRight className="w-4 h-4" /> العودة للطلبات
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">طلب #{orderNum}</h1>
          {dateStr && (
            <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              {new Date(dateStr).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge border px-3 py-1 ${STATUS_STYLES[order.status as OrderStatus]} font-medium`}>
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          {order.status === 'pending' && (
            <button
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="flex items-center gap-1 text-sm bg-primary text-white rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" /> إلغاء
            </button>
          )}
        </div>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-100 z-0" />
            <div
              className="absolute left-0 top-4 h-0.5 bg-primary z-0 transition-all duration-500"
              style={{ width: `${currentStepIdx >= 0 ? (currentStepIdx / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
            />
            {STATUS_STEPS.map((step, idx) => {
              const done = idx <= currentStepIdx
              const active = idx === currentStepIdx
              return (
                <div key={step.key} className="flex flex-col items-center gap-2 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                    done ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-300'
                  } ${active ? 'ring-4 ring-primary/20' : ''}`}>
                    {done ? '✓' : idx + 1}
                  </div>
                  <span className={`text-xs font-medium text-center ${done ? 'text-primary' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> منتجات الطلب
            </h2>
            <div className="space-y-4">
              {items.map((item: any) => {
                const img = item.productImages?.[0] || item.product?.images?.[0]?.attach || item.image || item.product_image;
                const iName = item.productName || item.product_name || item.product?.name || 'منتج';
                const iPrice = item.unitPrice || item.unit_price || item.price || 0;
                const iTotal = item.totalPrice || item.total_price || item.total || 0;
                const iDiscount = item.discount || item.discount_amount || 0;

                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 border border-gray-100 p-1">
                      {img ? (
                        <img src={img} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{String(iName)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">الكمية: {item.quantity} × {Number(iPrice).toFixed(2)} ج.م</p>
                      {iDiscount > 0 && (
                        <p className="text-xs text-green-600">-{Number(iDiscount).toFixed(2)} ج.م خصم</p>
                      )}
                    </div>
                    <p className="font-bold text-gray-900 shrink-0">{Number(iTotal).toFixed(2)} ج.م</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Shipping */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> تفاصيل الشحن
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium text-gray-700">هاتف 1:</span> {order.shippingPhone1 || order.shipping_phone1 || order.phone || order.address?.phone || 'غير متوفر'}</p>
              {(order.shippingPhone2 || order.shipping_phone2) && <p><span className="font-medium text-gray-700">هاتف 2:</span> {order.shippingPhone2 || order.shipping_phone2}</p>}
              {(order.shippingTitle || order.shipping_title || order.address?.title) && <p><span className="font-medium text-gray-700">العنوان:</span> {order.shippingTitle || order.shipping_title || order.address?.title}</p>}
              {(order.shippingDescription || order.shipping_description || order.address?.description) && <p className="text-gray-400">{order.shippingDescription || order.shipping_description || order.address?.description}</p>}
              {order.notes && (
                <p className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-500 italic">"{order.notes}"</p>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> الدفع
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>الطريقة</span>
                <span className="font-medium">{PAYMENT_LABELS[pMethod] ?? pMethod}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>الحالة</span>
                <span className={`font-medium ${pStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {PAYMENT_LABELS[pStatus] ?? pStatus}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2 space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>المجموع الجزئي</span>
                  <span>{Number(subtotal).toFixed(2)} ج.م</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> خصم</span>
                    <span>-{Number(discount).toFixed(2)} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>الشحن</span>
                  <span>{Number(shipping) > 0 ? `${Number(shipping).toFixed(2)} ج.م` : 'مجاني'}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                  <span>الإجمالي</span>
                  <span>{Number(total).toFixed(2)} ج.م</span>
                </div>
              </div>
            </div>
          </div>

          {order.coupon && (
            <div className="card p-4">
              <div className="flex items-center gap-2 text-green-600">
                <Tag className="w-4 h-4" />
                <span className="font-medium text-sm">كوبون: {order.coupon.code}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
