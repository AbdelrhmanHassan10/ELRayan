import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Heart, ShoppingCart, Star, Eye, Minus, Plus, Trash2 } from 'lucide-react'
import type { Product } from '../types'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { productsApi } from '../api/products'
import toast from 'react-hot-toast'
import { resolveName } from '../utils/localize'

interface ProductCardProps {
  product: Product
  onFavoriteToggle?: (id: number, isFavorite: boolean) => void
}

export default function ProductCard({ product, onFavoriteToggle }: ProductCardProps) {
  const { cart, addItem, updateItem, removeItem } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isFav, setIsFav] = useState(product.isFavorite ?? false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [updatingCart, setUpdatingCart] = useState(false)

  const cartItem = cart?.items?.find((i) => i.productId === product.id)

  const mainImage = product.images?.[0]?.attach
  const name = resolveName(product.name) || 'منتج'
  const hasDiscount = product.discount > 0
  const finalPrice = hasDiscount
    ? (product.discount_type === 'percentage'
      ? product.price - (product.price * product.discount) / 100
      : product.price - product.discount)
    : product.price

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/login'); return }
    setAddingToCart(true)
    try {
      await addItem(product.id, 1)
      toast.success('تمت الإضافة للسلة!')
    } catch {
      toast.error('فشل الإضافة للسلة')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleUpdateQuantity = async (e: React.MouseEvent, itemId: number, newQty: number) => {
    e.preventDefault()
    if (updatingCart) return
    setUpdatingCart(true)
    try {
      if (newQty <= 0) {
        await removeItem(itemId)
        toast.success('تم الحذف من السلة')
      } else {
        await updateItem(itemId, newQty)
      }
    } catch {
      toast.error('فشل تحديث السلة')
    } finally {
      setUpdatingCart(false)
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/login'); return }
    try {
      await productsApi.toggleFavorite(product.id)
      const newVal = !isFav
      setIsFav(newVal)
      onFavoriteToggle?.(product.id, newVal)
    } catch {
      toast.error('فشل الإجراء')
    }
  }

  return (
    <div className="group hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(200,16,46,0.06)] border border-gray-100 hover:border-primary/30 transition-all duration-300 flex flex-col h-full bg-white rounded-2xl p-1.5">
      {/* Image Area (Square and Compact) */}
      <div className="relative w-full aspect-square rounded-xl bg-gray-50 flex items-center justify-center p-4 overflow-hidden group-hover:bg-primary/5 transition-colors duration-300 shrink-0">

        <Link to={`/product/${product.id}`} className="relative z-10 w-full h-full flex items-center justify-center">
          {mainImage ? (
            <img
              src={mainImage}
              alt={name}
              loading="lazy"
              className="max-w-full max-h-full object-contain group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-300 ease-out"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
            />
          ) : (
            <ShoppingCart className="w-10 h-10 text-gray-300" />
          )}
        </Link>

        {/* Compact Badges */}
        <div className="absolute top-2 start-2 flex flex-col items-start gap-1 z-20">
          {hasDiscount && (
            <span className="bg-primary/95 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {product.discount_type === 'percentage' ? `خصم ${product.discount}%` : `وفر ${product.discount} ج.م`}
            </span>
          )}
          {product.isRecommended && (
            <span className="bg-yellow-400/95 text-yellow-900 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              مُميز
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-gray-900/95 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              نفذت الكمية
            </span>
          )}
        </div>

        {/* Quick Actions overlay */}
        <div className="absolute top-2 end-2 flex flex-col gap-1.5 z-20">
          <button
            onClick={handleToggleFavorite}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 shadow-sm ${isFav ? 'bg-primary text-white' : 'bg-white/95 text-gray-400 hover:text-primary'}`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current scale-110' : ''}`} />
          </button>
          <Link to={`/product/${product.id}`}
            className="w-7 h-7 rounded-full bg-white/95 text-gray-400 hover:text-primary shadow-sm flex items-center justify-center transition-transform duration-200 hover:scale-110">
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Info Area */}
      <div className="px-2 py-2 flex flex-col flex-1 relative z-10">
        <div className="text-[10px] font-bold text-gray-400 mb-1 tracking-wider uppercase">
          {resolveName(product.mainCategory?.name)}
        </div>

        <Link to={`/product/${product.id}`} className="mb-2 flex flex-col">
          <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h3>
          {product.unit && (
            <span className="text-xs text-gray-500 font-medium mt-0.5">
              {product.unit}
            </span>
          )}
        </Link>

        {/* Price & Add to Cart Area */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[10px] text-slate-400 line-through mb-0.5">
                {product.price.toFixed(2)} ج.م
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="font-black text-slate-900 text-lg tracking-tight">
                {finalPrice.toFixed(2)}
              </span>
              <span className="text-[10px] font-bold text-slate-500">ج.م</span>
            </div>
          </div>

          {cartItem ? (
            <div className="flex items-center bg-slate-900 text-white rounded-full p-1 shadow-md">
              <button
                onClick={(e) => handleUpdateQuantity(e, cartItem.id, cartItem.quantity + 1)}
                disabled={updatingCart || cartItem.quantity >= product.stock}
                className="w-7 h-7 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="font-bold w-6 text-center text-sm text-white">
                {updatingCart ? <span className="block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : cartItem.quantity}
              </span>
              <button
                onClick={(e) => handleUpdateQuantity(e, cartItem.id, cartItem.quantity - 1)}
                disabled={updatingCart}
                className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors disabled:opacity-50 ${cartItem.quantity === 1 ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 hover:text-white' : 'bg-white/10 hover:bg-white/20'}`}
              >
                {cartItem.quantity === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              className={`w-9 h-9 flex shrink-0 items-center justify-center rounded-full transition-colors duration-200 shadow-sm ${product.stock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-primary text-white hover:bg-primary-600'
                }`}
            >
              {addingToCart ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
