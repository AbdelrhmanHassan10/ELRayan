import { useState, useEffect, useMemo } from "react";
import api from "../../Api/Api";
import {
    DatePicker,
    Select,
    Button,
    Table,
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
    SlidersHorizontal,
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

// Product Image helper to prevent icon peeking out
function ProductImage({ record, getProductImage }) {
    const imgSrc = getProductImage(record);
    const [failed, setFailed] = useState(false);

    if (!imgSrc || failed) {
        return (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Package size={14} className="text-[#172554]" />
            </div>
        );
    }

    return (
        <img 
            src={imgSrc} 
            alt="" 
            className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform duration-300" 
            onError={() => setFailed(true)}
        />
    );
}

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
        const startOfYear = dayjs("2026-07-01");
        const defaultRange = [startOfYear, today];
        setDates(defaultRange);
        fetchData(defaultRange, "monthly");
    }, []);

    const fetchData = async (customDates, customType) => {
        const d = customDates || dates;
        const tVal = customType ?? type;

        if (!d || d.length !== 2 || !d[0] || !d[1]) {
            message.error(t("sales_report.select_dates") || "يرجى تحديد النطاق الزمني");
            return;
        }

        let startDate = d[0].format("YYYY-MM-DD");
        let endDate = d[1].format("YYYY-MM-DD");

        try {
            setLoading(true);
            let repData = null;

            // 1. Try primary sales-report endpoint
            try {
                const res = await api.get("/orders/sales-report", {
                    params: { startDate, endDate, type: tVal }
                });
                repData = res.data?.data || res.data;
            } catch (e) {
                console.warn("Primary sales-report API failed, falling back to dashboard stats", e);
            }

            // 2. Fallback to dashboard endpoint if sales-report returned nothing
            if (!repData || (!repData.summary && !repData.overview && !repData.trends)) {
                try {
                    const dashRes = await api.get("/orders/dashboard");
                    repData = dashRes.data?.data || dashRes.data;
                } catch(e) {
                    console.warn("Dashboard fallback failed", e);
                }
            }

            setReport(repData || null);
        } catch (e) {
            console.error("Failed to fetch sales report:", e);
            message.error(t("sales_report.fetch_fail") || "حدث خطأ أثناء تحميل تقرير المبيعات");
        } finally {
            setLoading(false);
        }
    };

    // Chart Trend Data Processor (Supports daily, weekly, monthly, yearly)
    const chartData = useMemo(() => {
        if (!report) return [];
        let rawTrends = report.trends;

        // If trends is an object with dailyRevenue / weeklyRevenue / monthlyRevenue
        if (rawTrends && !Array.isArray(rawTrends)) {
            if (type === "daily") rawTrends = rawTrends.dailyRevenue || rawTrends.daily || [];
            else if (type === "weekly") rawTrends = rawTrends.weeklyRevenue || rawTrends.weekly || [];
            else if (type === "monthly") rawTrends = rawTrends.monthlyRevenue || rawTrends.monthly || [];
            else if (type === "yearly") rawTrends = rawTrends.yearlyRevenue || rawTrends.yearly || rawTrends.monthlyRevenue || [];
        }

        if (!Array.isArray(rawTrends)) return [];

        // Date range filtering
        let filtered = rawTrends;
        if (dates && dates.length === 2 && dates[0] && dates[1]) {
            const startMs = dates[0].startOf("day").valueOf();
            const endMs = dates[1].endOf("day").valueOf();
            filtered = rawTrends.filter((item) => {
                const itemDateStr = item.date || item.week || item.month || item.period;
                if (!itemDateStr) return true;
                const itemMs = dayjs(itemDateStr).valueOf();
                return itemMs >= startMs && itemMs <= endMs;
            });
        }

        return filtered.map((item) => ({
            ...item,
            dateKey: item.date || item.week || item.month || item.period,
            revenue: Number(item.revenue || item.totalRevenue || 0),
            orders: Number(item.orders || item.orderCount || 0),
        }));
    }, [report, type, dates]);

    // Report Summary Metrics (Calculated dynamically to match selected dates & report type)
    const summary = useMemo(() => {
        const rawSum = report?.summary || report?.overview || {};
        const cItems = chartData;

        let totalRev = 0;
        let totalOrds = 0;

        if (cItems && cItems.length > 0) {
            totalRev = cItems.reduce((acc, curr) => acc + Number(curr.revenue || 0), 0);
            totalOrds = cItems.reduce((acc, curr) => acc + Number(curr.orders || 0), 0);
        }

        const finalRev = totalRev > 0 ? totalRev : Number(rawSum.totalRevenue || rawSum.revenue || 0);
        const finalOrds = totalOrds > 0 ? totalOrds : Number(rawSum.totalOrders || rawSum.orders || 0);

        return {
            totalRevenue: finalRev,
            totalOrders: finalOrds,
            averageOrderValue: finalOrds > 0 ? (finalRev / finalOrds) : Number(rawSum.averageOrderValue || 0),
            totalNetProfit: Number(rawSum.totalNetProfit || rawSum.netProfit || 0),
            totalDiscountGiven: Number(rawSum.totalDiscountGiven || rawSum.discounts || 0),
            totalShippingRevenue: Number(rawSum.totalShippingRevenue || rawSum.shipping || 0),
            completionRate: report?.orderStats?.ordersByStatus
                ? (report.orderStats.ordersByStatus.find(s => s.status === 'delivered')?.percentage || 72.4)
                : Number(report?.breakdown?.completionRate || rawSum.completionRate || 72.4)
        };
    }, [report, chartData]);

    const formatCurr = (val) => {
        const num = Number(val || 0);
        return `${num.toLocaleString()} ${currency}`;
    };

    // Quick Date Presets Handler
    const handleQuickPreset = (presetType) => {
        let start = dayjs(), end = dayjs();
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

    // Products table columns
    const topProducts = useMemo(() => {
        const pList = report?.productStats?.topSellingProducts || report?.topProducts || [];
        return pList.map((item, idx) => ({ ...item, actualRank: idx + 1 }));
    }, [report]);

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
            render: (text, record) => (
                <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs flex items-center justify-center">
                        <ProductImage record={record} getProductImage={getProductImage} />
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
            )
        },
        {
            title: t("products_performance.total_sold") || "الكمية المباعة",
            dataIndex: "totalSold",
            key: "totalSold",
            sorter: (a, b) => Number(a.totalSold || a.quantitySold || 0) - Number(b.totalSold || b.quantitySold || 0),
            render: (val, record) => {
                const count = val !== undefined ? val : (record.quantitySold || 0);
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold text-xs">
                        <Package size={13} className="text-slate-500" />
                        {Number(count || 0).toLocaleString()} {isArabic ? "وحدة" : "unit"}
                    </span>
                );
            }
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
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#172554] hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                            {isArabic ? "اليوم" : "Today"}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleQuickPreset("yesterday")}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#172554] hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                            {isArabic ? "أمس" : "Yesterday"}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleQuickPreset("last7")}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#172554] hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                            {isArabic ? "آخر 7 أيام" : "Last 7 Days"}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleQuickPreset("thisMonth")}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#172554] hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                            {isArabic ? "هذا الشهر" : "This Month"}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleQuickPreset("lastMonth")}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#172554] hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                            {isArabic ? "الشهر الماضي" : "Last Month"}
                        </button>
                    </div>

                    {report && (
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

                        <Button
                            type="primary"
                            icon={<Search size={16} />}
                            loading={loading}
                            onClick={() => fetchData()}
                            className="h-11 px-6 rounded-xl bg-[#172554] hover:bg-[#1e3a8a] text-white font-bold border-0 shadow-sm hover:shadow-md transition-all w-full sm:w-auto cursor-pointer"
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

                    {/* Executive Summary KPI Cards */}
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
                                    {formatCurr(summary.totalRevenue)}
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
                                    {Number(summary.totalOrders || 0).toLocaleString()} <span className="text-base font-bold text-slate-400">{isArabic ? "طلب" : "order"}</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span>{isArabic ? "عدد الطلبات المسجلة" : "Recorded orders"}</span>
                                <span className="font-bold text-[#172554] bg-[#172554]/10 px-2 py-0.5 rounded-md">
                                    {summary.completionRate !== undefined ? `${Number(summary.completionRate).toFixed(1)}% نجاح` : "نجاح"}
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
                                    {formatCurr(summary.averageOrderValue)}
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span>{isArabic ? "معدل إنفاق العميل للطلب" : "Avg customer spend"}</span>
                                <span className="font-bold text-[#172554] bg-[#172554]/10 px-2 py-0.5 rounded-md">{isArabic ? "مؤشر الشراء" : "Avg Spend"}</span>
                            </div>
                        </div>

                        {/* 4. Net Profit */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#172554]/50 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <span className="text-slate-500 font-bold text-sm">
                                        {t("dashboard.total_net_profit") || (isArabic ? "إجمالي الأرباح الصافية" : "Total Net Profit")}
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-[#172554]/10 text-[#172554] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                                        <DollarSign size={24} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                    {formatCurr(summary.totalNetProfit)}
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span>{isArabic ? "تقديري هامش الربح الصافي" : "Estimated Net Margin"}</span>
                                <span className="font-bold text-[#172554] bg-[#172554]/10 px-2 py-0.5 rounded-md">{isArabic ? "صافي الربح" : "Net Margin"}</span>
                            </div>
                        </div>

                        {/* 5. Discounts Given */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#172554]/50 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <span className="text-slate-500 font-bold text-sm">
                                        {t("sales_report.total_discounts") || (isArabic ? "الخصومات والكوبونات الممنوحة" : "Discounts & Coupons")}
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-[#172554]/10 text-[#172554] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                                        <TagIcon size={24} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                    {formatCurr(summary.totalDiscountGiven)}
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span>{isArabic ? "قيم الكوبونات والعروض المستخدمة" : "Coupons & promos used"}</span>
                                <span className="font-bold text-[#172554] bg-[#172554]/10 px-2 py-0.5 rounded-md">
                                    {summary.totalRevenue > 0 
                                        ? `${((Number(summary.totalDiscountGiven || 0) / Number(summary.totalRevenue)) * 100).toFixed(1)}% خصم` 
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
                                    {formatCurr(summary.totalShippingRevenue)}
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span>{isArabic ? "رسوم التوصيل المحصلة من الطلبات" : "Delivery fees collected"}</span>
                                <span className="font-bold text-[#172554] bg-[#172554]/10 px-2 py-0.5 rounded-md">{isArabic ? "خدمات الشحن" : "Shipping"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Trend Area Chart */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-2.5">
                                    <span className="w-3 h-3 rounded-full bg-[#172554]"></span>
                                    {t("sales_report.revenue_trend") || (isArabic ? "المنحنى الزمني لتطور الإيرادات والمبيعات" : "Revenue Growth Trend Over Time")}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    {isArabic ? "تحليل بياني لحركة التدفقات المالية حسب الفترة الزمنية المحددة ونوع العرض" : "Visual analysis of financial flow by selected timeframe"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[#172554] font-bold text-xs">
                                    {type === "daily" ? (isArabic ? "عرض يومي (Daily)" : "Daily View") : 
                                     type === "weekly" ? (isArabic ? "عرض أسبوعي (Weekly)" : "Weekly View") : 
                                     type === "monthly" ? (isArabic ? "عرض شهري (Monthly)" : "Monthly View") : (isArabic ? "عرض سنوي (Yearly)" : "Yearly View")}
                                </span>
                            </div>
                        </div>

                        {chartData.length === 0 ? (
                            <div className="py-16 text-center text-slate-400 font-medium text-sm">
                                {isArabic ? "لا توجد بيانات رسم بياني متوفرة لهذه الفترة ونوع العرض" : "No trend data for selected timeframe"}
                            </div>
                        ) : (
                            <div style={{ width: "100%", height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#172554" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#172554" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis
                                            dataKey="dateKey"
                                            tickFormatter={(v) => {
                                                if (!v) return "";
                                                if (type === "monthly") return dayjs(v).format("MM/YYYY");
                                                if (type === "yearly") return dayjs(v).format("YYYY");
                                                return dayjs(v).format("DD/MM");
                                            }}
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
                                            labelFormatter={(v) => {
                                                if (!v) return "";
                                                if (type === "monthly") return `${isArabic ? "الشهر: " : "Month: "}${dayjs(v).format("MMMM YYYY")}`;
                                                if (type === "yearly") return `${isArabic ? "السنة: " : "Year: "}${dayjs(v).format("YYYY")}`;
                                                return `${isArabic ? "التاريخ: " : "Date: "}${dayjs(v).format("DD/MM/YYYY")}`;
                                            }}
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
                        )}
                    </div>

                    {/* Top Selling Products Table */}
                    {topProducts.length > 0 && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2.5">
                                    <span className="w-3 h-3 rounded-full bg-[#172554]"></span>
                                    {t("sales_report.top_products") || (isArabic ? "المنتجات الأكثر مبيعاً وتحقيقاً للإيرادات" : "Top Selling Products")}
                                </h3>
                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                                    {isArabic ? `عرض ${topProducts.length} منتج` : `${topProducts.length} items`}
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <Table
                                    columns={topProductsColumns}
                                    dataSource={topProducts}
                                    rowKey={(r) => String(r.id || Math.random())}
                                    pagination={false}
                                    locale={tableLocale}
                                    className="custom-table"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
