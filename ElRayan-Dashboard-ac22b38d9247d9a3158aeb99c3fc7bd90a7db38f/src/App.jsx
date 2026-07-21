import { Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Package, ShoppingCart, Users, Settings, LandPlot, Puzzle, ChartColumnStacked, Store, ChartBar, Wallet, Gift, Layout, LayoutGrid, } from 'lucide-react';
import { DashboardLayout } from './Components/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login';
import Banners from './pages/Banners/Banners';
import { FaInfoCircle } from "react-icons/fa";
import Coupons from './pages/Coupons/Coupons';
import Orders from './pages/Orders/Orders';
import Categories from './pages/Categories/Categories';
import SettingsPage from './pages/Settings/Settings';
import Vendors from './pages/Vendors/Vendors';
import VendorOverview from './pages/Vendors/VendorOverview';
import VendorsStatistics from './pages/VendorsStatistics';
import RequireBack from './pages/Auth/RequireBack';
import RequireAuth from './pages/Auth/RequireAuth';
import UsersPage from './pages/Users/Users';
import GrowthTrend from './pages/Users/GrowthTrend';
import UsersStatistics from './pages/Users/UsersStatistics';
import Zones from './pages/Zones/Zones';
import AppVersionSettings from './pages/General-settings/General-settings';
import AdminWalletPage from './pages/Wallet/Wallet';
import { ConfigProvider } from "antd";
import Products from './pages/Products/Products';
import EditProduct from './pages/Products/EditProduct';
import AddProduct from './pages/Products/AddProduct';
import Rewards from './pages/Rewards/Rewards';


function App() {
  const location = useLocation();

  const { t, i18n } = useTranslation();

  const sidebarItems = [
    { label: t('sidebar.dashboard'), icon: Home, path: '/' },
    { label: t('sidebar.banners'), icon: FaInfoCircle, path: '/banners' },
    { label: t('sidebar.zones'), icon: LandPlot, path: '/zones' },
    { label: t('sidebar.coupons'), icon: Puzzle, path: '/coupons' },
    { label: t('sidebar.products'), icon: Package, path: '/products' },
    { label: t('sidebar.categories'), icon: ChartColumnStacked, path: '/categories' },
    { label: t('sidebar.orders'), icon: ShoppingCart, path: '/orders' },
    // { label: t('sidebar.rewards'), icon: Gift, path: '/rewards' },
    { label: t('sidebar.users'), icon: Users, path: "/users" },
    { label: t('sidebar.general_settings'), icon: Settings, path: '/general-settings' },
  ];

  return (
    // Theme customization for Ant Design components
    <ConfigProvider
      direction={i18n.dir()}
      theme={{
        token: {
          colorPrimary: "#e3010f",
        },
      }}
    >
      <Routes>
        {/* لو المستخدم داخل بالفعل، مايرجعش للوجن */}
        <Route path="/login" element={<RequireBack><Login /></RequireBack>} />

        {/* باقي الصفحات محتاجة توكن */}
        <Route
          path="/*"
          element={
            <RequireAuth>
              <DashboardLayout sidebarItems={sidebarItems} activePath={location.pathname} brandName="El Rayan Store">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/banners" element={<Banners />} />
                  <Route path="/zones" element={<Zones />} />
                  <Route path="/coupons" element={<Coupons />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<EditProduct />} />
                  <Route path="/products/add" element={<AddProduct />} />
                  <Route path="/rewards" element={<Rewards />} />
                  <Route path="/categories" element={<Categories />} />
                  {/* <Route path="/settings" element={<SettingsPage />} /> */}
                  {/* <Route path="/vendors" element={<Vendors />} />
                  <Route path="/vendors/overview" element={<VendorOverview />} /> 
                  <Route path="/vendors/statistics" element={<VendorsStatistics />} />*/}
                  <Route path="/users" element={<UsersPage />} />
                  {/* <Route path="/users/growth-trend" element={<GrowthTrend />} /> */}
                  {/* <Route path="/users/statistics" element={<UsersStatistics />} /> */}
                  <Route path='/general-settings' element={<AppVersionSettings />} />
                  {/* <Route path='/wallet' element={<AdminWalletPage />} /> */}
                </Routes>
              </DashboardLayout>
            </RequireAuth>
          }
        />
      </Routes>
    </ConfigProvider>
  );
}

export default App;

