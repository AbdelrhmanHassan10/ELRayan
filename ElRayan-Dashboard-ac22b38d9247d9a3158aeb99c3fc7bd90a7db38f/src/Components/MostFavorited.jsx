import { useEffect, useState } from "react";
import axios from "axios";
import { MoonLoader } from "react-spinners";
import { Spin } from "antd";

export default function MostFavorited() {
    const [data, setData] = useState([]);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(true);

    const fetchMostFavorited = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `https://api.maghni.acwad.tech/api/v1/vendor/dashboard/most-favorited?limit=${limit}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
            );
            setData(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMostFavorited();
    }, [limit]);

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Most Favorited Vendors</h2>

                <div className="flex items-center gap-2">
                    <label className="text-gray-600">Limit:</label>
                    <input
                        type="number"
                        value={limit}
                        min="1"
                        className="border px-3 py-1 rounded-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onChange={(e) => setLimit(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : data.length === 0 ? (
                <p className="text-gray-500 text-center">No favorite vendors found</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {data.map((vendor) => (
                        <div
                            key={vendor.vendor_id}
                            className="border rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-col items-center text-center"
                        >
                            <img
                                src={
                                    vendor.vendor_logo.startsWith("http")
                                        ? vendor.vendor_logo
                                        : `https://ik.imagekit.io/yodskwyrw${vendor.vendor_logo}`
                                }
                                alt={vendor.vendor_name}
                                className="w-20 h-20 object-cover rounded-full mb-3"
                            />
                            <h3 className="font-semibold text-gray-800">{vendor.vendor_name}</h3>
                            <p className="text-gray-500 text-sm">
                                Favorites: <span className="font-bold">{vendor.favoriteCount}</span>
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
