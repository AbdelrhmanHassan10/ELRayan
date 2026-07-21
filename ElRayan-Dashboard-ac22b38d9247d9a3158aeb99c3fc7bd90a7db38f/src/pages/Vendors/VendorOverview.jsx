import { useState } from "react";
import { Tabs } from "antd";

import DeliveryFee from "../../Components/DeliveryFee";
import DeliveryTime from "../../Components/DeliveryTime";
import GrowthTrend from "../../Components/GrowthTrend";
import Locations from "../../Components/Locations";
import MostFavorited from "../../Components/MostFavorited";
import TopPerformingVendors from "../../Components/topRated";

export default function VendorOverview() {
  const [activeTab, setActiveTab] = useState("deliveryFee");

  const items = [
    { key: "deliveryFee", label: "Delivery Fee", children: <DeliveryFee /> },
    { key: "deliveryTime", label: "Delivery Time", children: <DeliveryTime /> },
    { key: "growthTrend", label: "Growth Trend", children: <GrowthTrend /> },
    { key: "locations", label: "Locations", children: <Locations /> },
    { key: "mostFavorited", label: "Most Favorited", children: <MostFavorited /> },
    { key: "topRated", label: "Top Rated", children: <TopPerformingVendors /> },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Vendors Overview</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          type="card"
          size="large"
          items={items}
        />
      </div>
    </div>
  );
}
