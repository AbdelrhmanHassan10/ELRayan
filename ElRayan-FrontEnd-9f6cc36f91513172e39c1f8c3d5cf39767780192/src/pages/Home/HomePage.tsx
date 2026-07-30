import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { ChevronRight, Zap, TrendingUp, Gift, Star, ArrowRight, Flame, Sparkles, ArrowLeft } from 'lucide-react'
import { bannersApi } from '../../api/banners'
import { productsApi } from '../../api/products'
import { categoriesApi } from '../../api/categories'
import ProductCard from '../../components/ProductCard'
import { ProductSkeleton } from '../../components/Skeleton'
import FadeIn from '../../components/FadeIn'
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

  // Banners
  const banners = normList(bannerRes?.data?.data)

  // Products
  const featured = normList(featuredRes?.data?.data)
  const newest = normList(newRes?.data?.data)
  const onSale = normList(saleRes?.data?.data)

  // Categories
  const categories = normList(categoriesRes?.data?.data)

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-white">
        {banners.length > 0 ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              navigation
              loop={banners.length > 1}
              className="w-full h-[350px] sm:h-[450px] md:h-[550px] rounded-2xl shadow-sm overflow-hidden"
            >
              {banners.map((banner: any) => (
                <SwiperSlide key={banner.id}>
                  <div className="relative w-full h-full bg-dark">
                    {banner.imagePath ? (
                      <>
                        {(banner.productId || banner.product_id || banner.product?.id) ? (
                          <Link to={`/product/${banner.productId || banner.product_id || banner.product?.id}`} className="absolute inset-0 z-0 block cursor-pointer">
                            <img src={banner.imagePath} alt={banner.title} className="w-full h-full object-fill" />
                          </Link>
                        ) : banner.link && banner.link !== '.' ? (
                          <a href={banner.link} className="absolute inset-0 z-0 block cursor-pointer">
                            <img src={banner.imagePath} alt={banner.title} className="w-full h-full object-fill" />
                          </a>
                        ) : (
                          <img src={banner.imagePath} alt={banner.title} className="absolute inset-0 z-0 w-full h-full object-fill" />
                        )}
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                        {/* Text overlay */}
                        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 text-white pointer-events-none">
                          <div className="relative z-10 max-w-2xl pointer-events-auto">
                            <h2 className="text-3xl md:text-5xl font-bold mb-3 leading-tight drop-shadow-lg">{banner.title}</h2>
                            {banner.description && (
                              <p className="text-gray-200 text-sm md:text-base mb-4 max-w-xl">{banner.description}</p>
                            )}
                            <div className="flex gap-3">
                              {(banner.productId || banner.product_id || banner.product?.id) ? (
                                (Number(banner.product?.discount) > 0 || Number(banner.discount) > 0) ? (
                                  <Link to={`/product/${banner.productId || banner.product_id || banner.product?.id}`}
                                    className="btn-primary inline-flex items-center gap-2 py-2 px-5 text-sm">
                                    تسوق الآن <ArrowRight className="w-4 h-4" />
                                  </Link>
                                ) : null
                              ) : banner.link && banner.link !== '.' ? (
                                <a href={banner.link}
                                  className="btn-primary inline-flex items-center gap-2 py-2 px-5 text-sm">
                                  اكتشف المزيد <ArrowRight className="w-4 h-4" />
                                </a>
                              ) : null}
                            </div>
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
          </div>
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
                  <Link to="/offers" className="border-2 border-white text-white hover:bg-white hover:text-dark inline-flex items-center gap-2 text-lg px-8 py-3 rounded-lg font-semibold transition-colors">
                    العروض
                  </Link>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative">
                  <div className="w-64 h-64 md:w-80 md:h-80 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 md:w-64 md:h-64 bg-primary/30 rounded-full flex items-center justify-center">
                      <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                        <path d="M20 45 L35 45 L35 38 C35 32 38 28 44 26 L56 26 C62 28 65 32 65 38 L65 45 L80 45 L75 72 C74 76 71 78 67 78 L33 78 C29 78 26 76 25 72 Z" stroke="white" strokeWidth="4" fill="none" strokeLinejoin="round" />
                        <path d="M42 50 L47 56 L58 44" stroke="#C8102E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="40" cy="84" r="4" fill="white" />
                        <circle cx="60" cy="84" r="4" fill="white" />
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
      <section className="bg-gradient-to-b from-white to-gray-50/50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Zap, title: 'توصيل سريع', desc: 'شحن سريع وموثوق' },
              { icon: Star, title: 'جودة عالية', desc: 'منتجات موثّقة ومضمونة' },
              { icon: Gift, title: 'عروض مميزة', desc: 'كوبونات وعجلة الحظ' },
              { icon: TrendingUp, title: 'أفضل الأسعار', desc: 'أسعار تنافسية ومعقولة' },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <FadeIn key={title} delay={idx * 0.1} direction="up" className="h-full">
                <div className="group h-full flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 cursor-default">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/5 group-hover:bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-sm md:text-base text-gray-800 mb-1 group-hover:text-primary transition-colors">{title}</p>
                    <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">تسوق حسب الفئة</h2>
            <Link to="/shop" className="text-primary text-sm md:text-base font-semibold hover:text-primary/80 flex items-center gap-1 transition-colors">
              الكل <ChevronRight className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
            </Link>
          </div>
          <div className="flex gap-4 md:gap-8 overflow-x-auto overflow-y-hidden py-4 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {categories.map((cat: any, idx: number) => {
              const catName = resolveName(cat.name) || 'فئة'
              return (
                <FadeIn key={cat.id} delay={idx * 0.05} direction="up" className="shrink-0">
                  <Link
                    to={`/shop?categoryId=${cat.id}`}
                    className="flex flex-col items-center gap-4 min-w-[100px] md:min-w-[140px] group snap-start"
                  >
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl md:rounded-2xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] group-hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] group-hover:-translate-y-2 transition-all duration-300 flex items-center justify-center overflow-hidden border border-gray-50 group-hover:border-primary/20 relative">
                      {/* Subtle glow effect behind icon */}
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {cat.icon ? (
                        <img src={cat.icon} alt={String(catName)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 relative z-10" />
                      ) : (
                        <span className="text-4xl font-extrabold text-gray-200 relative z-10">{String(catName)[0]}</span>
                      )}
                    </div>
                    <span className="text-sm md:text-base text-center text-gray-700 group-hover:text-primary font-bold leading-snug max-w-[100px] md:max-w-[140px] transition-colors">
                      {String(catName)}
                    </span>
                  </Link>
                </FadeIn>
              )
            })}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 text-primary fill-primary/20" />
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">المنتجات المميزة</h2>
            </div>
            <p className="text-gray-500 text-sm md:text-base">تشكيلة منتقاة من أفضل منتجاتنا الحصرية</p>
          </div>
          <Link to="/recommended" className="btn-primary flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl hover:-translate-y-1 transition-all shadow-lg shadow-primary/20">
            عرض الكل <ChevronRight className="w-4 h-4 rotate-180" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {loadingFeatured
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : featured.map((p: any, idx: number) => (
                <FadeIn key={p.id} delay={idx * 0.05} direction="up">
                  <ProductCard product={p} />
                </FadeIn>
              ))
          }
        </div>
      </section>

      {/* Sale Products */}
      {(loadingSale || onSale.length > 0) && (
        <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-orange-50 border-y border-rose-100/50 py-6 md:py-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-rose-600 animate-pulse" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">عروض حصرية</h2>
                  <span className="badge bg-rose-600 text-white text-xs px-2.5 py-1">تخفيضات الكبرى</span>
                </div>
                <p className="text-gray-600 text-sm md:text-base ms-14">لا تفوت الفرصة، خصومات مذهلة لفترة محدودة</p>
              </div>
              <Link to="/offers" className="bg-white text-rose-600 border border-rose-200 flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl hover:bg-rose-50 hover:-translate-y-1 transition-all shadow-md">
                تسوق العروض <ChevronRight className="w-4 h-4 rotate-180" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {loadingSale
                ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
                : onSale.map((p: any, idx: number) => (
                    <FadeIn key={p.id} delay={idx * 0.05} direction="up">
                      <ProductCard product={p} />
                    </FadeIn>
                  ))
              }
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-primary fill-primary/20" />
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">وصل حديثاً</h2>
            </div>
            <p className="text-gray-500 text-sm md:text-base">كن أول من يجرب أحدث منتجاتنا المضافة</p>
          </div>
          <Link to="/shop?mostNew=true" className="btn-primary flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl hover:-translate-y-1 transition-all shadow-lg shadow-primary/20">
            تصفح الجديد <ChevronRight className="w-4 h-4 rotate-180" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {loadingNew
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : newest.map((p: any, idx: number) => (
                <FadeIn key={p.id} delay={idx * 0.05} direction="up">
                  <ProductCard product={p} />
                </FadeIn>
              ))
          }
        </div>
      </section>

      {/* Spin Wheel CTA */}
      <section className="relative overflow-hidden py-8 md:py-12 bg-[#0f172a]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-[#0f172a] to-primary/90 opacity-90" />
        
        {/* Floating circles */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-white/10 rounded-full blur-xl animate-[bounce_5s_ease-in-out_infinite]" />
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-orange-500/20 rounded-full blur-xl animate-[bounce_6s_ease-in-out_infinite_reverse]" />
        
        {/* Ray effects from center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] animate-[spin_10s_linear_infinite]" style={{ background: 'conic-gradient(from 0deg, transparent 0 340deg, rgba(255,255,255,0.1) 340deg 360deg)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] animate-[spin_10s_linear_infinite]" style={{ background: 'conic-gradient(from 120deg, transparent 0 340deg, rgba(255,255,255,0.1) 340deg 360deg)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] animate-[spin_10s_linear_infinite]" style={{ background: 'conic-gradient(from 240deg, transparent 0 340deg, rgba(255,255,255,0.1) 340deg 360deg)' }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-[0_0_80px_rgba(200,16,46,0.3)] relative overflow-hidden group">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-orange-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(200,16,46,0.5)] relative">
                {/* Outer dashed ring spinning */}
                <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full animate-[spin_8s_linear_infinite]" />
                
                {/* The Wheel Icon */}
                <svg className="w-10 h-10 text-white animate-[spin_3s_linear_infinite]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="2" x2="12" y2="22"></line>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                  <line x1="19.07" y1="4.93" x2="4.93" y2="19.07"></line>
                  <circle cx="12" cy="12" r="3" fill="#C8102E" stroke="none"></circle>
                </svg>

                {/* Pointer / Pin */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-6 z-10">
                  <svg viewBox="0 0 24 24" fill="#C8102E" stroke="white" strokeWidth="2" className="w-full h-full drop-shadow-md">
                    <path d="M12 22s8-10 8-14a8 8 0 1 0-16 0c0 4 8 14 8 14z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
                جرّب حظك واربح!
              </h2>
              
              <p className="text-white/80 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed font-medium">
                قم بإدارة عجلة الحظ الآن واحصل على <span className="text-orange-400 font-bold">قسائم خصم فورية</span> وهدايا حصرية بانتظارك.
              </p>
              
              <div className="flex justify-center relative">
                {/* Gifts around button */}
                <Gift className="absolute -top-5 -right-5 w-7 h-7 text-white/50 animate-bounce pointer-events-none" />
                <Gift className="absolute -bottom-5 -left-5 w-6 h-6 text-white/50 animate-[bounce_2s_infinite] pointer-events-none" />
                
                <Link to="/spin-wheel" className="group relative inline-flex items-center justify-center gap-2 text-base font-bold px-8 py-3.5 rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                  {/* Button background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-100 to-white transition-transform duration-500" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out" />
                  
                  <span className="relative text-primary z-10 flex items-center gap-2">
                     العب واربح
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
