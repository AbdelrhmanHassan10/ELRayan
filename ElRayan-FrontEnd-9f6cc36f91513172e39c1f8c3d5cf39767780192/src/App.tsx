import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute'

// Pages
import HomePage from './pages/Home/HomePage'
import ShopPage from './pages/Shop/ShopPage'
import ProductDetailPage from './pages/Product/ProductDetailPage'
import CartPage from './pages/Cart/CartPage'
import CheckoutPage from './pages/Checkout/CheckoutPage'
import OrdersPage from './pages/Orders/OrdersPage'
import OrderDetailPage from './pages/Orders/OrderDetailPage'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import VerifyOtpPage from './pages/Auth/VerifyOtpPage'
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/Auth/ResetPasswordPage'
import ProfilePage from './pages/Profile/ProfilePage'
import AddressesPage from './pages/Addresses/AddressesPage'
import FavoritesPage from './pages/Favorites/FavoritesPage'
import NotificationsPage from './pages/Notifications/NotificationsPage'
import CouponsPage from './pages/Coupons/CouponsPage'
import SpinWheelPage from './pages/SpinWheel/SpinWheelPage'
import ComplaintsPage from './pages/Complaints/ComplaintsPage'
import RecommendedPage from './pages/Special/RecommendedPage'
import OffersPage from './pages/Special/OffersPage'
import NewArrivalsPage from './pages/Special/NewArrivalsPage'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Auth routes (no navbar/footer) */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Main layout routes */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/shop" element={<Layout><ShopPage /></Layout>} />
        <Route path="/recommended" element={<Layout><RecommendedPage /></Layout>} />
        <Route path="/offers" element={<Layout><OffersPage /></Layout>} />
        <Route path="/new-arrivals" element={<Layout><NewArrivalsPage /></Layout>} />
        <Route path="/product/:id" element={<Layout><ProductDetailPage /></Layout>} />

        {/* Protected routes */}
        <Route path="/cart" element={<Layout><ProtectedRoute><CartPage /></ProtectedRoute></Layout>} />
        <Route path="/checkout" element={<Layout><ProtectedRoute><CheckoutPage /></ProtectedRoute></Layout>} />
        <Route path="/orders" element={<Layout><ProtectedRoute><OrdersPage /></ProtectedRoute></Layout>} />
        <Route path="/orders/:id" element={<Layout><ProtectedRoute><OrderDetailPage /></ProtectedRoute></Layout>} />
        <Route path="/profile" element={<Layout><ProtectedRoute><ProfilePage /></ProtectedRoute></Layout>} />
        <Route path="/addresses" element={<Layout><ProtectedRoute><AddressesPage /></ProtectedRoute></Layout>} />
        <Route path="/favorites" element={<Layout><ProtectedRoute><FavoritesPage /></ProtectedRoute></Layout>} />
        <Route path="/notifications" element={<Layout><ProtectedRoute><NotificationsPage /></ProtectedRoute></Layout>} />
        <Route path="/coupons" element={<Layout><ProtectedRoute><CouponsPage /></ProtectedRoute></Layout>} />
        <Route path="/spin-wheel" element={<Layout><ProtectedRoute><SpinWheelPage /></ProtectedRoute></Layout>} />
        <Route path="/complaints" element={<Layout><ProtectedRoute><ComplaintsPage /></ProtectedRoute></Layout>} />

        {/* 404 */}
        <Route path="*" element={
          <Layout>
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-center p-8">
              <div className="text-6xl">🔍</div>
              <h1 className="text-3xl font-bold text-gray-900">404 - الصفحة غير موجودة</h1>
              <p className="text-gray-400">الصفحة التي تبحث عنها غير موجودة.</p>
              <a href="/" className="btn-primary">العودة للرئيسية</a>
            </div>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
