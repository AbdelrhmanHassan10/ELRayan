import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../../api/products'
import ProductCard from '../../components/ProductCard'
import Pagination from '../../components/Pagination'
import { ProductSkeleton } from '../../components/Skeleton'
import { Sparkles, PackageSearch } from 'lucide-react'

export default function NewArrivalsPage() {
  const [page, setPage] = useState(1)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page])

  const { data, isLoading } = useQuery({
    queryKey: ['new-arrivals-products-page', page],
    queryFn: () => productsApi.getAll({ mostNew: true, page, limit: 21 }),
    staleTime: 1000 * 30,
  })

  const products = data?.data?.data?.items ?? []
  const metadata = data?.data?.data?.metadata
  const meta = metadata ? {
    total: Math.min(metadata.totalItems, 42),
    totalPages: Math.min(metadata.totalPages, 2),
    page: metadata.currentPage,
    limit: metadata.itemsPerPage,
  } : undefined

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary fill-primary/20" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">وصل حديثاً</h1>
          {meta && (
            <p className="text-sm font-medium text-gray-500 mt-1">
              نعرض أحدث <span className="text-primary font-bold">{meta.total}</span> منتج تم إضافتهم
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 15 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm max-w-2xl mx-auto my-10">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <PackageSearch className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mb-2">لا توجد منتجات جديدة حالياً</h3>
          <p className="text-gray-500">
            يبدو أنه لا توجد منتجات مضافة حديثاً في الوقت الحالي. تحقق مرة أخرى لاحقاً!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
          {meta && meta.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  )
}
