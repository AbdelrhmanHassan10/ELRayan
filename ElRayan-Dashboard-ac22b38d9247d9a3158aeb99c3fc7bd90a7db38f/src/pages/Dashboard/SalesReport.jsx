import { useState, useEffect } from "react";
import axios from "axios";
import {
    DatePicker,
    Select,
    Button,
    Table,
    Tag,
    message,
    Spin,
    Progress,
} from "antd";
import { 
    Search, 
    DollarSign, 
    ShoppingBag, 
    TrendingUp, 
    Package, 
    Tag as TagIcon, 
    Truck, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    RotateCcw, 
    Users, 
    UserCheck, 
    Repeat, 
    Calendar, 
    Filter, 
    RefreshCw,
    Sparkles,
    Award,
    SlidersHorizontal,
    ArrowUpRight,
    Activity,
    Percent
} from "lucide-react";
import dayjs from "dayjs";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";
import { useTranslation } from "react-i18next";
import { useProductImages } from "../../utils/useProductImages";

const { RangePicker } = DatePicker;

export default function SalesReport() {
    const { t, i18n } = useTranslation();
    const { getProductImage } = useProductImages();
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [dates, setDates] = useState([]);
    const [type, setType] = useState("monthly");

    const isArabic = i18n.language === "ar";
    const currency = isArabic ? "ج.م" : "EGP";

    useEffect(() => {
        const today = dayjs();
        const lastMonth = dayjs().subtract(1, "month");
        const defaultRange = [lastMonth, today];
        setDates(defaultRange);
        fetchData(defaultRange, "monthly");
    }, []);

    const fetchData = async (customDates, customType) => {
        const d = customDates || dates;
        const tVal = customType ?? type;

        if (!d || d.length !== 2) {
            message.error(t("sales_report.select_dates") || "يرجى تحديد النطاق الزمني");
            return;
        }

        let startDate = d[0].format("YYYY-MM-DD");
        let endDate = d[1].format("YYYY-MM-DD");

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axios.get(
                "https://api.elrayan.acwad.tech/api/v1/orders/sales-report",
                { 
                    params: { startDate, endDate, type: tVal },
                    headers: token ? { Authorization: `Bearer ${token}`, lang: i18n.language } : {}
                }
            );

            if (res.data) {
                setReport(res.data);
            }
        } catch (e) {
            console.error("Failed to fetch sales report:", e);
            message.error(t("sales_report.fetch_fail") || "حدث خطأ أثناء تحميل تقرير المبيعات");
        } finally {
            setLoading(false);
        }
    };

    const formatCurr = (val) => {
        const num = Number(val || 0);
        return `${num.toLocaleString()} ${currency}`;
    };

    // Quick Date Presets Handler
    const handleQuickPreset = (presetType) => {
        let start, end = dayjs();
        if (presetType === "today") {
            start = dayjs();
            end = dayjs();
        } else if (presetType === "yesterday") {
            start = dayjs().subtract(1, "day");
            end = dayjs().subtract(1, "day");
        } else if (presetType === "last7") {
            start = dayjs().subtract(7, "day");
            end = dayjs();
        } else if (presetType === "thisMonth") {
            start = dayjs().startOf("month");
            end = dayjs();
        } else if (presetType === "lastMonth") {
            start = dayjs().subtract(1, "month").startOf("month");
            end = dayjs().subtract(1, "month").endOf("month");
        }
        const newRange = [start, end];
        setDates(newRange);
        fetchData(newRange, type);
    };

    const topProductsColumns = [
        {
            title: "#",
            dataIndex: "actualRank",
            key: "rank",
            width: 60,
            render: (rank) => {
                if (rank === 1) return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/15 text-amber-600 font-extrabold text-xs border border-amber-500/30">1</span>;
                if (rank === 2) return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs">2</span>;
                if (rank === 3) return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/15 text-amber-800 font-bold text-xs">3</span>;
                return <span className="font-bold text-slate-400 text-xs ps-2">#{rank}</span>;
            },
        },
        { 
            title: t("products_performance.product") || "المنتج", 
            dataIndex: "name",
            key: "name",
            render: (text, record) => {
                const imgSrc = getProductImage(record);
                return (
                    <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs flex items-center justify-center">
                            {imgSrc ? (
                                <img src={imgSrc} alt="" className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                                <Package size={14} className="text-[#172554]" />
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-xs md:text-sm leading-snug line-clamp-1 hover:text-[#172554] transition-colors">
                                {text || (isArabic ? "منتج بدون اسم" : "Unnamed Product")}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                                ID: #{record.id || "N/A"}
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            title: t("products_performance.total_sold") || "الكمية المباعة",
            dataIndex: "quantitySold",
            key: "quantitySold",
            sorter: (a, b) => Number(a.quantitySold || 0) - Number(b.quantitySold || 0),
            render: (val) => (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold text-xs">
                    <Package size={13} className="text-slate-500" />
                    {Number(val || 0).toLocaleString()} {isArabic ? "وحدة" : "unit"}
                </span>
            )
        },
        {
            title: t("products_performance.revenue") || "إجمالي الإيرادات",
            dataIndex: "revenue",
            key: "revenue",
            sorter: (a, b) => Number(a.revenue || 0) - Number(b.revenue || 0),
            render: (val) => (
                <span className="font-extrabold text-[#172554] text-sm">
                    {formatCurr(val)}
                </span>
            )
        },
        {
            title: t("products_performance.avg_price") || "متوسط السعر",
            dataIndex: "averagePrice",
            key: "averagePrice",
            sorter: (a, b) => Number(a.averagePrice || 0) - Number(b.averagePrice || 0),
            render: (val) => (
                <span className="font-semibold text-slate-600 text-xs">
                    {formatCurr(val)}
                </span>
            )
        }
    ];

    const tableLocale = {
        triggerAsc: isArabic ? "انقر للترتيب تصاعدياً" : "Click to sort ascending",
        triggerDesc: isArabic ? "انقر للترتيب تنازلياً" : "Click to sort descending",
        cancelSort: isArabic ? "انقر لإلغاء الترتيب" : "Click to cancel sorting",
        emptyText: isArabic ? "لا توجد منتجات مسجلة في هذا النطاق" : "No products found",
    };

    return (
        <div className="space-y-6 p-3 md:p-6 bg-slate-50 min-h-screen font-sans" dir={isArabic ? "rtl" : "ltr"}>

            {/* Header Banner */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-rose-100/80 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-rose-800 to-red-600"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl shrink-0 shadow-2xs mt-1">
                            <Sparkles size={28} className="text-rose-800" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200/60 mb-2">
                                <Sparkles size={14} className="text-rose-800" />
                                <span>{isArabic ? "التحليلات المالية والتقارير التنفيذية" : "Financial Analytics & Executive Reports"}</span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                                {t("sales_report.title") || (isArabic ? "تقرير المبيعات والأداء المالي" : "Sales & Financial Report")}
                            </h1>
                            <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
                                {isArabic 
                                    ? "متابعة شاملة لحركة المبيعات، الإيرادات، الخصومات، وتحليلات أداء المنتجات وسلوك العملاء بدقة وعمق." 
                                    : "Comprehensive monitoring of sales revenue, order trends, product performance, and VIP customer analytics."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button 
                            type="primary"
                            size="large"
                            icon={<RefreshCw size={16} className={loading ? "animate-spin" : ""} />} 
                            onClick={() => fetchData()}
                            disabled={loading}
                            className="bg-rose-800 hover:bg-rose-900 text-white rounded-xl flex items-center gap-2 font-bold px-5 shadow-sm hover:shadow-md transition-all shrink-0"
                        >
                            {isArabic ? "تحديث البيانات" : "Refresh Data"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filter Card + Simplified Date Range */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 me-1">
                            <SlidersHorizontal size={14} className="text-[#172554]" />
                            {isArabic ? "اختر فترة سريعة:" : "Quick Select:"}
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
                            onClick={() => handleQuickPreset("yesterday")}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#172554] hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs"
                        >
                            {isArabic ? "أمس" : "Yesterday"}
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
                    </div>

                    {report && report.summary && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                            <span>{isArabic ? "البيانات محدثة" : "Updated"}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-wrap">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 flex-wrap">
                        
                        <div className="space-y-1.5 w-full sm:w-auto">
                            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                <Calendar size={14} className="text-[#172554]" />
                                {t("sales_report.date_range") || (isArabic ? "تحديد فترة مخصصة (من - إلى)" : "Custom Date Range")}
                            </label>
                            <RangePicker
                                format="DD/MM/YYYY"
                                value={dates}
                                onChange={(v) => {
                                    setDates(v);
                                    if (v && v.length === 2) {
                                        fetchData(v, type);
                                    }
                                }}
                                className="h-11 rounded-xl border-slate-300 hover:border-[#172554] focus:border-[#172554] font-semibold w-full sm:w-64"
                            />
                        </div>

                        <div className="space-y-1.5 w-full sm:w-auto">
                            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                <Filter size={14} className="text-[#172554]" />
                                {t("sales_report.report_type") || (isArabic ? "نوع العرض البياني" : "Grouping Type")}
                            </label>
                            <Select
                                className="h-11 w-full sm:w-48"
                                value={type}
                                onChange={(val) => {
                                    setType(val);
                                    fetchData(dates, val);
                                }}
                                options={[
                                    { value: "daily", label: t("sales_report.daily") || (isArabic ? "يومي (Daily)" : "Daily") },
                                    { value: "weekly", label: t("sales_report.weekly") || (isArabic ? "أسبوعي (Weekly)" : "Weekly") },
                                    { value: "monthly", label: t("sales_report.monthly") || (isArabic ? "شهري (Monthly)" : "Monthly") },
                                    { value: "yearly", label: t("sales_report.yearly") || (isArabic ? "سنوي (Yearly)" : "Yearly") },
                                ]}
                            />
                        </div>

                        <Button
                            type="primary"
                            icon={<Search size={16} />}
                            loading={loading}
                            onClick={() => fetchData()}
                            className="h-11 px-6 rounded-xl bg-[#172554] hover:bg-[#1e3a8a] text-white font-bold border-0 shadow-sm hover:shadow-md transition-all w-full sm:w-auto"
                        >
                            {t("sales_report.apply") || (isArabic ? "تطبيق الفلتر" : "Apply Filter")}
                        </Button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200/80 shadow-sm">
                    <Spin size="large" />
                    <p className="mt-4 text-slate-500 font-bold text-sm animate-pulse">
                        {isArabic ? "جاري معالجة البيانات وتحضير التقارير المالية..." : "Processing financial data and reports..."}
                    </p>
                </div>
            ) : !report ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8">
                    <Package size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-semibold text-base">
                        {isArabic ? "لا توجد بيانات متاحة لعرض التقرير في هذه الفترة." : "No data available for the selected period."}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">

                    {/* 3. Executive Summary KPI Cards (6 EQUAL, CLEAN, GORGEOUS WHITE CARDS IN NAVY BLUE / كحلي THEME) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        
                        {/* 1. Total Revenue */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#172554]/50 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <span className="text-slate-500 font-bold text-sm">
                                        {t("dashboard.total_revenue") || (isArabic ? "إجمالي الإيرادات" : "Total Revenue")}
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-[#172554]/10 text-[#172554] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                                        <DollarSign size={24} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                    {formatCurr(report.summary.totalRevenue)}
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span>{isArabic ? "الإيرادات المحققة في الفترة" : "Generated revenue"}</span>
                                <span className="font-bold text-[#172554] bg-[#172554]/10 px-2 py-0.5 rounded-md">{isArabic ? "صافي الإيراد" : "Net Flow"}</span>
                            </div>
                        </div>

                        {/* 2. Total Orders */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#172554]/50 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <span className="text-slate-500 font-bold text-sm">
                                        {t("dashboard.total_orders") || (isArabic ? "إجمالي الطلبات" : "Total Orders")}
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-[#172554]/10 text-[#172554] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                                        <ShoppingBag size={24} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                    {Number(report.summary.totalOrders || 0).toLocaleString()} <span className="text-base font-bold text-slate-400">{isArabic ? "طلب" : "order"}</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span>{isArabic ? "عدد الطلبات المسجلة" : "Recorded orders"}</span>
                                <span className="font-bold text-[#172554] bg-[#172554]/10 px-2 py-0.5 rounded-md">
                                    {report.breakdown.completionRate !== undefined ? `${Number(report.breakdown.completionRate).toFixed(1)}% نجاح` : "نجاح"}
                                </span>
                            </div>
                        </div>

                        {/* 3. Average Order Value (AOV) */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#172554]/50 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <span className="text-slate-500 font-bold text-sm">
                                        {t("sales_report.avg_order_value") || (isArabic ? "متوسط قيمة الطلب (AOV)" : "Average Order Value")}
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-[#172554]/10 text-[#172554] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                                        <TrendingUp size={24} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                    {formatCurr(report.summary.averageOrderValue)}
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span>{isArabic ? "معدل إنفاق العميل للطلب" : "Avg customer spend"}</span>
                                <span className="font-bold text-[#172554] bg-[#172554]/10 px-2 py-0.5 rounded-md">{isArabic ? "مؤشر الشراء" : "Avg Spend"}</span>
                            </div>
                        </div>

                        {/* 4. Total Items Sold */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#172554]/50 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <span className="text-slate-500 font-bold text-sm">
                                        {t("sales_report.total_items_sold") || (isArabic ? "المنتجات المباعة (الوحدات)" : "Total Items Sold")}
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-[#172554]/10 text-[#172554] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                                        <Package size={24} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                    {Number(report.summary.totalItemsSold || 0).toLocaleString()} <span className="text-base font-bold text-slate-400">{isArabic ? "وحدة" : "unit"}</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span>{isArabic ? "إجمالي قطع المنتجات المباعة" : "Physical items sold"}</span>
                                <span className="font-bold text-[#172554] bg-[#172554]/10 px-2 py-0.5 rounded-md">{isArabic ? "وحدات فعلية" : "Units"}</span>
                            </div>
                        </div>

                        {/* 5. Total Discount Given */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#172554]/50 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <span className="text-slate-500 font-bold text-sm">
                                        {t("sales_report.total_discount_given") || (isArabic ? "الخصومات الممنوحة" : "Total Discounts Given")}
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-[#172554]/10 text-[#172554] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                                        <TagIcon size={24} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                    {formatCurr(report.summary.totalDiscountGiven)}
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span>{isArabic ? "قيم الكوبونات والعروض المستخدمة" : "Coupons & promos used"}</span>
                                <span className="font-bold text-[#172554] bg-[#172554]/10 px-2 py-0.5 rounded-md">
                                    {report.summary.totalRevenue > 0 
                                        ? `${((Number(report.summary.totalDiscountGiven || 0) / Number(report.summary.totalRevenue)) * 100).toFixed(1)}% خصم` 
                                        : "0%"}
                                </span>
                            </div>
                        </div>

                        {/* 6. Total Shipping Revenue */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#172554]/50 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <span className="text-slate-500 font-bold text-sm">
                                        {t("sales_report.total_shipping_revenue") || (isArabic ? "إيرادات الشحن والتوصيل" : "Shipping Revenue")}
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-[#172554]/10 text-[#172554] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                                        <Truck size={24} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                    {formatCurr(report.summary.totalShippingRevenue)}
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span>{isArabic ? "رسوم التوصيل المحصلة من الطلبات" : "Delivery fees collected"}</span>
                                <span className="font-bold text-[#172554] bg-[#172554]/10 px-2 py-0.5 rounded-md">{isArabic ? "خدمات الشحن" : "Shipping"}</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. Revenue Trend Area Chart */}
                    {report.trends && report.trends.length > 0 && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div>
                                    <h3 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-2.5">
                                        <span className="w-3 h-3 rounded-full bg-[#172554]"></span>
                                        {t("sales_report.revenue_trend") || (isArabic ? "المنحنى الزمني لتطور الإيرادات والمبيعات" : "Revenue Growth Trend Over Time")}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {isArabic ? "تحليل بياني لحركة التدفقات المالية حسب الفترة الزمنية المحددة" : "Visual analysis of financial flow by selected timeframe"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[#172554] font-bold text-xs">
                                        {type === "daily" ? (isArabic ? "عرض يومي" : "Daily View") : 
                                         type === "weekly" ? (isArabic ? "عرض أسبوعي" : "Weekly View") : 
                                         type === "monthly" ? (isArabic ? "عرض شهري" : "Monthly View") : (isArabic ? "عرض سنوي" : "Yearly View")}
                                    </span>
                                </div>
                            </div>

                            <div style={{ width: "100%", height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={report.trends} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#172554" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#172554" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(v) => dayjs(v).format(type === "yearly" ? "YYYY" : "DD/MM")}
                                            stroke="#94a3b8"
                                            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                                        />
                                        <YAxis
                                            stroke="#94a3b8"
                                            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                                            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#0f172a",
                                                borderRadius: "12px",
                                                border: "1px solid #334155",
                                                color: "#fff",
                                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
                                            }}
                                            labelFormatter={(v) => `${isArabic ? "التاريخ: " : "Date: "}${dayjs(v).format("DD/MM/YYYY")}`}
                                            formatter={(value) => [formatCurr(value), isArabic ? "الإيراد المحقق" : "Revenue"]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#172554"
                                            strokeWidth={3.5}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                            activeDot={{ r: 7, strokeWidth: 2, stroke: "#fff", fill: "#172554" }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* 5. Comparative Financial Analysis (3 CLEAN, BEAUTIFUL WHITE CARDS IN NAVY BLUE THEME - EXACTLY AS BEFORE BUT EASIER TO READ) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        
                        {/* Card 1: Revenue vs Orders */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-[#172554]/50 transition-all">
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#172554]"></span>
                                        {t("sales_report.revenue_vs_orders") || (isArabic ? "الإيرادات مقابل الطلبات" : "Revenue vs Orders")}
                                    </h4>
                                    <div className="w-10 h-10 rounded-xl bg-[#172554]/10 text-[#172554] flex items-center justify-center font-bold">
                                        <DollarSign size={20} />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mb-6">{isArabic ? "مقارنة الحجم الكلي للمبيعات مع عدد العمليات المنفذة" : "Total sales revenue vs completed order transactions"}</p>

                                <div className="space-y-4">
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-xs text-slate-500 font-bold">{isArabic ? "إجمالي الإيرادات المحققة:" : "Total Revenue:"}</span>
                                        <span className="text-lg font-black text-[#172554]">{formatCurr(report.summary.totalRevenue)}</span>
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-xs text-slate-500 font-bold">{isArabic ? "إجمالي عدد الطلبات:" : "Total Orders:"}</span>
                                        <span className="text-base font-extrabold text-slate-800">{Number(report.summary.totalOrders || 0).toLocaleString()} {isArabic ? "طلب" : "order"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                                    <span className="text-slate-600">{isArabic ? "نسبة إتمام الطلبات بنجاح:" : "Success Rate:"}</span>
                                    <span className="text-emerald-700 font-extrabold">{report.breakdown.completionRate !== undefined ? `${Number(report.breakdown.completionRate).toFixed(1)}%` : "100%"}</span>
                                </div>
                                <Progress 
                                    percent={report.breakdown.completionRate !== undefined ? Number(report.breakdown.completionRate) : 100} 
                                    strokeColor="#172554" 
                                    showInfo={false} 
                                    size="small" 
                                />
                            </div>
                        </div>

                        {/* Card 2: Discounts Given */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-[#172554]/50 transition-all">
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#172554]"></span>
                                        {t("sales_report.discounts_given") || (isArabic ? "الخصومات الممنوحة" : "Discounts Given")}
                                    </h4>
                                    <div className="w-10 h-10 rounded-xl bg-[#172554]/10 text-[#172554] flex items-center justify-center font-bold">
                                        <TagIcon size={20} />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mb-6">{isArabic ? "إجمالي قيمة الخصومات وكوبونات التخفيض المستخدمة" : "Total value of promotional coupons and discounts"}</p>

                                <div className="space-y-4">
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-xs text-slate-500 font-bold">{isArabic ? "إجمالي قيمة الخصم:" : "Discount Total:"}</span>
                                        <span className="text-lg font-black text-[#172554]">{formatCurr(report.summary.totalDiscountGiven)}</span>
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-xs text-slate-500 font-bold">{isArabic ? "نسبة الخصم من الإيراد:" : "Discount %:"}</span>
                                        <span className="text-base font-extrabold text-slate-800">
                                            {report.summary.totalRevenue > 0 
                                                ? `${((Number(report.summary.totalDiscountGiven || 0) / Number(report.summary.totalRevenue)) * 100).toFixed(1)}%` 
                                                : "0%"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                                    <span className="text-slate-600">{isArabic ? "مستوى تأثير الخصومات:" : "Impact Level:"}</span>
                                    <span className="text-[#172554] font-extrabold">
                                        {report.summary.totalRevenue > 0 
                                            ? `${((Number(report.summary.totalDiscountGiven || 0) / Number(report.summary.totalRevenue)) * 100).toFixed(1)}% من الإجمالي` 
                                            : "0%"}
                                    </span>
                                </div>
                                <Progress 
                                    percent={report.summary.totalRevenue > 0 ? Math.min(100, (Number(report.summary.totalDiscountGiven || 0) / Number(report.summary.totalRevenue)) * 100) : 0} 
                                    strokeColor="#172554" 
                                    showInfo={false} 
                                    size="small" 
                                />
                            </div>
                        </div>

                        {/* Card 3: Shipping Revenue */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-[#172554]/50 transition-all">
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#172554]"></span>
                                        {t("sales_report.shipping_revenue") || (isArabic ? "إيرادات الشحن والتوصيل" : "Shipping Revenue")}
                                    </h4>
                                    <div className="w-10 h-10 rounded-xl bg-[#172554]/10 text-[#172554] flex items-center justify-center font-bold">
                                        <Truck size={20} />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mb-6">{isArabic ? "عائدات خدمات الشحن والتوصيل المحصلة من العملاء" : "Delivery and shipping fees collected from customers"}</p>

                                <div className="space-y-4">
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-xs text-slate-500 font-bold">{isArabic ? "إيرادات الشحن المحصلة:" : "Shipping Revenue:"}</span>
                                        <span className="text-lg font-black text-[#172554]">{formatCurr(report.summary.totalShippingRevenue)}</span>
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-xs text-slate-500 font-bold">{isArabic ? "نسبة الشحن من الإيراد:" : "Shipping %:"}</span>
                                        <span className="text-base font-extrabold text-slate-800">
                                            {report.summary.totalRevenue > 0 
                                                ? `${((Number(report.summary.totalShippingRevenue || 0) / Number(report.summary.totalRevenue)) * 100).toFixed(1)}%` 
                                                : "0%"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                                    <span className="text-slate-600">{isArabic ? "مساهمة الشحن في الإيراد:" : "Revenue Contribution:"}</span>
                                    <span className="text-[#172554] font-extrabold">
                                        {report.summary.totalRevenue > 0 
                                            ? `${((Number(report.summary.totalShippingRevenue || 0) / Number(report.summary.totalRevenue)) * 100).toFixed(1)}% من الإجمالي` 
                                            : "0%"}
                                    </span>
                                </div>
                                <Progress 
                                    percent={report.summary.totalRevenue > 0 ? Math.min(100, (Number(report.summary.totalShippingRevenue || 0) / Number(report.summary.totalRevenue)) * 100) : 0} 
                                    strokeColor="#172554" 
                                    showInfo={false} 
                                    size="small" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* 6. Orders Breakdown & Customer Insights - ONLY NAVY BLUE (#172554) & MAROON (#9f1239) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Left: Orders Breakdown (2 cols in lg) */}
                        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2.5">
                                <span className="w-3 h-3 rounded-full bg-[#172554]"></span>
                                {t("sales_report.breakdown") || (isArabic ? "توزيع حالات الطلبات وتحليل الأداء" : "Orders Status Breakdown")}
                            </h3>
                            
                            {/* 4 Status Cards using ONLY Navy Blue and Maroon as requested */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                
                                {/* Completed -> Navy Blue (#172554) */}
                                <div className="p-4 rounded-2xl bg-[#172554]/[0.07] border border-[#172554]/20 flex flex-col justify-between">
                                    <div className="flex items-center justify-between text-[#172554] mb-3">
                                        <span className="text-xs font-bold">{t("sales_report.completed_orders") || (isArabic ? "مكتملة" : "Completed")}</span>
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <div className="text-2xl font-black text-[#172554]">
                                        {Number(report.breakdown.completedOrders || 0).toLocaleString()}
                                    </div>
                                </div>

                                {/* Pending -> Navy Blue light / Slate */}
                                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col justify-between">
                                    <div className="flex items-center justify-between text-slate-700 mb-3">
                                        <span className="text-xs font-bold">{t("sales_report.pending_orders") || (isArabic ? "قيد الانتظار" : "Pending")}</span>
                                        <Clock size={18} />
                                    </div>
                                    <div className="text-2xl font-black text-slate-800">
                                        {Number(report.breakdown.pendingOrders || 0).toLocaleString()}
                                    </div>
                                </div>

                                {/* Cancelled -> Maroon (نبيتي) */}
                                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex flex-col justify-between">
                                    <div className="flex items-center justify-between text-[#9f1239] mb-3">
                                        <span className="text-xs font-bold">{t("sales_report.cancelled_orders") || (isArabic ? "ملغاة" : "Cancelled")}</span>
                                        <XCircle size={18} />
                                    </div>
                                    <div className="text-2xl font-black text-[#9f1239]">
                                        {Number(report.breakdown.cancelledOrders || 0).toLocaleString()}
                                    </div>
                                </div>

                                {/* Refunded -> Dark Maroon (نبيتي داكن) */}
                                <div className="p-4 rounded-2xl bg-rose-100/70 border border-rose-300 flex flex-col justify-between">
                                    <div className="flex items-center justify-between text-[#881337] mb-3">
                                        <span className="text-xs font-bold">{t("sales_report.refunded_orders") || (isArabic ? "مسترجعة" : "Refunded")}</span>
                                        <RotateCcw size={18} />
                                    </div>
                                    <div className="text-2xl font-black text-[#881337]">
                                        {Number(report.breakdown.refundedOrders || 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bars for Completion (Navy Blue) vs Cancellation (Maroon) */}
                            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                            <CheckCircle2 size={15} className="text-[#172554]" />
                                            {t("dashboard.completion_rate") || (isArabic ? "معدل إنجاز الطلبات (Completion Rate)" : "Completion Rate")}
                                        </span>
                                        <span className="font-black text-[#172554] text-sm">
                                            {report.breakdown.completionRate !== undefined ? Number(report.breakdown.completionRate).toFixed(1) : "0.0"}%
                                        </span>
                                    </div>
                                    <Progress 
                                        percent={report.breakdown.completionRate !== undefined ? Number(report.breakdown.completionRate) : 0} 
                                        strokeColor="#172554" 
                                        showInfo={false} 
                                        size="small" 
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                            <XCircle size={15} className="text-[#9f1239]" />
                                            {t("sales_report.cancellation_rate") || (isArabic ? "معدل إلغاء الطلبات (Cancellation Rate)" : "Cancellation Rate")}
                                        </span>
                                        <span className="font-black text-[#9f1239] text-sm">
                                            {report.breakdown.cancellationRate !== undefined ? Number(report.breakdown.cancellationRate).toFixed(1) : "0.0"}%
                                        </span>
                                    </div>
                                    <Progress 
                                        percent={report.breakdown.cancellationRate !== undefined ? Number(report.breakdown.cancellationRate) : 0} 
                                        strokeColor="#9f1239" 
                                        showInfo={false} 
                                        size="small" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right: Customer Insights Card (Navy Blue Executive Card) */}
                        <div className="bg-gradient-to-b from-[#172554] to-[#0f172a] p-6 md:p-8 rounded-3xl text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold mb-4">
                                    <Users size={14} />
                                    <span>{isArabic ? "إحصائيات العملاء" : "Customer Intelligence"}</span>
                                </div>
                                <h3 className="text-lg font-black text-white mb-6">
                                    {t("sales_report.customer_insights") || (isArabic ? "تحليلات تفاعل وولاء العملاء" : "Customer Insights")}
                                </h3>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/10 text-blue-300 flex items-center justify-center">
                                                <Users size={18} />
                                            </div>
                                            <span className="text-xs md:text-sm text-slate-200 font-semibold">{t("sales_report.unique_customers") || (isArabic ? "العملاء الفريدين" : "Unique Customers")}</span>
                                        </div>
                                        <span className="text-lg font-black text-white">{Number(report.customerInsights.uniqueCustomers || 0).toLocaleString()}</span>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center">
                                                <UserCheck size={18} />
                                            </div>
                                            <span className="text-xs md:text-sm text-slate-200 font-semibold">{t("sales_report.returning_customers") || (isArabic ? "العملاء العائدون (المتكررون)" : "Returning Customers")}</span>
                                        </div>
                                        <span className="text-lg font-black text-white">{Number(report.customerInsights.returningCustomers || 0).toLocaleString()}</span>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center">
                                                <Repeat size={18} />
                                            </div>
                                            <span className="text-xs md:text-sm text-slate-200 font-semibold">{t("sales_report.avg_orders_per_customer") || (isArabic ? "متوسط الطلبات لكل عميل" : "Avg Orders / Customer")}</span>
                                        </div>
                                        <span className="text-lg font-black text-white">{Number(report.customerInsights.averageOrdersPerCustomer || 0).toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-white/10 text-center">
                                <span className="text-2xs text-blue-200/70 font-medium">
                                    {isArabic ? "مؤشرات الولاء تساعدك على تصميم حملات تسويقية وكوبونات مخصصة." : "Loyalty metrics help you design targeted promotional campaigns."}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 7. Top Selling Products Section */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-2.5">
                                    <span className="w-3 h-3 rounded-full bg-[#172554]"></span>
                                    <Award size={22} className="text-amber-500" />
                                    {t("sales_report.top_products") || (isArabic ? "المنتجات الأكثر مبيعاً وتحقيقاً للإيرادات في هذه الفترة" : "Top Selling & Highest Revenue Products")}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    {isArabic ? "قائمة تفصيلية بالمنتجات الأفضل أداءً مدعومة بالصور الحقيقية ومؤشرات الإيراد" : "Detailed breakdown of top performing products with real images & revenue metrics"}
                                </p>
                            </div>
                            <Tag color="blue" className="px-3 py-1 text-xs font-bold rounded-full w-fit bg-[#172554]/10 text-[#172554] border-[#172554]/20">
                                {isArabic ? "أعلى المنتجات أداءً" : "Top Performers"}
                            </Tag>
                        </div>

                        {(!report.topProducts || report.topProducts.length === 0) ? (
                            <div className="py-12 text-center">
                                <Package size={40} className="mx-auto text-slate-300 mb-2" />
                                <span className="text-slate-500 font-bold text-sm block">
                                    {t("sales_report.no_top_products") || (isArabic ? "لا توجد منتجات مباعة مسجلة في هذا النطاق الزمني" : "No sold products recorded in this period")}
                                </span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table
                                    columns={topProductsColumns}
                                    dataSource={(report.topProducts || []).map((p, i) => ({ ...p, actualRank: i + 1 }))}
                                    rowKey={(r, idx) => r.id || idx}
                                    pagination={false}
                                    locale={tableLocale}
                                    className="custom-luxury-table"
                                />
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}
