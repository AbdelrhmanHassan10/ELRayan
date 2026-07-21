import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react'
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
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isFav, setIsFav] = useState(product.isFavorite ?? false)
  const [addingToCart, setAddingToCart] = useState(false)

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
    <div className="card group hover:shadow-md transition-shadow duration-300">
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <div className="aspect-square bg-gray-100 overflow-hidden">
            {mainImage ? (
              <img
                src={mainImage}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ShoppingCart className="w-12 h-12" />
              </div>
            )}
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-2 start-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="badge bg-primary text-white">
              {product.discount_type === 'percentage' ? `-${product.discount}%` : `-${product.discount}`}
            </span>
          )}
          {product.isRecommended && (
            <span className="badge bg-yellow-100 text-yellow-800">مميز</span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-gray-200 text-gray-600">نفذ المخزون</span>
          )}
        </div>

        {/* Actions overlay */}
        <div className="absolute top-2 end-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleToggleFavorite}
            className={`w-8 h-8 rounded-full shadow flex items-center justify-center transition-colors ${isFav ? 'bg-primary text-white' : 'bg-white text-gray-400 hover:text-primary'}`}
          >
            <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
          </button>
          <Link to={`/product/${product.id}`}
            className="w-8 h-8 rounded-full shadow bg-white text-gray-400 hover:text-primary flex items-center justify-center transition-colors">
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="p-3">
        <div className="text-xs text-gray-400 mb-1 truncate">
          {resolveName(product.mainCategory?.name)}
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-gray-900">
            {finalPrice.toFixed(2)} ج.م
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Sold count */}
        {product.sold > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-gray-500">{product.sold} مُباع</span>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={addingToCart || product.stock === 0}
          className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {addingToCart ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {product.stock === 0 ? 'نفذ المخزون' : 'أضف للسلة'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
