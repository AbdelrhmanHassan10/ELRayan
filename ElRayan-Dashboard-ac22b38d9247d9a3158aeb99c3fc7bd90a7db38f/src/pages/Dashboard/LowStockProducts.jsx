import { useEffect, useState, useMemo } from "react";
import api from "../../Api/Api";
import { Table, InputNumber, Button, Card, Space, Tag, Spin, Empty } from "antd";
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
    Sparkles, 
    ShieldAlert 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProductImages } from "../../utils/useProductImages";

export default function LowStockProducts() {
    const { t, i18n } = useTranslation();
    const { getProductImage } = useProductImages();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // params
    const [threshold, setThreshold] = useState(10);
    const [limit, setLimit] = useState(20);

    // pagination
    const [page, setPage] = useState(1);
    const isArabic = i18n.language === "ar";

    const fetchData = async (customThreshold = threshold, customLimit = limit) => {
        try {
            setLoading(true);
            const res = await api.get(`/orders/low-stock-products`, {
                params: {
                    threshold: customThreshold,
                    limit: customLimit
                }
            });
            setData(res.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleThresholdChange = (val) => {
        setThreshold(val);
        setPage(1);
        fetchData(val, limit);
    };

    // Calculate quick stats from loaded data
    const stats = useMemo(() => {
        if (!data.length) return { critical: 0, warning: 0, recommended: 0 };
        return data.reduce((acc, item) => {
            const stock = Number(item.currentStock || 0);
            if (stock <= 3) acc.critical += 1;
            else if (stock <= 10) acc.warning += 1;
            if (item.isRecommended) acc.recommended += 1;
            return acc;
        }, { critical: 0, warning: 0, recommended: 0 });
    }, [data]);

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
            render: (text, record) => {
                const imgSrc = getProductImage(record);
                return (
                    <div className="flex items-center gap-3.5 min-w-[220px]">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs flex items-center justify-center">
                            {imgSrc ? (
                                <img src={imgSrc} alt="" className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                                <Package size={14} className="text-rose-800" />
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-sm md:text-base leading-snug line-clamp-2 hover:text-red-600 transition-colors">
                                {text || (isArabic ? "منتج بدون اسم" : "Unnamed Product")}
                            </div>
                            {record.mainCategoryName && (
                                <div className="text-xs text-slate-400 mt-0.5">
                                    {record.mainCategoryName}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
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
                            <span>{isArabic ? "نفد تماماً (0)" : "Out of Stock (0)"}</span>
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
            title: t("low_stock.recommended") || "التوصية بإعادة الطلب",
            dataIndex: "isRecommended",
            key: "isRecommended",
            render: (v) => v ? (
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
        <div className="space-y-6 animate-fadeIn pb-10">
            {/* Clean Modern Header Banner */}
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
                                {t("low_stock.title") || "منتجات منخفضة المخزون"}
                            </h1>
                            <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
                                {isArabic 
                                    ? "تابع المنتجات المقاربة للنفاذ أو التي نفدت بالكامل من المستودع مع ترشيحات إعادة الطلب الذكية لتفادي توقف المبيعات." 
                                    : "Monitor near-depletion or out-of-stock inventory with smart reordering recommendations to prevent sales disruption."}
                            </p>
                        </div>
                    </div>

                    {/* Quick Refresh Action */}
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
                        <div className="text-xs font-medium text-gray-500">{isArabic ? "تحتاج متابعة قريبة (≤ 10)" : "Needs Attention (≤ 10)"}</div>
                        <div className="text-xl md:text-2xl font-black text-rose-800 mt-0.5 flex items-center gap-1.5">
                            <span>{stats.warning}</span>
                            <span className="text-xs font-normal text-gray-400">{isArabic ? "منتج" : "items"}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/5 rounded-full pointer-events-none"></div>
                    <div className="p-3.5 bg-emerald-500/10 text-emerald-600 rounded-2xl shrink-0">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500">{isArabic ? "موصى بإعادة طلبها حالياً" : "Recommended Reorder"}</div>
                        <div className="text-xl md:text-2xl font-black text-emerald-600 mt-0.5 flex items-center gap-1.5">
                            <span>{stats.recommended}</span>
                            <span className="text-xs font-normal text-gray-400">{isArabic ? "منتج" : "items"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Threshold Toolbar */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-sm md:text-base">
                    <AlertTriangle size={18} className="text-rose-800" />
                    <span>{t("low_stock.threshold") || "تصفية حسب الحد الأدنى للمخزون:"}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Quick Threshold Pills */}
                    {[0, 3, 5, 10, 20].map((val) => (
                        <button
                            key={val}
                            type="button"
                            onClick={() => handleThresholdChange(val)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                threshold === val
                                    ? "bg-rose-800 text-white shadow-md shadow-rose-800/20 scale-105"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {val === 0 ? (isArabic ? "0 (نفد)" : "0 (Empty)") : `≤ ${val}`}
                        </button>
                    ))}

                    <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                    <div className="flex items-center gap-2">
                        <InputNumber
                            min={0}
                            max={500}
                            value={threshold}
                            onChange={(v) => setThreshold(v !== null ? v : 10)}
                            className="rounded-xl font-semibold"
                            style={{ width: 80 }}
                        />
                        <Button
                            type="primary"
                            icon={<Search size={15} />}
                            onClick={() => { setPage(1); fetchData(); }}
                            loading={loading}
                            className="bg-rose-800 hover:bg-rose-900 text-white rounded-xl font-semibold px-4 flex items-center justify-center shadow-sm"
                        >
                            {t("low_stock.apply") || "عرض"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Inventory Display (Responsive Table on Desktop, App Cards on Mobile/Tablet) */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="font-extrabold text-slate-800 flex items-center gap-2">
                        <TrendingDown size={18} className="text-rose-800" />
                        <span>{isArabic ? "قائمة المنتجات التي تحتاج إلى تدخل أو توريد جديد" : "Products Requiring Replenishment or Attention"}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 px-2.5 py-1 rounded-lg">
                        {isArabic ? `عرض ${data.length} منتج` : `Showing ${data.length} items`}
                    </span>
                </div>

                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-3">
                        <Spin size="large" />
                        <span className="text-sm font-medium text-slate-500 animate-pulse">{t("common.loading") || "جاري فحص مستويات المخزون..."}</span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="py-20">
                        <Empty description={t("common.no_data") || "لا توجد منتجات منخفضة المخزون تحت هذا الحد حالياً"} />
                    </div>
                ) : (
                    <>
                        {/* 1. Desktop & Tablet Large Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <Table
                                rowKey={(r) => r.id || Math.random()}
                                loading={loading}
                                columns={columns}
                                dataSource={data}
                                pagination={{
                                    current: page,
                                    pageSize: limit,
                                    total: data.length,
                                    showSizeChanger: true,
                                    pageSizeOptions: ["10", "20", "50", "100"],
                                    onChange: (p, size) => { setPage(p); if (size !== limit) setLimit(size); },
                                    className: "px-6 py-4"
                                }}
                                className="custom-table"
                            />
                        </div>

                        {/* 2. Mobile & Tablet Card Grid View (Fully Responsive without scrollbars!) */}
                        <div className="block lg:hidden p-4 md:p-6 bg-slate-50/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {data.map((record, idx) => {
                                    const stock = Number(record.currentStock || 0);
                                    const imgSrc = getProductImage(record);
                                    return (
                                        <div key={record.id || idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-3 relative overflow-hidden group">
                                            {/* Top Row: Stock Alert Badge & Recommendation */}
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
                                                    {record.isRecommended ? (
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

                                            {/* Middle Row: Image & Name */}
                                            <div className="flex items-center gap-3 py-1">
                                                <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs flex items-center justify-center relative">
                                                    {imgSrc ? (
                                                        <img src={imgSrc} alt="" className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform duration-300" />
                                                    ) : (
                                                        <Package size={16} className="text-rose-800" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">
                                                        {record.name || (isArabic ? "منتج بدون اسم" : "Unnamed Product")}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                                        <span>ID: #{record.id || "N/A"}</span>
                                                        {record.mainCategoryName && <span>• {record.mainCategoryName}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Row: 2 Metrics Grid */}
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
