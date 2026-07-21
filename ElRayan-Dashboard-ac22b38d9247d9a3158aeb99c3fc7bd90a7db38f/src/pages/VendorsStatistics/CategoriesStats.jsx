import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Spin } from "antd";

export default function VendorsCategoriesStats() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    "https://api.maghni.acwad.tech/api/v1/vendor/dashboard/statistics/categories?locale=en",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setCategories(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-64">
        <Spin size="large" />
    </div>;

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold">Vendors by Category</h2>

            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={categories}
                        dataKey="percentage"
                        nameKey="categoryName"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label
                    >
                        {categories.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>

            <div className="grid md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                    <div
                        key={cat.categoryId}
                        className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg shadow"
                    >
                        <img
                            src={`https://ik.imagekit.io/yodskwyrw${cat.categoryIcon}`}
                            alt={cat.categoryName}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-medium">{cat.categoryName}</p>
                            <p className="text-gray-600 text-sm">{cat.percentage}% — {cat.vendorCount} vendors</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
