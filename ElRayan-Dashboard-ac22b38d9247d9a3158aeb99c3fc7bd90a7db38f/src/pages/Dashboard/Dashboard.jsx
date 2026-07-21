import { useState, Suspense } from "react";
import DashboardOverview from "./DashboardOverview";
import RecentActivity from "./RecentActivity";
import RevenueTimeline from "./RevenueTimeline";
import { PulseLoader } from "react-spinners";
import TopPerformers from "./TopPerformers";
import RevenueTab from "./RevenueTab";
import OrdersTab from "./OrdersTab";
import UsersTab from "./UsersTab";
import VendorsPerformanceTab from "./VendorsPerformanceTab";
import ProductsPerformance from "./ProductsPerformance ";
import ShippingTab from "./ShippingTab";
import TrendsAndGeographicTab from "./TrendsAndGeographicTab";
import SuperAdminDashboard from "./SuperAdminDashboard";
import ExportSummaryPage from "./ExportSummaryPage";
import CouponsStatsMock from "./Coupons";
import LowStockProducts from "./LowStockProducts";
import SalesReport from "./SalesReport";
import { FaInfoCircle } from "react-icons/fa";
import { Section } from "lucide-react";
import TopCustomers from "./TopCustomers";
import { useTranslation } from "react-i18next";

/*
  Simple Tabs layout.
  We'll lazy-load other sections later (they can be separate components).
*/
export default function Dashboard() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("orders");

    const tabs = [
        // { key: "overview", label: t("dashboard.overview") },
        // { key: "revenue", label: t("dashboard.revenue") },
        // { key: "users", label: t("dashboard.users") },
        // { key: "vendors", label: t("dashboard.vendors") },
        // { key: "products", label: t("dashboard.products") },
        // { key: "coupons", label: t("dashboard.coupons") },
        // { key: "shipping", label: t("dashboard.shipping") },
        // { key: "SuperAdmin", label: t("dashboard.super_admin") },
        { key: "orders", label: t("dashboard.orders") },
        { key: "analytics", label: t("dashboard.analytics") },
        { key: "lowStock", label: t("dashboard.low_stock") },
        { key: "report", label: t("dashboard.report") },
        { key: "topCustomers", label: t("dashboard.top_customers") },
        { key: "topProducts", label: t("dashboard.top_products") },
        { key: "trends", label: t("dashboard.trends") },


        // { key: "top", label: "Top Performers" }     
    ];


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold mb-6">{t("dashboard.title")}</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-4 py-2 rounded-lg font-medium ${activeTab === t.key
                            ? "bg-red-600 text-white shadow"
                            : "bg-white border text-gray-700"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-6">
                {activeTab === "overview" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <DashboardOverview />
                        <RecentActivity />
                        <RevenueTimeline />
                    </Suspense>
                )}

                {
                    activeTab === "lowStock" && (
                        <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                            <LowStockProducts />
                        </Suspense>
                    )
                }

                {
                    activeTab === "report" && (
                        <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                            <SalesReport />
                        </Suspense>
                    )
                }

                {activeTab === "top" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <TopPerformers />
                    </Suspense>
                )}

                {activeTab === "revenue" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <RevenueTab />
                    </Suspense>
                )}

                {activeTab === "orders" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <OrdersTab />
                    </Suspense>
                )}

                {activeTab === "users" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <UsersTab />
                    </Suspense>
                )}

                {activeTab === "vendors" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <VendorsPerformanceTab />
                    </Suspense>
                )}

                {activeTab === "topProducts" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <ProductsPerformance />
                    </Suspense>
                )}
                {activeTab === "topCustomers" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <TopCustomers />
                    </Suspense>
                )}

                {activeTab === "shipping" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <ShippingTab />
                    </Suspense>
                )}

                {activeTab === "trends" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <TrendsAndGeographicTab />
                    </Suspense>
                )}

                {activeTab === "SuperAdmin" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <SuperAdminDashboard />
                    </Suspense>
                )}

                {activeTab === "analytics" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <ExportSummaryPage />
                    </Suspense>
                )}


                {/* Placeholder for other tabs: lazy-load them later */}
                {activeTab == "coupons" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <CouponsStatsMock />
                    </Suspense>
                )}
            </div>
        </div>
    );
}
