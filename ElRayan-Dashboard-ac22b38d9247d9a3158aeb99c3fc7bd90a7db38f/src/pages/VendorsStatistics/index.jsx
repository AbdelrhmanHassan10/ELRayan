import { useState } from "react";
import VendorsOverview from "./Overview";
import VendorsCategoriesStats from "./CategoriesStats";

export default function VendorsStatistics() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Vendors Statistics</h1>

            {/* Tabs */}
            <div className="flex gap-3 mb-6 border-b pb-2">
                <button
                    className={`px-4 py-2 rounded-t-md font-medium transition-all ${activeTab === "overview"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    onClick={() => setActiveTab("overview")}
                >
                    Overview
                </button>
                <button
                    className={`px-4 py-2 rounded-t-md font-medium transition-all ${activeTab === "categories"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    onClick={() => setActiveTab("categories")}
                >
                    By Categories
                </button>
            </div>

            {/* Content */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                {activeTab === "overview" ? <VendorsOverview /> : <VendorsCategoriesStats />}
            </div>
        </div>
    );
}
