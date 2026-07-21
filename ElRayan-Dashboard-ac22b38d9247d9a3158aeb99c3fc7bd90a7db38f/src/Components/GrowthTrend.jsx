import { Spin } from "antd";
import { div } from "framer-motion/client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function GrowthTrend() {
    const [days, setDays] = useState(10);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://api.maghni.acwad.tech/api/v1/vendor/dashboard/growth-trend?days=${days}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const result = await res.json();
            if (result.success) setData(result.data);
            else toast.error(result.message);
        } catch {
            toast.error("Error fetching growth trend");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [days]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Growth Trend</h2>
                <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="border px-3 py-1 rounded w-24"
                    placeholder="Days"
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center" style={{ height: 300 }}>
                    <Spin size="large" />
                </div>
            ) : data.length === 0 ? (
                <p className="text-gray-500">No data found</p>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
