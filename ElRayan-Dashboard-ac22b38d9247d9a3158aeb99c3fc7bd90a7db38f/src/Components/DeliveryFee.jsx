import { Spin } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DeliveryFee() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("https://api.maghni.acwad.tech/api/v1/vendor/dashboard/delivery-fee-distribution", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const result = await res.json();

            if (result.success) {
                setData(result.data);
            } else {
                toast.error(result.message || "Failed to fetch data");
            }
        } catch {
            toast.error("Error fetching data");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <h2 className="text-lg font-bold mb-4">Delivery Fee Distribution</h2>

            {loading ? (
              <div className="flex justify-center items-center" style={{ height: 300 }}>
                 <Spin size="large" />
              </div>
            ) : data.length === 0 ? (
                <p className="text-gray-500">No data available.</p>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
