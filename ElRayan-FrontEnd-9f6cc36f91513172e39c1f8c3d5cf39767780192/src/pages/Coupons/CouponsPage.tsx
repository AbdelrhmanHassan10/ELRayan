import { useQuery } from '@tanstack/react-query'
import { Tag, Copy, Clock, ShoppingCart, CheckCircle, Package, Layers, ArrowLeft } from 'lucide-react'
import { couponsApi } from '../../api/coupons'
import { PageSpinner } from '../../components/Spinner'
import toast from 'react-hot-toast'
import { resolveName } from '../../utils/localize'
import { Link, useNavigate } from 'react-router-dom'

export default function CouponsPage() {
  const navigate = useNavigate();

  const { data: myData, isLoading: loadingMy } = useQuery({
    queryKey: ['my-coupons'],
    queryFn: () => couponsApi.getMyCoupons(),
  })

  const extractCoupons = (res: any): any[] => {
    if (!res) return [];

    const findArray = (obj: any, depth = 0): any[] | null => {
      if (depth > 3 || !obj) return null;
      if (Array.isArray(obj)) return obj;
      if (typeof obj !== 'object') return null;

      for (const key of ['data', 'items', 'coupons', 'result', 'payload']) {
        if (Array.isArray(obj[key])) return obj[key];
      }

      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object') {
          const arr = findArray(obj[key], depth + 1);
          if (arr) return arr;
        }
      }
      return null;
    }

    return findArray(res) || [];
  };

  const allCoupons = extractCoupons(myData);

  const handleUseCoupon = (code: string, url: string = '/shop') => {
    navigator.clipboard.writeText(code)
    toast.success(`تم نسخ الكوبون: ${code}، تسوق الآن!`, { icon: '🥳' })
    navigate(url)
  }

  if (loadingMy) return <PageSpinner />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Tag className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">محفظة الكوبونات</h1>
          <p className="text-gray-500 mt-1">جميع العروض وخصوماتك المتاحة في مكان واحد</p>
        </div>
      </div>

      {allCoupons.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="font-bold text-xl text-gray-900">محفظتك فارغة حالياً</h3>
          <p className="text-gray-500 mt-2 mb-8 max-w-md mx-auto">أدر عجلة الحظ الآن لتربح كوبونات خصم وهدايا قيمة تستخدمها في مشترياتك القادمة!</p>
          <Link to="/spin-wheel" className="btn-primary py-3 px-8 text-lg shadow-lg shadow-primary/30">
            أدر العجلة واربح
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allCoupons.map((coupon: any) => {
            const isExpired = coupon.validTo ? new Date(coupon.validTo) < new Date() : false;
            const isFullyUsed = (coupon.usageLimit && coupon.usedCount !== undefined) ? coupon.usedCount >= coupon.usageLimit : false;

            // Assume active unless explicitly marked otherwise
            const isActive = coupon.isActive !== false && coupon.status !== 'inactive';
            const isUsable = isActive && !isExpired && !isFullyUsed;

            const name = resolveName(coupon.name) || coupon.code
            const desc = resolveName(coupon.description)

            // Extract possible image
            const linkedProductImage = coupon.products?.[0]?.images?.[0]?.attach || coupon.product?.images?.[0]?.attach;
            const linkedCategoryImage = coupon.categories?.[0]?.icon || coupon.category?.icon;
            const imageStr = coupon.image || coupon.imagePath || coupon.imageUrl || coupon.icon || linkedProductImage || linkedCategoryImage;

            // Format discount gracefully
            const val = Number(coupon.discountValue || 0);
            const formattedVal = val % 1 === 0 ? val : val.toFixed(2);

            let discountLabel = '';
            let discountSuffix = '';

            const isFreeShipping = coupon.discountType === 'free_shipping' || coupon.isFreeShipping;

            if (isFreeShipping) {
              discountLabel = 'شحن مجاني';
            } else if (coupon.discountType === 'percentage') {
              discountLabel = `${formattedVal}%`;
              discountSuffix = 'خصم';
            } else {
              discountLabel = `${formattedVal} ج.م`;
              discountSuffix = 'خصم';
            }

            // Linked product/category info (if backend provides it)
            const linkedProducts = Array.isArray(coupon.products) && coupon.products.length > 0
              ? coupon.products
              : (coupon.product ? [coupon.product] : (coupon.productName ? [{ name: coupon.productName }] : []));

            const isMultiProduct = linkedProducts.length > 1;

            const linkedProduct = linkedProducts[0] || null;
            const linkedCategory = coupon.categories?.[0] || coupon.category || coupon.categoryName || null;

            const linkedProductName = resolveName(linkedProduct?.name) || resolveName(linkedProduct);
            const linkedCategoryName = resolveName(linkedCategory?.name) || resolveName(linkedCategory);

            let targetUrl = '/shop';
            if (linkedProduct?.id) {
              targetUrl = `/product/${linkedProduct.id}`;
            } else if (linkedCategory?.id) {
              targetUrl = `/shop?category=${linkedCategory.id}`;
            }

            return (
              <div
                key={coupon.id}
                className={`relative flex flex-col bg-white rounded-3xl overflow-hidden border transition-all duration-300 ${isUsable
                    ? 'border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-1'
                    : 'border-gray-200 shadow-sm opacity-75 grayscale-[0.3]'
                  }`}
              >
                {/* Ribbon for status */}
                {!isUsable && (
                  <div className="absolute top-4 left-4 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full border border-gray-200 z-10">
                    {isExpired ? 'منتهي الصلاحية' : isFullyUsed ? 'تم الاستخدام' : 'غير متاح'}
                  </div>
                )}
                {isUsable && (
                  <div className="absolute top-4 left-4 bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full border border-green-200 z-10 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> متاح للاستخدام
                  </div>
                )}

                {/* Top Section: Discount Details */}
                <div className="p-6 pb-8 bg-gray-50">
                  <div className="flex justify-between items-start mb-4 mt-2">
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`${isMultiProduct ? 'text-3xl' : 'text-4xl sm:text-5xl'} font-black tracking-tight ${isUsable ? 'text-primary' : 'text-gray-500'}`}>
                          {discountLabel}
                        </span>
                        {discountSuffix && (
                          <span className={`${isMultiProduct ? 'text-lg' : 'text-xl'} font-bold ${isUsable ? 'text-primary/80' : 'text-gray-400'}`}>
                            {discountSuffix}
                          </span>
                        )}
                      </div>
                      {/* Name removed per user request */}
                    </div>
                    {imageStr && !isMultiProduct && (
                      <div className="shrink-0 ms-4">
                        <img
                          src={imageStr}
                          alt={name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl shadow-md border-2 border-white"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Conditions & Links */}
                  <div className="space-y-3 mt-4">
                    {linkedProducts.length === 1 && (
                      <Link to={`/product/${linkedProducts[0].id || ''}`} className="flex items-center justify-between w-full p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all group cursor-pointer mt-3">
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-bold text-gray-500 mb-0.5 font-[Cairo]">مخصص لمنتج:</span>
                          <span className="text-sm font-bold text-gray-900 line-clamp-1 font-[Cairo]">{resolveName(linkedProducts[0]?.name) || 'منتج محدد'}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0 ms-2 transition-transform group-hover:-translate-x-1">
                          <ArrowLeft className="w-4 h-4" />
                        </div>
                      </Link>
                    )}

                    {isMultiProduct && (
                      <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
                        <span className="text-[11px] font-bold text-gray-500 mb-3 block font-[Cairo]">المنتجات المشمولة في الخصم:</span>
                        <div className="flex gap-3 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: 'none' }}>
                          {linkedProducts.map((prod: any, idx: number) => {
                            const pName = resolveName(prod?.name) || resolveName(prod);
                            const pImage = prod?.images?.[0]?.attach || prod?.image || '';
                            return (
                              <Link key={prod?.id || idx} to={`/product/${prod?.id || ''}`} className="flex flex-col items-center gap-2 min-w-[72px] w-[72px] group snap-start">
                                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden group-hover:border-primary/30 group-hover:shadow-md transition-all flex-shrink-0">
                                  {pImage ? (
                                    <img src={pImage} alt={pName} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                                      <Package className="w-6 h-6" />
                                    </div>
                                  )}
                                </div>
                                <span className="text-[10px] font-bold text-gray-700 text-center line-clamp-2 leading-tight font-[Cairo] group-hover:text-primary transition-colors w-full">{pName || 'منتج'}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {linkedCategory && (
                      <Link to={`/shop?category=${linkedCategory.id || ''}`} className="flex items-center justify-between w-full p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all group cursor-pointer mt-3">
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-bold text-gray-500 mb-0.5 font-[Cairo]">مخصص لقسم:</span>
                          <span className="text-sm font-bold text-gray-900 line-clamp-1 font-[Cairo]">{linkedCategoryName || 'قسم محدد'}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0 ms-2 transition-transform group-hover:-translate-x-1">
                          <ArrowLeft className="w-4 h-4" />
                        </div>
                      </Link>
                    )}
                    {coupon.isFirstOrderOnly && (
                      <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg font-medium w-max mt-2">
                        <span>✨ صالح لأول طلب لك فقط</span>
                      </div>
                    )}
                    {desc && desc.trim() !== discountLabel && desc.trim() !== 'شحن مجانى' && desc.trim() !== name?.trim() && (
                      <p className="text-sm text-gray-600 leading-relaxed mt-2">{desc}</p>
                    )}
                  </div>
                </div>

                {/* Scalloped Divider */}
                <div className="relative flex items-center px-4 -my-3 z-10">
                  <div className={`w-6 h-6 rounded-full -ms-7 shadow-inner ${isUsable ? 'bg-primary' : 'bg-gray-50'}`} />
                  <div className={`flex-1 border-t-2 border-dashed mx-2 ${isUsable ? 'border-primary/20' : 'border-gray-300'}`} />
                  <div className={`w-6 h-6 rounded-full -me-7 shadow-inner ${isUsable ? 'bg-primary' : 'bg-gray-50'}`} />
                </div>

                {/* Bottom Section: Code & Action */}
                <div className="p-6 pt-8 bg-white flex flex-col grow justify-between">
                  <div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-gray-500 mb-5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      {coupon.minOrderAmount > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">•</span> الحد الأدنى: {coupon.minOrderAmount} ج.م
                        </div>
                      )}
                      {coupon.maxDiscountAmount > 0 && coupon.discountType === 'percentage' && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">•</span> أقصى خصم: {coupon.maxDiscountAmount} ج.م
                        </div>
                      )}
                      <div className="flex items-center gap-1 w-full mt-1 text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        صالح حتى: {new Date(coupon.validTo).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-auto">
                    <p className="text-sm font-bold text-gray-500 text-center -mb-1 mt-2">كود الخصم:</p>
                    <button
                      onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success('تم نسخ كود الخصم!'); }}
                      className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl p-3 relative overflow-hidden group hover:bg-primary/10 transition-colors cursor-copy"
                      title="انسخ الكود"
                    >
                      <span className="font-mono font-black text-xl text-primary tracking-widest w-full text-center">
                        {coupon.code}
                      </span>
                      <Copy className="w-5 h-5 text-primary/60 group-hover:text-primary shrink-0 transition-colors" />
                    </button>

                    <button
                      onClick={() => handleUseCoupon(coupon.code, targetUrl)}
                      disabled={!isUsable}
                      className={`w-full py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isUsable
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30 hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {isUsable ? (
                        <>
                          <ShoppingCart className="w-5 h-5" /> تسوق الآن
                        </>
                      ) : (
                        'غير متاح للاستخدام'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
