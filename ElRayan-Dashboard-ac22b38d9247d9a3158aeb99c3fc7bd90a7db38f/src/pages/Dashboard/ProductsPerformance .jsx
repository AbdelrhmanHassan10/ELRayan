import { useState, useEffect, useMemo } from "react";
import api from "../../Api/Api";
import { Card, InputNumber, Button, Table, Space, message, Spin, Empty, Input, Select, DatePicker, Progress, Tag } from "antd";
import { 
    Search, 
    Star, 
    TrendingUp, 
    Package, 
    DollarSign, 
    Filter, 
    Sparkles, 
    Award, 
    RefreshCw, 
    ShoppingBag, 
    Layers,
    Calendar,
    SlidersHorizontal,
    Percent,
    PieChart,
    ArrowUpRight,
    BarChart3
} from "lucide-react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useProductImages } from "../../utils/useProductImages";

const { RangePicker } = DatePicker;

export default function TopProducts() {
    const { t, i18n } = useTranslation();
    const { getProductImage } = useProductImages();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [limit, setLimit] = useState(20);
    const [dates, setDates] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    
    const isArabic = i18n.language === "ar";
    const currency = isArabic ? "ج.م" : "EGP";

    useEffect(() => {
        const today = dayjs();
        const last6Months = dayjs().subtract(6, "month");
        const defaultRange = [last6Months, today];
        setDates(defaultRange);
        fetchData(defaultRange, limit);
    }, []);

    const fetchData = async (customDates = dates, customLimit = limit) => {
        try {
            setLoading(true);
            const finalLimit = Number(customLimit) || 20;
            const params = { 
                page: 1, 
                limit: finalLimit, 
                pageSize: finalLimit, 
                per_page: finalLimit, 
                size: finalLimit 
            };
            if (customDates && customDates.length === 2) {
                params.startDate = customDates[0].format("YYYY-MM-DD");
                params.endDate = customDates[1].format("YYYY-MM-DD");
            }
            if (searchQuery && searchQuery.trim() !== "") {
                params.search = searchQuery.trim();
                params.query = searchQuery.trim();
                params.keyword = searchQuery.trim();
                params.name = searchQuery.trim();
            }
            const res = await api.get("/orders/top-products", { params });
            setProducts(res.data || []);
        } catch (e) {
            console.error(e);
            message.error(t("products_performance.fetch_fail") || "فشل جلب المنتجات الأكثر مبيعاً");
        } finally {
            setLoading(false);
        }
    };

    // Quick Date Presets
    const handleQuickPreset = (presetType) => {
        let start, end = dayjs();
        if (presetType === "today") {
            start = dayjs();
            end = dayjs();
        } else if (presetType === "last7") {
            start = dayjs().subtract(7, "day");
            end = dayjs();
        } else if (presetType === "thisMonth") {
            start = dayjs().startOf("month");
            end = dayjs();
        } else if (presetType === "lastMonth") {
            start = dayjs().subtract(1, "month").startOf("month");
            end = dayjs().subtract(1, "month").endOf("month");
        } else if (presetType === "last6Months") {
            start = dayjs().subtract(6, "month");
            end = dayjs();
        } else if (presetType === "allTime") {
            start = dayjs().subtract(5, "year");
            end = dayjs();
        }
        const newRange = [start, end];
        setDates(newRange);
        fetchData(newRange, limit);
    };

    const handleLimitChange = (val) => {
        const newLimit = val || 20;
        setLimit(newLimit);
    };

    // Extract unique categories for filter dropdown
    const categories = useMemo(() => {
        const set = new Set();
        products.forEach((p) => {
            if (p.mainCategoryName) set.add(p.mainCategoryName);
        });
        return Array.from(set);
    }, [products]);

    // Filter products by search query and category
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const nameMatch = !searchQuery || (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || String(p.id || "").includes(searchQuery);
            const catMatch = selectedCategory === "ALL" || p.mainCategoryName === selectedCategory;
            return nameMatch && catMatch;
        });
    }, [products, searchQuery, selectedCategory]);

    // Calculate summary statistics
    const stats = useMemo(() => {
        if (!filteredProducts.length) return { totalRev: 0, totalSold: 0, avgPrice: 0, topContribution: 0 };
        const totalRev = filteredProducts.reduce((acc, curr) => acc + Number(curr.revenue || 0), 0);
        const totalSold = filteredProducts.reduce((acc, curr) => acc + Number(curr.totalSold || 0), 0);
        const avgPrice = totalSold > 0 ? totalRev / totalSold : 0;
        const topProductRev = filteredProducts[0] ? Number(filteredProducts[0].revenue || 0) : 0;
        const topContribution = totalRev > 0 ? (topProductRev / totalRev) * 100 : 0;
        return { totalRev, totalSold, avgPrice, topContribution };
    }, [filteredProducts]);

    const columns = [
        {
            title: "#",
            dataIndex: "actualRank",
            key: "rank",
            width: 70,
            align: "center",
            render: (rank) => {
                if (rank === 1) return <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 font-extrabold text-sm border border-amber-500/30 shadow-sm" title="1st Place">1</span>;
                if (rank === 2) return <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-300/50 text-slate-700 font-bold text-sm border border-slate-400/30 shadow-sm" title="2nd Place">2</span>;
                if (rank === 3) return <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/20 text-amber-800 font-bold text-sm border border-amber-700/30 shadow-sm" title="3rd Place">3</span>;
                return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200">{rank}</span>;
            }
        },
        {
            title: t("products_performance.product") || "المنتج",
            dataIndex: "name",
            key: "name",
            render: (text, record) => {
                const imgSrc = getProductImage(record);
                return (
                    <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs flex items-center justify-center">
                            {imgSrc ? (
                                <img src={imgSrc} alt="" className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <Package size={16} />
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-sm md:text-base leading-snug line-clamp-2 hover:text-[#172554] transition-colors">
                                {text || (isArabic ? "منتج بدون اسم" : "Unnamed Product")}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-600">ID: #{record.id || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            title: isArabic ? "القسم" : "Category",
            key: "category",
            render: (_, record) => (
                <div className="space-y-0.5 min-w-[130px]">
                    <div className="text-xs font-bold text-[#172554] flex items-center gap-1">
                        <Layers size={12} className="shrink-0" />
                        <span>{record.mainCategoryName || (isArabic ? "عام" : "General")}</span>
                    </div>
                    {record.subCategoryName && (
                        <div className="text-[11px] text-slate-400 font-medium ps-4">
                            {record.subCategoryName}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: t("products_performance.total_sold") || "إجمالي المباع",
            dataIndex: "totalSold",
            key: "totalSold",
            sorter: (a, b) => (a.totalSold || 0) - (b.totalSold || 0),
            render: (val) => (
                <span className="font-extrabold text-slate-800 text-sm">
                    {Number(val || 0).toLocaleString()} <span className="text-xs font-medium text-slate-400">{isArabic ? "قطعة" : "sold"}</span>
                </span>
            )
        },
        {
            title: t("products_performance.revenue") || "الإيرادات",
            dataIndex: "revenue",
            key: "revenue",
            sorter: (a, b) => (a.revenue || 0) - (b.revenue || 0),
            render: (val) => (
                <div className="font-black text-slate-900 text-sm">
                    <span className="text-xs text-slate-400 font-normal me-1">{currency}</span>
                    <span>{Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                </div>
            )
        },
        {
            title: isArabic ? "نسبة المساهمة" : "Revenue Share",
            key: "share",
            render: (_, record) => {
                const rev = Number(record.revenue || 0);
                const pct = stats.totalRev > 0 ? ((rev / stats.totalRev) * 100).toFixed(1) : "0.0";
                return (
                    <div className="w-[85px]">
                        <div className="text-xs font-bold text-slate-700 mb-0.5">{pct}%</div>
                        <Progress percent={Number(pct)} showInfo={false} strokeColor="#172554" size="small" className="m-0" />
                    </div>
                );
            }
        },
        {
            title: t("products_performance.avg_price") || "متوسط السعر",
            dataIndex: "averagePrice",
            key: "averagePrice",
            sorter: (a, b) => (a.averagePrice || 0) - (b.averagePrice || 0),
            render: (val) => (
                <div className="font-bold text-slate-700 text-sm">
                    <span className="text-xs text-slate-400 font-normal me-1">{currency}</span>
                    <span>{Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                </div>
            )
        }
    ];

    const tableLocale = {
        triggerAsc: isArabic ? "انقر للترتيب تصاعدياً" : "Click to sort ascending",
        triggerDesc: isArabic ? "انقر للترتيب تنازلياً" : "Click to sort descending",
        cancelSort: isArabic ? "انقر لإلغاء الترتيب" : "Click to cancel sorting",
        emptyText: t("products_performance.no_top_products") || "لا توجد منتجات مطابقة لخيارات البحث أو الفترة الزمنية"
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-10" dir={isArabic ? "rtl" : "ltr"}>
            {/* Clean Modern Header Banner (Lighter Rose Degree as requested) */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-rose-100/80 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-rose-800 to-red-600"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl shrink-0 shadow-2xs mt-1">
                            <Sparkles size={28} className="text-rose-800" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200/60 mb-2">
                                <Star size={14} className="text-rose-800" />
                                <span>{t("dashboard.top_selling_products") || "المنتجات الأكثر مبيعاً وأداءً في المتجر"}</span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                                {t("products_performance.title") || "أداء أفضل المنتجات"}
                            </h1>
                            <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
                                {isArabic 
                                    ? "تابع قائمة المنتجات الأكثر طلباً ومبيعاً في المتجر مع تحليل الإيرادات ومتوسط أسعار البيع لحظياً لتطوير خطط المبيعات." 
                                    : "Track the highest-demand and best-selling products with real-time revenue and average selling price analytics."}
                            </p>
                        </div>
                    </div>

                    {/* Quick Action Refresh */}
                    <Button 
                        type="primary"
                        size="large"
                        icon={<RefreshCw size={16} className={loading ? "animate-spin" : ""} />}
                        onClick={() => fetchData()}
                        disabled={loading}
                        className="bg-rose-700 hover:bg-rose-800 text-white rounded-xl flex items-center gap-2 font-bold px-5 shadow-md shadow-rose-700/20 hover:shadow-lg transition-all shrink-0"
                    >
                        {isArabic ? "تحديث الأداء" : "Refresh Performance"}
                    </Button>
                </div>
            </div>

            {/* Filter Card + Quick Presets */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 me-1">
                            <SlidersHorizontal size={14} className="text-[#172554]" />
                            {isArabic ? "فترات سريعة:" : "Quick Select:"}
                        </span>
                        <button 
                            type="button" 
                            onClick={() => handleQuickPreset("today")}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#172554] hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs"
                        >
                            {isArabic ? "اليوم" : "Today"}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleQuickPreset("last7")}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#172554] hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs"
                        >
                            {isArabic ? "آخر 7 أيام" : "Last 7 Days"}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleQuickPreset("thisMonth")}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#172554] hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs"
                        >
                            {isArabic ? "هذا الشهر" : "This Month"}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleQuickPreset("lastMonth")}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#172554] hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs"
                        >
                            {isArabic ? "الشهر الماضي" : "Last Month"}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleQuickPreset("last6Months")}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#172554] hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs"
                        >
                            {isArabic ? "آخر 6 أشهر" : "Last 6 Months"}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleQuickPreset("allTime")}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#172554] hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs"
                        >
                            {isArabic ? "كل الأوقات" : "All Time"}
                        </button>
                    </div>

                    {filteredProducts.length > 0 && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#172554]/10 text-[#172554] text-xs font-bold border border-[#172554]/20">
                            <span className="w-2 h-2 rounded-full bg-[#172554] animate-pulse"></span>
                            <span>{isArabic ? `تم العثور على (${filteredProducts.length}) منتج` : `${filteredProducts.length} items found`}</span>
                        </div>
                    )}
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            <Calendar size={14} className="text-[#172554]" />
                            {isArabic ? "تحديد النطاق الزمني" : "Date Range"}
                        </label>
                        <RangePicker
                            format="DD/MM/YYYY"
                            value={dates}
                            onChange={(v) => {
                                setDates(v);
                                if (v && v.length === 2) {
                                    fetchData(v, limit);
                                }
                            }}
                            className="h-11 rounded-xl border-slate-300 hover:border-[#172554] focus:border-[#172554] font-semibold w-full"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            <Search size={14} className="text-[#172554]" />
                            {isArabic ? "بحث باسم أو كود المنتج" : "Search product name or ID"}
                        </label>
                        <Input
                            placeholder={isArabic ? "ابحث عن منتج هنا..." : "Search product..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onPressEnter={() => fetchData(dates, limit)}
                            allowClear
                            className="h-11 rounded-xl font-medium"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            <Layers size={14} className="text-[#172554]" />
                            {isArabic ? "تصفية حسب القسم الرئيسي" : "Filter by Category"}
                        </label>
                        <Select
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            className="w-full h-11"
                            options={[
                                { label: isArabic ? "جميع الأقسام" : "All Categories", value: "ALL" },
                                ...categories.map((c) => ({ label: c, value: c }))
                            ]}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="space-y-1.5 flex-1">
                            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                <Filter size={14} className="text-[#172554]" />
                                {t("products_performance.limit") || (isArabic ? "العدد:" : "Limit:")}
                            </label>
                            <InputNumber 
                                min={1} 
                                max={500} 
                                value={limit} 
                                onChange={(v) => handleLimitChange(v || 10)} 
                                onPressEnter={() => fetchData(dates, limit)}
                                className="rounded-xl font-bold h-11 w-full flex items-center"
                            />
                        </div>
                        <Button
                            type="primary"
                            icon={<Search size={16} />}
                            onClick={() => fetchData(dates, limit)}
                            loading={loading}
                            className="h-11 px-5 bg-[#172554] hover:bg-[#1e3a8a] text-white rounded-xl font-bold flex items-center justify-center shadow-sm"
                        >
                            {t("products_performance.apply") || "عرض"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Top Stats Summary (4 Executive Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-[#172554]/30 transition-all">
                    <div className="p-3.5 bg-[#172554]/10 text-[#172554] rounded-2xl shrink-0">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500">{isArabic ? "إجمالي إيرادات القائمة" : "Total Listed Revenue"}</div>
                        <div className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">
                            {currency} {Math.round(stats.totalRev).toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-[#172554]/30 transition-all">
                    <div className="p-3.5 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-2xl shrink-0">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500">{isArabic ? "إجمالي القطع المباعة" : "Total Units Sold"}</div>
                        <div className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">
                            {stats.totalSold.toLocaleString()} <span className="text-xs font-bold text-gray-400">{isArabic ? "قطعة" : "units"}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-[#172554]/30 transition-all">
                    <div className="p-3.5 bg-indigo-900/10 text-indigo-900 rounded-2xl shrink-0">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500">{isArabic ? "متوسط سعر البيع للقطعة" : "Average Unit Price"}</div>
                        <div className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">
                            {currency} {Math.round(stats.avgPrice).toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-[#172554]/30 transition-all">
                    <div className="p-3.5 bg-blue-900/10 text-blue-900 rounded-2xl shrink-0">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500">{isArabic ? "هيمنة المنتج الأول" : "Top 1 Share"}</div>
                        <div className="text-xl md:text-2xl font-black text-slate-900 mt-0.5 flex items-center gap-1">
                            <span>{stats.topContribution.toFixed(1)}%</span>
                            <span className="text-3xs font-medium text-slate-400 block">{isArabic ? "من إيراد القائمة" : "of top revenue"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Display (Responsive Table on Desktop, Cards on Mobile/Tablet) */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="font-extrabold text-slate-800 flex items-center gap-2">
                        <TrendingUp size={18} className="text-[#172554]" />
                        <span>{isArabic ? "ترتيب المنتجات حسب الأداء المالي والمبيعات" : "Products Ranked by Sales & Financial Performance"}</span>
                    </div>
                    <span className="text-xs font-bold text-[#172554] bg-[#172554]/10 px-3 py-1 rounded-lg border border-[#172554]/20">
                        {isArabic ? `عرض ${filteredProducts.length} منتج` : `Showing ${filteredProducts.length} items`}
                    </span>
                </div>

                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-3">
                        <Spin size="large" />
                        <span className="text-sm font-medium text-slate-500 animate-pulse">{t("common.loading") || "جاري جلب بيانات أفضل المنتجات..."}</span>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="py-20">
                        <Empty description={t("products_performance.no_top_products") || "لا توجد منتجات مطابقة لخيارات البحث أو الفترة الزمنية"} />
                    </div>
                ) : (
                    <>
                        {/* 1. Desktop & Tablet Large Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <Table
                                columns={columns}
                                dataSource={filteredProducts.map((item, index) => ({ ...item, actualRank: index + 1 }))}
                                rowKey={(r) => r.id || Math.random()}
                                pagination={{
                                    pageSize: Number(limit) || 20,
                                    showSizeChanger: true,
                                    pageSizeOptions: Array.from(new Set(["10", "15", "20", "25", "30", "50", "100", "200", "500", String(limit || 20)])).sort((a, b) => Number(a) - Number(b)),
                                    onChange: (page, pageSize) => {
                                        if (pageSize !== Number(limit)) {
                                            setLimit(pageSize);
                                            fetchData(dates, pageSize);
                                        }
                                    },
                                    showTotal: (total) => isArabic ? `إجمالي المنتجات: ${total}` : `Total items: ${total}`,
                                    className: "px-6 py-4"
                                }}
                                locale={tableLocale}
                                loading={loading}
                                className="custom-table"
                            />
                        </div>

                        {/* 2. Mobile & Tablet Card Grid View (Fully Responsive without scrollbars!) */}
                        <div className="block lg:hidden p-4 md:p-6 bg-slate-50/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredProducts.map((record, idx) => {
                                    const rank = idx + 1;
                                    const imgSrc = getProductImage(record);
                                    const rev = Number(record.revenue || 0);
                                    const pct = stats.totalRev > 0 ? ((rev / stats.totalRev) * 100).toFixed(1) : "0.0";
                                    return (
                                        <div key={record.id || idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-3 relative overflow-hidden group">
                                            {/* Top Row: Rank & Categories */}
                                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                                <div className="flex items-center gap-2">
                                                    {rank === 1 && <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 font-extrabold text-xs border border-amber-500/30">#1</span>}
                                                    {rank === 2 && <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300">#2</span>}
                                                    {rank === 3 && <span className="px-2.5 py-0.5 rounded-full bg-amber-700/15 text-amber-800 font-bold text-xs border border-amber-700/30">#3</span>}
                                                    {rank > 3 && <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs flex items-center justify-center">#{rank}</span>}
                                                    
                                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                                                        {record.mainCategoryName || (isArabic ? "عام" : "General")}
                                                    </span>
                                                </div>
                                                {record.subCategoryName && (
                                                    <span className="text-2xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 truncate max-w-[100px]">
                                                        {record.subCategoryName}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Middle Row: Image & Name */}
                                            <div className="flex items-center gap-3 py-1">
                                                <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs flex items-center justify-center relative">
                                                    {imgSrc ? (
                                                        <img src={imgSrc} alt="" className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform duration-300" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <Package size={18} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">
                                                        {record.name || (isArabic ? "منتج بدون اسم" : "Unnamed Product")}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                                                        <span>ID: #{record.id || "N/A"}</span>
                                                        <span className="font-bold text-[#172554] text-[11px]">{pct}% {isArabic ? "مساهمة" : "share"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contribution Bar */}
                                            <div className="w-full">
                                                <Progress percent={Number(pct)} showInfo={false} strokeColor="#172554" size="small" className="m-0" />
                                            </div>

                                            {/* Bottom Row: 3 Metrics Grid */}
                                            <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80 text-center mt-1">
                                                <div className="flex flex-col">
                                                    <span className="text-2xs font-semibold text-slate-400">{isArabic ? "المبيعات" : "Sold"}</span>
                                                    <span className="text-xs sm:text-sm font-extrabold text-[#172554] mt-0.5">
                                                        {Number(record.totalSold || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col border-x border-slate-200 px-1">
                                                    <span className="text-2xs font-semibold text-slate-400">{isArabic ? "الإيرادات" : "Revenue"}</span>
                                                    <span className="text-xs sm:text-sm font-black text-slate-800 mt-0.5 truncate">
                                                        {Number(record.revenue || 0).toLocaleString()} <span className="text-3xs font-normal">{currency}</span>
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-2xs font-semibold text-slate-400">{isArabic ? "متوسط السعر" : "Avg Price"}</span>
                                                    <span className="text-xs sm:text-sm font-bold text-slate-600 mt-0.5 truncate">
                                                        {Number(record.averagePrice || 0).toLocaleString()} <span className="text-3xs font-normal">{currency}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
