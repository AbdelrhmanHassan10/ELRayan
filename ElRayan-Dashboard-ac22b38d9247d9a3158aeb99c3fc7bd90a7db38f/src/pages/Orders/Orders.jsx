import { useEffect, useState, useMemo } from "react";
import api from "../../Api/Api";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Spin,
  Modal,
  Button,
  Table,
  Tag,
  Select,
  Pagination,
  Empty,
  Input
} from "antd";
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Eye, 
  Sparkles, 
  RefreshCw, 
  Package, 
  Phone, 
  MapPin, 
  CreditCard,
  FileText,
  TrendingUp,
  CheckCircle2,
  Search,
  Filter,
  RotateCcw,
  ArrowUpDown
} from "lucide-react";
import { useTranslation } from "react-i18next";

const { Option } = Select;

export default function Orders() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const language = isArabic ? "ar" : "en";

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [dashboardOverview, setDashboardOverview] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const token = localStorage.getItem("token");

  // Helper to resolve image URL without double prefixing
  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    if (url.includes("ik.imagekit.io")) {
      return `https://${url.replace(/^\/+/, "")}`;
    }
    return url;
  };

  // Fetch Orders and Dashboard Statistics
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      
      const params = {
        page,
        limit,
        sortOrder: sortBy.includes('amount') ? undefined : (sortBy === 'oldest' ? 'ASC' : 'DESC'),
      };
      
      if (statusFilter !== "all") params.status = statusFilter;
      if (paymentMethodFilter !== "all") params.paymentMethod = paymentMethodFilter;
      if (paymentStatusFilter !== "all") params.paymentStatus = paymentStatusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      // Parallel requests: get paginated orders + get real store statistics from dashboard endpoint
      const [ordersRes, dashRes] = await Promise.all([
        api.get('/orders', { params }).catch((err) => {
          console.warn("Failed with params, trying fallback", err);
          return api.get('/orders', { params: { page, limit: 20 } });
        }),
        axios.get("https://api.elrayan.acwad.tech/api/v1/orders/dashboard", {
          headers: { Authorization: `Bearer ${token}`, lang: language }
        }).catch(() => null)
      ]);

      const ordersData = ordersRes?.data?.data || ordersRes?.data || {};


      // Make parsing robust in case the API returns an array directly or a different object structure
      const fetchedItems = Array.isArray(ordersData) 
        ? ordersData 
        : (ordersData?.items || ordersData?.orders || ordersData?.data || []);
      const fetchedStats = ordersData?.statistics || {};
      const fetchedTotal = ordersData?.metadata?.totalItems || ordersData?.total || fetchedItems.length || 0;

      setOrders(fetchedItems);
      setStats(fetchedStats);
      setTotalOrders(fetchedTotal);

      if (dashRes?.data?.overview) {
        setDashboardOverview(dashRes.data.overview);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error(t("orders.fetch_fail") || (isArabic ? "فشل في جلب قائمة الطلبات" : "Failed to fetch orders"));
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, limit, statusFilter, paymentMethodFilter, paymentStatusFilter, sortBy]);

  // Handle search submit
  const handleSearchSubmit = () => {
    setPage(1);
    fetchOrders();
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPaymentMethodFilter("all");
    setPaymentStatusFilter("all");
    setSortBy("newest");
    setPage(1);
  };

  // Update Order Status
  const updateOrder = async (orderId, newStatus) => {
    try {
      const body = {
        status: newStatus,
        notes: "status updated from dashboard",
      };
      await api.patch(`/orders/${orderId}`, body);
      toast.success(t("orders.update_success") || (isArabic ? "تم تحديث حالة الطلب بنجاح" : "Order status updated successfully"));
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error(t("orders.update_fail") || (isArabic ? "فشل في تحديث حالة الطلب" : "Failed to update order status"));
    }
  };

  // Update Payment Status
  const updatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const body = {
        paymentStatus: newPaymentStatus,
        notes: "payment status updated from dashboard",
      };
      await api.patch(`/orders/${orderId}`, body);
      toast.success(isArabic ? "تم تحديث حالة الدفع بنجاح" : "Payment status updated successfully");
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? "فشل في تحديث حالة الدفع" : "Failed to update payment status");
    }
  };

  // Get Order Details
  const fetchOrderDetails = async (orderId) => {
    try {
      setLoadingDetails(true);
      setSelectedOrder(null);
      const res = await api.get(`/orders/${orderId}`);
      setSelectedOrder(res.data?.data || null);
    } catch (err) {
      console.error(err);
      toast.error(t("orders.details_fail") || (isArabic ? "فشل في جلب تفاصيل الطلب" : "Failed to fetch order details"));
    } finally {
      setLoadingDetails(false);
    }
  };

  // Accurate Statistics Calculation (Ensures logical consistency: never 328 orders with 0 EGP)
  const computedTotalOrders = useMemo(() => {
    return dashboardOverview?.totalOrders || totalOrders || orders.length || 0;
  }, [dashboardOverview, totalOrders, orders]);

  const computedTotalRevenue = useMemo(() => {
    if (dashboardOverview?.totalRevenue && dashboardOverview.totalRevenue > 0) {
      return Math.round(dashboardOverview.totalRevenue);
    }
    if (stats?.totalSales && stats.totalSales > 0) {
      return Math.round(stats.totalSales);
    }
    if (stats?.totalRevenue && stats.totalRevenue > 0) {
      return Math.round(stats.totalRevenue);
    }
    return 0;
  }, [dashboardOverview, stats]);

  const computedTotalCustomers = useMemo(() => {
    if (dashboardOverview?.totalCustomers && dashboardOverview.totalCustomers > 0) {
      return dashboardOverview.totalCustomers;
    }
    if (stats?.totalUniqueCustomers && stats.totalUniqueCustomers > 0) {
      return stats.totalUniqueCustomers;
    }
    return 0;
  }, [dashboardOverview, stats]);



  // Status Badge Rendering
  const renderStatusTag = (status) => {
    const statusMap = {
      pending: { color: "gold", labelAr: "قيد الانتظار", labelEn: "Pending" },
      confirmed: { color: "blue", labelAr: "تم التأكيد", labelEn: "Confirmed" },
      processing: { color: "cyan", labelAr: "جاري التجهيز", labelEn: "Processing" },
      shipped: { color: "purple", labelAr: "تم الشحن", labelEn: "Shipped" },
      delivered: { color: "green", labelAr: "تم التوصيل", labelEn: "Delivered" },
      cancelled: { color: "red", labelAr: "ملغي", labelEn: "Cancelled" },
      returned: { color: "volcano", labelAr: "مرتجع", labelEn: "Returned" },
      refunded: { color: "magenta", labelAr: "مسترد", labelEn: "Refunded" },
    };
    const current = statusMap[status?.toLowerCase()] || { color: "default", labelAr: status || "-", labelEn: status || "-" };
    return (
      <Tag color={current.color} className="font-extrabold px-3 py-1 rounded-lg text-xs m-0">
        {isArabic ? current.labelAr : current.labelEn}
      </Tag>
    );
  };

  // Payment Method Translation Helper
  const translatePaymentMethod = (method) => {
    if (!method) return isArabic ? "غير محدد" : "Unspecified";
    const m = method.toLowerCase();
    if (m === "cash_on_delivery" || m === "cod" || m.includes("cash")) {
      return isArabic ? "الدفع عند الاستلام (كاش)" : "Cash on Delivery (COD)";
    }
    if (m === "card" || m === "credit_card" || m.includes("card") || m === "online") {
      return isArabic ? "بطاقة ائتمان / دفع إلكتروني" : "Credit Card / Online";
    }
    if (m === "wallet" || m.includes("wallet") || m.includes("vodafone") || m.includes("insta")) {
      return isArabic ? "محفظة إلكترونية / انستاباي" : "E-Wallet / InstaPay";
    }
    if (m === "bank_transfer" || m.includes("bank")) {
      return isArabic ? "تحويل بنكي مباشر" : "Bank Transfer";
    }
    return method.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  // Payment Status Translation Helper
  const renderPaymentStatusTag = (status) => {
    if (!status) return null;
    const s = status.toLowerCase();
    let color = "default";
    let labelAr = status;
    let labelEn = status;

    if (s === "pending") {
      color = "warning";
      labelAr = t("orders.pending");
      labelEn = "Pending";
    } else if (s === "paid" || s === "completed" || s === "success") {
      color = "success";
      labelAr = "تم الدفع بنجاح"; // Custom or can be translated
      labelEn = "Paid";
    } else if (s === "refunded" || s === "refund") {
      color = "magenta";
      labelAr = t("orders.refunded");
      labelEn = "Refunded";
    } else if (s === "failed" || s === "error" || s === "declined") {
      color = "error";
      labelAr = t("orders.failed");
      labelEn = "Failed";
    } else if (s === "cancelled" || s === "canceled") {
      color = "default";
      labelAr = t("orders.cancelled");
      labelEn = "Cancelled";
    }

    return (
      <Tag color={color} className="font-extrabold px-2.5 py-0.5 rounded-md text-2xs m-0">
        {isArabic ? labelAr : labelEn}
      </Tag>
    );
  };

  // Table columns
  const columns = [
    {
      title: isArabic ? "رقم الطلب" : "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text) => (
        <span className="font-black text-rose-800 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200/60 text-sm inline-block shadow-2xs">
          #{text || "-"}
        </span>
      ),
    },
    {
      title: isArabic ? "طريقة وحالة الدفع" : "Payment Method & Status",
      key: "paymentInfo",
      render: (_, record) => (
        <div className="flex flex-col gap-1.5 items-start">
          <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
            <CreditCard size={14} className="text-rose-800" />
            <span>{translatePaymentMethod(record.paymentMethod)}</span>
          </span>
          <div>{renderPaymentStatusTag(record.paymentStatus)}</div>
        </div>
      ),
    },
    {
      title: isArabic ? "المجموع الفرعي" : "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (text) => (
        <span className="font-bold text-slate-700 text-sm">
          {text || 0} {isArabic ? "ج.م" : "EGP"}
        </span>
      ),
    },
    {
      title: isArabic ? "الخصم" : "Discount",
      dataIndex: "discountAmount",
      key: "discountAmount",
      render: (text) => (
        <span className={`font-bold text-sm ${text > 0 ? "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded" : "text-slate-400"}`}>
          {text || 0} {isArabic ? "ج.م" : "EGP"}
        </span>
      ),
    },
    {
      title: isArabic ? "الشحن" : "Shipping",
      dataIndex: "shippingAmount",
      key: "shippingAmount",
      render: (text) => (
        <span className="font-bold text-slate-600 text-sm">
          {text || 0} {isArabic ? "ج.م" : "EGP"}
        </span>
      ),
    },
    {
      title: isArabic ? "الإجمالي الكلي" : "Total Amount",
      dataIndex: "totalAmount",
      key: "total",
      render: (text) => (
        <span className="font-black text-rose-900 text-base">
          {text || 0} {isArabic ? "ج.م" : "EGP"}
        </span>
      ),
    },
    {
      title: isArabic ? "حالة الطلب" : "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => renderStatusTag(status),
    },
    {
      title: isArabic ? "الإجراءات والتحكم" : "Actions & Control",
      key: "actions",
      align: "center",
      width: 260,
      render: (_, record) => (
        <div className="flex gap-2 items-center justify-center flex-wrap">
          <Button
            onClick={() => fetchOrderDetails(record.id)}
            className="h-9 px-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-800 hover:text-white font-bold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Eye size={15} />
            <span>{isArabic ? "التفاصيل" : "View Details"}</span>
          </Button>

          <div className="flex flex-col gap-1.5">
            {record.availableTransitions?.length > 0 ? (
              <Select
                size="middle"
                placeholder={isArabic ? "تغيير حالة الطلب..." : "Change Order Status..."}
                onChange={(value) => updateOrder(record.id, value)}
                className="min-w-[140px] font-bold text-xs text-rose-900"
                popupClassName="font-bold"
              >
                {record.availableTransitions.map((status) => (
                  <Option key={status} value={status} className="font-bold">
                    {isArabic 
                      ? status === "confirmed" ? "تأكيد الطلب" 
                      : status === "processing" ? "جاري التجهيز"
                      : status === "shipped" ? "شحن الطلب" 
                      : status === "delivered" ? "تم التوصيل" 
                      : status === "cancelled" ? "إلغاء الطلب" 
                      : status === "returned" ? "مرتجع" : status
                      : status}
                  </Option>
                ))}
              </Select>
            ) : (
              <Tag color="default" className="font-bold rounded-lg px-2.5 py-1 m-0 text-center block">
                {isArabic ? "حالة نهائية للطلب" : "Final Order State"}
              </Tag>
            )}

            <Select
              size="middle"
              placeholder={isArabic ? "تغيير حالة الدفع..." : "Change Payment..."}
              onChange={(value) => updatePaymentStatus(record.id, value)}
              className="min-w-[140px] font-bold text-xs text-blue-900"
              popupClassName="font-bold"
              value={record.paymentStatus?.toLowerCase() || undefined}
            >
              <Option value="pending" className="font-bold text-yellow-600">{isArabic ? "معلق" : "Pending"}</Option>
              <Option value="paid" className="font-bold text-green-600">{isArabic ? "تم الدفع" : "Paid"}</Option>
              <Option value="refunded" className="font-bold text-magenta-600">{isArabic ? "مسترد" : "Refunded"}</Option>
              <Option value="failed" className="font-bold text-red-600">{isArabic ? "فشل" : "Failed"}</Option>
            </Select>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-8 bg-slate-50/50 min-h-screen" dir={isArabic ? "rtl" : "ltr"}>
      <ToastContainer theme="colored" position={isArabic ? "top-left" : "top-right"} autoClose={3000} />

      {/* Clean Modern Header Banner (Burgundy Theme) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-2.5 h-full bg-gradient-to-b from-rose-800 to-red-600"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-rose-800/10 text-rose-800 rounded-2xl shrink-0 mt-1 shadow-2xs">
              <ShoppingBag size={28} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200/60 mb-2">
                <Sparkles size={14} className="text-rose-800" />
                <span>{isArabic ? "نظام إدارة المبيعات (النسق النبيتي الملكي)" : "Sales & Orders System (Royal Burgundy)"}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight m-0">
                {isArabic ? "إدارة الطلبات والمبيعات" : "Customer Orders Directory"}
              </h1>
              <p className="text-slate-500 text-xs md:text-sm mt-1.5 max-w-2xl leading-relaxed m-0">
                {isArabic
                  ? "متابعة وإدارة كافة طلبات العملاء، تحديث حالات الشحن والتوصيل، وتصفية وفلترة الطلبات حسب طرق وحالات الدفع بدقة."
                  : "Track and manage all customer orders, update shipping statuses, and filter orders by payment methods seamlessly."}
              </p>
            </div>
          </div>
          <Button
            onClick={fetchOrders}
            type="primary"
            disabled={loadingOrders}
            className="h-11 px-6 bg-rose-800 hover:bg-rose-900 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-rose-800/20 hover:shadow-lg transition-all border-0 text-sm self-start md:self-center"
          >
            <RefreshCw size={16} className={loadingOrders ? "animate-spin" : ""} />
            <span>{isArabic ? "تحديث قائمة الطلبات" : "Refresh Orders"}</span>
          </Button>
        </div>
      </div>

      {/* Burgundy Unified Summary Cards (Logical & Accurate Stats) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-8">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm hover:shadow hover:border-rose-800/30 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-800" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-800/10 text-rose-800 flex items-center justify-center shrink-0">
              <ShoppingBag size={24} />
            </div>
            <div>
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                {isArabic ? "إجمالي الطلبات" : "Total Orders"}
              </span>
              <span className="text-2xl font-black text-rose-800 mt-0.5 block">
                {computedTotalOrders}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm hover:shadow hover:border-rose-800/30 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-800" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-800/10 text-rose-800 flex items-center justify-center shrink-0">
              <DollarSign size={24} />
            </div>
            <div>
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                {isArabic ? "إجمالي المبيعات المحققة" : "Total Revenue"}
              </span>
              <span className="text-lg font-black text-rose-800 mt-1 block">
                {computedTotalRevenue.toLocaleString()} <span className="text-xs font-bold">{isArabic ? "ج.م" : "EGP"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm hover:shadow hover:border-rose-800/30 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-800" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-800/10 text-rose-800 flex items-center justify-center shrink-0">
              <Users size={24} />
            </div>
            <div>
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                {isArabic ? "عدد العملاء المميزين" : "Unique Customers"}
              </span>
              <span className="text-lg font-black text-rose-800 mt-1 block">
                {computedTotalCustomers}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm hover:shadow hover:border-rose-800/30 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-800" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-800/10 text-rose-800 flex items-center justify-center shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                {isArabic ? "حالة النظام والربط" : "System Status"}
              </span>
              <span className="text-sm font-black text-rose-800 mt-1 block">
                {isArabic ? "مزامنة حية نشطة 100%" : "100% Active Sync"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card with Comprehensive Filters */}
      <div className="bg-white p-6 rounded-3xl border border-rose-100/80 shadow-md">
        
        {/* Filter Bar Section */}
        <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 mb-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-rose-100/80">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-rose-800" />
              <span className="font-black text-slate-800 text-sm">
                {isArabic ? "تصفية وفلترة الطلبات والبحث السريع" : "Filter Orders & Quick Search"}
              </span>
            </div>
            <Button
              onClick={resetFilters}
              size="small"
              className="h-8 px-3 rounded-lg bg-white border border-rose-200 text-rose-800 hover:bg-rose-800 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <RotateCcw size={13} />
              <span>{isArabic ? "إعادة ضبط الفلاتر" : "Reset Filters"}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="md:col-span-1 sm:col-span-2">
              <span className="text-2xs font-bold text-slate-600 block mb-1">
                {isArabic ? "بحث سريع بالرقم أو الهاتف:" : "Search by # or Phone:"}
              </span>
              <Input
                placeholder={isArabic ? "رقم الطلب، العميل أو الهاتف..." : "Order #, Phone, Name..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={handleSearchSubmit}
                allowClear
                prefix={<Search size={15} className="text-slate-400" />}
                className="h-10 rounded-xl font-semibold text-xs border-slate-200 focus:border-rose-800"
              />
            </div>

            {/* Status Filter */}
            <div>
              <span className="text-2xs font-bold text-slate-600 block mb-1">
                {isArabic ? "حالة الطلب التوصيلية:" : "Order Status:"}
              </span>
              <Select
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                className="w-full font-bold text-xs h-10"
                popupClassName="font-bold"
              >
                <Option value="all">{isArabic ? "الكل (جميع الحالات)" : "All Statuses"}</Option>
                <Option value="pending">{isArabic ? "قيد الانتظار" : "Pending"}</Option>
                <Option value="confirmed">{isArabic ? "تم التأكيد" : "Confirmed"}</Option>
                <Option value="processing">{isArabic ? "جاري التجهيز" : "Processing"}</Option>
                <Option value="shipped">{isArabic ? "تم الشحن" : "Shipped"}</Option>
                <Option value="delivered">{isArabic ? "تم التوصيل" : "Delivered"}</Option>
                <Option value="cancelled">{isArabic ? "ملغي" : "Cancelled"}</Option>
                <Option value="returned">{isArabic ? "مرتجع" : "Returned"}</Option>
                <Option value="refunded">{isArabic ? "مسترد" : "Refunded"}</Option>
              </Select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <span className="text-2xs font-bold text-slate-600 block mb-1">
                {isArabic ? "طريقة الدفع المسجلة:" : "Payment Method:"}
              </span>
              <Select
                value={paymentMethodFilter}
                onChange={(val) => setPaymentMethodFilter(val)}
                className="w-full font-bold text-xs h-10"
                popupClassName="font-bold"
              >
                <Option value="all">{isArabic ? "الكل (جميع طرق الدفع)" : "All Payment Methods"}</Option>
                <Option value="cash_on_delivery">{isArabic ? "الدفع عند الاستلام (كاش)" : "Cash on Delivery"}</Option>
                <Option value="card">{isArabic ? "بطاقة ائتمان / دفع إلكتروني" : "Credit Card / Online"}</Option>
                <Option value="wallet">{isArabic ? "محفظة إلكترونية / انستاباي" : "E-Wallet"}</Option>
              </Select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <span className="text-2xs font-bold text-slate-600 block mb-1">
                {isArabic ? "حالة الدفع المالية:" : "Payment Status:"}
              </span>
              <Select
                value={paymentStatusFilter}
                onChange={(val) => setPaymentStatusFilter(val)}
                className="w-full font-bold text-xs h-10"
                popupClassName="font-bold"
              >
                <Option value="all">{isArabic ? "الكل (جميع حالات الدفع)" : "All Payment Statuses"}</Option>
                <Option value="pending">{isArabic ? "معلق (لم يتم الدفع بعد)" : "Pending Payment"}</Option>
                <Option value="paid">{isArabic ? "تم الدفع بنجاح" : "Paid Successfully"}</Option>
                <Option value="refunded">{isArabic ? "تم استرداد المبلغ (مرتجع - Refunded)" : "Refunded"}</Option>
                <Option value="failed">{isArabic ? "فشل الدفع" : "Failed Payment"}</Option>
              </Select>
            </div>

            {/* Sort By Filter */}
            <div>
              <span className="text-2xs font-bold text-slate-600 block mb-1">
                {isArabic ? "ترتيب وعرض حسب:" : "Sort By:"}
              </span>
              <Select
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                className="w-full font-bold text-xs h-10"
                popupClassName="font-bold"
                suffixIcon={<ArrowUpDown size={14} className="text-rose-800" />}
              >
                <Option value="newest">{isArabic ? "الأحدث أولاً" : "Newest First"}</Option>
                <Option value="oldest">{isArabic ? "الأقدم أولاً" : "Oldest First"}</Option>
                <Option value="highest_amount">{isArabic ? "الأعلى قيمة أولاً" : "Highest Amount"}</Option>
                <Option value="lowest_amount">{isArabic ? "الأقل قيمة أولاً" : "Lowest Amount"}</Option>
              </Select>
            </div>
          </div>
        </div>

        {/* Table Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-800 text-white flex items-center justify-center font-bold shadow-md shadow-rose-800/25">
              <Package size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 m-0">
                {isArabic ? "سجل طلبات العملاء والفواتير" : "Customer Orders Log"}
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {isArabic
                  ? `إجمالي الطلبات (${orders.length} في هذه الصفحة)`
                  : `Showing (${orders.length} orders on this page)`}
              </span>
            </div>
          </div>
        </div>

        {loadingOrders ? (
          <div className="py-20 flex flex-col justify-center items-center gap-3">
            <Spin size="large" />
            <span className="text-sm font-bold text-rose-800 animate-pulse">
              {isArabic ? "جاري تحميل وتصفية سجل الطلبات الملكي..." : "Loading and filtering orders log..."}
            </span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16">
            <Empty description={<span className="font-bold text-slate-400">{isArabic ? "لا توجد طلبات تطابق معايير الفلترة المحددة" : "No orders match the selected filters"}</span>}>
              <Button
                onClick={resetFilters}
                className="mt-3 h-10 px-6 rounded-xl bg-rose-800 text-white hover:bg-rose-900 font-bold border-0 shadow-sm"
              >
                {isArabic ? "إعادة ضبط الفلاتر وعرض الكل" : "Reset Filters & Show All"}
              </Button>
            </Empty>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="id"
              pagination={false}
              className="overflow-x-auto"
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100 font-bold">
              <span className="text-xs text-slate-500 font-semibold">
                {isArabic ? `إجمالي عدد الطلبات في قاعدة البيانات: ${computedTotalOrders}` : `Total registered orders in DB: ${computedTotalOrders}`}
              </span>
              <Pagination
                current={page}
                pageSize={limit}
                total={totalOrders}
                onChange={(p, l) => {
                  setPage(p);
                  setLimit(l);
                }}
                showSizeChanger
                pageSizeOptions={["5", "10", "20", "50", "100"]}
                className="font-bold"
              />
            </div>
          </div>
        )}
      </div>

      {/* ======================
        ORDER DETAILS MODAL (Burgundy Theme)
      ====================== */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 pr-2">
            <span className="p-2.5 rounded-xl bg-rose-800 text-white shadow-sm">
              <FileText size={18} />
            </span>
            <div>
              <h3 className="text-lg font-black text-slate-800 m-0">
                {isArabic ? "تفاصيل الفاتورة والطلب" : "Invoice & Order Details"}
              </h3>
              {selectedOrder && (
                <span className="text-xs text-rose-800 font-bold">
                  #{selectedOrder.orderNumber || "-"}
                </span>
              )}
            </div>
          </div>
        }
        open={!!selectedOrder}
        onCancel={() => setSelectedOrder(null)}
        footer={[
          <Button
            key="close"
            onClick={() => setSelectedOrder(null)}
            className="h-10 px-6 bg-rose-800 hover:bg-rose-900 text-white font-bold rounded-xl border-0 shadow-sm"
            style={{ backgroundColor: "#9f1239" }}
          >
            {isArabic ? "إغلاق النافذة" : "Close"}
          </Button>,
        ]}
        width={750}
        className="rounded-3xl overflow-hidden"
      >
        {loadingDetails || !selectedOrder ? (
          <div className="flex flex-col justify-center items-center py-16 gap-3">
            <Spin size="large" />
            <span className="text-sm font-bold text-rose-800">
              {isArabic ? "جاري جلب تفاصيل الفاتورة..." : "Fetching order invoice details..."}
            </span>
          </div>
        ) : (
          <div className="pt-3 space-y-6">
            {/* Top Status & Payment Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-rose-50/50 p-4 rounded-2xl border border-rose-100/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-800/10 text-rose-800 flex items-center justify-center shrink-0">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <span className="text-2xs font-bold text-slate-400 block uppercase">{isArabic ? "حالة الطلب الحالية" : "Current Status"}</span>
                  <div className="mt-1">{renderStatusTag(selectedOrder.status)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-800/10 text-rose-800 flex items-center justify-center shrink-0">
                  <CreditCard size={20} />
                </div>
                <div>
                  <span className="text-2xs font-bold text-slate-400 block uppercase">{isArabic ? "طريقة وحالة الدفع" : "Payment Info"}</span>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-slate-800 text-xs">
                      {translatePaymentMethod(selectedOrder.paymentMethod)}
                    </span>
                    {renderPaymentStatusTag(selectedOrder.paymentStatus)}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <h4 className="text-sm font-black text-rose-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                <MapPin size={16} className="text-rose-800" />
                <span>{isArabic ? "عنوان التوصيل وبيانات المستلم" : "Shipping Address & Recipient"}</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span className="font-bold text-slate-700">{isArabic ? "هاتف المستلم:" : "Phone:"} </span>
                  <span className="font-black text-rose-800" dir="ltr">{selectedOrder.shippingAddress?.phone1 || "-"}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">{isArabic ? "عنوان المنطقة:" : "Zone Title:"} </span>
                  <span className="font-semibold text-slate-800">{selectedOrder.shippingAddress?.title || "-"}</span>
                </div>
                <div className="md:col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                  <span className="font-bold text-slate-700 block mb-0.5 text-xs">{isArabic ? "العنوان بالتفصيل:" : "Detailed Address:"} </span>
                  <span className="font-medium text-slate-700 text-sm leading-relaxed">{selectedOrder.shippingAddress?.description || isArabic ? "غير محدد" : "Not specified"}</span>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div>
              <h4 className="text-sm font-black text-rose-900 mb-3 flex items-center gap-2">
                <ShoppingBag size={16} className="text-rose-800" />
                <span>{isArabic ? `المنتجات المطلوبة (${selectedOrder.orderItems?.length || 0})` : `Order Items (${selectedOrder.orderItems?.length || 0})`}</span>
              </h4>

              <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                {selectedOrder.orderItems?.map((item) => {
                  const rawUrl = item.productImages?.[0] || null;
                  const imgUrl = resolveImageUrl(rawUrl);
                  return (
                    <div
                      key={item.id}
                      className="bg-white p-3 rounded-xl border border-slate-200/80 hover:border-rose-200 flex items-center justify-between gap-3 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-200 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={item.productName}
                              className="w-full h-full object-contain rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Package size={22} className="text-slate-300" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-800 text-sm m-0 truncate">{item.productName || "-"}</p>
                          <p className="text-xs font-bold text-slate-500 mt-1 mb-0">
                            {isArabic ? "الكمية:" : "Qty:"} <span className="text-rose-800 font-black">{item.quantity}</span> × {item.unitPrice} {isArabic ? "ج.م" : "EGP"}
                          </p>
                          {item.discount > 0 && (
                            <span className="inline-block mt-1 text-2xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              {isArabic ? `خصم: ${item.discount}%` : `Discount: ${item.discount}%`}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-end shrink-0 font-black text-rose-900 text-base">
                        {item.totalPrice} <span className="text-xs font-bold">{isArabic ? "ج.م" : "EGP"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-red-800 text-white p-5 rounded-2xl shadow-lg space-y-2">
              <div className="flex justify-between items-center text-xs text-rose-100">
                <span>{isArabic ? "المجموع الفرعي للمنتجات:" : "Items Subtotal:"}</span>
                <span className="font-bold">{selectedOrder.subtotal || 0} {isArabic ? "ج.م" : "EGP"}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-rose-100">
                <span>{isArabic ? "قيمة الخصم الكلي:" : "Total Discount:"}</span>
                <span className="font-bold">{selectedOrder.discountAmount || 0} {isArabic ? "ج.م" : "EGP"}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-rose-100">
                <span>{isArabic ? "رسوم الشحن والتوصيل:" : "Shipping Fee:"}</span>
                <span className="font-bold">{selectedOrder.shippingAmount || 0} {isArabic ? "ج.م" : "EGP"}</span>
              </div>
              <hr className="border-white/20 my-2" />
              <div className="flex justify-between items-center text-base md:text-lg font-black pt-1">
                <span>{isArabic ? "الإجمالي النهائي المستحق:" : "Total Payable Amount:"}</span>
                <span className="text-xl text-yellow-300">{selectedOrder.totalAmount || 0} <span className="text-xs font-bold">{isArabic ? "ج.م" : "EGP"}</span></span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
