import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Row,
  Col,
  Card,
  Spin,
  Table,
  Space,
  Badge,
  Progress,
  Tag,
  message,
} from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  BarChart as BarIcon,
  PieChart as PieIcon,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  CheckCircle2,
  Award,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProductImages } from "../../utils/useProductImages";

const API = "https://api.elrayan.acwad.tech/api/v1/orders/dashboard";
const COLORS = [
  "#4CAF50",
  "#FF9800",
  "#2196F3",
  "#F44336",
  "#9C27B0",
  "#00BCD4",
];
const OVERVIEW_COLORS = ["#e3f2fd", "#fff3e0", "#e8f5e9", "#fce4ec", "#e0f7fa"]; // ألوان للكاردز الأولية

const OrdersTab = () => {
  const { t } = useTranslation();
  const { getProductImage } = useProductImages();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const language = localStorage.getItem("i18nextLng") || "en";
  const headers = { Authorization: `Bearer ${token}`, lang: language };

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API, { headers });
        if (mounted) setData(res.data);
      } catch (e) {
        console.error(e);
        message.error(t("dashboard.failed_load"));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [language]);

  const StatCard = ({ title, value, icon, accent, formatter, isProgress }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      let start = 0;
      const end = value || 0;
      if (start === end) return;
      let duration = 1200;
      let increment = end / (duration / 16);
      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          start = end;
          clearInterval(counter);
        }
        setDisplayValue(start);
      }, 16);
      return () => clearInterval(counter);
    }, [value]);

    const formattedVal = formatter ? formatter(displayValue) : Math.round(displayValue).toLocaleString();

    return (
      <div className="relative bg-white rounded-2xl border border-slate-200/60 hover:border-slate-300/80 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group cursor-default">
        {/* Left accent bar */}
        <div className={`absolute top-0 left-0 w-1 h-full ${accent || 'bg-[#172554]'} rounded-l-2xl`}></div>
        
        <div className="p-4 ps-5">
          {/* Top row: icon + title */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#172554]/[0.06] flex items-center justify-center text-[#172554] group-hover:bg-[#172554]/[0.1] transition-colors duration-300">
              {icon}
            </div>
            <span className="text-slate-500 font-semibold text-[13px] leading-tight">{title}</span>
          </div>
          
          {/* Value */}
          <div className="text-[1.65rem] font-extrabold text-slate-800 tracking-tight leading-none">
            {formattedVal}
          </div>
          
          {isProgress && (
            <div className="mt-2.5 w-full">
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#172554] to-[#b91c1c] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, Math.round(displayValue))}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const overviewCards = useMemo(() => {
    if (!data) return [];
    const o = data.overview;
    return [
      {
        title: t("dashboard.total_revenue"),
        value: o.totalRevenue,
        icon: <DollarSign size={18} strokeWidth={2.5} />,
        accent: "bg-[#172554]",
        formatter: (v) => `${language === "ar" ? "ج.م " : "EGP "}${Math.round(v).toLocaleString()}`,
      },
      {
        title: t("dashboard.total_orders"),
        value: o.totalOrders,
        icon: <ShoppingCart size={18} strokeWidth={2.5} />,
        accent: "bg-[#b91c1c]",
        formatter: (v) => Math.round(v).toLocaleString(),
      },
      {
        title: t("dashboard.total_products"),
        value: o.totalProducts,
        icon: <Package size={18} strokeWidth={2.5} />,
        accent: "bg-[#172554]",
        formatter: (v) => Math.round(v).toLocaleString(),
      },
      {
        title: t("dashboard.total_customers"),
        value: o.totalCustomers,
        icon: <Users size={18} strokeWidth={2.5} />,
        accent: "bg-[#b91c1c]",
        formatter: (v) => Math.round(v).toLocaleString(),
      },
      {
        title: t("dashboard.completion_rate"),
        value: o.completionRate,
        icon: <CheckCircle2 size={18} strokeWidth={2.5} />,
        accent: "bg-gradient-to-b from-[#172554] to-[#b91c1c]",
        formatter: (v) => `${v.toFixed(1)}%`,
        isProgress: true,
      },
    ];
  }, [data, t, language]);

  const dailyTrend = useMemo(
    () =>
      (data?.trends?.dailyRevenue || []).map((d) => ({
        date: new Date(d.date).toLocaleDateString(),
        revenue: d.revenue,
        orders: d.orders,
      })),
    [data],
  );

  const weeklyTrend = useMemo(
    () =>
      (data?.trends?.weeklyRevenue || []).map((d) => ({
        week: new Date(d.week).toLocaleDateString(),
        revenue: d.revenue,
        orders: d.orders,
      })),
    [data],
  );

  const monthlyTrend = useMemo(
    () =>
      (data?.trends?.monthlyRevenue || []).map((d) => ({
        month: new Date(d.month).toLocaleString(undefined, {
          month: "short",
          year: "numeric",
        }),
        revenue: d.revenue,
        orders: d.orders,
      })),
    [data],
  );

  const ordersByStatus = data?.orderStats?.ordersByStatus || [];
  const ordersByPayment = data?.orderStats?.ordersByPaymentStatus || [];
  const paymentMethods = data?.orderStats?.ordersByPaymentMethod || [];

  const productColumns = [
    {
      title: t("products_performance.product"),
      dataIndex: "name",
      key: "name",
      render: (txt, r) => {
        const imgSrc = getProductImage(r);
        return (
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs flex items-center justify-center">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt=""
                className="w-full h-full object-contain p-0.5"
              />
            ) : (
              <span className="text-xs">📦</span>
            )}
          </div>
          <span className="font-bold text-slate-700 text-xs sm:text-sm">{txt}</span>
        </div>
        );
      },
    },
    {
      title: t("products_performance.main_category"),
      dataIndex: "mainCategoryName",
      key: "mainCategoryName",
    },
    {
      title: t("products_performance.total_sold"),
      dataIndex: "totalSold",
      key: "totalSold",
    },
    {
      title: t("products_performance.revenue"),
      dataIndex: "revenue",
      key: "revenue",
      render: (v) => `${language === "ar" ? "ج.م" : "Egp"} ${v}`,
    },
    {
      title: t("products_performance.avg_price"),
      dataIndex: "averagePrice",
      key: "averagePrice",
      render: (v) => `${language === "ar" ? "ج.م" : "Egp"} ${v}`,
    },
  ];

  const lowStockColumns = [
    {
      title: t("products_performance.product"),
      dataIndex: "name",
      key: "name",
      render: (v) => (
        <span className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1">
          {v || (language === "ar" ? "منتج بدون اسم" : "Unnamed Product")}
        </span>
      ),
    },
    {
      title: t("inventory.current_stock"),
      dataIndex: "currentStock",
      key: "currentStock",
      render: (v) => {
        const num = Number(v || 0);
        return num <= 3 ? (
          <span className="inline-flex items-center justify-center font-extrabold text-red-600 bg-red-50/80 px-2.5 py-0.5 rounded-full border border-red-200 text-xs shadow-2xs">
            {num}
          </span>
        ) : (
          <span className="inline-flex items-center justify-center font-bold text-amber-700 bg-amber-50/80 px-2.5 py-0.5 rounded-full border border-amber-200 text-xs">
            {num}
          </span>
        );
      },
    },
    {
      title: t("products_performance.total_sold"),
      dataIndex: "sold",
      key: "sold",
      render: (v) => (
        <span className="font-bold text-slate-600 text-xs sm:text-sm">
          {Number(v || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: t("low_stock.recommended"),
      dataIndex: "isRecommended",
      key: "isRecommended",
      render: (v) =>
        v ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 font-bold text-xs border border-emerald-500/20">
            {t("common.yes") || (language === "ar" ? "نعم" : "Yes")}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium text-xs">
            {t("common.no") || (language === "ar" ? "لا" : "No")}
          </span>
        ),
    },
  ];

  const customerColumns = [
    { title: t("top_customers.name"), dataIndex: "fullName", key: "fullName" },
    { title: t("top_customers.email"), dataIndex: "email", key: "email" },
    {
      title: t("top_customers.order_count"),
      dataIndex: "orderCount",
      key: "orderCount",
    },
    {
      title: t("top_customers.total_spent"),
      dataIndex: "totalSpent",
      key: "totalSpent",
      render: (v) =>
        `${language === "ar" ? "ج.م" : "Egp"} ${Number(v).toFixed(2)}`,
    },
    {
      title: t("top_customers.avg_order_value"),
      dataIndex: "averageOrderValue",
      key: "averageOrderValue",
      render: (v) =>
        `${language === "ar" ? "ج.م" : "Egp"} ${Number(v).toFixed(2)}`,
    },
  ];

  const recentStatsLabels = {
    todayRevenue: "dashboard.today_revenue",
    todayOrders: "dashboard.today_orders",
    weeklyRevenue: "dashboard.weekly_revenue",
    weeklyOrders: "dashboard.weekly_orders",
    monthlyRevenue: "dashboard.monthly_revenue",
    monthlyOrders: "dashboard.monthly_orders",
  };

  if (loading || !data)
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <Spin size="large" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        {overviewCards.map((c, idx) => (
          <StatCard key={c.title || idx} {...c} />
        ))}
      </div>

      <Row gutter={[16, 16]} style={{ marginTop: 20 }} className="!flex !flex-wrap items-stretch">
        <Col xs={24} lg={16} className="!flex flex-col">
          {/* Revenue Trends */}
          <Card
            title={
              <Space>
                <BarIcon size={16} />
                {t("dashboard.revenue_trends")}
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    dot={{ r: 3 }}
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#82ca9d"
                    dot={{ r: 3 }}
                    name="Orders"
                    yAxisId={1}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title={t("dashboard.weekly_monthly_revenue")}>
            <Row gutter={[12, 12]}>
              <Col xs={24} md={12}>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                      <Bar dataKey="orders" name="Orders" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" name="Revenue" fill="#ff7f50" />
                      <Bar dataKey="orders" name="Orders" fill="#ffd54f" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Col>
            </Row>
          </Card>

          <Card
            title={
              <div className="flex items-center gap-2.5 font-black text-slate-800 text-base">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
                  <Package size={18} />
                </span>
                <span>{t("dashboard.top_selling_products")}</span>
              </div>
            }
            className="mt-4 shadow-sm border-slate-200/80 rounded-2xl overflow-hidden bg-white flex-grow"
          >
            <Table
              columns={productColumns}
              dataSource={data.productStats?.topSellingProducts}
              rowKey="id"
              pagination={false}
              scroll={{ x: 650 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8} className="!flex flex-col">
          {/* Right column */}
          <Card
            title={
              <div className="flex items-center gap-2 font-black text-slate-800">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <PieIcon size={18} />
                </span>
                <span>{t("dashboard.orders_by_status")}</span>
              </div>
            }
            className="mb-4 shadow-sm border-slate-100 rounded-2xl"
          >
            <div className="space-y-4">
              {/* Doughnut Chart Container */}
              <div className="relative w-full h-52 flex items-center justify-center bg-slate-50/60 rounded-2xl p-2 border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ordersByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {ordersByStatus.map((entry, idx) => (
                        <Cell
                          key={`c-${idx}`}
                          fill={COLORS[idx % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Total Count */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-800">
                    {ordersByStatus.reduce((acc, curr) => acc + Number(curr.count || 0), 0)}
                  </span>
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider">
                    {language === "ar" ? "طلب" : "orders"}
                  </span>
                </div>
              </div>

              {/* Legend List (No fixed height -> never overflows!) */}
              <div className="space-y-2 pt-1">
                {ordersByStatus.map((s, idx) => {
                  const color = COLORS[idx % COLORS.length];
                  return (
                    <div
                      key={s.status || idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs hover:border-slate-200 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-bold text-slate-700 text-xs sm:text-sm capitalize truncate">
                          {s.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-slate-800 text-sm">
                          {s.count}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                          {(s.percentage || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card
            title={
              <div className="flex items-center gap-2 font-black text-slate-800">
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                  <PieIcon size={18} />
                </span>
                <span>{t("dashboard.payment_status")}</span>
              </div>
            }
            className="mb-4 shadow-sm border-slate-100 rounded-2xl"
          >
            <div className="space-y-5">
              {/* 1. Payment Status List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {language === "ar" ? "حالة السداد" : "Payment Status"}
                </div>
                {ordersByPayment.map((p, idx) => {
                  const color = COLORS[(idx + 2) % COLORS.length];
                  return (
                    <div
                      key={p.status || idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-bold text-slate-700 text-xs sm:text-sm capitalize truncate">
                          {p.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-extrabold text-slate-800 text-sm">
                          {p.count}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                          {(p.percentage || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2. Payment Methods Chart & Legend */}
              {paymentMethods && paymentMethods.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {language === "ar" ? "طرق الدفع" : "Payment Methods"}
                  </div>

                  <div className="relative w-full h-48 flex items-center justify-center bg-slate-50/60 rounded-2xl p-2 border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentMethods}
                          dataKey="count"
                          nameKey="method"
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={4}
                        >
                          {paymentMethods.map((_, idx) => (
                            <Cell
                              key={`pm-${idx}`}
                              fill={COLORS[idx % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-black text-slate-800">
                        {paymentMethods.reduce((acc, curr) => acc + Number(curr.count || 0), 0)}
                      </span>
                      <span className="text-3xs font-bold text-slate-400 uppercase">
                        {language === "ar" ? "عملية" : "txns"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {paymentMethods.map((pm, idx) => {
                      const color = COLORS[idx % COLORS.length];
                      return (
                        <div
                          key={pm.method || idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-bold text-slate-700 text-xs sm:text-sm capitalize truncate">
                              {pm.method}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-black text-slate-800 text-sm">
                              {pm.count}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                              {(pm.percentage || 0).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Stats Card */}
          <Card
            title={
              <div className="flex items-center gap-2 font-black text-slate-800">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                  <Award size={18} />
                </span>
                <span>{t("dashboard.recent_stats")}</span>
              </div>
            }
            className="shadow-sm border-slate-100 rounded-2xl flex-grow flex flex-col"
            bodyStyle={{ flexGrow: 1, display: "flex", flexDirection: "column", padding: "16px" }}
          >
            <div className="flex flex-col h-full gap-3 flex-grow">
              {[
                {
                  title: language === "ar" ? "اليوم" : "Today",
                  revenueKey: "todayRevenue",
                  ordersKey: "todayOrders",
                  revenueLabel: "dashboard.today_revenue",
                  ordersLabel: "dashboard.today_orders",
                },
                {
                  title: language === "ar" ? "هذا الأسبوع" : "This Week",
                  revenueKey: "weeklyRevenue",
                  ordersKey: "weeklyOrders",
                  revenueLabel: "dashboard.weekly_revenue",
                  ordersLabel: "dashboard.weekly_orders",
                },
                {
                  title: language === "ar" ? "هذا الشهر" : "This Month",
                  revenueKey: "monthlyRevenue",
                  ordersKey: "monthlyOrders",
                  revenueLabel: "dashboard.monthly_revenue",
                  ordersLabel: "dashboard.monthly_orders",
                }
              ].map((group, idx) => {
                const revenue = data.recentStats?.[group.revenueKey];
                const orders = data.recentStats?.[group.ordersKey];
                
                return (
                  <div key={idx} className="flex-1 flex flex-col justify-center bg-slate-50/50 rounded-2xl p-4 border border-slate-100 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-rose-800 to-rose-950 rounded-l-2xl opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="text-sm font-black text-slate-600 uppercase tracking-widest mb-3 px-2">
                      {group.title}
                    </div>
                    
                    <div className="space-y-2 px-1">
                      <div className="flex items-center justify-between bg-red-50/50 p-2 rounded-lg border border-red-100/50">
                        <span className="font-bold text-slate-600 text-xs">
                          {t(group.revenueLabel)}
                        </span>
                        <span className="font-black text-sm text-[#b91c1c]">
                          {typeof revenue === "number" ? revenue.toLocaleString() : revenue} {language === "ar" ? "ج.م" : "EGP"}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-600 text-xs">
                          {t(group.ordersLabel)}
                        </span>
                        <span className="font-extrabold text-sm text-slate-800">
                          {typeof orders === "number" ? orders.toLocaleString() : orders}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Full Width Sections Below the Main Columns */}
      <div className="grid grid-cols-1 gap-6">
        <Card
          title={
            <div className="flex items-center gap-2.5 font-black text-slate-800 text-base">
              <span className="p-2 rounded-xl bg-red-50 text-[#b91c1c] border border-red-100 shadow-2xs">
                <ShoppingCart size={18} />
              </span>
              <span>{t("dashboard.low_stock_products")}</span>
            </div>
          }
          className="shadow-sm border-slate-200/80 rounded-2xl overflow-hidden bg-white"
        >
          <Table
            columns={lowStockColumns}
            dataSource={data.productStats?.lowStockProducts}
            rowKey="id"
            pagination={{ pageSize: 10, size: "small", showSizeChanger: false }}
            scroll={{ x: 550 }}
            className="overflow-x-auto"
          />
        </Card>

        <Card
          title={
            <div className="flex items-center gap-2.5 font-black text-slate-800 text-base">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shadow-2xs">
                <Users size={18} />
              </span>
              <span>{t("dashboard.top_customers")}</span>
            </div>
          }
          className="shadow-sm border-slate-200/80 rounded-2xl overflow-hidden bg-white"
        >
          <Table
            columns={customerColumns}
            dataSource={data?.topCustomers}
            rowKey="id"
            pagination={{ pageSize: 5, size: "small", showSizeChanger: false }}
            scroll={{ x: 650 }}
            className="overflow-x-auto"
          />
        </Card>
      </div>
    </div>
  );
};

export default OrdersTab;
