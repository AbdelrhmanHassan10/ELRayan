import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin, ShoppingBag } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-lg leading-tight">متجر الريان</p>
                <p className="text-primary text-xs">Al Rayan</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              وجهتك الموثوقة للمنتجات الجودة. تسوق بثقة واطمئنان.
            </p>
            <div className="flex gap-3 mt-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/', label: 'الرئيسية' },
                { to: '/shop', label: 'المتجر' },
                { to: '/shop?recommended=true', label: 'المنتجات المميزة' },
                { to: '/shop?discounted=true', label: 'العروض والتخفيضات' },
                { to: '/spin-wheel', label: 'عجلة الحظ' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-white hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-semibold mb-4">حسابي</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/profile', label: 'الملف الشخصي' },
                { to: '/orders', label: 'طلباتي' },
                { to: '/cart', label: 'سلة التسوق' },
                { to: '/favorites', label: 'قائمة الأمنيات' },
                { to: '/coupons', label: 'كوبوناتي' },
                { to: '/complaints', label: 'الدعم والشكاوى' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">تواصل معنا</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>+966 XX XXX XXXX</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>support@alrayan.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>الرياض، المملكة العربية السعودية</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} متجر الريان. جميع الحقوق محفوظة.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300 transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-gray-300 transition-colors">شروط الخدمة</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
