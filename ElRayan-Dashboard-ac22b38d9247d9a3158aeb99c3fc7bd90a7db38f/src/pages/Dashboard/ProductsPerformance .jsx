import { useState, useEffect, useMemo } from "react";
import api from "../../Api/Api";
import { InputNumber, Button, Table, message, Spin, Empty, Input, Select, DatePicker, Progress } from "antd";
import { 
    Search, 
    Star, 
    TrendingUp, 
    Package, 
    DollarSign, 
    Filter, 
    Sparkles, 
    RefreshCw, 
    ShoppingBag, 
    Layers,
    Calendar,
    BarChart3
} from "lucide-react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useProductImages } from "../../utils/useProductImages";

function ProductImage({ record, getProductImage }) {
    const imgSrc = getProductImage(record);
    const [failed, setFailed] = useState(false);

    if (!imgSrc || failed) {
        return (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Package size={16} />
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

const { RangePicker } = DatePicker;

export default function TopProducts() {
    const { t, i18n } = useTranslation();
    const { getProductImage } = useProductImages();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [limit, setLimit] = useState(100);
    const [dates, setDates] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    
    const isArabic = i18n.language === "ar";
    const currency = isArabic ? "ج.م" : "EGP";

    const renderString = (val) => {
        if (!val) return "";
        if (typeof val === "string") return val;
        if (typeof val === "object") {
            return isArabic ? (val.ar || val.en || "") : (val.en || val.ar || "");
        }
        return String(val);
    };

    useEffect(() => {
        const today = dayjs().endOf("day");
        const startOfYear = dayjs("2026-01-01").startOf("day");
        const defaultRange = [startOfYear, today];
        setDates(defaultRange);
        fetchData(defaultRange, 100);
    }, []);

    const fetchData = async (customDates = dates, customLimit = limit) => {
        try {
            setLoading(true);
            const finalLimit = Number(customLimit) || 100;

            // 1. Fetch top products
            let topItems = [];
            try {
                const params = { limit: 100 };
                if (customDates && customDates.length === 2 && customDates[0] && customDates[1]) {
                    params.startDate = customDates[0].format("YYYY-MM-DD");
                    params.endDate = customDates[1].format("YYYY-MM-DD");
                }
                if (searchQuery && searchQuery.trim() !== "") {
                    params.search = searchQuery.trim();
                }

                const res = await api.get("/orders/top-products", { params });
                const raw = res.data;
                const extracted = Array.isArray(raw) 
                    ? raw 
                    : (Array.isArray(raw?.data) 
                        ? raw.data 
                        : (raw?.data?.items || raw?.data?.topSellingProducts || raw?.items || raw?.topSellingProducts || []));
                topItems = Array.isArray(extracted) ? extracted : [];
            } catch (e) {
                console.warn("Primary top-products API failed, trying dashboard", e);
            }

            // 2. Fallback to /orders/dashboard if topItems is empty
            if (!topItems || topItems.length === 0) {
                try {
                    const dashRes = await api.get("/orders/dashboard");
                    const dData = dashRes.data?.data || dashRes.data || {};
                    topItems = dData?.productStats?.topSellingProducts || dData?.topProducts || [];
                } catch(e) {}
            }

            // 3. Fetch store products from /product
            let storeProducts = [];
            try {
                const catRes = await api.get("/product?page=1&limit=100&sortOrder=DESC");
                const catRaw = catRes.data;
                const itemsList = Array.isArray(catRaw) 
                    ? catRaw 
                    : (Array.isArray(catRaw?.data) 
                        ? catRaw.data 
                        : (catRaw?.data?.items || catRaw?.items || catRaw?.products || []));
                storeProducts = Array.isArray(itemsList) ? itemsList : [];

                // Try fetching page 2 if page 1 has items
                if (storeProducts.length > 0 && catRaw?.data?.metadata?.totalPages > 1) {
                    try {
                        const page2Res = await api.get("/product?page=2&limit=100&sortOrder=DESC");
                        const page2Items = page2Res.data?.data?.items || [];
                        if (Array.isArray(page2Items) && page2Items.length > 0) {
                            storeProducts = [...storeProducts, ...page2Items];
                        }
                    } catch(e) {}
                }
            } catch (e) {
                console.warn("Store catalog fetch failed", e);
            }

            // Combine top items and store products so NO product is missing
            const combined = [];
            const seenIds = new Set();

            // First add top items
            if (Array.isArray(topItems)) {
                topItems.forEach((item) => {
                    const id = String(item.id || item.productId || "");
                    if (id && !seenIds.has(id)) {
                        seenIds.add(id);
                        combined.push({
                            ...item,
                            id: item.id || item.productId,
                            name: item.name || item.title || item.productName,
                            totalSold: Number(item.totalSold || item.quantitySold || item.soldCount || 0),
                            revenue: Number(item.revenue || item.totalRevenue || 0),
                            averagePrice: Number(item.averagePrice || item.price || 0)
                        });
                    }
                });
            }

            // Then add remaining store products
            if (Array.isArray(storeProducts)) {
                storeProducts.forEach((p) => {
                    const pId = String(p.id || p.productId || "");
                    if (pId && !seenIds.has(pId)) {
                        seenIds.add(pId);
                        combined.push({
                            id: p.id || p.productId,
                            name: p.name || p.title,
                            mainCategoryName: p.mainCategoryName || p.category?.name,
                            subCategoryName: p.subCategoryName || p.subCategory?.name,
                            totalSold: 0,
                            revenue: 0,
                            averagePrice: Number(p.price || 0),
                            images: p.images || p.image,
                        });
                    }
                });
            }

            const enriched = combined.map((item, idx) => ({ ...item, actualRank: idx + 1 }));
            setProducts(enriched);
        } catch (e) {
            console.error("Failed to fetch top products:", e);
            message.error(t("products_performance.fetch_fail") || "فشل جلب المنتجات");
        } finally {
            setLoading(false);
        }
    };

    const handleLimitChange = (val) => {
        const newLimit = val || 20;
        setLimit(newLimit);
    };

    // Extract unique categories for filter dropdown
    const categories = useMemo(() => {
        const set = new Set();
        products.forEach((p) => {
            const catName = renderString(p.mainCategoryName || p.categoryName || p.category);
            if (catName) set.add(catName);
        });
        return Array.from(set);
    }, [products, isArabic]);

    // Filter products by search query and category
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const pName = renderString(p.name || p.title || p.productName);
            const pCat = renderString(p.mainCategoryName || p.categoryName || p.category);
            
            const nameMatch = !searchQuery || pName.toLowerCase().includes(searchQuery.toLowerCase()) || String(p.id || p.productId || "").includes(searchQuery);
            const catMatch = selectedCategory === "ALL" || pCat === selectedCategory;
            return nameMatch && catMatch;
        });
    }, [products, searchQuery, selectedCategory, isArabic]);

    // Calculate summary statistics
    const stats = useMemo(() => {
        if (!filteredProducts.length) return { totalRev: 0, totalSold: 0, avgPrice: 0, topContribution: 0 };
        const totalRev = filteredProducts.reduce((acc, curr) => acc + Number(curr.revenue || curr.totalRevenue || 0), 0);
        const totalSold = filteredProducts.reduce((acc, curr) => acc + Number(curr.totalSold || curr.quantitySold || curr.soldCount || 0), 0);
        const avgPrice = totalSold > 0 ? totalRev / totalSold : 0;
        const topProductRev = filteredProducts[0] ? Number(filteredProducts[0].revenue || filteredProducts[0].totalRevenue || 0) : 0;
        const topContribution = totalRev > 0 ? (topProductRev / totalRev) * 100 : 0;
        return { totalRev, totalSold, avgPrice, topContribution };
    }, [filteredProducts]);

    const formatCurr = (val) => {
        const num = Number(val || 0);
        return `${num.toLocaleString()} ${currency}`;
    };

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
                const nameStr = renderString(text || record.title || record.productName) || (isArabic ? "منتج بدون اسم" : "Unnamed Product");
                return (
                    <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs flex items-center justify-center">
                            <ProductImage record={record} getProductImage={getProductImage} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-sm md:text-base leading-snug line-clamp-2 hover:text-[#172554] transition-colors">
                                {nameStr}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-600">ID: #{record.id || record.productId || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            title: isArabic ? "القسم" : "Category",
            key: "category",
            render: (_, record) => {
                const catStr = renderString(record.mainCategoryName || record.categoryName || record.category) || (isArabic ? "عام" : "General");
                const subStr = renderString(record.subCategoryName);
                return (
                    <div className="space-y-0.5 min-w-[130px]">
                        <div className="text-xs font-bold text-[#172554] flex items-center gap-1">
                            <Layers size={12} className="shrink-0" />
                            <span>{catStr}</span>
                        </div>
                        {subStr && (
                            <div className="text-[11px] text-slate-400 font-medium ps-4">
                                {subStr}
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            title: t("products_performance.total_sold") || "إجمالي المباع",
            dataIndex: "totalSold",
            key: "totalSold",
            sorter: (a, b) => Number(a.totalSold || a.quantitySold || 0) - Number(b.totalSold || b.quantitySold || 0),
            render: (val, record) => {
                const count = val !== undefined ? val : (record.quantitySold || record.soldCount || 0);
                return (
                    <span className="font-extrabold text-slate-800 text-sm">
                        {Number(count || 0).toLocaleString()} <span className="text-xs font-medium text-slate-400">{isArabic ? "قطعة" : "sold"}</span>
                    </span>
                );
            }
        },
        {
            title: t("products_performance.revenue") || "الإيرادات",
            dataIndex: "revenue",
            key: "revenue",
            sorter: (a, b) => Number(a.revenue || a.totalRevenue || 0) - Number(b.revenue || b.totalRevenue || 0),
            render: (val, record) => {
                const rev = val !== undefined ? val : (record.totalRevenue || 0);
                return (
                    <div className="font-black text-slate-900 text-sm">
                        <span>{formatCurr(rev)}</span>
                    </div>
                );
            }
        },
        {
            title: isArabic ? "نسبة المساهمة" : "Revenue Share",
            key: "share",
            render: (_, record) => {
                const rev = Number(record.revenue || record.totalRevenue || 0);
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
            sorter: (a, b) => Number(a.averagePrice || a.price || 0) - Number(b.averagePrice || b.price || 0),
            render: (val, record) => {
                const avgP = val !== undefined ? val : (record.price || 0);
                return (
                    <div className="font-bold text-slate-700 text-sm">
                        <span>{formatCurr(avgP)}</span>
                    </div>
                );
            }
        }
    ];

    const tableLocale = {
        triggerAsc: isArabic ? "انقر للترتيب تصاعدياً" : "Click to sort ascending",
        triggerDesc: isArabic ? "انقر للترتيب تنازلياً" : "Click to sort descending",
        cancelSort: isArabic ? "انقر لإلغاء الترتيب" : "Click to cancel sorting",
        emptyText: isArabic ? "لا توجد منتجات مسجلة في هذا النطاق" : "No products found"
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-10" dir={isArabic ? "rtl" : "ltr"}>
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

                    <div className="flex items-center gap-3">
                        <Button 
                            type="primary"
                            size="large"
                            icon={<RefreshCw size={16} className={loading ? "animate-spin" : ""} />}
                            onClick={() => fetchData()}
                            disabled={loading}
                            className="bg-rose-700 hover:bg-rose-800 text-white rounded-xl flex items-center gap-2 font-bold px-5 shadow-md shadow-rose-700/20 hover:shadow-lg transition-all shrink-0 cursor-pointer"
                        >
                            {isArabic ? "تحديث الأداء" : "Refresh Performance"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filter Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 me-1">
                            <Layers size={14} className="text-[#172554]" />
                            {isArabic ? "تصفية الأداء والمنتجات" : "Product Filters"}
                        </span>
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
                                onChange={(v) => handleLimitChange(v || 100)} 
                                onPressEnter={() => fetchData(dates, limit)}
                                className="rounded-xl font-bold h-11 w-full flex items-center"
                            />
                        </div>
                        <Button
                            type="primary"
                            icon={<Search size={16} />}
                            onClick={() => fetchData(dates, limit)}
                            loading={loading}
                            className="h-11 px-5 bg-[#172554] hover:bg-[#1e3a8a] text-white rounded-xl font-bold flex items-center justify-center shadow-sm cursor-pointer"
                        >
                            {t("products_performance.apply") || "عرض"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Top Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-[#172554]/30 transition-all">
                    <div className="p-3.5 bg-[#172554]/10 text-[#172554] rounded-2xl shrink-0">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500">{isArabic ? "إجمالي إيرادات القائمة" : "Total Listed Revenue"}</div>
                        <div className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">
                            {formatCurr(stats.totalRev)}
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
                            {formatCurr(stats.avgPrice)}
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="font-extrabold text-slate-800 flex items-center gap-2">
                        <Star size={18} className="text-amber-500" />
                        <span>{t("products_performance.title") || (isArabic ? "قائمة جميع منتجات المتجر حسب الأداء" : "All Products Performance List")}</span>
                    </div>
                    <span className="text-xs font-bold text-[#172554] bg-[#172554]/10 px-3 py-1 rounded-lg border border-[#172554]/20">
                        {isArabic ? `إجمالي ${filteredProducts.length} منتج` : `Total ${filteredProducts.length} items`}
                    </span>
                </div>

                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-3">
                        <Spin size="large" />
                        <span className="text-sm font-medium text-slate-500 animate-pulse">{t("common.loading") || "جاري جلب جميع المنتجات..."}</span>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="py-20">
                        <Empty description={tableLocale.emptyText} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table
                            columns={columns}
                            dataSource={filteredProducts}
                            rowKey={(record) => String(record.id || record.productId || Math.random())}
                            pagination={{
                                pageSize: Number(limit) || 20,
                                showSizeChanger: true,
                                pageSizeOptions: ["10", "20", "50", "100", "200"],
                                showTotal: (total) => isArabic ? `إجمالي المنتجات: ${total}` : `Total items: ${total}`,
                                className: "px-6 py-4"
                            }}
                            locale={tableLocale}
                            className="custom-table"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
