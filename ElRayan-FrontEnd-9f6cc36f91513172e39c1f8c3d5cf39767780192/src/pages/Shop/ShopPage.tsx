import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X, ChevronDown, ChevronUp, PackageSearch, Check, ChevronRight } from 'lucide-react'
import { productsApi } from '../../api/products'
import { categoriesApi } from '../../api/categories'
import ProductCard from '../../components/ProductCard'
import Pagination from '../../components/Pagination'
import { ProductSkeleton } from '../../components/Skeleton'
import { resolveName } from '../../utils/localize'

function normList(raw: any): any[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.data)) return raw.data
  if (Array.isArray(raw.items)) return raw.items
  if (raw.data && Array.isArray(raw.data.data)) return raw.data.data
  if (raw.data && Array.isArray(raw.data.items)) return raw.data.items
  return []
}

function normMeta(raw: any) {
  if (!raw) return undefined
  const meta = raw.metadata || raw.meta || (raw.data && raw.data.metadata) || (raw.data && raw.data.meta) || raw
  if (!meta) return undefined
  return {
    total: meta.totalItems ?? meta.total ?? 0,
    totalPages: meta.totalPages ?? meta.last_page ?? 1,
    page: meta.currentPage ?? meta.current_page ?? 1,
    limit: meta.itemsPerPage ?? meta.per_page ?? 20,
  }
}

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

  const products = normList(data?.data?.data || data?.data)
  const meta = normMeta(data?.data?.data || data?.data)

  const categories = normList(categoriesRes?.data?.data || categoriesRes?.data)
  const subCats = normList(subCatsRes?.data?.data || subCatsRes?.data)

  const filteredSubCats = filters.categoryId
    ? subCats.filter(sc => sc.main_category_id === filters.categoryId)
    : []

  const setFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params)
  }

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
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



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header and Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {filters.name ? `نتائج البحث عن "${filters.name}"` : 'جميع المنتجات'}
          </h1>
          {meta && (
            <p className="text-sm font-medium text-gray-500 mt-2 flex items-center gap-2">
              نعرض <span className="text-primary">{meta.total}</span> منتج متوفر
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Custom Styled Select for Sorting */}
          <div className="relative w-full sm:w-auto">
            <select
              className="appearance-none w-full sm:w-auto bg-white border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-xl text-sm font-medium hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
              value={`${filters.sortBy ?? ''}_${filters.sortOrder ?? ''}`}
              onChange={e => {
                const [sortBy, sortOrder] = e.target.value.split('_')
                const params = new URLSearchParams(searchParams)
                if (sortBy) { params.set('sortBy', sortBy); params.set('sortOrder', sortOrder) }
                else { params.delete('sortBy'); params.delete('sortOrder') }
                setSearchParams(params)
              }}
            >
              <option value="_">ترتيب حسب</option>
              {sortOptions.map(o => (
                <option key={o.label} value={`${o.sortBy}_${o.sortOrder}`}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFilters(v => !v)}
            className={`md:hidden flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 border rounded-xl text-sm font-bold transition-all shadow-sm ${
              showFilters 
                ? 'bg-primary border-primary text-white shadow-primary/20 hover:bg-primary/90' 
                : 'bg-white border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            فلاتر متقدمة
            {hasActiveFilters && (
              <span className="flex items-center justify-center w-5 h-5 bg-white text-primary text-xs rounded-full shadow-sm ml-1">
                {Array.from(searchParams.keys()).filter(k => k !== 'page' && k !== 'sortBy' && k !== 'sortOrder').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Subcategory filters (Top Bar) */}
      {(filteredSubCats.length > 0 || hasActiveFilters) && (
        <div className="flex flex-wrap items-center gap-2.5 mb-8">
          {filteredSubCats.length > 0 && <span className="text-sm font-medium text-gray-500 ml-2">الفئات الفرعية:</span>}
          {filteredSubCats.map((sc: any) => {
            const name = resolveName(sc.name) || 'فئة فرعية'
            const isActive = filters.subCategoryId === sc.id
            return (
              <button
                key={sc.id}
                onClick={() => setFilter('subCategoryId', isActive ? undefined : String(sc.id))}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                  isActive 
                    ? 'bg-primary/10 text-primary border-primary/20 shadow-inner' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary hover:text-primary shadow-sm hover:shadow'
                }`}
              >
                {isActive && <Check className="w-3.5 h-3.5" />}
                {name}
              </button>
            )
          })}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-full text-sm font-bold border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1.5 bg-white transition-all shadow-sm ml-auto"
            >
              <X className="w-4 h-4" /> مسح الفلاتر
            </button>
          )}
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className={`w-64 shrink-0 transition-all duration-300 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm sticky top-24">
              <div>
                <h3 className="font-extrabold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-primary rounded-full" />
                  الفئات الرئيسية
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => updateFilters({ categoryId: undefined, subCategoryId: undefined })}
                    className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${
                      !filters.categoryId ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    عرض الكل
                    {!filters.categoryId && <ChevronRight className="w-4 h-4 text-white/70 rotate-180" />}
                  </button>
                  {categories.map((cat: any) => {
                    const name = resolveName(cat.name) || 'فئة'
                    const isActive = filters.categoryId === cat.id
                    return (
                      <button
                        key={cat.id}
                        onClick={() => updateFilters({ categoryId: String(cat.id), subCategoryId: undefined })}
                        className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${
                          isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {name}
                        {isActive && <ChevronRight className="w-4 h-4 text-white/70 rotate-180" />}
                      </button>
                    )
                  })}
                </div>
              </div>


            </div>
          </aside>

        {/* Products grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 20 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm max-w-2xl mx-auto my-10">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <PackageSearch className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">عفواً، لا توجد منتجات</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                لم نتمكن من العثور على أي منتجات تتطابق مع الفلاتر التي اخترتها. جرب إزالة بعض الفلاتر للبحث بشكل أوسع.
              </p>
              <button onClick={clearAllFilters} className="btn-primary px-8 py-3 rounded-xl shadow-lg shadow-primary/20">
                عرض جميع المنتجات
              </button>
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
