import { useEffect, useState, useMemo } from "react";
import api from "../../Api/Api";
import { Table, Button, Spin, Empty, Input, Select } from "antd";
import { 
    Search, 
    AlertTriangle, 
    TrendingDown, 
    Package, 
    RefreshCw, 
    CheckCircle2, 
    XCircle, 
    ShoppingBag, 
    Layers, 
    ShieldAlert,
    Filter,
    Boxes
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProductImages } from "../../utils/useProductImages";

// Helper to safely render strings if backend returns { ar, en } objects
function renderString(val, fallback = "") {
    if (!val) return fallback;
    if (typeof val === "string") return val;
    if (typeof val === "number") return String(val);
    if (typeof val === "object") {
        return val.ar || val.en || val.name || val.title || fallback;
    }
    return String(val);
}

// Clean Product Image Component to prevent icon peeking behind image
function ProductImage({ record, getProductImage, iconClass }) {
    const imgSrc = getProductImage(record);
    const [failed, setFailed] = useState(false);

    if (!imgSrc || failed) {
        return (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Package size={16} className={iconClass || "text-rose-800"} />
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

export default function LowStockProducts() {
    const { t, i18n } = useTranslation();
    const { getProductImage } = useProductImages();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [threshold, setThreshold] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [limit, setLimit] = useState(20);
    const [page, setPage] = useState(1);

    const isArabic = i18n.language === "ar";

    const fetchData = async () => {
        try {
            setLoading(true);
            let lowStockMap = {};
            
            // 1. Fetch low stock items from low-stock endpoint (limit = 100)
            try {
                const res = await api.get(`/orders/low-stock-products`, { params: { limit: 100, threshold: 100 } });
                const raw = res.data;
                const items = Array.isArray(raw) ? raw : (raw?.data?.items || raw?.data || raw?.items || []);
                if (Array.isArray(items)) {
                    items.forEach(it => {
                        if (it && it.id) lowStockMap[it.id] = it;
                    });
                }
            } catch(e) {}

            // 2. Fetch products from /product API (page 1 and page 2 to avoid 429 rate limit)
            let allProducts = [];
            try {
                const firstRes = await api.get(`/product?page=1&limit=100&sortOrder=DESC`);
                if (firstRes.data?.success && firstRes.data?.data) {
                    const page1 = firstRes.data.data.items || [];
                    allProducts.push(...page1);

                    // Fetch page 2 if needed
                    const meta = firstRes.data.data.metadata || {};
                    if (meta.totalPages && meta.totalPages > 1) {
                        try {
                            const secondRes = await api.get(`/product?page=2&limit=100&sortOrder=DESC`);
                            if (secondRes.data?.success && secondRes.data?.data?.items) {
                                allProducts.push(...secondRes.data.data.items);
                            }
                        } catch(e) {}
                    }
                }
            } catch(e) {
                console.warn("Product list fetch failed", e);
            }

            // Merge so products in store are present with stock & category info
            let combined = [];
            if (allProducts.length > 0) {
                const seenIds = new Set();
                allProducts.forEach(p => {
                    if (!p || !p.id || seenIds.has(p.id)) return;
                    seenIds.add(p.id);
                    const lowStockExtra = lowStockMap[p.id] || {};
                    combined.push({
                        ...p,
                        ...lowStockExtra,
                        id: p.id,
                        name: p.name || lowStockExtra.name || "",
                        mainCategoryName: p.mainCategoryName || p.category?.name || lowStockExtra.mainCategoryName || "",
                        currentStock: p.stock !== undefined ? p.stock : (p.quantity !== undefined ? p.quantity : (lowStockExtra.currentStock !== undefined ? lowStockExtra.currentStock : 0)),
                        sold: p.totalSold !== undefined ? p.totalSold : (p.sold !== undefined ? p.sold : (lowStockExtra.sold || 0)),
                        isRecommended: lowStockExtra.isRecommended !== undefined ? lowStockExtra.isRecommended : (p.stock <= 3),
                        Image: p.Image || p.image || p.images?.[0]?.attach || lowStockExtra.Image || ""
                    });
                });
            } else if (Object.keys(lowStockMap).length > 0) {
                combined = Object.values(lowStockMap);
            }

            setData(combined);
        } catch (e) {
            console.error("Critical error loading all products:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Normalize items safely with renderString
    const normalizedData = useMemo(() => {
        return data.map((p) => {
            const stockVal = p.currentStock !== undefined ? p.currentStock : (p.stock !== undefined ? p.stock : (p.quantity !== undefined ? p.quantity : (p.current_stock !== undefined ? p.current_stock : 0)));
            const catStr = renderString(p.mainCategoryName || p.categoryName || p.category, isArabic ? "عام" : "General");
            const nameStr = renderString(p.name || p.title, isArabic ? "منتج بدون اسم" : "Unnamed Product");

            return {
                ...p,
                id: p.id || p.productId || p.product_id,
                name: nameStr,
                currentStock: Number(stockVal || 0),
                sold: Number(p.sold || p.totalSold || 0),
                mainCategoryName: catStr,
                isRecommended: p.isRecommended !== undefined ? p.isRecommended : Number(stockVal || 0) <= 3
            };
        });
    }, [data, isArabic]);

    // Extract unique categories for filter
    const categories = useMemo(() => {
        const set = new Set();
        normalizedData.forEach((p) => {
            if (p.mainCategoryName) set.add(renderString(p.mainCategoryName));
        });
        return Array.from(set);
    }, [normalizedData]);

    // Fast local filtering
    const filteredData = useMemo(() => {
        return normalizedData.filter((item) => {
            const stock = item.currentStock;
            
            let matchesThreshold = true;
            if (threshold === 0) {
                matchesThreshold = stock === 0;
            } else if (threshold !== "ALL") {
                matchesThreshold = stock <= Number(threshold);
            }

            const searchLower = searchQuery.trim().toLowerCase();
            const nameStr = renderString(item.name).toLowerCase();
            const matchesSearch = !searchLower || 
                nameStr.includes(searchLower) || 
                String(item.id || "").includes(searchLower);

            const catStr = renderString(item.mainCategoryName);
            const matchesCategory = selectedCategory === "ALL" || catStr === selectedCategory;

            return matchesThreshold && matchesSearch && matchesCategory;
        });
    }, [normalizedData, threshold, searchQuery, selectedCategory]);

    // Stats based on all normalized data
    const stats = useMemo(() => {
        if (!normalizedData.length) return { critical: 0, warning: 0, total: 0 };
        return normalizedData.reduce((acc, item) => {
            const stock = item.currentStock;
            if (stock <= 3) acc.critical += 1;
            if (stock <= 10) acc.warning += 1;
            return acc;
        }, { critical: 0, warning: 0, total: normalizedData.length });
    }, [normalizedData]);

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 70,
            align: "center",
            sorter: (a, b) => (a.id || 0) - (b.id || 0),
            render: (val) => <span className="font-bold text-slate-500 text-xs">#{val}</span>
        },
        {
            title: t("products_performance.product") || "المنتج",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <div className="flex items-center gap-3.5 min-w-[220px]">
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs flex items-center justify-center">
                        <ProductImage record={record} getProductImage={getProductImage} iconClass="text-rose-800" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 text-sm md:text-base leading-snug line-clamp-2 hover:text-red-600 transition-colors">
                            {renderString(text, isArabic ? "منتج بدون اسم" : "Unnamed Product")}
                        </div>
                        {record.mainCategoryName && (
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                <Layers size={10} />
                                <span>{renderString(record.mainCategoryName)}</span>
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            title: t("inventory.current_stock") || "المخزون الحالي",
            dataIndex: "currentStock",
            key: "currentStock",
            sorter: (a, b) => (a.currentStock || 0) - (b.currentStock || 0),
            render: (val) => {
                const num = Number(val || 0);
                if (num === 0) {
                    return (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500 text-white font-black text-xs shadow-sm animate-pulse">
                            <XCircle size={14} />
                            <span>{isArabic ? "نفد بالكامل (0)" : "Out of Stock (0)"}</span>
                        </span>
                    );
                }
                if (num <= 3) {
                    return (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 text-red-700 font-extrabold text-xs border border-red-500/30">
                            <AlertTriangle size={14} className="text-red-600 animate-bounce" style={{ animationDuration: '2s' }} />
                            <span>{isArabic ? `حرج جداً (${num})` : `Critical (${num})`}</span>
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-800/15 text-rose-900 font-bold text-xs border border-rose-800/30">
                        <TrendingDown size={14} className="text-rose-800" />
                        <span>{num} {isArabic ? "قطع" : "units"}</span>
                    </span>
                );
            }
        },
        {
            title: t("inventory.total_sold") || "المبيعات السابقة",
            dataIndex: "sold",
            key: "sold",
            sorter: (a, b) => (a.sold || 0) - (b.sold || 0),
            render: (val) => (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                    <ShoppingBag size={13} className="text-slate-500" />
                    <span>{Number(val || 0).toLocaleString()}</span>
                </div>
            )
        },
        {
            title: t("low_stock.recommended") || "التوصية بطلب جديد",
            dataIndex: "isRecommended",
            key: "isRecommended",
            render: (v, record) => record.currentStock <= 3 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-700 font-bold text-xs border border-emerald-500/30">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>{t("low_stock.recommended") || "موصى به"}</span>
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 font-medium text-xs">
                    <span>{t("low_stock.normal") || "عادي"}</span>
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fadeIn pb-10" dir={isArabic ? "rtl" : "ltr"}>
            {/* Header Banner */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-rose-100/80 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-rose-800 to-red-600"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl shrink-0 shadow-2xs mt-1">
                            <AlertTriangle size={28} className="animate-pulse" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200/60 mb-2">
                                <ShieldAlert size={14} className="text-rose-800" />
                                <span>{t("dashboard.low_stock") || "مراقبة المخزون الحرج وتنبيهات النواقص"}</span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                                {t("low_stock.title") || "منتجات منخفضة المخزون وحركة التوريد"}
                            </h1>
                            <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
                                {isArabic 
                                    ? "عرض شامل لجميع منتجات المتجر ومستويات المخزون مع التصفية السريعة والبحث اللحظي لتحديد الاحتياجات التوريدية." 
                                    : "Monitor all inventory items, zero-stock alerts, and fast reorder recommendations."}
                            </p>
                        </div>
                    </div>

                    <Button 
                        type="primary"
                        size="large"
                        icon={<RefreshCw size={16} className={loading ? "animate-spin" : ""} />}
                        onClick={() => { setPage(1); fetchData(); }}
                        disabled={loading}
                        className="bg-rose-800 hover:bg-rose-900 text-white rounded-xl flex items-center gap-2 font-bold px-5 shadow-sm hover:shadow-md transition-all shrink-0"
                    >
                        {isArabic ? "تحديث المخزون" : "Refresh Inventory"}
                    </Button>
                </div>
            </div>

            {/* Top Stats Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-red-500/5 rounded-full pointer-events-none"></div>
                    <div className="p-3.5 bg-red-500/10 text-red-600 rounded-2xl shrink-0">
                        <AlertTriangle size={24} className="animate-pulse" />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500">{isArabic ? "حرجة جداً أو نفدت (≤ 3)" : "Critical or Empty (≤ 3)"}</div>
                        <div className="text-xl md:text-2xl font-black text-red-600 mt-0.5 flex items-center gap-1.5">
                            <span>{stats.critical}</span>
                            <span className="text-xs font-normal text-gray-400">{isArabic ? "منتج" : "items"}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-rose-800/5 rounded-full pointer-events-none"></div>
                    <div className="p-3.5 bg-rose-800/10 text-rose-800 rounded-2xl shrink-0">
                        <TrendingDown size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500">{isArabic ? "منخفضة المخزون (≤ 10)" : "Low Stock (≤ 10)"}</div>
                        <div className="text-xl md:text-2xl font-black text-rose-800 mt-0.5 flex items-center gap-1.5">
                            <span>{stats.warning}</span>
                            <span className="text-xs font-normal text-gray-400">{isArabic ? "منتج" : "items"}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/5 rounded-full pointer-events-none"></div>
                    <div className="p-3.5 bg-blue-500/10 text-blue-600 rounded-2xl shrink-0">
                        <Boxes size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500">{isArabic ? "إجمالي منتجات المتجر" : "Total Store Products"}</div>
                        <div className="text-xl md:text-2xl font-black text-blue-600 mt-0.5 flex items-center gap-1.5">
                            <span>{stats.total}</span>
                            <span className="text-xs font-normal text-gray-400">{isArabic ? "منتج" : "items"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar: Search + Category + Threshold Pills */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[240px]">
                        <Input
                            placeholder={isArabic ? "ابحث باسم المنتج أو الـ ID..." : "Search by product name or ID..."}
                            prefix={<Search size={16} className="text-slate-400 me-2" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            allowClear
                            className="h-11 rounded-xl font-medium border-slate-200 focus:border-rose-800"
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div className="w-full md:w-56">
                        <Select
                            className="h-11 w-full"
                            value={selectedCategory}
                            onChange={(v) => setSelectedCategory(v)}
                            options={[
                                { value: "ALL", label: isArabic ? "جميع الأقسام" : "All Categories" },
                                ...categories.map((c) => ({ value: c, label: c })),
                            ]}
                        />
                    </div>
                </div>

                {/* Threshold Pills */}
                <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 me-1">
                            <Filter size={14} className="text-rose-800" />
                            {isArabic ? "حد المخزون المعروض:" : "Stock Threshold:"}
                        </span>
                        {[
                            { label: isArabic ? "كل المنتجات" : "All Products", val: "ALL" },
                            { label: isArabic ? "0 (نفد)" : "0 (Out)", val: 0 },
                            { label: "≤ 3", val: 3 },
                            { label: "≤ 5", val: 5 },
                            { label: "≤ 10", val: 10 },
                            { label: "≤ 20", val: 20 },
                            { label: "≤ 50", val: 50 },
                        ].map((btn) => (
                            <button
                                key={String(btn.val)}
                                type="button"
                                onClick={() => {
                                    setThreshold(btn.val);
                                    setPage(1);
                                }}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    threshold === btn.val
                                        ? "bg-rose-800 text-white shadow-md shadow-rose-800/20 scale-105"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                        {isArabic ? `عناصر المعاينة: ${filteredData.length}` : `Items found: ${filteredData.length}`}
                    </div>
                </div>
            </div>

            {/* Inventory Display Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="font-extrabold text-slate-800 flex items-center gap-2">
                        <TrendingDown size={18} className="text-rose-800" />
                        <span>{isArabic ? "قائمة المنتجات ومستويات المخزون" : "Inventory Product List & Stock Levels"}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-rose-50 border border-rose-200/60 px-3 py-1 rounded-lg">
                        {isArabic ? `إجمالي النتائج المطابقة: ${filteredData.length}` : `Total matching results: ${filteredData.length}`}
                    </span>
                </div>

                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-3">
                        <Spin size="large" />
                        <span className="text-sm font-medium text-slate-500 animate-pulse">{isArabic ? "جاري جلب كافة منتجات المتجر والمخزون..." : "Loading inventory data..."}</span>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="py-20">
                        <Empty description={isArabic ? "لا توجد منتجات مطابقة لهذا الفلتر أو البحث حالياً" : "No products match current filter"} />
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <Table
                                rowKey={(record) => String(record.id || record.productId || Math.random())}
                                loading={loading}
                                columns={columns}
                                dataSource={filteredData}
                                pagination={{
                                    current: page,
                                    pageSize: limit,
                                    total: filteredData.length,
                                    showSizeChanger: true,
                                    pageSizeOptions: ["10", "20", "50", "100", "200", "500"],
                                    onChange: (p, size) => { setPage(p); if (size !== limit) setLimit(size); },
                                    showTotal: (total) => isArabic ? `إجمالي المنتجات: ${total}` : `Total items: ${total}`,
                                    className: "px-6 py-4"
                                }}
                                className="custom-table"
                            />
                        </div>

                        {/* Mobile & Tablet Grid */}
                        <div className="block lg:hidden p-4 md:p-6 bg-slate-50/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredData.slice((page - 1) * limit, page * limit).map((record, idx) => {
                                    const stock = Number(record.currentStock || 0);
                                    return (
                                        <div key={record.id || idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-3 relative overflow-hidden group">
                                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                                <div>
                                                    {stock === 0 ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500 text-white font-black text-2xs animate-pulse">
                                                            <XCircle size={12} />
                                                            <span>{isArabic ? "نفد بالكامل (0)" : "Empty (0)"}</span>
                                                        </span>
                                                    ) : stock <= 3 ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-700 font-bold text-2xs border border-red-500/30">
                                                            <AlertTriangle size={12} className="text-red-600 animate-bounce" style={{ animationDuration: '2s' }} />
                                                            <span>{isArabic ? `حرج جداً (${stock})` : `Critical (${stock})`}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-800/15 text-rose-900 font-bold text-2xs border border-rose-800/30">
                                                            <span>{stock} {isArabic ? "قطع متبقية" : "units left"}</span>
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    {record.currentStock <= 3 ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 font-bold text-2xs border border-emerald-500/30">
                                                            <CheckCircle2 size={12} />
                                                            <span>{isArabic ? "موصى بطلبه" : "Recommended"}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-2xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">
                                                            {isArabic ? "عادي" : "Normal"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 py-1">
                                                <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs flex items-center justify-center relative">
                                                    <ProductImage record={record} getProductImage={getProductImage} iconClass="text-rose-800" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">
                                                        {renderString(record.name)}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                                        <span>ID: #{record.id || "N/A"}</span>
                                                        {record.mainCategoryName && <span>• {renderString(record.mainCategoryName)}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80 text-center mt-1">
                                                <div className="flex flex-col">
                                                    <span className="text-2xs font-semibold text-slate-400">{isArabic ? "المخزون الفعلي" : "Current Stock"}</span>
                                                    <span className={`text-sm sm:text-base font-black mt-0.5 ${stock === 0 ? "text-red-600" : stock <= 3 ? "text-red-500" : "text-rose-800"}`}>
                                                        {stock} <span className="text-3xs font-normal text-slate-400">{isArabic ? "قطعة" : "unit"}</span>
                                                    </span>
                                                </div>
                                                <div className="flex flex-col border-s border-slate-200 px-1">
                                                    <span className="text-2xs font-semibold text-slate-400">{isArabic ? "المبيعات السابقة" : "Historical Sales"}</span>
                                                    <span className="text-sm sm:text-base font-bold text-slate-700 mt-0.5">
                                                        {Number(record.sold || 0).toLocaleString()} <span className="text-3xs font-normal text-slate-400">{isArabic ? "قطعة" : "sold"}</span>
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
