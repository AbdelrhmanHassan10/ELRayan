import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { toast } from "react-toastify";

// ANTD
import { DatePicker, Select, Button, Card, Row, Col, Spin } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const RevenueTimeline = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        startDate: "2025-06-01",
        endDate: "2025-10-21",
        groupBy: "day",
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                `https://api.maghni.acwad.tech/api/v1/dashboard/revenue/timeline`,
                {
                    params: {
                        startDate: filters.startDate,
                        endDate: filters.endDate,
                        groupBy: filters.groupBy,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setData(res.data);
            toast.success("Revenue timeline loaded successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch revenue timeline");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Card
            title={<h2 className="text-xl font-bold">Revenue Timeline</h2>}
            className="shadow-md"
        >
            {/* Filters */}
            <Row gutter={16} className="mb-6">

                {/* Date Range Picker */}
                <Col xs={24} sm={12} lg={8}>
                    <label className="block mb-2 text-gray-600 font-medium">Date Range</label>
                    <RangePicker
                        style={{ width: "100%" }}
                        value={[
                            filters.startDate ? dayjs(filters.startDate) : null,
                            filters.endDate ? dayjs(filters.endDate) : null,
                        ]}
                        onChange={(dates) => {
                            if (dates) {
                                setFilters({
                                    ...filters,
                                    startDate: dates[0].format("YYYY-MM-DD"),
                                    endDate: dates[1].format("YYYY-MM-DD"),
                                });
                            }
                        }}
                    />
                </Col>

                {/* Group By */}
                <Col xs={24} sm={12} lg={6}>
                    <label className="block mb-2 text-gray-600 font-medium">Group By</label>
                    <Select
                        style={{ width: "100%" }}
                        value={filters.groupBy}
                        onChange={(value) =>
                            setFilters({ ...filters, groupBy: value })
                        }
                        options={[
                            { value: "day", label: "Day" },
                            { value: "week", label: "Week" },
                            { value: "month", label: "Month" },
                        ]}
                    />
                </Col>

                {/* Apply Button */}
                <Col xs={24} sm={24} lg={4}>
                    <Button
                        type="primary"
                        style={{ width: "100%", marginTop: 28 }}
                        onClick={fetchData}
                    >
                        Apply Filters
                    </Button>
                </Col>
            </Row>

            {/* Chart */}
            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <Spin size="large" />
                </div>
            ) : data.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#1677ff" strokeWidth={3} />
                        <Line type="monotone" dataKey="orderCount" stroke="#52c41a" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-center text-gray-500 py-10">
                    No data available for this range.
                </p>
            )}
        </Card>
    );
};

export default RevenueTimeline;
