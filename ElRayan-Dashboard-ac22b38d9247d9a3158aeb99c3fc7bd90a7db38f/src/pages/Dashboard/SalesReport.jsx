import { useState, useEffect } from "react";
import axios from "axios";
import {
    Card,
    DatePicker,
    Select,
    Button,
    Space,
    Table,
    Tag,
    message,
    Spin,
} from "antd";
import { Search } from "lucide-react";
import dayjs from "dayjs";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";
import { useTranslation } from "react-i18next";

const { RangePicker } = DatePicker;

export default function SalesReport() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [dates, setDates] = useState([]);
    const [type, setType] = useState("");

    // Default date = last month → today
    useEffect(() => {
        const today = dayjs();
        const lastMonth = dayjs().subtract(1, "month");
        const defaultRange = [lastMonth, today];
        setDates(defaultRange);
        fetchData(defaultRange, "");
    }, []);

    const fetchData = async (customDates, customType) => {
        const d = customDates || dates;
        const t = customType ?? type;

        if (!d || d.length !== 2) {
            message.error(t("sales_report.select_dates"));
            return;
        }

        let startDate = d[0].format("YYYY-MM-DD");
        let endDate = d[1].format("YYYY-MM-DD");

        try {
            setLoading(true);

            const res = await axios.get(
                "https://api.elrayan.acwad.tech/api/v1/orders/sales-report",
                { params: { startDate, endDate, type: t } }
            );

            setReport(res.data);
        } catch (e) {
            console.log(e);
            message.error(t("sales_report.fetch_fail"));
        }

        setLoading(false);
    };

    const topProductsColumns = [
        { title: t("products_performance.product"), dataIndex: "name" },
        {
            title: t("products_performance.total_sold"),
            dataIndex: "quantitySold",
            sorter: (a, b) => a.quantitySold - b.quantitySold,
        },
        {
            title: t("products_performance.revenue"),
            dataIndex: "revenue",
            sorter: (a, b) => a.revenue - b.revenue,
        },
        {
            title: t("products_performance.avg_price"),
            dataIndex: "averagePrice",
            sorter: (a, b) => a.averagePrice - b.averagePrice,
        }
    ];

    return (
        <div className="space-y-5 p-2">

            {/* Filters */}
            <Card className="p-4">
                <Space wrap size="large">

                    <div>
                        <div style={{ fontSize: 12, color: "#666" }}>{t("sales_report.date_range")}</div>
                        <RangePicker
                            format="DD-MM-YYYY"
                            value={dates}
                            onChange={(v) => setDates(v)}
                            style={{ width: 250 }}
                        />
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: "#666" }}>{t("sales_report.report_type")}</div>
                        <Select
                            style={{ width: 180 }}
                            value={type || undefined}
                            onChange={setType}
                            placeholder={t("sales_report.report_type")}
                            options={[
                                { value: "daily", label: t("sales_report.daily") },
                                { value: "weekly", label: t("sales_report.weekly") },
                                { value: "monthly", label: t("sales_report.monthly") },
                                { value: "yearly", label: t("sales_report.yearly") },
                            ]}
                        />
                    </div>

                    <Button
                        type="primary"
                        icon={<Search size={16} />}
                        loading={loading}
                        onClick={() => fetchData()}
                        style={{ marginTop: 20 }}
                    >
                        {t("sales_report.apply")}
                    </Button>

                </Space>
            </Card>

            {!report ? null : (
                <>
                    {loading ? (
                        <div style={{ textAlign: "center", marginTop: 50 }}>
                            <Spin size="large" />
                        </div>
                    ) : null}
                    {/* Revenue Trend Chart */}
                    {report.trends && report.trends.length > 0 && (
                        <Card title={t("sales_report.revenue_trend")}>
                            <div style={{ width: "100%", height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={report.trends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(v) => dayjs(v).format("DD/MM")}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            labelFormatter={(v) => dayjs(v).format("DD/MM/YYYY")}
                                        />
                                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    )}

                    {/* Charts Row */}
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <Card title={t("sales_report.revenue_vs_orders")} style={{ flex: 1, minWidth: 250 }}>
                            <div style={{ width: "100%", height: 260 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={[
                                            { name: "Revenue", value: report.summary.totalRevenue },
                                            { name: "Orders", value: report.summary.totalOrders },
                                        ]}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card title={t("sales_report.discounts_given")} style={{ flex: 1, minWidth: 250 }}>
                            <div style={{ width: "100%", height: 260 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={[{ name: "Total Discount", value: report.summary.totalDiscountGiven }]}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card title={t("sales_report.shipping_revenue")} style={{ flex: 1, minWidth: 250 }}>
                            <div style={{ width: "100%", height: 260 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={[{ name: "Shipping", value: report.summary.totalShippingRevenue }]}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>



                    {/* Summary */}
                    <Card title={t("sales_report.summary")}>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                            <Card><b>{t("dashboard.total_revenue")}</b><div className="text-xl font-bold">{report.summary.totalRevenue}</div></Card>

                            <Card><b>{t("dashboard.total_orders")}</b><div className="text-xl font-bold">{report.summary.totalOrders}</div></Card>

                            <Card><b>{t("sales_report.avg_order_value")}</b><div className="text-xl font-bold">{report.summary.averageOrderValue}</div></Card>

                            <Card><b>{t("sales_report.total_items_sold")}</b><div className="text-xl font-bold">{report.summary.totalItemsSold}</div></Card>

                            <Card><b>{t("sales_report.total_discount_given")}</b><div className="text-xl font-bold">{report.summary.totalDiscountGiven}</div></Card>

                            <Card><b>{t("sales_report.total_shipping_revenue")}</b><div className="text-xl font-bold">{report.summary.totalShippingRevenue}</div></Card>

                        </div>
                    </Card>

                    {/* Breakdown */}
                    <Card title={t("sales_report.breakdown")}>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                            <Card><b>{t("sales_report.completed_orders")}</b><div className="text-xl">{report.breakdown.completedOrders}</div></Card>

                            <Card><b>{t("sales_report.pending_orders")}</b><div className="text-xl">{report.breakdown.pendingOrders}</div></Card>

                            <Card><b>{t("sales_report.cancelled_orders")}</b><div className="text-xl">{report.breakdown.cancelledOrders}</div></Card>

                            <Card><b>{t("sales_report.refunded_orders")}</b><div className="text-xl">{report.breakdown.refundedOrders}</div></Card>

                            <Card>
                                <b>{t("dashboard.completion_rate")}</b>
                                <div className="text-xl">
                                    {report.breakdown.completionRate !== undefined
                                        ? Number(report.breakdown.completionRate).toFixed(2)
                                        : "0.00"}%
                                </div>
                            </Card>

                            <Card>
                                <b>{t("sales_report.cancellation_rate")}</b>
                                <div className="text-xl">
                                    {report.breakdown.cancellationRate !== undefined
                                        ? Number(report.breakdown.cancellationRate).toFixed(2)
                                        : "0.00"}%
                                </div>
                            </Card>

                        </div>
                    </Card>

                    {/* Customer Insights */}
                    <Card title={t("sales_report.customer_insights")}>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                            <Card><b>{t("sales_report.unique_customers")}</b><div className="text-xl">{report.customerInsights.uniqueCustomers}</div></Card>

                            <Card><b>{t("sales_report.returning_customers")}</b><div className="text-xl">{report.customerInsights.returningCustomers}</div></Card>

                            <Card><b>{t("sales_report.avg_orders_per_customer")}</b><div className="text-xl">{report.customerInsights.averageOrdersPerCustomer}</div></Card>

                        </div>
                    </Card>

                    {/* Top Products */}
                    <Card title={t("sales_report.top_products")}>
                        {(!report.topProducts || report.topProducts.length === 0) ? (
                            <Tag color="red">{t("sales_report.no_top_products")}</Tag>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <Table
                                    columns={topProductsColumns}
                                    dataSource={report.topProducts}
                                    rowKey={(r) => r.id}
                                    pagination={false}
                                />
                            </div>
                        )}
                    </Card>

                </>
            )}
        </div>
    );
}
