import { useState, useEffect } from "react";
import axios from "axios";
import { Card, Select, InputNumber, Button, Space, message } from "antd";
import { Search } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast, ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function Trends() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [type, setType] = useState("daily");
    const [limit, setLimit] = useState(30);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get("https://api.elrayan.acwad.tech/api/v1/orders/trends", {
                params: { type, limit }
            });
            const formatted = (res.data || []).map(d => ({
                date: new Date(d.date).toLocaleDateString(),
                revenue: d.revenue,
                orders: d.orders
            }));
            setData(formatted);
        } catch (e) {
            console.error(e);
            toast.error(e.response?.data?.message || t("trends.fetch_fail"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-5">
            <ToastContainer />
            {/* Filters */}
            <Card className="p-4">
                <Space wrap size="large">

                    <div>
                        <div style={{ fontSize: 12, color: "#666" }}>{t("trends.type")}</div>
                        <Select
                            style={{ width: 180 }}
                            value={type}
                            onChange={setType}
                            options={[
                                { value: "daily", label: t("trends.daily") },
                                { value: "weekly", label: t("trends.weekly") },
                                { value: "monthly", label: t("trends.monthly") },
                                // { value: "yearly", label: t("trends.yearly") },
                            ]}
                        />
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: "#666" }}>{t("trends.limit")}</div>
                        <InputNumber min={1} max={
                            type === "daily" ? 365 : type === "weekly" ? 52 : 24
                        } value={limit} onChange={v => setLimit(v)} />
                    </div>

                    <Button
                        type="primary"
                        icon={<Search size={16} />}
                        loading={loading}
                        onClick={fetchData}
                        style={{ marginTop: 20 }}
                    >
                        {t("trends.apply")}
                    </Button>
                </Space>
            </Card>

            {/* Line Chart */}
            <Card title={t("trends.title")}>
                {data.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#888" }}>{t("trends.no_data")}</div>
                ) : (
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" orientation="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name={t("trends.revenue")} />
                                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" name={t("trends.orders")} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>
        </div>
    );
}
