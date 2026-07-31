import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, Tag, X, ArrowLeft } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import toast from 'react-hot-toast'
import ConfirmModal from '../../components/ConfirmModal'

export default function CartPage() {
  const { cart, isLoading, updateItem, removeItem, clearCart, applyCoupon, removeCoupon } = useCart()
  const navigate = useNavigate()
  const [couponCode, setCouponCode] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">سلتك فارغة</h2>
        <p className="text-gray-400 mb-6">أضف بعض المنتجات للبدء!</p>
        <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" /> تصفح المنتجات
        </Link>
      </div>
    )
  }

  const items = cart.items ?? []

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setApplyingCoupon(true)
    try {
      await applyCoupon(couponCode.trim())
      setCouponCode('')
      toast.success('تم تطبيق الكوبون بنجاح!')
    } catch (e: any) {
      const data = e?.response?.data;
      let errMsg = data?.message || 'كوبون غير صالح';
      
      if (data?.errors) {
        if (typeof data.errors === 'string') {
          errMsg = data.errors;
        } else if (Array.isArray(data.errors) && data.errors.length > 0) {
          errMsg = data.errors[0].msg || data.errors[0];
        } else if (typeof data.errors === 'object') {
          const firstKey = Object.keys(data.errors)[0];
          if (firstKey && data.errors[firstKey]) {
            errMsg = Array.isArray(data.errors[firstKey]) ? data.errors[firstKey][0] : data.errors[firstKey];
          }
        }
      } else if (data?.error) {
        errMsg = typeof data.error === 'string' ? data.error : data.error.message || errMsg;
      }
      
      toast.error(errMsg)
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon()
      toast.success('تم إزالة الكوبون')
    } catch {
      toast.error('فشل إزالة الكوبون')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">سلة التسوق</h1>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> مسح السلة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const finalPrice = item.discount > 0
              ? (item.discountType === 'percentage'
                ? item.unitPrice - (item.unitPrice * item.discount) / 100
                : item.unitPrice - item.discount)
              : item.unitPrice
            const mainImage = item.productImages?.[0]

            return (
              <div key={item.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex gap-4 sm:gap-5 group relative">
                <Link to={`/product/${item.productId}`} className="shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden flex items-center justify-center relative group-hover:border-primary/20 transition-colors">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={item.productName}
                        className="w-full h-full object-contain p-2 mix-blend-multiply"
                        onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <Link to={`/product/${item.productId}`} className="font-bold text-gray-800 text-sm sm:text-base hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {item.productName}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id).then(() => toast.success('تم الإزالة من السلة')).catch(() => toast.error('فشل'))}
                        className="shrink-0 p-1.5 text-gray-400 bg-gray-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-all opacity-80 group-hover:opacity-100"
                        title="إزالة المنتج"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {!item.inStock && (
                      <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-xs font-medium">
                        نفذ المخزون
                      </span>
                    )}
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                      <button
                        onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-white transition-colors text-gray-600 hover:text-primary"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 sm:w-10 text-center font-bold text-gray-900 text-sm select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-white transition-colors text-gray-600 hover:text-primary"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-end">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="font-black text-lg sm:text-xl text-primary">{(finalPrice * item.quantity).toFixed(2)}</span>
                        <span className="text-xs font-bold text-gray-500">ج.م</span>
                      </div>
                      {item.quantity > 1 && (
                        <p className="text-xs font-medium text-gray-400 mt-0.5">{finalPrice.toFixed(2)} ج.م للوحدة</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-4">ملخص الطلب</h2>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الجزئي ({cart.itemsCount || 0} منتج)</span>
                <span>{(cart.subtotal || 0).toFixed(2)} ج.م</span>
              </div>
              {(cart.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>الخصم</span>
                  <span>-{(cart.discountAmount || 0).toFixed(2)} ج.م</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>الشحن</span>
                <span>{(cart.shippingAmount || 0) > 0 ? `${(cart.shippingAmount || 0).toFixed(2)} ج.م` : (cart.coupon ? 'مجاني' : 'يحسب عند الدفع')}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 mb-4">
              <div className="flex justify-between font-bold text-gray-900">
                <span>الإجمالي</span>
                <span>{(cart.total || 0).toFixed(2)} ج.م</span>
              </div>
            </div>

            {/* Coupon */}
            {cart.coupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-3 py-2 mb-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">{cart.coupon.code}</span>
                </div>
                <button onClick={handleRemoveCoupon} className="text-green-400 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mb-4">
                <input
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="كود الكوبون"
                  className="input flex-1 py-2 text-sm"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                  className="px-4 py-2 bg-dark text-white text-sm rounded-lg hover:bg-dark-light transition-colors disabled:opacity-50 shrink-0"
                >
                  تطبيق
                </button>
              </div>
            )}

            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              إتمام الطلب <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
            <Link to="/shop" className="block text-center text-sm text-primary hover:underline mt-3">
              مواصلة التسوق
            </Link>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearConfirm}
        title="مسح السلة"
        message="هل أنت متأكد من رغبتك في مسح جميع المنتجات من السلة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="نعم، امسح السلة"
        onConfirm={() => {
          clearCart()
          toast.success('تم مسح السلة')
        }}
        onClose={() => setShowClearConfirm(false)}
      />
    </div>
  )
}
