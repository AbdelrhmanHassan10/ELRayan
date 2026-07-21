import { useEffect, useState } from "react";
import axios from "axios";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Spin, InputNumber, Button, Card, Space } from "antd";

export default function GrowthTrend() {
    const [data, setData] = useState([]);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");

    const fetchGrowthTrend = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `https://api.maghni.acwad.tech/api/v1/user/dashboard/growth-trend?days=${days}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setData(res.data.data || []);
            toast.success("Growth trend data loaded successfully!");
        } catch (err) {
            console.error(err);
            toast.error("❌ Failed to fetch growth trend data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrowthTrend();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [days]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <ToastContainer position="top-right" autoClose={2000} />
            <h2 className="text-2xl font-bold mb-6 text-gray-800">User Growth Trend</h2>

            {/* Days selection */}
            <Card className="mb-6">
                <Space>
                    <label className="text-gray-700 font-medium">Days:</label>
                    <InputNumber
                        min={1}
                        max={365}
                        value={days}
                        onChange={(value) => setDays(value)}
                    />
                    <Button type="primary" onClick={fetchGrowthTrend}>
                        Refresh
                    </Button>
                </Space>
            </Card>

            {/* Chart */}
            <Card>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spin size="large" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center text-red-500">No growth data available.</div>
                ) : (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) =>
                                    new Date(date).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                    })
                                }
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(date) =>
                                    new Date(date).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })
                                }
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </Card>
        </div>
    );
}
