import { useState, Suspense, useEffect } from "react";
import { PulseLoader } from "react-spinners";
import OrdersTab from "./OrdersTab";
import ProductsPerformance from "./ProductsPerformance ";
import TrendsAndGeographicTab from "./TrendsAndGeographicTab";
import ExportSummaryPage from "./ExportSummaryPage";
import LowStockProducts from "./LowStockProducts";
import SalesReport from "./SalesReport";
import TopCustomers from "./TopCustomers";
import { useTranslation } from "react-i18next";
import {
    ShoppingCart,
    BarChart2,
    AlertTriangle,
    FileText,
    Users,
    Star,
    TrendingUp,
    ShieldCheck,
    Clock,
    Activity
} from "lucide-react";

export default function Dashboard() {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState("orders");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const tabs = [
        { key: "orders", label: t("dashboard.orders") || "الطلبات", icon: <ShoppingCart size={18} /> },
        { key: "analytics", label: t("dashboard.analytics") || "التحليلات", icon: <BarChart2 size={18} /> },
        { key: "lowStock", label: t("dashboard.low_stock") || "نواقص المخزون", icon: <AlertTriangle size={18} /> },
        { key: "report", label: t("dashboard.report") || "تقرير المبيعات", icon: <FileText size={18} /> },
        { key: "topCustomers", label: t("dashboard.top_customers") || "أفضل العملاء", icon: <Users size={18} /> },
        { key: "topProducts", label: t("dashboard.top_products") || "المنتجات الأكثر مبيعاً", icon: <Star size={18} /> },
        { key: "trends", label: t("dashboard.trends") || "الاتجاهات والتوزيع", icon: <TrendingUp size={18} /> },
    ];

    const fallbackLoader = (
        <div className="flex flex-col gap-4 justify-center items-center py-32 bg-white/60 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[#b91c1c]/10 blur-xl rounded-full"></div>
                <PulseLoader color="#b91c1c" size={16} />
            </div>
            <span className="text-sm font-bold text-slate-500 animate-pulse tracking-wide">
                {t("common.loading") || "جاري تحميل وتجهيز البيانات..."}
            </span>
        </div>
    );

    return (
        <>
        <style>{`
            @keyframes fade-slide-up {
                0% { opacity: 0; transform: translateY(15px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-slide-up {
                animation: fade-slide-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            }
            @keyframes blob {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(30px, -50px) scale(1.1); }
                66% { transform: translate(-20px, 20px) scale(0.9); }
                100% { transform: translate(0px, 0px) scale(1); }
            }
            .animate-blob {
                animation: blob 7s infinite alternate;
            }
            .animation-delay-2000 {
                animation-delay: 2s;
            }
            .animation-delay-4000 {
                animation-delay: 4s;
            }
            .no-scrollbar::-webkit-scrollbar {
                display: none;
            }
            .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `}</style>
        
        <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-[#f8fafc] text-slate-900 relative overflow-hidden font-sans">
            {/* Animated Background Mesh */}
            <div className="absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-[#b91c1c] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.06] animate-blob pointer-events-none"></div>
            <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] bg-[#172554] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.06] animate-blob animation-delay-2000 pointer-events-none"></div>
            <div className="absolute -bottom-32 left-1/2 w-[30rem] h-[30rem] bg-[#b91c1c] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.04] animate-blob animation-delay-4000 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

            <div className={`relative z-10 max-w-[1400px] mx-auto transition-all duration-1000 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                
                {/* Premium Hero Section (Glassmorphism) */}
                <div className="relative bg-white/70 backdrop-blur-2xl rounded-[2rem] p-8 lg:p-10 mb-10 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group">
                    {/* Top gradient accent */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#b91c1c] opacity-90"></div>
                    
                    {/* Inner Content */}
                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pt-2">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-5">
                                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#172554] text-white border border-[#172554] shadow-sm">
                                    <span className="relative flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                                    </span>
                                    {t("dashboard.live_status") || "نظام مباشر | Live Stream"}
                                </span>
                                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#b91c1c]/5 text-[#b91c1c] border border-[#b91c1c]/10 shadow-sm">
                                    <Activity size={14} className="text-[#b91c1c]" />
                                    {t("dashboard.admin_panel") || "مركز القيادة المتقدم"}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[#172554] mb-4 drop-shadow-sm">
                                {t("dashboard.title") || "لوحة التحكم الذكية"}
                            </h1>
                            <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl leading-relaxed">
                                {t("dashboard.welcome_desc") || "رؤية شاملة وتحليل فوري للبيانات. تحكم في مسار عملك من خلال مؤشرات أداء دقيقة وتصميم يضع كل ما تحتاجه بين يديك بلمسة واحدة."}
                            </p>
                        </div>

                        {/* Glass Clock Card */}
                        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-100 shadow-sm lg:w-auto hover:shadow-md transition-all duration-300">
                            <div className="p-3.5 bg-gradient-to-br from-[#b91c1c]/10 to-[#b91c1c]/5 rounded-xl text-[#b91c1c] border border-[#b91c1c]/10 shadow-inner">
                                <Clock size={24} />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">{t("dashboard.current_date") || "توقيت النظام"}</div>
                                <div className="font-black text-slate-800 text-base md:text-lg tracking-wide">
                                    {new Date().toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Glass Navigation (Responsive Swipeable Tabs) */}
                <div className="relative mb-8 md:mb-10 w-full flex justify-center">
                    <div className="bg-white/90 backdrop-blur-2xl p-1.5 rounded-2xl md:rounded-[1.75rem] border border-slate-200/80 shadow-md flex items-center gap-1.5 overflow-x-auto max-w-full whitespace-nowrap no-scrollbar scroll-smooth">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`group relative flex items-center gap-2 px-3.5 py-2.5 md:px-5 md:py-3.5 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all duration-300 select-none cursor-pointer shrink-0 whitespace-nowrap ${
                                        isActive
                                            ? "text-[#172554] bg-[#172554]/10 shadow-2xs font-black border border-[#172554]/20"
                                            : "text-slate-600 hover:text-[#172554] hover:bg-slate-100"
                                    }`}
                                >
                                    <span className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                        {tab.icon}
                                    </span>
                                    <span className="relative z-10 tracking-wide">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Section with Premium Transitions */}
                <div className="relative min-h-[500px]">
                    <div className="transition-opacity duration-500 ease-in-out">
                        {tabs.map((tab) => (
                            activeTab === tab.key && (
                                <div key={tab.key} className="animate-fade-slide-up">
                                    <Suspense fallback={fallbackLoader}>
                                        {tab.key === "orders" && <OrdersTab />}
                                        {tab.key === "analytics" && <ExportSummaryPage />}
                                        {tab.key === "lowStock" && <LowStockProducts />}
                                        {tab.key === "report" && <SalesReport />}
                                        {tab.key === "topCustomers" && <TopCustomers />}
                                        {tab.key === "topProducts" && <ProductsPerformance />}
                                        {tab.key === "trends" && <TrendsAndGeographicTab />}
                                    </Suspense>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
