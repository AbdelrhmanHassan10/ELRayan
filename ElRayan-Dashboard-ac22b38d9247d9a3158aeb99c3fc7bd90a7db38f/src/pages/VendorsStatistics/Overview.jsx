import { useEffect, useState } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Spin } from "antd";

export default function VendorsOverview() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const res = await axios.get(
                    "https://api.maghni.acwad.tech/api/v1/vendor/dashboard/statistics",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setData(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStatistics();
    }, []);

    if (loading)
        return (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
        );

    if (!data)
        return <p className="text-center text-red-500">No data found</p>;

    const {
        statistics,
        categoryDistribution,
        vendorLocations,
        recentActivities,
        topPerformingVendors,
        growthTrend
    } = data;

    const statColors = [
        "from-blue-600 to-blue-400",
        "from-emerald-600 to-emerald-400",
        "from-indigo-600 to-indigo-400",
        "from-amber-600 to-amber-400",
        "from-pink-600 to-pink-400",
        "from-cyan-600 to-cyan-400",
    ];

    return (
        <div className="space-y-10">

            {/* 📊 General Statistics */}
            <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">General Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {Object.entries(statistics).map(([key, value], idx) => (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`bg-gradient-to-br ${statColors[idx % statColors.length]} text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300`}
                        >
                            <h2 className="font-semibold capitalize text-sm mb-3 text-white/90">
                                {key.replace(/([A-Z])/g, " $1")}
                            </h2>
                            <CountUp
                                end={Number(value)}
                                duration={1.5}
                                className="text-4xl font-extrabold tracking-tight drop-shadow-md"
                            />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 🧩 Category Distribution */}
            <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Category Distribution</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {categoryDistribution.map((cat) => (
                        <div key={cat.categoryId} className="bg-white shadow-md p-4 rounded-xl flex items-center space-x-4">
                            <img
                                src={`https://api.maghni.acwad.tech${cat.categoryIcon}`}
                                alt={cat.categoryName}
                                className="w-14 h-14 rounded-lg object-cover"
                            />
                            <div>
                                <h3 className="font-semibold">{cat.categoryName}</h3>
                                <p className="text-sm text-gray-600">
                                    Vendors: {cat.vendorCount} | {cat.percentage}%
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 🗺️ Vendor Locations MAP */}
            <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Vendor Locations Map</h2>

                <div className="rounded-xl overflow-hidden shadow-lg">
                    <MapContainer
                        center={[25.276987, 55.296249]}  // UAE center
                        zoom={5}
                        style={{ height: "400px", width: "100%" }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        {vendorLocations.map((v) => (
                            <Marker key={v.id} position={[v.latitude, v.longitude]}>
                                <Popup>
                                    <b>{v.name}</b><br />
                                    Status: {v.isOpen ? "Open" : "Closed"}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </section>

            {/* 🕓 Recent Activities */}
            <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Recent Activities</h2>
                <div className="bg-white rounded-xl shadow-md p-4">
                    <ul className="space-y-2">
                        {recentActivities.map((act, idx) => (
                            <li key={idx} className="flex justify-between border-b pb-2 last:border-none">
                                <span className="font-medium">{act.activity}</span>
                                <span className="text-blue-600 font-semibold">{act.count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ⭐ Top Performing Vendors */}
            <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Top Performing Vendors</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {topPerformingVendors.map((vendor) => (
                        <div
                            key={vendor.id}
                            className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center text-center hover:scale-[1.02] transition-transform"
                        >
                            <img
                                src={`https://api.maghni.acwad.tech${vendor.logo}`}
                                alt={vendor.name}
                                className="w-20 h-20 rounded-full object-cover mb-3"
                            />
                            <h3 className="font-semibold text-gray-800">{vendor.name}</h3>
                            <p className="text-sm text-gray-600">
                                Favorites: {vendor.favoriteCount} | Rating: {vendor.averageRating}
                            </p>
                            <p className="text-xs text-gray-500">
                                Reviews: {vendor.totalReviews} | Categories: {vendor.categoryCount}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 📈 Growth Trend */}
            <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Growth Trend</h2>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={growthTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#2563eb" radius={[5, 5, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    );
}
