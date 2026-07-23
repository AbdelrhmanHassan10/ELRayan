import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Heart, ShoppingCart, Star, Eye, Minus, Plus } from 'lucide-react'
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
    <div className="group hover:shadow-[0_8px_30px_rgba(200,16,46,0.12)] border border-gray-100 hover:border-primary/20 transition-all duration-300 flex flex-col h-full bg-white rounded-3xl p-2">
      {/* Image Area with Premium Glow */}
      <div className="relative w-full aspect-[4/5] rounded-[1.5rem] bg-gradient-to-br from-gray-50 to-gray-100/50 flex items-center justify-center p-6 overflow-hidden group-hover:from-rose-50/50 group-hover:to-orange-50/50 transition-colors duration-500 shrink-0">
        
        {/* Soft background glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(200,16,46,0.05)_0%,transparent_70%)]" />

        <Link to={`/product/${product.id}`} className="relative z-10 w-full h-full flex items-center justify-center">
          {mainImage ? (
            <img
              src={mainImage}
              alt={name}
              className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-xl group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
            />
          ) : (
            <ShoppingCart className="w-12 h-12 text-gray-300 drop-shadow-sm" />
          )}
        </Link>

        {/* Premium Glass Badges */}
        <div className="absolute top-3 start-3 flex flex-col items-start gap-1.5 z-20">
          {hasDiscount && (
            <span className="bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-primary/20">
              {product.discount_type === 'percentage' ? `خصم ${product.discount}%` : `وفر ${product.discount} ج.م`}
            </span>
          )}
          {product.isRecommended && (
            <span className="bg-yellow-400/90 backdrop-blur-md text-yellow-900 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-yellow-400/20">
              مُميز
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-gray-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
              نفذت الكمية
            </span>
          )}
        </div>

        {/* Quick Actions overlay */}
        <div className="absolute top-3 end-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 z-20">
          <button
            onClick={handleToggleFavorite}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl backdrop-blur-md ${isFav ? 'bg-primary text-white shadow-primary/30' : 'bg-white/90 text-gray-400 hover:text-primary hover:bg-white'}`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current scale-110' : ''}`} />
          </button>
          <Link to={`/product/${product.id}`}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-gray-400 hover:text-primary hover:bg-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110">
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Info Area */}
      <div className="px-1 py-4 flex flex-col flex-1 relative z-10">
        <div className="text-[10px] font-bold text-gray-400 mb-1.5 tracking-wider uppercase">
          {resolveName(product.mainCategory?.name)}
        </div>
        
        <Link to={`/product/${product.id}`} className="mb-3">
          <h3 className="font-extrabold text-gray-800 text-sm md:text-base line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Price & Add to Cart Area */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through mb-0.5">
                {product.price.toFixed(2)} ج.م
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="font-black text-gray-900 text-xl tracking-tight">
                {finalPrice.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-gray-500">ج.م</span>
            </div>
          </div>

          {cartItem ? (
            <div className="flex items-center bg-gray-900 text-white rounded-full p-1 shadow-xl shadow-gray-900/20">
              <button
                onClick={(e) => handleUpdateQuantity(e, cartItem.id, cartItem.quantity + 1)}
                disabled={updatingCart || cartItem.quantity >= product.stock}
                className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="font-bold w-6 text-center text-sm">
                {updatingCart ? <span className="block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : cartItem.quantity}
              </span>
              <button
                onClick={(e) => handleUpdateQuantity(e, cartItem.id, cartItem.quantity - 1)}
                disabled={updatingCart}
                className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              className={`w-11 h-11 flex shrink-0 items-center justify-center rounded-full transition-all duration-300 shadow-lg ${
                product.stock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-primary text-white hover:bg-primary-600 shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 hover:scale-105'
              }`}
            >
              {addingToCart ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </button>
        )}
      </div>
      </div>
    </div>
  )
}
