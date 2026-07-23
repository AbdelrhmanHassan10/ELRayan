import { useQuery } from '@tanstack/react-query'
import { Tag, Copy, Clock } from 'lucide-react'
import { couponsApi } from '../../api/coupons'
import { PageSpinner } from '../../components/Spinner'
import toast from 'react-hot-toast'
import { resolveName } from '../../utils/localize'
import { Link } from 'react-router-dom'

export default function CouponsPage() {
  const { data: myData, isLoading: loadingMy } = useQuery({
    queryKey: ['my-coupons'],
    queryFn: () => couponsApi.getMyCoupons(),
  })

  const { data: activeData, isLoading: loadingActive } = useQuery({
    queryKey: ['active-coupons'],
    queryFn: () => couponsApi.getActive(),
  })

  const extractCoupons = (res: any) => {
    const data = res?.data?.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const myCoupons = extractCoupons(myData);
  const activeCoupons = extractCoupons(activeData);

  const allCoupons = [...myCoupons, ...activeCoupons].filter(
    (c, idx, arr) => arr.findIndex(x => x.id === c.id) === idx
  )

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`تم النسخ: ${code}`)
  }

  if (loadingMy || loadingActive) return <PageSpinner />

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Tag className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">كوبوناتي</h1>
      </div>

      {allCoupons.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-600">لا توجد كوبونات</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">أدر عجلة الحظ لتربح كوبونات خصم!</p>
          <Link to="/spin-wheel" className="btn-primary">أدر العجلة</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {allCoupons.map((coupon: any) => {
            const isExpired = new Date(coupon.validTo) < new Date()
            const name = resolveName(coupon.name) || coupon.code
            const desc = resolveName(coupon.description)
            const discountLabel = coupon.discountType === 'percentage'
              ? `${coupon.discountValue}% خصم`
              : `${coupon.discountValue} ج.م خصم`

            return (
              <div key={coupon.id} className={`card overflow-hidden ${isExpired ? 'opacity-60' : ''}`}>
                {/* Coupon header */}
                <div className="bg-gradient-to-r from-dark to-dark-light p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-xl">{discountLabel}</p>
                    {name !== coupon.code && (
                      <p className="text-gray-300 text-sm mt-0.5">{name}</p>
                    )}
                  </div>
                  <div className="text-start">
                    <span className={`badge text-xs ${coupon.isActive && !isExpired ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                      {isExpired ? 'منتهي' : coupon.isActive ? 'فعّال' : 'غير فعّال'}
                    </span>
                  </div>
                </div>

                {/* Dashed separator */}
                <div className="flex items-center px-4">
                  <div className="w-4 h-4 rounded-full bg-gray-100 -ms-6 shrink-0" />
                  <div className="flex-1 border-t-2 border-dashed border-gray-100 mx-2" />
                  <div className="w-4 h-4 rounded-full bg-gray-100 -me-6 shrink-0" />
                </div>

                {/* Coupon body */}
                <div className="p-4">
                  <div className="flex items-center gap-2 bg-gray-50 border border-dashed border-gray-200 rounded-lg px-3 py-2">
                    <Tag className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-mono font-bold text-gray-900 tracking-wider flex-1">{coupon.code}</span>
                    <button
                      onClick={() => copyCode(coupon.code)}
                      className="text-primary hover:text-primary-600 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
                    {coupon.minOrderAmount && (
                      <span>الحد الأدنى للطلب: {coupon.minOrderAmount} ج.م</span>
                    )}
                    {coupon.maxDiscountAmount && coupon.discountType === 'percentage' && (
                      <span>أقصى خصم: {coupon.maxDiscountAmount} ج.م</span>
                    )}
                    {coupon.usageLimit && (
                      <span>{coupon.usedCount}/{coupon.usageLimit} استخدام</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      صالح: {new Date(coupon.validFrom).toLocaleDateString('ar-SA')} – {new Date(coupon.validTo).toLocaleDateString('ar-SA')}
                    </span>
                  </div>

                  {desc && <p className="text-xs text-gray-400 mt-2">{desc}</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
