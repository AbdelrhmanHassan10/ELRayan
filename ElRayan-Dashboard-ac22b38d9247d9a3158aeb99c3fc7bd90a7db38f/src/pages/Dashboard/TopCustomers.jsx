import { useState, useEffect, useMemo } from "react";
import api from "../../Api/Api";
import {
    DatePicker,
    Select,
    Button,
    Table,
    message,
    Spin,
    InputNumber,
    Empty,
    Input,
    Progress
} from "antd";
import { 
    Search, 
    TrendingUp, 
    DollarSign, 
    Users, 
    Calendar, 
    Filter, 
    RefreshCw, 
    Sparkles, 
    Award, 
    SlidersHorizontal,
    ShoppingBag, 
    Phone, 
    Mail, 
    Crown,
    Star,
    ShieldCheck
} from "lucide-react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const { RangePicker } = DatePicker;

export default function TopCustomers() {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [dates, setDates] = useState([]);
    const [limit, setLimit] = useState(20);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTier, setSelectedTier] = useState("ALL");

    const isArabic = i18n.language === "ar";
    const currency = isArabic ? "ج.م" : "EGP";

    useEffect(() => {
        const today = dayjs().endOf("day");
        const startOfYear = dayjs("2026-01-01").startOf("day");
        const defaultRange = [startOfYear, today];
        setDates(defaultRange);
        fetchData(defaultRange, limit);
    }, []);

    const fetchData = async (customDates = dates, customLimit = limit) => {
        if (!customDates || customDates.length !== 2) {
            message.error(t("top_customers.select_dates") || "يرجى تحديد النطاق الزمني");
            return;
        }

        const startDate = customDates[0] ? customDates[0].format("YYYY-MM-DD") : "2026-01-01";
        const endDate = customDates[1] ? customDates[1].format("YYYY-MM-DD") : "2026-12-31";

        try {
            setLoading(true);
            let items = [];

            // 1. Primary endpoint /orders/top-customer
            try {
                const res = await api.get("/orders/top-customer", {
                    params: { 
                        startDate, 
                        endDate, 
                        limit: customLimit, 
                        pageSize: customLimit, 
                        take: customLimit 
                    }
                });
                const raw = res.data;
                items = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : (raw?.data?.topCustomers || raw?.topCustomers || []));
            } catch (e) {
                console.warn("Primary top-customer API failed, trying fallback", e);
            }

            // 2. Fallback to /orders/dashboard
            if (!items || items.length === 0) {
                try {
                    const dashRes = await api.get("/orders/dashboard");
                    const dData = dashRes.data?.data || dashRes.data || {};
                    items = dData?.topCustomers || [];
                } catch(e) {}
            }

            setCustomers(items || []);
        } catch (e) {
            console.error("Failed to fetch top customers:", e);
            message.error(t("top_customers.fetch_fail") || "حدث خطأ أثناء تحميل بيانات العملاء");
        } finally {
            setLoading(false);
        }
    };

    const formatCurr = (val) => {
        const num = Number(val || 0);
        return `${num.toLocaleString()} ${currency}`;
    };

    // Quick Date Presets
    const handleQuickPreset = (presetType) => {
        let start = dayjs();
        let end = dayjs().endOf("day");

        if (presetType === "today") {
            start = dayjs().startOf("day");
        } else if (presetType === "last7") {
            start = dayjs().subtract(7, "day").startOf("day");
        } else if (presetType === "thisMonth") {
            start = dayjs().startOf("month");
        } else if (presetType === "lastMonth") {
            start = dayjs().subtract(1, "month").startOf("month");
            end = dayjs().subtract(1, "month").endOf("month");
        } else if (presetType === "last6Months") {
            start = dayjs().subtract(6, "month").startOf("day");
        } else if (presetType === "allTime") {
            start = dayjs("2020-01-01").startOf("day");
        }

        const newRange = [start, end];
        setDates(newRange);
        fetchData(newRange, limit);
    };

    // Enrich customers with VIP Tiers
    const enrichedCustomers = useMemo(() => {
        if (!Array.isArray(customers)) return [];
        return customers.map((c, idx) => {
            let tier = "SILVER";
            let tierLabel = isArabic ? "الفئة الفضية" : "Silver Tier";
            if (idx < 3) {
                tier = "DIAMOND";
                tierLabel = isArabic ? "الفئة الماسية" : "Diamond Tier";
            } else if (idx < 10) {
                tier = "GOLD";
                tierLabel = isArabic ? "الفئة الذهبية" : "Gold Tier";
            }
            return { ...c, tier, tierLabel, actualRank: idx + 1 };
        });
    }, [customers, isArabic]);

    // Filter customers by search query and VIP tier
    const filteredCustomers = useMemo(() => {
        return enrichedCustomers.filter((c) => {
            const nameMatch = !searchQuery || 
                (c.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                (c.email || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                (c.phoneNumber || "").includes(searchQuery) ||
                String(c.userId || "").includes(searchQuery);
            const tierMatch = selectedTier === "ALL" || c.tier === selectedTier;
            return nameMatch && tierMatch;
        });
    }, [enrichedCustomers, searchQuery, selectedTier]);

    // Calculate summary statistics
    const stats = useMemo(() => {
        if (!filteredCustomers.length) return { totalSpent: 0, totalOrders: 0, avgSpend: 0, avgOrders: 0 };
        const totalSpent = filteredCustomers.reduce((acc, curr) => acc + Number(curr.totalSpent || 0), 0);
        const totalOrders = filteredCustomers.reduce((acc, curr) => acc + Number(curr.orderCount || 0), 0);
        const avgSpend = totalSpent / filteredCustomers.length;
        const avgOrders = totalOrders / filteredCustomers.length;
        return { totalSpent, totalOrders, avgSpend, avgOrders };
    }, [filteredCustomers]);

    const columns = [
        {
            title: "#",
            dataIndex: "actualRank",
            key: "rank",
            width: 55,
            align: "center",
            render: (rank) => {
                if (rank === 1) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-700 font-extrabold text-xs border border-amber-500/30 shadow-sm" title="1st">1</span>;
                if (rank === 2) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/60 text-slate-700 font-bold text-xs border border-slate-400/30 shadow-sm" title="2nd">2</span>;
                if (rank === 3) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-800 font-bold text-xs border border-amber-700/30 shadow-sm" title="3rd">3</span>;
                return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200">{rank}</span>;
            },
        },
        { 
            title: t("top_customers.name") || "اسم العميل", 
            dataIndex: "fullName",
            key: "fullName",
            render: (text, record) => {
                const nameStr = text || (isArabic ? "عميل مجهول" : "Anonymous Customer");
                const initial = nameStr.charAt(0).toUpperCase();
                let tierBadge = null;
                if (record.tier === "DIAMOND") {
                    tierBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30">
                            <Crown size={11} className="text-amber-600" />
                            {record.tierLabel}
                        </span>
                    );
                } else if (record.tier === "GOLD") {
                    tierBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Star size={11} className="text-amber-600" />
                            {record.tierLabel}
                        </span>
                    );
                } else {
                    tierBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <ShieldCheck size={11} className="text-slate-400" />
                            {record.tierLabel}
                        </span>
                    );
                }

                return (
                    <div className="flex items-center gap-3 min-w-[170px]">
                        <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-800 font-extrabold text-xs flex items-center justify-center shrink-0 border border-rose-200/80 shadow-2xs">
                            {initial}
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-sm hover:text-rose-700 transition-colors leading-snug">
                                {nameStr}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-500 text-[10px]">ID: #{record.userId || "N/A"}</span>
                                {tierBadge}
                            </div>
                        </div>
                    </div>
                );
            }
        },
        { 
            title: t("top_customers.phone") || "التواصل الهاتفي", 
            dataIndex: "phoneNumber",
            key: "phoneNumber",
            render: (val, record) => (
                <div className="space-y-0.5 min-w-[120px]">
                    <div className="text-xs font-bold text-slate-700 font-mono" dir="ltr">
                        {val || "—"}
                    </div>
                    {record.email && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]" title={record.email}>
                            {record.email}
                        </div>
                    )}
                </div>
            )
        },
        { 
            title: t("top_customers.order_count") || "عدد الطلبات", 
            dataIndex: "orderCount",
            key: "orderCount",
            sorter: (a, b) => Number(a.orderCount || 0) - Number(b.orderCount || 0),
            render: (val) => (
                <span className="font-extrabold text-slate-800 text-sm">
                    {Number(val || 0).toLocaleString()} <span className="text-xs font-medium text-slate-400">{isArabic ? "طلب" : "orders"}</span>
                </span>
            )
        },
        { 
            title: t("top_customers.total_spent") || "إجمالي الإنفاق", 
            dataIndex: "totalSpent",
            key: "totalSpent",
            sorter: (a, b) => Number(a.totalSpent || 0) - Number(b.totalSpent || 0),
            render: (val) => (
                <div className="font-black text-slate-900 text-sm">
                    <span className="text-xs text-slate-400 font-normal me-1">{currency}</span>
                    <span>{Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                </div>
            )
        },
        {
            title: isArabic ? "نسبة المساهمة" : "Spend Share",
            key: "share",
            render: (_, record) => {
                const spent = Number(record.totalSpent || 0);
                const pct = stats.totalSpent > 0 ? ((spent / stats.totalSpent) * 100).toFixed(1) : "0.0";
                return (
                    <div className="w-[85px]">
                        <div className="text-xs font-bold text-slate-700 mb-0.5">{pct}%</div>
                        <Progress percent={Number(pct)} showInfo={false} strokeColor="#be123c" size="small" className="m-0" />
                    </div>
                );
            }
        },
        { 
            title: t("top_customers.avg_order_value") || t("top_customers.average_order_value") || (isArabic ? "متوسط قيمة الطلب" : "Avg Order Value"), 
            dataIndex: "averageOrderValue",
            key: "averageOrderValue",
            sorter: (a, b) => Number(a.averageOrderValue || 0) - Number(b.averageOrderValue || 0),
            render: (val) => (
                <div className="font-bold text-slate-700 text-sm">
                    <span className="text-xs text-slate-400 font-normal me-1">{currency}</span>
                    <span>{Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                </div>
            )
        },
    ];

    const tableLocale = {
        triggerAsc: isArabic ? "انقر للترتيب تصاعدياً" : "Click to sort ascending",
        triggerDesc: isArabic ? "انقر للترتيب تنازلياً" : "Click to sort descending",
        cancelSort: isArabic ? "انقر لإلغاء الترتيب" : "Click to cancel sorting",
        emptyText: isArabic ? "لا توجد بيانات عملاء مطابقة للبحث أو النطاق الزمني" : "No VIP customer data found",
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-10" dir={isArabic ? "rtl" : "ltr"}>
            {/* Header Banner */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-rose-100/80 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-rose-800 to-red-600"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl shrink-0 shadow-2xs mt-1">
                            <Award size={28} className="text-rose-800" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200/60 mb-2">
                                <Sparkles size={14} className="text-rose-800" />
                                <span>{isArabic ? "تحليلات كبار العملاء والولاء" : "VIP Customers & Loyalty Analytics"}</span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                                {t("top_customers.title") || (isArabic ? "أفضل العملاء وأكثرهم إنفاقاً" : "Top Spending VIP Customers")}
                            </h1>
                            <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
                                {isArabic 
                                    ? "قائمة تفصيلية بعملاء النخبة الأكثر شراءً وتفاعلاً، مع تحليل حجم الطلبات ومتوسط قيمة الإنفاق لكل عميل." 
                                    : "Comprehensive analysis of high-value VIP customers, order volume, and average order spending."}
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
                            className="bg-rose-700 hover:bg-rose-800 text-white rounded-xl flex items-center gap-2 font-bold px-5 shadow-md shadow-rose-700/20 hover:shadow-lg transition-all shrink-0"
                        >
                            {isArabic ? "تحديث القائمة" : "Refresh List"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filter Card + Quick Presets */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100">
                

                    {filteredCustomers.length > 0 && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200/60">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                            <span>{isArabic ? `تم العثور على (${filteredCustomers.length}) عميل` : `${filteredCustomers.length} VIPs found`}</span>
                        </div>
                    )}
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            <Calendar size={14} className="text-rose-800" />
                            {t("top_customers.date_range") || (isArabic ? "تحديد النطاق الزمني" : "Date Range")}
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
                            className="h-11 rounded-xl border-slate-300 hover:border-rose-800 focus:border-rose-800 font-semibold w-full"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            <Search size={14} className="text-rose-800" />
                            {isArabic ? "بحث باسم أو هاتف أو بريد العميل" : "Search customer name, email or phone"}
                        </label>
                        <Input
                            placeholder={isArabic ? "ابحث عن عميل هنا..." : "Search VIP..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            allowClear
                            className="h-11 rounded-xl font-medium"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            <Crown size={14} className="text-rose-800" />
                            {isArabic ? "تصفية حسب تصنيف الولاء" : "Filter by VIP Tier"}
                        </label>
                        <Select
                            value={selectedTier}
                            onChange={setSelectedTier}
                            className="w-full h-11"
                            options={[
                                { label: isArabic ? "جميع العملاء" : "All VIP Customers", value: "ALL" },
                                { label: isArabic ? "الفئة الماسية (أعلى 3 عملاء)" : "Diamond Tier (Top 3)", value: "DIAMOND" },
                                { label: isArabic ? "الفئة الذهبية (المراكز 4 إلى 10)" : "Gold Tier (Ranks 4-10)", value: "GOLD" },
                                { label: isArabic ? "الفئة الفضية (بقية العملاء)" : "Silver Tier (Others)", value: "SILVER" },
                            ]}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="space-y-1.5 flex-1">
                            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                <Filter size={14} className="text-rose-800" />
                                {t("top_customers.limit") || (isArabic ? "عدد العملاء:" : "Limit:")}
                            </label>
                            <InputNumber
                                min={1}
                                max={200}
                                value={limit}
                                onChange={(val) => {
                                    const newLimit = val || 10;
                                    setLimit(newLimit);
                                    fetchData(dates, newLimit);
                                }}
                                onPressEnter={() => fetchData(dates, limit)}
                                className="h-11 rounded-xl border-slate-300 w-full flex items-center font-bold"
                            />
                        </div>
                        <Button
                            type="primary"
                            icon={<Search size={16} />}
                            loading={loading}
                            onClick={() => fetchData(dates, limit)}
                            className="h-11 px-5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold border-0 shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer"
                        >
                            {t("top_customers.apply") || (isArabic ? "عرض" : "Apply")}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Top Stats Summary (4 Executive Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-rose-300 transition-all">
                    <div className="p-3.5 bg-rose-50 text-rose-800 rounded-2xl shrink-0 border border-rose-100">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500">{isArabic ? "عدد عملاء القائمة" : "Total VIP Customers"}</div>
                        <div className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">
                            {filteredCustomers.length} <span className="text-xs font-bold text-gray-400">{isArabic ? "عميل مميز" : "VIPs"}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-rose-300 transition-all">
                    <div className="p-3.5 bg-rose-50 text-rose-800 rounded-2xl shrink-0 border border-rose-100">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500">{isArabic ? "إجمالي مشتريات القائمة" : "Total VIPs Spend"}</div>
                        <div className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">
                            {currency} {Math.round(stats.totalSpent).toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-rose-300 transition-all">
                    <div className="p-3.5 bg-rose-50 text-rose-800 rounded-2xl shrink-0 border border-rose-100">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500">{isArabic ? "متوسط إنفاق العميل المميز" : "Avg Spend / VIP"}</div>
                        <div className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">
                            {currency} {Math.round(stats.avgSpend).toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-rose-300 transition-all">
                    <div className="p-3.5 bg-rose-50 text-rose-800 rounded-2xl shrink-0 border border-rose-100">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500">{isArabic ? "إجمالي طلبات النخبة" : "Total VIP Orders"}</div>
                        <div className="text-xl md:text-2xl font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
                            <span>{stats.totalOrders.toLocaleString()}</span>
                            <span className="text-3xs font-semibold text-slate-400 block">({stats.avgOrders.toFixed(1)} {isArabic ? "طلب/عميل" : "ord/VIP"})</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customers Table Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="font-extrabold text-slate-800 flex items-center gap-2">
                        <Crown size={18} className="text-amber-500" />
                        <span>{t("top_customers.title") || (isArabic ? "قائمة أفضل العملاء حسب الإنفاق" : "Top Spending VIP Customers List")}</span>
                    </div>
                    <span className="text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200/60">
                        {isArabic ? `عرض ${filteredCustomers.length} عميل` : `Showing ${filteredCustomers.length} VIPs`}
                    </span>
                </div>

                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-3">
                        <Spin size="large" />
                        <span className="text-sm font-medium text-slate-500 animate-pulse">{t("common.loading") || "جاري جلب بيانات كبار العملاء..."}</span>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="py-20">
                        <Empty description={t("top_customers.no_customers") || "لا يوجد عملاء مطابقون لخيارات البحث أو الفترة الزمنية"} />
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <Table
                                columns={columns}
                                dataSource={filteredCustomers}
                                rowKey={(record) => String(record.userId || record.id || Math.random())}
                                pagination={{
                                    pageSize: Number(limit) || 20,
                                    showSizeChanger: true,
                                    pageSizeOptions: Array.from(new Set(["10", "15", "20", "25", "30", "50", "100", "200", String(limit || 20)])).sort((a, b) => Number(a) - Number(b)),
                                    showTotal: (total) => isArabic ? `إجمالي العملاء: ${total}` : `Total items: ${total}`,
                                    className: "px-6 py-4"
                                }}
                                locale={tableLocale}
                                className="custom-table"
                            />
                        </div>

                        {/* Mobile Cards View */}
                        <div className="block lg:hidden p-4 md:p-6 bg-slate-50/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredCustomers.map((record, idx) => {
                                    const rank = idx + 1;
                                    const initial = (record.fullName || "A").charAt(0).toUpperCase();
                                    const spent = Number(record.totalSpent || 0);
                                    const pct = stats.totalSpent > 0 ? ((spent / stats.totalSpent) * 100).toFixed(1) : "0.0";
                                    return (
                                        <div key={record.userId || idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-3 relative overflow-hidden group">
                                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    {rank === 1 && <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 font-extrabold text-xs border border-amber-500/30">#1</span>}
                                                    {rank === 2 && <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300">#2</span>}
                                                    {rank === 3 && <span className="px-2.5 py-0.5 rounded-full bg-amber-700/15 text-amber-800 font-bold text-xs border border-amber-700/30">#3</span>}
                                                    {rank > 3 && <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs flex items-center justify-center">#{rank}</span>}
                                                    
                                                    <span className="text-xs font-bold text-slate-700">
                                                        {record.tierLabel}
                                                    </span>
                                                </div>
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 font-extrabold text-xs border border-rose-200/60">
                                                    <ShoppingBag size={12} className="text-rose-700" />
                                                    {Number(record.orderCount || 0)} {isArabic ? "طلب" : "orders"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 py-1">
                                                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-800 font-black text-sm flex items-center justify-center shrink-0 border border-rose-200/80 shadow-2xs">
                                                    {initial}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-bold text-slate-800 text-sm block truncate">
                                                        {record.fullName || (isArabic ? "عميل مجهول" : "Anonymous")}
                                                    </span>
                                                    <div className="text-[11px] text-slate-400 flex items-center justify-between mt-0.5">
                                                        <span>ID: #{record.userId || "N/A"}</span>
                                                        <span className="font-bold text-rose-700">{pct}% {isArabic ? "مساهمة" : "share"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-full">
                                                <Progress percent={Number(pct)} showInfo={false} strokeColor="#be123c" size="small" className="m-0" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs py-1">
                                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                                    <span className="text-slate-400 font-semibold block text-[11px] mb-0.5">{t("top_customers.total_spent") || (isArabic ? "إجمالي الإنفاق:" : "Total Spent:")}</span>
                                                    <span className="font-black text-slate-900 text-sm">{formatCurr(record.totalSpent)}</span>
                                                </div>
                                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                                    <span className="text-slate-400 font-semibold block text-[11px] mb-0.5">{t("top_customers.avg_order_value") || (isArabic ? "متوسط قيمة الطلب:" : "Avg Order Value:")}</span>
                                                    <span className="font-bold text-slate-700 text-xs">{formatCurr(record.averageOrderValue)}</span>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-xs text-slate-600">
                                                {record.phoneNumber && (
                                                    <div className="flex items-center gap-2 font-bold" dir="ltr">
                                                        <Phone size={13} className="text-rose-700" />
                                                        <span>{record.phoneNumber}</span>
                                                    </div>
                                                )}
                                                {record.email && (
                                                    <div className="flex items-center gap-2 truncate text-slate-500">
                                                        <Mail size={13} className="text-slate-400 shrink-0" />
                                                        <span className="truncate">{record.email}</span>
                                                    </div>
                                                )}
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
