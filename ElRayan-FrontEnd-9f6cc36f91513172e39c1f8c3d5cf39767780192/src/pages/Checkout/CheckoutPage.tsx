import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { MapPin, CreditCard, FileText, CheckCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCart } from '../../contexts/CartContext'
import { ordersApi } from '../../api/orders'
import { addressesApi } from '../../api/addresses'
import type { CreateOrderPayload, PaymentMethod } from '../../types'
import toast from 'react-hot-toast'

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'cash_on_delivery', label: 'الدفع عند الاستلام', icon: '💵' },
  { value: 'credit_card', label: 'بطاقة ائتمانية', icon: '💳' },
  { value: 'debit_card', label: 'بطاقة مدى', icon: '💳' },
  { value: 'bank_transfer', label: 'تحويل بنكي', icon: '🏦' },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, fetchCart } = useCart()
  const [placing, setPlacing] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery')

  const { register, handleSubmit, formState: { errors } } = useForm<{ phone1: string; phone2?: string; notes?: string }>()

  const { data: addressRes } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.getAll(),
  })
  const addresses = addressRes?.data?.data ?? []

  if (!cart || cart.items?.length === 0) {
    navigate('/cart')
    return null
  }

  const items = cart.items ?? []

  const defaultAddr = addresses.find((a: any) => a.isDefault)
  const shipping = selectedAddress
    ? addresses.find((a: any) => a.id === selectedAddress)?.zone?.shippingCost ?? cart.shippingAmount
    : defaultAddr?.zone?.shippingCost ?? cart.shippingAmount

  const couponDiscount = cart.coupon
    ? (cart.coupon.discountType === 'percentage'
      ? Math.min(cart.subtotal * cart.coupon.discountValue / 100, cart.coupon.maxDiscountAmount ?? Infinity)
      : cart.coupon.discountValue)
    : cart.discountAmount

  const total = cart.subtotalWithDiscount + shipping

  const onSubmit = async (data: { phone1: string; phone2?: string; notes?: string }) => {
    setPlacing(true)
    try {
      const payload: CreateOrderPayload = {
        shippingAddress: { phone1: data.phone1, phone2: data.phone2 },
        paymentMethod,
        notes: data.notes,
      }
      const res = await ordersApi.create(payload)
      await fetchCart()
      toast.success('تم تقديم الطلب بنجاح!')
      navigate(`/orders/${res.data.data.id}`)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'فشل تقديم الطلب')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">إتمام الطلب</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> تفاصيل الشحن
              </h2>

              {addresses.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">اختر عنواناً محفوظاً:</p>
                  <div className="space-y-2">
                    {addresses.map((addr: any) => (
                      <label key={addr.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${selectedAddress === addr.id || (!selectedAddress && addr.isDefault) ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                        <input
                          type="radio"
                          name="address"
                          className="mt-0.5 text-primary"
                          checked={selectedAddress === addr.id || (!selectedAddress && addr.isDefault)}
                          onChange={() => setSelectedAddress(addr.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{addr.title || addr.type}</p>
                          {addr.description && <p className="text-xs text-gray-400 mt-0.5">{addr.description}</p>}
                          {addr.zone && <p className="text-xs text-primary mt-0.5">الشحن: {addr.zone.shippingCost} ج.م</p>}
                          {addr.isDefault && <span className="badge bg-green-100 text-green-700 mt-1">الافتراضي</span>}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">هاتف 1 *</label>
                  <input
                    {...register('phone1', { required: 'رقم الهاتف مطلوب' })}
                    placeholder="+966 XXX XXX XXXX"
                    className="input"
                  />
                  {errors.phone1 && <p className="text-xs text-red-500 mt-1">{errors.phone1.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">هاتف 2 (اختياري)</label>
                  <input {...register('phone2')} placeholder="+966 XXX XXX XXXX" className="input" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> طريقة الدفع
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(pm => (
                  <label key={pm.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === pm.value ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" name="payment" className="text-primary" checked={paymentMethod === pm.value} onChange={() => setPaymentMethod(pm.value)} />
                    <span className="text-lg">{pm.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{pm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> ملاحظات الطلب
              </h2>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="أي تعليمات خاصة بطلبك..."
                className="input resize-none"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="card p-5 sticky top-20">
              <h2 className="font-bold text-gray-900 mb-4">ملخص الطلب</h2>

              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.productImages?.[0] && (
                        <img src={item.productImages[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.totalPriceWithDiscount.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>المجموع الجزئي</span>
                  <span>{cart.subtotal.toFixed(2)} ج.م</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>الخصم</span>
                    <span>-{couponDiscount.toFixed(2)} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>الشحن</span>
                  <span>{shipping > 0 ? `${shipping.toFixed(2)} ج.م` : 'مجاني'}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                  <span>الإجمالي</span>
                  <span>{total.toFixed(2)} ج.م</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={placing}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-4"
              >
                {placing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><CheckCircle className="w-5 h-5" /> تأكيد الطلب</>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
