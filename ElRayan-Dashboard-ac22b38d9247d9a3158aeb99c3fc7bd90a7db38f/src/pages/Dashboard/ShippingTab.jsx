import { useEffect, useState } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { Card, DatePicker, Button, Row, Col, Spin } from "antd";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

const { RangePicker } = DatePicker;

export default function ShippingTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `https://api.maghni.acwad.tech/api/v1/dashboard/shipping/stats`,
                {
                    params: {
                        startDate: startDate ? startDate.format("YYYY-MM-DD") : undefined,
                        endDate: endDate ? endDate.format("YYYY-MM-DD") : undefined,
                    },
                }
            );
            setData(res.data);
        } catch (err) {
            console.error("Error fetching shipping data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-10">
            <h2 className="text-2xl font-bold mb-4">Shipping Statistics</h2>

            {/* Date Filters */}
            <Row gutter={8} align="middle" className="mb-6">
                <Col>
                    <RangePicker
                        value={
                            startDate && endDate
                                ? [startDate, endDate]
                                : null
                        }
                        onChange={(values) => {
                            if (values) {
                                setStartDate(values[0]);
                                setEndDate(values[1]);
                            } else {
                                setStartDate(null);
                                setEndDate(null);
                            }
                        }}
                        placeholder={["Start Date", "End Date"]}
                    />
                </Col>
                <Col>
                    <Button type="primary" onClick={fetchData} loading={loading}>
                        Apply Filters
                    </Button>
                </Col>
            </Row>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-10">
                    <Spin size="large" />
                </div>
            )}

            {/* No Data */}
            {!loading && !data && (
                <p className="text-center text-gray-600">No data available.</p>
            )}

            {/* Data Display */}
            {!loading && data && (
                <>
                    {/* Summary Cards */}
                    <Row gutter={16}>
                        <Col xs={24} sm={8}>
                            <SummaryCard
                                title="Total Shipping Revenue"
                                value={data.totalShippingRevenue}
                                color="#2563eb"
                                suffix=" EGP"
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <SummaryCard
                                title="Average Shipping Cost"
                                value={data.averageShippingCost}
                                color="#10b981"
                                suffix=" EGP"
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <SummaryCard
                                title="Average Delivery Time"
                                value={data.averageDeliveryTime}
                                color="#8b5cf6"
                                suffix=" days"
                            />
                        </Col>
                    </Row>

                    {/* Orders by Shipping Status */}
                    <Card title="Orders by Shipping Status" className="mt-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.ordersByShippingStatus}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {data.ordersByShippingStatus.map((_, index) => (
                                        <Cell
                                            key={index}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value}`, "Orders"]} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </>
            )}
        </div>
    );
}

function SummaryCard({ title, value, color, suffix }) {
    return (
        <Card style={{ backgroundColor: color, color: "#fff" }}>
            <h4 className="text-sm uppercase opacity-80">{title}</h4>
            <p className="text-2xl font-bold mt-1">
                <CountUp end={value || 0} duration={2.5} separator="," decimals={2} />{" "}
                {suffix}
            </p>
        </Card>
    );
}
