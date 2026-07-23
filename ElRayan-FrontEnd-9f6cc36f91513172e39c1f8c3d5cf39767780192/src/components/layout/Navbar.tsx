import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { ShoppingCart, Bell, User, Search, Menu, X, Heart, ChevronDown, LogOut, Package, MapPin, Tag, RotateCcw, MessageSquare } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { cartCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?name=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const navLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/shop', label: 'المتجر' },
    { to: '/recommended', label: 'مميز' },
    { to: '/offers', label: 'العروض' },
  ]

  return (
    <header className="bg-dark sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" rx="16" fill="#1A1F2E"/>
              <path d="M20 45 L35 45 L35 38 C35 32 38 28 44 26 L56 26 C62 28 65 32 65 38 L65 45 L80 45 L75 72 C74 76 71 78 67 78 L33 78 C29 78 26 76 25 72 Z" stroke="#C8102E" strokeWidth="5" fill="none" strokeLinejoin="round"/>
              <path d="M42 50 L47 56 L58 44" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="40" cy="84" r="5" fill="#C8102E"/>
              <circle cx="60" cy="84" r="5" fill="#C8102E"/>
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-lg tracking-tight">Al Rayan</span>
              <span className="text-primary text-xs font-medium tracking-wider">الريان</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.to && !link.to.includes('?')
                    ? 'text-primary bg-white/5'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث عن منتجات..."
                className="w-full bg-white/10 border border-white/10 text-white placeholder-gray-400 rounded-lg ps-9 pe-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/15"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link to="/favorites" className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link to="/notifications" className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                </Link>
                <Link to="/cart" className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -end-0.5 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(v => !v)}
                    className="flex items-center gap-2 p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors ms-1"
                  >
                    <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <ChevronDown className="w-3 h-3 hidden sm:block" />
                  </button>

                  {profileOpen && (
                    <div className="absolute end-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 text-sm truncate">{user?.fullName}</p>
                        <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                      </div>
                      {[
                        { to: '/profile', icon: User, label: 'ملفي الشخصي' },
                        { to: '/orders', icon: Package, label: 'طلباتي' },
                        { to: '/addresses', icon: MapPin, label: 'عناويني' },
                        { to: '/coupons', icon: Tag, label: 'كوبوناتي' },
                        { to: '/spin-wheel', icon: RotateCcw, label: 'عجلة الحظ' },
                        { to: '/complaints', icon: MessageSquare, label: 'الدعم' },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <item.icon className="w-4 h-4 text-gray-400" />
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={() => { setProfileOpen(false); logout() }}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors">
                          <LogOut className="w-4 h-4" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-300 hover:text-white px-3 py-2 transition-colors">دخول</Link>
                <Link to="/register" className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors font-medium">تسجيل</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(v => !v)}
              className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg ms-1 transition-colors">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-white/10 mt-2 pt-3 space-y-1">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن منتجات..."
                  className="w-full bg-white/10 border border-white/10 text-white placeholder-gray-400 rounded-lg ps-9 pe-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </form>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
