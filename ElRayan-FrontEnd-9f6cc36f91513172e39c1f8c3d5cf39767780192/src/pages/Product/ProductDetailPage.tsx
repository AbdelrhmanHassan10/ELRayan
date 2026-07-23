import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, Heart, Minus, Plus, ArrowRight, Star, Package, Tag, Trash2 } from 'lucide-react'
import { productsApi } from '../../api/products'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import StarRating from '../../components/StarRating'
import { PageSpinner } from '../../components/Spinner'
import toast from 'react-hot-toast'
import { resolveName } from '../../utils/localize'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem, updateItem, removeItem, cart } = useCart()
  const { isAuthenticated } = useAuth()
  const [qty, setQty] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFav, setIsFav] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [isUpdatingCart, setIsUpdatingCart] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(Number(id)),
    enabled: !!id,
  })

  const product = data?.data?.data

  if (isLoading) return <PageSpinner />
  if (isError || !product) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">المنتج غير موجود.</p>
        <Link to="/shop" className="btn-primary">العودة للمتجر</Link>
      </div>
    )
  }

  const name = resolveName(product.name) || 'منتج'
  const description = resolveName(product.description)
  const details = resolveName(product.details)
  const hasDiscount = product.discount > 0
  const finalPrice = hasDiscount
    ? (product.discount_type === 'percentage'
      ? product.price - (product.price * product.discount) / 100
      : product.price - product.discount)
    : product.price

  const cartItem = cart?.items?.find(item => item.productId === product.id)
  const displayQty = cartItem ? cartItem.quantity : qty

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setAddingToCart(true)
    try {
      await addItem(product.id, displayQty)
      toast.success('تمت الإضافة للسلة!')
    } catch {
      toast.error('فشل الإضافة للسلة')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleUpdateCartQty = async (newQty: number) => {
    if (!cartItem) return;
    setIsUpdatingCart(true)
    try {
      if (newQty === 0) {
        await removeItem(cartItem.id)
        toast.success('تم إزالة المنتج من السلة')
      } else {
        await updateItem(cartItem.id, newQty)
      }
    } catch {
      toast.error('فشل تحديث الكمية')
    } finally {
      setIsUpdatingCart(false)
    }
  }

  const handleFavorite = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    try {
      await productsApi.toggleFavorite(product.id)
      setIsFav(v => !v)
      toast.success(isFav ? 'تم الإزالة من المفضلة' : 'تمت الإضافة للمفضلة')
    } catch {
      toast.error('فشل الإجراء')
    }
  }

  const productImages = product.images || (product as any).productImages || []
  const normImages = productImages.map((img: any) => typeof img === 'string' ? img : img?.attach || img?.url || '').filter(Boolean)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-primary transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180" /> رجوع
        </button>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary">المتجر</Link>
        {product.mainCategory && (
          <>
            <span>/</span>
            <Link to={`/shop?categoryId=${product.main_category_id}`} className="hover:text-primary">
              {resolveName(product.mainCategory.name)}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-700 truncate max-w-xs">{String(name)}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="flex flex-col h-full gap-4">
          <div className="flex-1 min-h-[300px] bg-white rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center p-4">
            {normImages[selectedImage] ? (
              <img
                src={normImages[selectedImage]}
                alt={String(name)}
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: 'calc(100vh - 300px)' }}
                onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package className="w-16 h-16" />
              </div>
            )}
          </div>
          {normImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 mt-auto">
              {normImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-colors ${
                    idx === selectedImage ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {/* Category badges */}
          <div className="flex flex-wrap gap-2">
            {product.mainCategory && (
              <span className="badge bg-gray-100 text-gray-600">
                {resolveName(product.mainCategory.name)}
              </span>
            )}
            {product.subCategory && (
              <span className="badge bg-primary/10 text-primary">
                {resolveName(product.subCategory.name)}
              </span>
            )}
            {product.isFeatured && <span className="badge bg-yellow-50 text-yellow-700">مميز</span>}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{String(name)}</h1>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-gray-900">{finalPrice.toFixed(2)} <span className="text-base font-medium text-gray-500">ج.م</span></span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">{product.price.toFixed(2)}</span>
                <span className="badge bg-primary text-white">
                  {product.discount_type === 'percentage' ? `خصم ${product.discount}%` : `خصم ${product.discount} ج.م.`}
                </span>
              </>
            )}
          </div>

          {/* Stock Availability */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-400'}`} />
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? 'متوفر في المخزون' : 'نفذ المخزون'}
            </span>
          </div>

          {/* Unit */}
          {product.unit && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Tag className="w-4 h-4" />
              <span>الوحدة: {product.unit}</span>
            </div>
          )}

          {/* Description */}
          {description && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">الوصف</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{String(description)}</p>
            </div>
          )}

          {/* Details */}
          {details && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">التفاصيل</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{String(details)}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">الكمية:</span>
                <div className={`flex items-center border border-gray-200 rounded-lg overflow-hidden ${isUpdatingCart ? 'opacity-50 pointer-events-none' : ''}`}>
                  <button
                    onClick={() => {
                      if (cartItem) {
                        handleUpdateCartQty(cartItem.quantity - 1)
                      } else {
                        setQty(v => Math.max(1, v - 1))
                      }
                    }}
                    disabled={!cartItem && qty <= 1}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {cartItem && cartItem.quantity === 1 ? (
                      <Trash2 className="w-4 h-4 text-red-500" />
                    ) : (
                      <Minus className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <span className="px-4 py-2 font-semibold text-gray-900 min-w-[40px] text-center">{displayQty}</span>
                  <button
                    onClick={() => {
                      if (cartItem) {
                        handleUpdateCartQty(Math.min(product.stock, cartItem.quantity + 1))
                      } else {
                        setQty(v => Math.min(product.stock, v + 1))
                      }
                    }}
                    disabled={displayQty >= product.stock}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {product.stock > 0 ? (
                cartItem ? (
                  <Link
                    to="/cart"
                    className="flex-1 btn-primary !bg-emerald-600 hover:!bg-emerald-700 !shadow-emerald-600/30 flex items-center justify-center gap-2 py-3 text-base"
                  >
                    <ShoppingCart className="w-5 h-5" /> المنتج في السلة - عرض السلة
                  </Link>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-base"
                  >
                    {addingToCart
                      ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><ShoppingCart className="w-5 h-5" /> أضف للسلة</>
                    }
                  </button>
                )
              ) : (
                <div className="flex-1 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium text-center flex items-center justify-center">
                  المنتج غير متوفر حالياً.
                </div>
              )}
              
              <button
                onClick={handleFavorite}
                className={`p-3 border-2 rounded-lg transition-colors ${isFav ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-400 hover:border-primary hover:text-primary'}`}
              >
                <Heart className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
