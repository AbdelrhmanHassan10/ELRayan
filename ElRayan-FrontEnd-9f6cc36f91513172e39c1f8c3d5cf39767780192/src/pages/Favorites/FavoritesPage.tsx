import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../../api/products'
import ProductCard from '../../components/ProductCard'
import { ProductSkeleton } from '../../components/Skeleton'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FavoritesPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => productsApi.getAll({ isFavorite: true, limit: 100 }),
  })
  const products = data?.data?.data?.items ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-primary fill-primary" />
        <h1 className="text-2xl font-bold text-gray-900">قائمة الأمنيات</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-600 text-lg">قائمة الأمنيات فارغة</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">احفظ المنتجات التي تعجبك للرجوع إليها لاحقاً</p>
          <Link to="/shop" className="btn-primary">تصفح المنتجات</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {(products as any[]).map((p: any) => (
            <ProductCard
              key={p.id}
              product={{ ...p, isFavorite: true }}
              onFavoriteToggle={() => refetch()}
            />
          ))}
        </div>
      )}
    </div>
  )
}
