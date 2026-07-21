// src/pages/SuperAdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, DatePicker, Table, Row, Col, Spin } from "antd";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from "recharts";

const { RangePicker } = DatePicker;
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
import { useTranslation } from "react-i18next";

export default function SuperAdminDashboard() {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        fetchSuperAdmin();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSuperAdmin = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                "https://api.maghni.acwad.tech/api/v1/dashboard/super-admin",
                {
                    params: {
                        startDate: startDate || undefined,
                        endDate: endDate || undefined,
                    },
                },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                }
            );

            setData(res.data);
            toast.success(t("common.success"));
        } catch (err) {
            console.error("Error loading super-admin dashboard:", err);
            toast.error(t("common.error"));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[70vh] flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6">
                <ToastContainer />
                <p className="text-red-600">No dashboard data available.</p>
            </div>
        );
    }

    // helpers to protect against missing fields
    const overview = data.overview || {};
    const revenue = data.revenue || {};
    const orders = data.orders || {};
    const products = data.products || {};
    const users = data.users || {};
    const vendors = data.vendors || {};
    const topPerformers = data.topPerformers || {};
    const recentActivity = data.recentActivity || {};

    const vendorColumns = [
        { title: t("dashboard.vendors"), dataIndex: "vendorName", key: "vendorName" },
        { title: t("dashboard.revenue"), dataIndex: "revenue", key: "revenue", render: (val) => `${Number(val).toLocaleString()} EGP` },
        { title: t("dashboard.orders"), dataIndex: "orderCount", key: "orderCount" },
    ];
    const paymentMethodColumns = [
        { title: "Method", dataIndex: "paymentMethod", key: "paymentMethod" },
        { title: t("dashboard.orders"), dataIndex: "count", key: "count" },
        { title: "Amount", dataIndex: "amount", key: "amount", render: (val) => `${Number(val).toLocaleString()} EGP` },
    ];

    const topProductsColumns = [
        {
            title: t("dashboard.products"), dataIndex: "productName", key: "productName", render: (name) => {
                try { const parsed = JSON.parse(name); return parsed?.en || parsed?.ar || name; }
                catch { return name; }
            }
        },
        { title: "Sold", dataIndex: "totalSold", key: "totalSold" },
        { title: t("dashboard.revenue"), dataIndex: "totalRevenue", key: "totalRevenue", render: (val) => `${Number(val).toLocaleString()} EGP` },
        { title: t("dashboard.orders"), dataIndex: "orderCount", key: "orderCount", render: (val) => val ?? "-" },
    ];

    const topPerformersColumns = [
        { title: t("vendors.name"), dataIndex: "vendorName", key: "vendorName" },
        { title: t("dashboard.orders"), dataIndex: "orderCount", key: "orderCount" },
        { title: t("dashboard.revenue"), dataIndex: "revenue", key: "revenue", render: (val) => `${Number(val).toLocaleString()} EGP` },
    ]

    const topCustomersColumns = [
        { title: t("users.full_name"), dataIndex: "name", key: "name" },
        { title: t("dashboard.orders"), dataIndex: "orderCount", key: "orderCount" },
        { title: t("users.total_spent"), dataIndex: "totalSpent", key: "totalSpent", render: (val) => `${Number(val).toLocaleString()} EGP` },
    ];
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <ToastContainer />
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-extrabold">Super Admin </h1>
                {/* Date Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-4">

                    <RangePicker
                        onChange={(dates, dateStrings) => {
                            setStartDate(dateStrings[0]);
                            setEndDate(dateStrings[1]);
                        }}
                    />

                    <button
                        onClick={fetchSuperAdmin}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition self-end"
                    >
                        {loading ? t("dashboard.loading") : t("dashboard.apply_filters")}
                    </button>
                </div>

            </div>

            {/* Overview cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={4}>
                    <AntdStatCard title="Total Revenue" value={overview.totalRevenue} color="#10b981" suffix="EGP" />
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <AntdStatCard title="Total Orders" value={overview.totalOrders} color="#2563eb" />
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <AntdStatCard title="Total Users" value={overview.totalUsers} color="#4f46e5" />
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <AntdStatCard title="Total Products" value={overview.totalProducts} color="#facc15" />
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <AntdStatCard title="Total Vendors" value={overview.totalVendors} color="#ec4899" />
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <AntdStatCard title="Avg Order Value" value={overview.averageOrderValue} color="#8b5cf6" suffix="EGP" decimals={2} />
                </Col>
            </Row>


            {/* Main grid: Revenue chart | Orders pie | Revenue by vendor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Revenue timeline chart */}
                <div className="bg-white rounded-2xl shadow p-4 col-span-2">
                    <h2 className="text-lg font-semibold mb-3">{t("dashboard.daily_revenue")}</h2>
                    {revenue?.dailyRevenue && revenue?.dailyRevenue.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={[...(revenue?.dailyRevenue || [])].sort((a, b) => new Date(a.date) - new Date(b.date))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
                                <YAxis />
                                <Tooltip formatter={(val) => `${val} EGP`} labelFormatter={(d) => new Date(d).toLocaleString()} />
                                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500">No daily revenue data</p>
                    )}
                </div>

                {/* Orders by status pie */}
                <div className="bg-white rounded-2xl shadow p-4">
                    <h2 className="text-lg font-semibold mb-3">{t("dashboard.orders_by_status")}</h2>
                    {orders.ordersByStatus && orders.ordersByStatus.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={orders.ordersByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                                    {orders.ordersByStatus.map((_, idx) => (
                                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500">No orders status data</p>
                    )}
                </div>
            </div>

            {/* Two column: Revenue by vendor + Orders payment breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">


                {revenue.revenueByVendor && revenue.revenueByVendor.length > 0 ? (
                    <>

                        {/* /////////////////////////////////////////////////////////////////////////////////////// */}
                        <Card title={t("dashboard.revenue_by_vendor")} className="mb-6">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={revenue.revenueByVendor}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="vendorName" tick={{ fontSize: 12 }} />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `${value} EGP`} />
                                    <Bar dataKey="revenue" name="Revenue" fill="#10b981" />
                                </BarChart>
                            </ResponsiveContainer>
                            <Table
                                dataSource={revenue.revenueByVendor || []}
                                columns={vendorColumns}
                                rowKey="vendorId"
                                pagination={false}
                                className="overflow-x-auto"
                            />
                        </Card>
                    </>
                ) : (
                    <p className="text-gray-500">No vendor revenue data</p>
                )}


                <div className="bg-white rounded-2xl shadow p-4">
                    <h3 className="text-lg font-semibold mb-3">{t("dashboard.payment_breakdown")}</h3>

                    {/* Payment status bar */}
                    {orders.ordersByPaymentStatus && orders.ordersByPaymentStatus.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={orders.ordersByPaymentStatus}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="paymentStatus" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value} ${typeof value === "number" ? "" : ""}`} />
                                <Legend />
                                <Bar dataKey="count" name="Orders" fill="#2563eb" />
                                <Bar dataKey="amount" name="Amount (EGP)" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500">No payment status data</p>
                    )}

                    {/* Payment methods */}
                    <div className="mt-4">
                        {orders.ordersByPaymentMethod && orders.ordersByPaymentMethod.length > 0 ? (
                            <Card title={t("dashboard.payment_method")} className="mb-6">
                                <Table
                                    dataSource={orders.ordersByPaymentMethod || []}
                                    columns={paymentMethodColumns}
                                    rowKey="paymentMethod"
                                    pagination={false}
                                    className="overflow-x-auto"
                                />
                            </Card>
                        ) : (
                            <p className="text-gray-500">No payment method data</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Products and Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Top Selling Products */}

                {products.topSellingProducts && products.topSellingProducts.length > 0 ? (
                    <div className="space-y-3">
                        <Card title={t("dashboard.top_selling_products")} className="mb-6">
                            <Table
                                dataSource={products.topSellingProducts || []}
                                columns={topProductsColumns}
                                rowKey="productId"
                                pagination={false}
                                className="overflow-x-auto"
                            />
                        </Card>
                    </div>
                ) : (
                    <p className="text-gray-500">No top products data</p>
                )}


                {/* Top Vendors / Customers summary */}



                <div className="mb-4 min-h-full">
                    {topPerformers.topVendors && topPerformers.topVendors.length > 0 ? (
                        <Card title={t("dashboard.top_vendors")} className="mb-6">
                            <Table
                                dataSource={topPerformers.topVendors || []}
                                columns={topPerformersColumns}
                                rowKey="vendorId"
                                pagination={false}
                                className="overflow-x-auto"
                            />
                        </Card>
                    ) : (
                        <p className="text-gray-500">No top vendors</p>
                    )}
                </div>

                <div>

                    {topPerformers.topCustomers && topPerformers.topCustomers.length > 0 ? (
                        <Card title={t("dashboard.top_customers")} className="mb-6">
                            <Table
                                dataSource={topPerformers.topCustomers || []}
                                columns={topCustomersColumns}
                                rowKey="userId"
                                pagination={false}
                            />
                        </Card>
                    ) : (
                        <p className="text-gray-500">No top customers</p>
                    )}
                </div>
            </div>


            {/* Users & Vendors summaries + recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-2xl shadow p-4">
                    <h4 className="font-semibold mb-3">{t("dashboard.users")}</h4>
                    <div className="space-y-2">
                        <StatSmall label={t("dashboard.total_users")} value={users.totalUsers} />
                        <StatSmall label={t("dashboard.new_users")} value={users.newUsers} />
                        <StatSmall label={t("dashboard.active_users")} value={users.activeUsers} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow p-4">
                    <h4 className="font-semibold mb-3">{t("dashboard.vendors")}</h4>
                    <div className="space-y-2">
                        <StatSmall label={t("dashboard.total_vendors")} value={vendors.totalVendors} />
                        <StatSmall label={t("dashboard.active_vendors")} value={vendors.activeVendors} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow p-4">
                    <h4 className="font-semibold mb-3">{t("dashboard.recent_activity")}</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                        <div>
                            <div className="font-medium">{t("dashboard.recent_orders")}</div>
                            <ul className="text-sm mt-2 space-y-2">
                                {(recentActivity.recentOrders || []).slice(0, 6).map((o) => (
                                    <li key={o.id} className="flex justify-between">
                                        <span>{o.orderNumber} — {o.user?.fullName || "—"}</span>
                                        <span className="font-semibold">{o.totalAmount} EGP</span>
                                    </li>
                                ))}
                                {(!recentActivity.recentOrders || recentActivity.recentOrders.length === 0) && (
                                    <li className="text-gray-500">No recent orders</li>
                                )}
                            </ul>
                        </div>
                        <hr />
                        <div>
                            <div className="font-medium mt-2">{t("dashboard.recent_users")}</div>
                            <ul className="text-sm mt-2 space-y-2">
                                {(recentActivity.recentUsers || []).slice(0, 6).map((u) => (
                                    <li key={u.id} className="flex justify-between">
                                        <span>{u.fullName || u.email}</span>
                                        <span className="text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</span>
                                    </li>
                                ))}
                                {(!recentActivity.recentUsers || recentActivity.recentUsers.length === 0) && (
                                    <li className="text-gray-500">No recent users</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer small note */}
            <div className="text-sm text-gray-500">
                {t("dashboard.generated_at")} {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : "n/a"}
            </div>
        </div>
    );
}

function AntdStatCard({ title, value, color = "#2563eb", suffix = "", decimals = 0 }) {
    return (
        <Card
            bordered={false}
            style={{
                backgroundColor: color,
                color: "#fff",
                borderRadius: 12,
                textAlign: "center",
            }}
        >
            <div className="text-sm opacity-90">{title}</div>
            <div className="text-2xl font-bold mt-2">
                <CountUp end={Number(value) || 0} duration={1.8} separator="," decimals={decimals} />
                {suffix && <span className="ml-1 text-sm">{suffix}</span>}
            </div>
        </Card>
    );
}

function StatSmall({ label, value }) {
    return (
        <div className="flex justify-between">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="font-semibold">{Number(value || 0).toLocaleString()}</span>
        </div>
    );
}
/*

// src/pages/SuperAdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PulseLoader } from "react-spinners";
import { Card, DatePicker, Table, Row, Col } from "antd";
// import moment from "moment";
import {
import TopPerformers from './TopPerformers';
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from "recharts";

const { RangePicker } = DatePicker;
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function SuperAdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const [dateRange, setDateRange] = useState([]);

    useEffect(() => {
        fetchSuperAdmin();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSuperAdmin = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                "https://api.maghni.acwad.tech/api/v1/dashboard/super-admin",
                {
                    params: {
                        startDate: dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : undefined,
                        endDate: dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
                    },
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                }
            );

            setData(res.data);
            toast.success("Dashboard data loaded");
        } catch (err) {
            console.error("Error loading super-admin dashboard:", err);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[70vh] flex items-center justify-center">
                <PulseLoader color="#2563eb" size={12} />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6">
                <ToastContainer />
                <p className="text-red-600">No dashboard data available.</p>
            </div>
        );
    }

    const overview = data.overview || {};
    const revenue = data.revenue || {};
    const orders = data.orders || {};
    const products = data.products || {};
    const topPerformers = data.topPerformers || {};

    // Columns for Antd Tables
    const vendorColumns = [
        { title: "Vendor", dataIndex: "vendorName", key: "vendorName" },
        { title: "Revenue", dataIndex: "revenue", key: "revenue", render: (val) => `${Number(val).toLocaleString()} EGP` },
        { title: "Orders", dataIndex: "orderCount", key: "orderCount" },
    ];

    const paymentMethodColumns = [
        { title: "Method", dataIndex: "paymentMethod", key: "paymentMethod" },
        { title: "Orders", dataIndex: "count", key: "count" },
        { title: "Amount", dataIndex: "amount", key: "amount", render: (val) => `${Number(val).toLocaleString()} EGP` },
    ];

    const topProductsColumns = [
        {
            title: "Product", dataIndex: "productName", key: "productName", render: (name) => {
                try { const parsed = JSON.parse(name); return parsed?.en || parsed?.ar || name; }
                catch { return name; }
            }
        },
        { title: "Sold", dataIndex: "totalSold", key: "totalSold" },
        { title: "Revenue", dataIndex: "totalRevenue", key: "totalRevenue", render: (val) => `${Number(val).toLocaleString()} EGP` },
        { title: "Orders", dataIndex: "orderCount", key: "orderCount", render: (val) => val ?? "-" },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <ToastContainer />

            
            <Row justify="space-between" className="mb-6">
                <Col>
                    <h1 className="text-3xl font-extrabold">Super Admin</h1>
                </Col>
                <Col>
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates)}
                        onOk={fetchSuperAdmin}
                    />
                </Col>
            </Row>

            
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={4}>
                    <AntdStatCard title="Total Revenue" value={overview.totalRevenue} color="#10b981" suffix="EGP" />
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <AntdStatCard title="Total Orders" value={overview.totalOrders} color="#2563eb" />
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <AntdStatCard title="Total Users" value={overview.totalUsers} color="#4f46e5" />
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <AntdStatCard title="Total Products" value={overview.totalProducts} color="#facc15" />
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <AntdStatCard title="Total Vendors" value={overview.totalVendors} color="#ec4899" />
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <AntdStatCard title="Avg Order Value" value={overview.averageOrderValue} color="#8b5cf6" suffix="EGP" decimals={2} />
                </Col>
            </Row>

            
            <Card title="Revenue by Vendor" className="mb-6">
                <Table
                    dataSource={revenue.revenueByVendor || []}
                    columns={vendorColumns}
                    rowKey="vendorId"
                    pagination={false}
                />
            </Card>

            
            <Card title="Orders by Payment Method" className="mb-6">
                <Table
                    dataSource={orders.ordersByPaymentMethod || []}
                    columns={paymentMethodColumns}
                    rowKey="paymentMethod"
                    pagination={false}
                />
            </Card>

            
            <Card title="Top Selling Products" className="mb-6">
                <Table
                    dataSource={products.topSellingProducts || []}
                    columns={topProductsColumns}
                    rowKey="productId"
                    pagination={false}
                />
            </Card>

            
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} lg={12}>
                    <Card title="Daily Revenue">
                        {revenue.dailyRevenue && revenue.dailyRevenue.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={[...revenue.dailyRevenue].sort((a, b) => new Date(a.date) - new Date(b.date))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickFormatter={d => new Date(d).toLocaleDateString()} />
                                    <YAxis />
                                    <Tooltip formatter={val => `${val} EGP`} labelFormatter={d => new Date(d).toLocaleString()} />
                                    <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : <p>No data</p>}
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="Orders by Status">
                        {orders.ordersByStatus && orders.ordersByStatus.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={orders.ordersByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                                        {orders.ordersByStatus.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p>No data</p>}
                    </Card>
                </Col>
            </Row>

        </div>
    );
}

// ---------- Antd Stat Card ----------
function AntdStatCard({ title, value, color = "#2563eb", suffix = "", decimals = 0 }) {
    return (
        <Card
            bordered={false}
            style={{
                backgroundColor: color,
                color: "#fff",
                borderRadius: 12,
                textAlign: "center",
            }}
        >
            <div className="text-sm opacity-90">{title}</div>
            <div className="text-2xl font-bold mt-2">
                <CountUp end={Number(value) || 0} duration={1.8} separator="," decimals={decimals} />
                {suffix && <span className="ml-1 text-sm">{suffix}</span>}
            </div>
        </Card>
    );
}

*/