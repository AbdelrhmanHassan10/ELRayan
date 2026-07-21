import { useEffect, useState } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { DatePicker, Button, Table, Spin } from "antd";
// import moment from "moment"
import dayjs from "dayjs";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const { RangePicker } = DatePicker;

export default function RevenueTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const res = await axios.get(
                `https://api.maghni.acwad.tech/api/v1/dashboard/revenue/breakdown`,
                {
                    params: { startDate, endDate },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setData(res.data);
        } catch (err) {
            console.error("Error fetching revenue data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading)
        return (
            <div className="flex justify-center py-20">
                <Spin size="large" />
            </div>
        );

    if (!data)
        return (
            <p className="text-center text-gray-600">
                No data available.
            </p>
        );

    // Antd Table Columns
    const vendorColumns = [
        {
            title: "Vendor Name",
            dataIndex: "vendorName",
            key: "vendorName",
        },
        {
            title: "Revenue (EGP)",
            dataIndex: "revenue",
            key: "revenue",
            render: (value) => (
                <CountUp end={value || 0} duration={2.5} separator="," />
            ),
        },
        {
            title: "Orders",
            dataIndex: "orderCount",
            key: "orderCount",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex gap-2 items-center">
                <RangePicker
                    value={
                        startDate && endDate
                            ? [dayjs(startDate), dayjs(endDate)]
                            : null
                    }
                    onChange={(values) => {
                        if (values) {
                            setStartDate(values[0].format("YYYY-MM-DD"));
                            setEndDate(values[1].format("YYYY-MM-DD"));
                        } else {
                            setStartDate("");
                            setEndDate("");
                        }
                    }}
                />
                <Button type="primary" onClick={fetchData}>
                    Filter
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard title="Total Revenue" value={data.totalRevenue} color="bg-blue-500" />
                <SummaryCard title="Completed Amount" value={data.totalCOMPLETEDAmount} color="bg-green-500" />
                <SummaryCard title="Total Discounts" value={data.totalDiscounts} color="bg-yellow-500" />
                <SummaryCard title="Total Shipping" value={data.totalShipping} color="bg-purple-500" />
            </div>

            {/* Daily Revenue Chart */}
            <div className="bg-white shadow rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">Daily Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.dailyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(d) =>
                                new Date(d).toLocaleDateString("en-GB")
                            }
                        />
                        <YAxis />
                        <Tooltip
                            formatter={(value) => [`${value} EGP`, "Revenue"]}
                            labelFormatter={(d) =>
                                new Date(d).toLocaleDateString("en-GB")
                            }
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#2563eb"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Revenue by Vendor Table */}
            <div className="bg-white shadow rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">Revenue by Vendor</h3>
                <Table
                    columns={vendorColumns}
                    dataSource={data.revenueByVendor}
                    rowKey="vendorId"
                    pagination={false}
                />
            </div>
        </div>
    );
}

// Summary Card
function SummaryCard({ title, value, color }) {
    return (
        <div className={`p-4 rounded-xl text-white shadow ${color}`}>
            <h4 className="text-sm uppercase opacity-80">{title}</h4>
            <p className="text-2xl font-bold mt-1">
                <CountUp end={value || 0} duration={2.5} separator="," /> EGP
            </p>
        </div>
    );
}
