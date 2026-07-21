import { LogOut, Video as LucideIcon, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Sidebar({ items, activePath, brandName = 'Dashboard' }) {
    const { t } = useTranslation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    return (
        <>
            {/* زر الموبايل */}
            <button
                onClick={toggleMobile}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            >
                {isMobileOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>

            {/* الشريط الجانبي */}
            <div
                className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } w-64 flex flex-col`}
            >
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">{brandName}</h1>
                    <p className="text-sm text-gray-500 mt-1">Acwad Admin</p>
                </div>

                <nav className="flex-1 overflow-y-auto p-4">
                    <ul className="space-y-2">
                        {items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activePath === item.path;

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-red-50 text-[#e3010f] font-medium shadow-sm'
                                            : 'text-gray-700 hover:bg-red-50 hover:text-[#e3010f]'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-sm">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* الجزء السفلي - المستخدم */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold">
                            A
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                Admin User
                            </p>
                            <p className="text-xs text-gray-500 truncate">admin@maghani.com</p>
                        </div>
                        {/* زر تسجيل الخروج */}
                        <button
                            className="text-sm text-gray-700 hover:text-gray-900"
                            onClick={() => setShowLogoutModal(true)}
                        >
                            <LogOut className="w-4 h-4 inline-block ml-1" />
                        </button>
                    </div>
                </div>
            </div>

            {/* الخلفية للموبايل */}
            {isMobileOpen && (
                <div
                    onClick={toggleMobile}
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                />
            )}

            {/* مودال تأكيد تسجيل الخروج */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-80 text-center">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            {t("logout")}
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            {t("confirm_logout")}
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                            >
                                {t('sidebar.logout')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
