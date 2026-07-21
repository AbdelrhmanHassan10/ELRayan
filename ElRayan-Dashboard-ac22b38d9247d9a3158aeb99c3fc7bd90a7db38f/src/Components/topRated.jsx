import { useEffect, useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import { Spin } from "antd";

export default function TopPerformingVendors() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(10); // dynamic limit

    useEffect(() => {
        const fetchVendors = async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `https://api.maghni.acwad.tech/api/v1/vendor/dashboard/top-performing?limit=${limit}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setVendors(res.data.data || []);
            } catch (err) {
                console.error("Error fetching top vendors:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, [limit]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    Top Performing Vendors
                </h2>
                <div className="flex items-center gap-2">
                    <label className="text-gray-700 font-medium">Limit:</label>
                    <input
                        type="number"
                        min="1"
                        max="50"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        className="w-20 border border-gray-300 rounded-md px-2 py-1 text-center focus:ring focus:ring-blue-300 outline-none"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64 text-gray-600 font-semibold">
                  <Spin size="large" />
                </div>
            ) : !vendors.length ? (
                <div className="text-center text-red-600 font-semibold">
                    No vendors found.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendors.map((vendor) => (
                        <div
                            key={vendor.id}
                            className="bg-white rounded-2xl shadow-md p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                            <img
                                src={`https://api.maghni.acwad.tech${vendor.logo}`}
                                alt={vendor.name}
                                className="w-full h-40 object-cover rounded-xl mb-4"
                            />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                                {vendor.name}
                            </h3>

                            <div className="text-sm text-gray-600 space-y-2 text-center">
                                <p>
                                    <span className="font-medium text-gray-700">
                                        Favorites Count:
                                    </span>{" "}
                                    {vendor.favoriteCount}
                                </p>
                                <p>
                                    <span className="font-medium text-gray-700">
                                        Categories Count:
                                    </span>{" "}
                                    {vendor.categoryCount}
                                </p>
                                <p className="flex items-center justify-center gap-1">
                                    <Star
                                        size={16}
                                        className={
                                            vendor.averageRating > 0
                                                ? "text-yellow-400"
                                                : "text-gray-400"
                                        }
                                    />
                                    <span className="font-medium">
                                        {vendor.averageRating || "0.0"}
                                    </span>
                                    <span className="text-gray-500">
                                        ({vendor.totalReviews} reviews)
                                    </span>
                                </p>
                                <p>
                                    <span className="font-medium text-gray-700">
                                        Delivery Fee:
                                    </span>{" "}
                                    {vendor.deliveryFee !== null
                                        ? `${vendor.deliveryFee} SAR`
                                        : "Not specified"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
