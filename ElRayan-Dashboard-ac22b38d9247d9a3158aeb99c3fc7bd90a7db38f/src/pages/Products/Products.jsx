import { useEffect, useState } from "react";
import api from "../../Api/Api";
import {
  Table,
  Button,
  Modal,
  Tag,
  Popconfirm,
  Spin,
  Select,
  Empty,
  Tooltip,
  Switch,
  message
} from "antd";
import { 
  Package, 
  ShoppingBag, 
  Plus, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  Sparkles, 
  Layers, 
  Tag as TagIcon, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  DollarSign, 
  Box,
  RotateCcw,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Products() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [viewModal, setViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [selectedMain, setSelectedMain] = useState("");
  const [selectedSub, setSelectedSub] = useState("");
  const [quickFilter, setQuickFilter] = useState("all"); // "all", "visible", "hidden", "low"

  const language = i18n.language || "en";
  const isArabic = language === "ar";
  const currency = isArabic ? "ج.م" : "EGP";

  // Helper to extract category names reliably without empty strings
  const getCategoryName = (cat) => {
    if (!cat) return null;
    if (typeof cat === "string") return cat;
    if (typeof cat.name === "string") return cat.name;
    if (cat.name?.ar || cat.name?.en) return isArabic ? (cat.name.ar || cat.name.en) : (cat.name.en || cat.name.ar);
    if (cat.name_ar || cat.name_en) return isArabic ? (cat.name_ar || cat.name_en) : (cat.name_en || cat.name_ar);
    if (cat.title?.ar || cat.title?.en) return isArabic ? (cat.title.ar || cat.title.en) : (cat.title.en || cat.title.ar);
    if (typeof cat.title === "string") return cat.title;
    return null;
  };

  // ===========================
  // Fetch Products
  // ===========================
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/product?page=${page}&limit=${limit}&sortOrder=DESC${
          selectedMain && selectedMain !== "all" ? `&categoryId=${selectedMain}` : ""
        }${selectedSub && selectedSub !== "all" ? `&subCategoryId=${selectedSub}` : ""}`,
      );

      if (res.data.success) {
        setProducts(res.data.data.items || []);
        setMeta(res.data.data.metadata || {});
      }
    } catch (e) {
      console.error(e);
      message.error(isArabic ? "فشل جلب المنتجات" : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // Delete Product
  // ===========================
  const deleteProduct = async (id) => {
    try {
      await api.delete(`/product/${id}`);
      message.success(isArabic ? "تم حذف المنتج بنجاح" : "Product deleted successfully");
      fetchProducts();
    } catch (e) {
      console.error(e);
      message.error(isArabic ? "فشل حذف المنتج" : "Failed to delete product");
    }
  };

  // ===========================
  // Toggle Hidden
  // ===========================
  const toggleHidden = async (id) => {
    try {
      await api.patch(`/product/toggle-hidden/${id}`);
      message.success(isArabic ? "تم تحديث حالة الظهور" : "Visibility updated");
      fetchProducts();
    } catch (e) {
      console.error(e);
      message.error(isArabic ? "فشل تحديث الحالة" : "Failed to update visibility");
    }
  };

  // ===========================
  // Open View Modal
  // ===========================
  const openView = async (id) => {
    try {
      const res = await api.get(`/product/${id}`);
      if (res.data.success) {
        setSelectedProduct(res.data.data);
        setViewModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ===========================
  // Fetch Categories
  // ==========================
  useEffect(() => {
    const fetchMain = async () => {
      try {
        const res = await api.get("/category");
        if (res.data.success) setMainCategories(res.data.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMain();
  }, []);

  // ===========================
  // Fetch Sub Categories
  // =========================
  useEffect(() => {
    if (!selectedMain || selectedMain === "all") {
      setSubCategories([]);
      return;
    }
    const fetchSubs = async () => {
      try {
        const res = await api.get(
          `/sub-categories?main_category=${selectedMain}`
        );
        if (res.data.success) setSubCategories(res.data.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSubs();
  }, [selectedMain]);

  // Fetch products on page, limit, or category change
  useEffect(() => {
    fetchProducts();
  }, [page, limit, selectedMain, selectedSub]);

  // Stats calculation
  const totalProducts = meta.totalItems || products.length;
  const visibleProductsCount = products.filter(p => !p.isHidden).length;
  const hiddenProductsCount = products.filter(p => p.isHidden).length;
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  // Filtered products for quick stats card click
  const filteredProducts = products.filter(p => {
    if (quickFilter === "visible") return !p.isHidden;
    if (quickFilter === "hidden") return p.isHidden;
    if (quickFilter === "low") return p.stock <= 5;
    return true;
  });

  // ===========================
  // Table Columns
  // ===========================
  const columns = [
    {
      title: isArabic ? "صورة المنتج" : "Image",
      dataIndex: "images",
      key: "images",
      width: 90,
      align: "center",
      render: (img) => (
        <div className="w-14 h-14 rounded-xl border border-rose-100 overflow-hidden bg-slate-50 flex items-center justify-center p-1 shadow-2xs mx-auto group hover:border-[#9f1239] transition-all">
          {img?.[0]?.attach ? (
            <img
              src={img[0].attach}
              alt="product"
              className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
            />
          ) : (
            <Package size={22} className="text-slate-300" />
          )}
        </div>
      ),
    },
    {
      title: isArabic ? "اسم المنتج والتفاصيل" : "Product Name",
      dataIndex: "name",
      key: "name",
      render: (n, row) => (
        <div>
          <b className="text-slate-800 font-bold text-sm md:text-base block hover:text-[#9f1239] transition-colors">
            {isArabic ? (n?.ar || n?.en) : (n?.en || n?.ar)}
          </b>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            {getCategoryName(row.mainCategory) && (
              <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                <Layers size={11} className="text-[#9f1239]" />
                {getCategoryName(row.mainCategory)}
              </span>
            )}
            {getCategoryName(row.subCategory) && (
              <span className="inline-flex items-center gap-1 bg-rose-50/70 text-[#9f1239] px-2 py-0.5 rounded-md border border-rose-100">
                {getCategoryName(row.subCategory)}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: isArabic ? "السعر بعد الخصم" : "Price",
      dataIndex: "price_after_discount",
      key: "price",
      align: "center",
      render: (p, row) => (
        <div className="flex flex-col items-center justify-center">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-50 border border-rose-200/70 font-black text-[#9f1239] text-sm shadow-2xs">
            <span>{p || "0"}</span>
            <span className="text-xs font-bold text-[#9f1239]/70">{currency}</span>
          </span>
          {row.price && row.price !== p && (
            <span className="text-2xs text-slate-400 line-through mt-0.5 font-bold">
              {row.price} {currency}
            </span>
          )}
        </div>
      ),
    },
    {
      title: isArabic ? "المخزون المتاح" : "Stock",
      dataIndex: "stock",
      key: "stock",
      align: "center",
      render: (s) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
          s <= 5 
            ? "bg-amber-50 text-amber-700 border-amber-200" 
            : "bg-emerald-50 text-emerald-700 border-emerald-200"
        }`}>
          <Box size={14} className={s <= 5 ? "text-amber-500" : "text-emerald-500"} />
          <span>{s} {isArabic ? "قطعة" : "units"}</span>
        </span>
      ),
    },
    {
      title: isArabic ? "حالة المنتج" : "Status",
      dataIndex: "isHidden",
      key: "isHidden",
      align: "center",
      render: (h) =>
        h ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {isArabic ? "مخفي عن الجمهور" : "Hidden"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {isArabic ? "معروض في المتجر" : "Visible"}
          </span>
        ),
    },
    {
      title: isArabic ? "الإجراءات" : "Actions",
      key: "actions",
      align: "center",
      width: 200,
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          {/* زر 1: تعديل المنتج */}
          <Tooltip title={isArabic ? "تعديل بيانات المنتج" : "Edit Product"}>
            <Link to={`/products/${row.id}`}>
              <Button
                icon={<Edit3 size={16} />}
                className="h-9 w-9 rounded-xl bg-[#9f1239] text-white hover:bg-[#881337] border-0 flex items-center justify-center shadow-md shadow-[#9f1239]/20 transition-all"
              />
            </Link>
          </Tooltip>

          {/* زر 2: عرض تفاصيل ومواصفات المنتج */}
          <Tooltip title={isArabic ? "عرض مواصفات وتفاصيل المنتج" : "View Product Details"}>
            <Button
              icon={<FileText size={16} />}
              onClick={() => openView(row.id)}
              className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 flex items-center justify-center transition-all shadow-2xs"
            />
          </Tooltip>

          {/* زر 3: إخفاء أو إظهار المنتج للجمهور في المتجر */}
          <Tooltip title={row.isHidden ? (isArabic ? "المنتج مخفي حالياً - اضغط لإظهاره للجمهور في المتجر" : "Hidden - Click to publish to store") : (isArabic ? "المنتج معروض للجمهور - اضغط لإخفائه مؤقتاً من المتجر" : "Visible - Click to hide from store")}>
            <Button
              icon={row.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
              onClick={() => toggleHidden(row.id)}
              className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all shadow-2xs ${
                row.isHidden 
                  ? "border-rose-200 text-rose-500 bg-rose-50/70 hover:bg-rose-100 hover:border-rose-300" 
                  : "border-emerald-200 text-emerald-600 bg-emerald-50/70 hover:bg-emerald-100 hover:border-emerald-300"
              }`}
            />
          </Tooltip>

          {/* زر 4: حذف المنتج نهائياً */}
          <Popconfirm
            title={isArabic ? "هل أنت متأكد من حذف هذا المنتج نهائياً؟" : "Are you sure you want to delete this product?"}
            okText={isArabic ? "نعم، احذف" : "Delete"}
            cancelText={isArabic ? "إلغاء" : "Cancel"}
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteProduct(row.id)}
          >
            <Tooltip title={isArabic ? "حذف المنتج نهائياً" : "Delete Product"}>
              <Button danger icon={<Trash2 size={16} />} className="h-9 w-9 rounded-xl flex items-center justify-center shadow-2xs hover:bg-rose-50 transition-all" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12" dir={isArabic ? "rtl" : "ltr"}>
      {/* Lighter Burgundy / Crimson Wine (#9f1239) Header Banner */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-[#9f1239] to-[#f43f5e]"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-[#9f1239]/10 text-[#9f1239] rounded-2xl shrink-0 mt-1 shadow-2xs">
              <Package size={28} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#9f1239] text-xs font-bold border border-rose-200/60 mb-2">
                <Sparkles size={14} className="text-[#9f1239]" />
                <span>{isArabic ? "إدارة المخزون وكتالوج المنتجات (النظام النبيتي الفاتح)" : "Products & Catalog Management"}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                {isArabic ? "قائمة وإدارة المنتجات" : "Products Directory"}
              </h1>
              <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-xl leading-relaxed">
                {isArabic 
                  ? "تحكم الكامل في كتالوج منتجات متجرك، إضافة منتجات جديدة، ضبط المخزون، والتحكم في الأسعار وحالة الظهور للجمهور." 
                  : "Complete control over your store's catalog, add new items, monitor stock levels, and manage visibility."}
              </p>
            </div>
          </div>
          <Link to="/products/add">
            <Button
              type="primary"
              className="h-11 px-6 bg-[#9f1239] hover:bg-[#881337] text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-[#9f1239]/25 hover:shadow-lg transition-all"
            >
              <Plus size={18} /> 
              <span>{isArabic ? "إضافة منتج جديد" : "Add New Product"}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Statistics Cards (Interactive Filtering) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: إجمالي المنتجات */}
        <div 
          onClick={() => setQuickFilter("all")}
          className={`relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
            quickFilter === "all"
              ? "bg-gradient-to-br from-[#9f1239]/15 via-[#9f1239]/5 to-white border-[#9f1239] shadow-md ring-2 ring-[#9f1239]/20"
              : "bg-white border-gray-100 hover:border-[#9f1239]/30 shadow-sm hover:shadow"
          }`}
        >
          {quickFilter === "all" && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#9f1239]" />
          )}
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${quickFilter === "all" ? "bg-[#9f1239] text-white shadow-md shadow-[#9f1239]/30 scale-105" : "bg-[#9f1239]/10 text-[#9f1239]"}`}>
              <ShoppingBag size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">{isArabic ? "إجمالي المنتجات" : "Total Products"}</span>
                {quickFilter === "all" && (
                  <span className="inline-flex items-center text-3xs font-extrabold text-[#9f1239] bg-[#9f1239]/10 px-2 py-0.5 rounded-full">
                    {isArabic ? "● نشط" : "● Active"}
                  </span>
                )}
              </div>
              <span className={`text-2xl font-black mt-0.5 block ${quickFilter === "all" ? "text-[#9f1239]" : "text-slate-800"}`}>{totalProducts}</span>
            </div>
          </div>
        </div>

        {/* Card 2: منتجات معروضة */}
        <div 
          onClick={() => setQuickFilter(quickFilter === "visible" ? "all" : "visible")}
          className={`relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
            quickFilter === "visible"
              ? "bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
              : "bg-white border-gray-100 hover:border-emerald-500/30 shadow-sm hover:shadow"
          }`}
        >
          {quickFilter === "visible" && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
          )}
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${quickFilter === "visible" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 scale-105" : "bg-emerald-50 text-emerald-600"}`}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">{isArabic ? "منتجات معروضة" : "Visible Products"}</span>
                {quickFilter === "visible" && (
                  <span className="inline-flex items-center text-3xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {isArabic ? "● نشط" : "● Active"}
                  </span>
                )}
              </div>
              <span className="text-2xl font-black text-emerald-600 mt-0.5 block">{visibleProductsCount}</span>
            </div>
          </div>
        </div>

        {/* Card 3: منتجات مخفية */}
        <div 
          onClick={() => setQuickFilter(quickFilter === "hidden" ? "all" : "hidden")}
          className={`relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
            quickFilter === "hidden"
              ? "bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-white border-rose-500 shadow-md ring-2 ring-rose-500/20"
              : "bg-white border-gray-100 hover:border-rose-500/30 shadow-sm hover:shadow"
          }`}
        >
          {quickFilter === "hidden" && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />
          )}
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${quickFilter === "hidden" ? "bg-rose-600 text-white shadow-md shadow-rose-500/30 scale-105" : "bg-rose-50 text-rose-600"}`}>
              <XCircle size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">{isArabic ? "منتجات مخفية" : "Hidden Products"}</span>
                {quickFilter === "hidden" && (
                  <span className="inline-flex items-center text-3xs font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                    {isArabic ? "● نشط" : "● Active"}
                  </span>
                )}
              </div>
              <span className="text-2xl font-black text-rose-600 mt-0.5 block">{hiddenProductsCount}</span>
            </div>
          </div>
        </div>

        {/* Card 4: مخزون منخفض */}
        <div 
          onClick={() => setQuickFilter(quickFilter === "low" ? "all" : "low")}
          className={`relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
            quickFilter === "low"
              ? "bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-white border-amber-500 shadow-md ring-2 ring-amber-500/20"
              : "bg-white border-gray-100 hover:border-amber-500/30 shadow-sm hover:shadow"
          }`}
        >
          {quickFilter === "low" && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
          )}
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${quickFilter === "low" ? "bg-amber-600 text-white shadow-md shadow-amber-500/30 scale-105" : "bg-amber-50 text-amber-600"}`}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">{isArabic ? "مخزون منخفض / قرب النفاذ" : "Low Stock Alert"}</span>
                {quickFilter === "low" && (
                  <span className="inline-flex items-center text-3xs font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {isArabic ? "● تنبيه" : "● Alert"}
                  </span>
                )}
              </div>
              <span className="text-2xl font-black text-amber-600 mt-0.5 block">{lowStockCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Redesigned Prominent Filters & Category Control Panel */}
      <div className="bg-gradient-to-r from-slate-50 sm:from-slate-50/80 via-white to-rose-50/30 p-6 rounded-3xl border-2 border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
          <div className="p-2 bg-[#9f1239] text-white rounded-xl shadow-2xs">
            <Filter size={18} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800 m-0">{isArabic ? "تصفية والبحث في الأقسام والمنتجات" : "Filter & Search Products"}</h3>
            <span className="text-2xs text-slate-400">{isArabic ? "اختر القسم الرئيسي أو الفرعي لتصفية قائمة المنتجات فوراً" : "Select categories to filter inventory items instantly"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Main Category Select */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-2 ms-1">
              📦 {isArabic ? "القسم الرئيسي:" : "Main Category:"}
            </label>
            <Select
              value={selectedMain || "all"}
              size="large"
              className="w-full font-bold shadow-2xs"
              onChange={(value) => {
                setSelectedMain(value === "all" ? "" : value);
                setSelectedSub("");
                setPage(1);
              }}
              options={[
                { value: "all", label: isArabic ? "🟢 الكل (جميع الأقسام الرئيسية)" : "🟢 All Categories" },
                ...mainCategories.map((c) => ({
                  value: c.id,
                  label: isArabic ? (c.name?.ar || c.name?.en) : (c.name?.en || c.name?.ar),
                }))
              ]}
            />
          </div>

          {/* Subcategory Select */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-2 ms-1">
              🏷️ {isArabic ? "القسم الفرعي:" : "Subcategory:"}
            </label>
            <Select
              value={selectedSub || "all"}
              size="large"
              disabled={!selectedMain || selectedMain === "all"}
              className="w-full font-bold shadow-2xs"
              onChange={(value) => {
                setSelectedSub(value === "all" ? "" : value);
                setPage(1);
              }}
              options={[
                { value: "all", label: isArabic ? "🔵 الكل (جميع الأقسام الفرعية)" : "🔵 All Subcategories" },
                ...subCategories.map((s) => ({
                  value: s.id,
                  label: isArabic ? (s.name?.ar || s.name?.en) : (s.name?.en || s.name?.ar),
                }))
              ]}
            />
          </div>

          {/* Active Status Info */}
          <div className="lg:col-span-1 flex items-center py-2 px-4 rounded-2xl bg-white border border-slate-200/80 h-11">
            <span className="text-xs font-bold text-slate-500">
              {isArabic ? "الحالة المعروضة الآن: " : "Current view: "}
              <b className="text-[#9f1239]">
                {quickFilter === "all" ? (isArabic ? "جميع المنتجات" : "All products") :
                 quickFilter === "visible" ? (isArabic ? "المنتجات المعروضة فقط" : "Visible only") :
                 quickFilter === "hidden" ? (isArabic ? "المنتجات المخفية فقط" : "Hidden only") :
                 (isArabic ? "تنبيه المخزون المنخفض" : "Low stock only")}
              </b>
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2.5 justify-end">
            {(selectedMain || selectedSub || quickFilter !== "all") && (
              <Button
                onClick={() => {
                  setSelectedMain("");
                  setSelectedSub("");
                  setQuickFilter("all");
                  setPage(1);
                  setLimit(10);
                }}
                icon={<RotateCcw size={16} />}
                className="h-11 px-4 rounded-xl font-bold border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center gap-1.5 transition-all w-full md:w-auto"
              >
                <span>{isArabic ? "مسح التصفية" : "Reset"}</span>
              </Button>
            )}

            <Button
              type="primary"
              onClick={() => fetchProducts()}
              loading={loading}
              icon={<RefreshCw size={16} />}
              className="h-11 px-5 bg-[#9f1239] hover:bg-[#881337] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#9f1239]/20 transition-all w-full md:w-auto ms-auto"
            >
              <span>{isArabic ? "تحديث القائمة" : "Refresh"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-6 bg-[#9f1239] rounded-full"></div>
            <h2 className="text-lg font-black text-slate-800">{isArabic ? "قائمة المنتجات المتاحة في المتجر" : "Products Inventory"}</h2>
          </div>
          <span className="text-xs font-bold text-slate-500 px-3.5 py-1.5 bg-slate-50 rounded-full border border-slate-200">
            {quickFilter !== "all" 
              ? (isArabic ? `معروض حسب التصفية: ${filteredProducts.length} من أصل ${totalProducts}` : `Showing: ${filteredProducts.length} of ${totalProducts}`)
              : (isArabic ? `إجمالي النتائج: ${totalProducts}` : `Total: ${totalProducts}`)}
          </span>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Spin size="large" />
            <span className="text-sm font-medium text-slate-500 animate-pulse">{isArabic ? "جاري تحميل قائمة المنتجات..." : "Loading products..."}</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Empty description={isArabic ? "لا توجد منتجات مطابقة للتصفية الحالية أو الفلاتر" : "No products matching current filter"} />
            {(selectedMain || selectedSub || quickFilter !== "all") && (
              <Button
                onClick={() => {
                  setSelectedMain("");
                  setSelectedSub("");
                  setQuickFilter("all");
                }}
                className="mt-2 text-[#9f1239] border-[#9f1239] hover:bg-[#9f1239]/10 font-bold rounded-xl"
              >
                {isArabic ? "عرض جميع المنتجات" : "Show All Products"}
              </Button>
            )}
          </div>
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredProducts}
            pagination={{
              current: meta.currentPage || page,
              total: meta.totalItems || filteredProducts.length,
              pageSize: limit,
              showSizeChanger: true,
              onChange: (p, pageSize) => {
                setPage(p);
                setLimit(pageSize);
              },
            }}
            bordered={false}
            size="middle"
            className="overflow-x-auto modern-table"
            rowClassName="hover:bg-rose-50/30 transition-colors"
          />
        )}
      </div>

      {/* VIEW MODAL */}
      <Modal
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={null}
        title={
          <div className="flex items-center gap-2.5 text-lg font-black text-slate-800 pb-3 border-b border-slate-100">
            <span className="p-2.5 rounded-xl bg-[#9f1239]/10 text-[#9f1239]">
              <Package size={18} />
            </span>
            <span>{isArabic ? "تفاصيل ومواصفات المنتج الكاملة" : "Product Details"}</span>
          </div>
        }
        width={700}
        className="rounded-3xl overflow-hidden"
      >
        {selectedProduct && (
          <div className="pt-4 space-y-5" dir={isArabic ? "rtl" : "ltr"}>
            {/* Images Section */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">{isArabic ? "صور المنتج" : "Product Images"}</span>
              {selectedProduct.images?.length === 1 ? (
                <div className="w-full h-64 rounded-2xl border border-rose-100 overflow-hidden bg-slate-50 flex items-center justify-center p-2 shadow-inner">
                  <img
                    src={selectedProduct.images[0]?.attach}
                    alt="product"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              ) : selectedProduct.images?.length > 1 ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {selectedProduct.images.map((img) => (
                    <div key={img.id} className="w-36 h-36 shrink-0 rounded-2xl border border-rose-100 overflow-hidden bg-slate-50 flex items-center justify-center p-2 shadow-2xs hover:border-[#9f1239] transition-all">
                      <img
                        src={img.attach}
                        alt="product"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-40 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 font-bold">
                  {isArabic ? "لا توجد صور لهذا المنتج" : "No images available"}
                </div>
              )}
            </div>

            {/* Info Grid */}
            <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 space-y-3">
              <div>
                <h3 className="text-lg font-black text-slate-800 m-0">
                  {isArabic ? (selectedProduct.name?.ar || selectedProduct.name?.en) : (selectedProduct.name?.en || selectedProduct.name?.ar)}
                </h3>
                <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
                  {isArabic ? (selectedProduct.description?.ar || selectedProduct.description?.en) : (selectedProduct.description?.en || selectedProduct.description?.ar)}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-rose-200/60">
                <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-2xs">
                  <span className="text-2xs font-bold text-slate-400 block">{isArabic ? "السعر بعد الخصم" : "Price"}</span>
                  <span className="text-lg font-black text-[#9f1239] mt-0.5 block">{selectedProduct.price_after_discount} {currency}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-2xs">
                  <span className="text-2xs font-bold text-slate-400 block">{isArabic ? "السعر الأصلي" : "Original Price"}</span>
                  <span className="text-lg font-bold text-slate-700 mt-0.5 block">{selectedProduct.price || selectedProduct.price_after_discount} {currency}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-2xs">
                  <span className="text-2xs font-bold text-slate-400 block">{isArabic ? "المخزون المتاح" : "Stock"}</span>
                  <span className={`text-lg font-black mt-0.5 block ${selectedProduct.stock <= 5 ? "text-amber-600" : "text-emerald-600"}`}>
                    {selectedProduct.stock} {isArabic ? "قطعة" : "units"}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-2xs">
                  <span className="text-2xs font-bold text-slate-400 block">{isArabic ? "الحالة في المتجر" : "Status"}</span>
                  <span className={`text-xs font-black px-2 py-1 rounded-lg mt-1 inline-block ${selectedProduct.isHidden ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {selectedProduct.isHidden ? (isArabic ? "مخفي" : "Hidden") : (isArabic ? "معروض" : "Visible")}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs font-bold text-slate-500">{isArabic ? "الأقسام المرتبطة:" : "Categories:"}</span>
                {getCategoryName(selectedProduct.mainCategory) && (
                  <span className="inline-flex items-center gap-1 bg-white text-[#9f1239] px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-200 shadow-2xs">
                    <Layers size={13} />
                    <span>{getCategoryName(selectedProduct.mainCategory)}</span>
                  </span>
                )}
                {getCategoryName(selectedProduct.subCategory) && (
                  <span className="inline-flex items-center gap-1 bg-[#9f1239] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs">
                    <span>{getCategoryName(selectedProduct.subCategory)}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button onClick={() => setViewModal(false)} className="h-10 px-6 rounded-xl font-bold bg-[#9f1239] hover:bg-[#881337] text-white border-0 shadow-sm">
                {isArabic ? "إغلاق النافذة" : "Close"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

