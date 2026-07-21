import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'
import { productsApi } from '../../api/products'
import { categoriesApi } from '../../api/categories'
import ProductCard from '../../components/ProductCard'
import Pagination from '../../components/Pagination'
import { ProductSkeleton } from '../../components/Skeleton'
import { resolveName } from '../../utils/localize'

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  const filters = {
    name: searchParams.get('name') || undefined,
    categoryId: searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined,
    subCategoryId: searchParams.get('subCategoryId') ? Number(searchParams.get('subCategoryId')) : undefined,
    isFavorite: searchParams.get('isFavorite') === 'true' || undefined,
    mostSold: searchParams.get('mostSold') === 'true' || undefined,
    mostNew: searchParams.get('mostNew') === 'true' || undefined,
    recommended: searchParams.get('recommended') === 'true' || undefined,
    discounted: searchParams.get('discounted') === 'true' || undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'ASC' | 'DESC') || undefined,
  }

  useEffect(() => { setPage(1) }, [searchParams.toString()])

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters, page],
    queryFn: () => productsApi.getAll({ ...filters, page, limit: 20 }),
    staleTime: 1000 * 30,
  })

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  })

  const { data: subCatsRes } = useQuery({
    queryKey: ['sub-categories'],
    queryFn: () => categoriesApi.getAllSubCategories(),
  })

  // Products API: data.items + data.metadata
  const products = data?.data?.data?.items ?? []
  const metadata = data?.data?.data?.metadata
  const meta = metadata ? {
    total: metadata.totalItems,
    totalPages: metadata.totalPages,
    page: metadata.currentPage,
    limit: metadata.itemsPerPage,
  } : undefined

  // Categories: normalise (may be array or {data:[]} shape)
  const rawCats = categoriesRes?.data?.data
  const categories: any[] = Array.isArray(rawCats) ? rawCats : (rawCats as any)?.data ?? []
  const rawSubCats = subCatsRes?.data?.data
  const subCats: any[] = Array.isArray(rawSubCats) ? rawSubCats : (rawSubCats as any)?.data ?? []

  const filteredSubCats = filters.categoryId
    ? subCats.filter(sc => sc.main_category_id === filters.categoryId)
    : subCats

  const setFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params)
  }

  const clearAllFilters = () => setSearchParams(new URLSearchParams())

  const hasActiveFilters = Array.from(searchParams.keys()).length > 0

  const sortOptions = [
    { label: 'الأحدث', sortBy: 'createdAt', sortOrder: 'DESC' },
    { label: 'السعر: الأقل', sortBy: 'price', sortOrder: 'ASC' },
    { label: 'السعر: الأعلى', sortBy: 'price', sortOrder: 'DESC' },
    { label: 'الأكثر مبيعاً', sortBy: 'sold', sortOrder: 'DESC' },
  ]

  const quickFilters = [
    { label: 'مميز', key: 'recommended', value: 'true' },
    { label: 'تخفيضات', key: 'discounted', value: 'true' },
    { label: 'جديد', key: 'mostNew', value: 'true' },
    { label: 'الأكثر مبيعاً', key: 'mostSold', value: 'true' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {filters.name ? `نتائج "${filters.name}"` : 'المتجر'}
          </h1>
          {meta && (
            <p className="text-sm text-gray-400 mt-1">{meta.total} منتج</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            className="input text-sm w-auto py-2"
            value={`${filters.sortBy ?? ''}_${filters.sortOrder ?? ''}`}
            onChange={e => {
              const [sortBy, sortOrder] = e.target.value.split('_')
              const params = new URLSearchParams(searchParams)
              if (sortBy) { params.set('sortBy', sortBy); params.set('sortOrder', sortOrder) }
              else { params.delete('sortBy'); params.delete('sortOrder') }
              setSearchParams(params)
            }}
          >
            <option value="_">ترتيب</option>
            {sortOptions.map(o => (
              <option key={o.label} value={`${o.sortBy}_${o.sortOrder}`}>{o.label}</option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-primary hover:text-primary transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            فلترة
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {quickFilters.map(qf => {
          const isActive = searchParams.get(qf.key) === qf.value
          return (
            <button
              key={qf.key}
              onClick={() => setFilter(qf.key, isActive ? undefined : qf.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                isActive ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary bg-white'
              }`}
            >
              {qf.label}
            </button>
          )
        })}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-1.5 rounded-full text-sm font-medium border border-red-200 text-red-500 hover:bg-red-50 flex items-center gap-1 bg-white transition-colors"
          >
            <X className="w-3 h-3" /> مسح الكل
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        {showFilters && (
          <aside className="w-56 shrink-0">
            <div className="card p-4 space-y-5 sticky top-20">
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-3">الفئة</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => { setFilter('categoryId', undefined); setFilter('subCategoryId', undefined) }}
                    className={`w-full text-right px-3 py-1.5 rounded-lg text-sm transition-colors ${!filters.categoryId ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    كل الفئات
                  </button>
                  {categories.map((cat: any) => {
                    const name = resolveName(cat.name) || 'فئة'
                    return (
                      <button
                        key={cat.id}
                        onClick={() => { setFilter('categoryId', String(cat.id)); setFilter('subCategoryId', undefined) }}
                        className={`w-full text-right px-3 py-1.5 rounded-lg text-sm transition-colors ${filters.categoryId === cat.id ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {filteredSubCats.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">الفئة الفرعية</h3>
                  <div className="space-y-1">
                    {filteredSubCats.map((sc: any) => {
                      const name = resolveName(sc.name) || 'فئة فرعية'
                      return (
                        <button
                          key={sc.id}
                          onClick={() => setFilter('subCategoryId', filters.subCategoryId === sc.id ? undefined : String(sc.id))}
                          className={`w-full text-right px-3 py-1.5 rounded-lg text-sm transition-colors ${filters.subCategoryId === sc.id ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          {name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Products grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 20 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-medium text-gray-600 text-lg">لا توجد منتجات</p>
              <p className="text-sm mt-1">جرّب تغيير الفلاتر</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
              </div>
              {meta && (
                <Pagination
                  currentPage={page}
                  totalPages={meta.totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
