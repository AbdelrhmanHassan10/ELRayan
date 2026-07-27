import { LogOut, Video as LucideIcon, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../../logo.png';

export function Sidebar({ items, activePath, brandName = 'Dashboard', isMobileOpen: propIsMobileOpen, onCloseMobile }) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === "rtl";
    const [internalMobileOpen, setInternalMobileOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const isMobileOpen = propIsMobileOpen !== undefined ? propIsMobileOpen : internalMobileOpen;
    
    const closeMobile = () => {
        if (onCloseMobile) onCloseMobile();
        else setInternalMobileOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    return (
        <>
            {/* الخلفية المظللة عند فتح القائمة في الموبايل */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
                    onClick={closeMobile}
                />
            )}

            {/* الشريط الجانبي */}
            <div
                className={`fixed lg:sticky top-0 ${isRtl ? 'right-0' : 'left-0'} h-screen bg-[#172554] transition-transform duration-300 ease-in-out z-50 ${isMobileOpen
                        ? 'translate-x-0 shadow-2xl'
                        : isRtl
                            ? 'translate-x-full lg:translate-x-0'
                            : '-translate-x-full lg:translate-x-0'
                    } w-[92vw] sm:w-96 lg:w-64 max-w-[400px] lg:max-w-none flex flex-col shrink-0 overflow-hidden`}
            >
                <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#0f1d45] shrink-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img src={logo} alt={brandName} className="h-11 w-auto max-w-[135px] object-contain drop-shadow-sm shrink-0 hover:scale-105 transition-transform duration-300 brightness-110" />
                    </div>
                    {/* زر إغلاق الجوال */}
                    <button
                        onClick={closeMobile}
                        className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 cursor-pointer"
                        title={t("cancel") || "Close"}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 sm:p-5 overflow-x-hidden">
                    <ul className="space-y-1.5">
                        {items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activePath === item.path;

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={closeMobile}
                                        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                            ? 'bg-white/15 text-white font-black border-s-4 border-rose-400 shadow-lg shadow-black/10'
                                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110 text-rose-400' : 'group-hover:scale-110'}`} />
                                        <span className="text-sm tracking-wide truncate">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* الجزء السفلي - المستخدم */}
                <div className="p-4 border-t border-white/10 bg-[#0f1d45]">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/10 border border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-rose-400/20 text-rose-400 border border-rose-400/30 flex items-center justify-center font-black shadow-2xs">
                            A
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                                Admin User
                            </p>
                            <p className="text-xs font-medium text-slate-400 truncate">admin@elrayan.com</p>
                        </div>
                        {/* زر تسجيل الخروج */}
                        <button
                            className="text-sm text-slate-400 hover:text-white transition-colors"
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
                    onClick={closeMobile}
                    className="lg:hidden fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 transition-opacity"
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
                                className="px-4 py-2 rounded-lg bg-[#172554] text-white hover:bg-[#1e3a8a] transition"
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
