import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { ChevronRight, Zap, TrendingUp, Gift, Star, ArrowRight } from 'lucide-react'
import { bannersApi } from '../../api/banners'
import { productsApi } from '../../api/products'
import { categoriesApi } from '../../api/categories'
import ProductCard from '../../components/ProductCard'
import { ProductSkeleton } from '../../components/Skeleton'
import { resolveName } from '../../utils/localize'

function normCats(raw: any): any[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.data)) return raw.data
  if (Array.isArray(raw.items)) return raw.items
  return []
}

export default function HomePage() {
  const { data: bannerRes } = useQuery({
    queryKey: ['banners'],
    queryFn: () => bannersApi.getAll(),
  })

  const { data: featuredRes, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.getAll({ recommended: true, limit: 8 }),
  })

  const { data: newRes, isLoading: loadingNew } = useQuery({
    queryKey: ['new-products'],
    queryFn: () => productsApi.getAll({ mostNew: true, limit: 8 }),
  })

  const { data: saleRes, isLoading: loadingSale } = useQuery({
    queryKey: ['sale-products'],
    queryFn: () => productsApi.getAll({ discounted: true, limit: 8 }),
  })

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  })

  // Banners: API returns data as Banner[] directly
  const banners = bannerRes?.data?.data
    ? (Array.isArray(bannerRes.data.data) ? bannerRes.data.data : [])
    : []

  // Products: API returns data.items
  const featured = featuredRes?.data?.data?.items ?? []
  const newest = newRes?.data?.data?.items ?? []
  const onSale = saleRes?.data?.data?.items ?? []

  // Categories: normalise
  const categories = normCats(categoriesRes?.data?.data)

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-dark">
        {banners.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation
            loop={banners.length > 1}
            className="h-64 sm:h-80 md:h-[440px]"
          >
            {banners.map((banner: any) => (
              <SwiperSlide key={banner.id}>
                <div className="relative w-full h-full overflow-hidden">
                  {banner.imagePath ? (
                    <>
                      <img
                        src={banner.imagePath}
                        alt={banner.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      {/* Text overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                        <h2 className="text-2xl md:text-4xl font-bold mb-2 leading-tight">{banner.title}</h2>
                        {banner.description && (
                          <p className="text-gray-200 text-sm md:text-base mb-4 max-w-xl">{banner.description}</p>
                        )}
                        <div className="flex gap-3">
                          {banner.productId ? (
                            <Link to={`/product/${banner.productId}`}
                              className="btn-primary inline-flex items-center gap-2 py-2 px-5 text-sm">
                              تسوق الآن <ArrowRight className="w-4 h-4" />
                            </Link>
                          ) : banner.link && banner.link !== '.' ? (
                            <a href={banner.link}
                              className="btn-primary inline-flex items-center gap-2 py-2 px-5 text-sm">
                              اكتشف المزيد <ArrowRight className="w-4 h-4" />
                            </a>
                          ) : (
                            <Link to="/shop"
                              className="btn-primary inline-flex items-center gap-2 py-2 px-5 text-sm">
                              تسوق الآن <ArrowRight className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-dark to-dark-light flex items-center justify-center">
                      <div className="text-center text-white px-8">
                        <h2 className="text-3xl md:text-5xl font-bold mb-3">{banner.title}</h2>
                        {banner.description && (
                          <p className="text-gray-300 mb-6 text-lg">{banner.description}</p>
                        )}
                        <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
                          تسوق الآن <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          // Default hero when no banners
          <div className="relative bg-gradient-to-br from-dark via-dark-light to-[#1a0a0e] min-h-[420px] flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row items-center gap-8 w-full">
              <div className="flex-1 text-white text-center md:text-right">
                <span className="badge bg-primary text-white text-sm px-4 py-1.5 mb-6 inline-block">تشكيلة جديدة</span>
                <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                  تسوق بذكاء،<br />
                  <span className="text-primary">تسوق من الريان</span>
                </h1>
                <p className="text-gray-300 text-lg mb-8 max-w-md">
                  اكتشف آلاف المنتجات الجودة بأسعار لا تُقاوم.
                </p>
                <div className="flex gap-4 justify-center md:justify-end">
                  <Link to="/shop" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
                    تسوق الآن <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/shop?discounted=true" className="border-2 border-white text-white hover:bg-white hover:text-dark inline-flex items-center gap-2 text-lg px-8 py-3 rounded-lg font-semibold transition-colors">
                    العروض
                  </Link>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative">
                  <div className="w-64 h-64 md:w-80 md:h-80 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 md:w-64 md:h-64 bg-primary/30 rounded-full flex items-center justify-center">
                      <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                        <path d="M20 45 L35 45 L35 38 C35 32 38 28 44 26 L56 26 C62 28 65 32 65 38 L65 45 L80 45 L75 72 C74 76 71 78 67 78 L33 78 C29 78 26 76 25 72 Z" stroke="white" strokeWidth="4" fill="none" strokeLinejoin="round"/>
                        <path d="M42 50 L47 56 L58 44" stroke="#C8102E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="40" cy="84" r="4" fill="white"/>
                        <circle cx="60" cy="84" r="4" fill="white"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Features strip */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Zap, title: 'توصيل سريع', titleEn: 'Fast Delivery', desc: 'شحن سريع وموثوق' },
              { icon: Star, title: 'جودة عالية', titleEn: 'Quality Products', desc: 'منتجات موثّقة ومضمونة' },
              { icon: Gift, title: 'عروض مميزة', titleEn: 'Great Offers', desc: 'كوبونات وعجلة الحظ' },
              { icon: TrendingUp, title: 'أفضل الأسعار', titleEn: 'Best Prices', desc: 'أسعار تنافسية ومعقولة' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">تسوق حسب الفئة</h2>
            <Link to="/shop" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              الكل <ChevronRight className="w-4 h-4 rotate-180" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat: any) => {
              const catName = resolveName(cat.name) || 'فئة'
              return (
                <Link
                  key={cat.id}
                  to={`/shop?categoryId=${cat.id}`}
                  className="flex flex-col items-center gap-2 min-w-[80px] group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 group-hover:bg-primary/10 transition-colors flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-primary/20">
                    {cat.icon ? (
                      <img src={cat.icon} alt={String(catName)} className="w-10 h-10 object-contain" />
                    ) : (
                      <span className="text-2xl">{String(catName)[0]}</span>
                    )}
                  </div>
                  <span className="text-xs text-center text-gray-600 group-hover:text-primary font-medium leading-tight max-w-[80px]">
                    {String(catName)}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h2 className="section-title">المنتجات المميزة</h2>
          </div>
          <Link to="/shop?recommended=true" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
            عرض الكل <ChevronRight className="w-4 h-4 rotate-180" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {loadingFeatured
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : featured.map((p: any) => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </section>

      {/* Sale Products */}
      {(loadingSale || onSale.length > 0) && (
        <section className="bg-gradient-to-r from-primary/5 to-pink-50 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <h2 className="section-title">عروض خاصة</h2>
                <span className="badge bg-primary text-white text-xs px-2 py-0.5 animate-pulse">تخفيض</span>
              </div>
              <Link to="/shop?discounted=true" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                عرض الكل <ChevronRight className="w-4 h-4 rotate-180" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {loadingSale
                ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
                : onSale.map((p: any) => <ProductCard key={p.id} product={p} />)
              }
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h2 className="section-title">وصل حديثاً</h2>
          </div>
          <Link to="/shop?mostNew=true" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
            عرض الكل <ChevronRight className="w-4 h-4 rotate-180" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {loadingNew
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : newest.map((p: any) => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </section>

      {/* Spin Wheel CTA */}
      <section className="bg-dark py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-lg mx-auto">
            <div className="text-5xl mb-4">🎡</div>
            <h2 className="text-3xl font-bold text-white mb-3">جرّب حظك!</h2>
            <p className="text-gray-300 mb-6">أدر العجلة لتربح خصومات رائعة وكوبونات وأكثر!</p>
            <Link to="/spin-wheel" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
              العب الآن <Gift className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
