import { useState, useEffect } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { Card, DatePicker, Button, Row, Col, Table, Spin } from "antd";
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

export default function UsersTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                "https://api.maghni.acwad.tech/api/v1/dashboard/users/statistics",
                {
                    params: {
                        startDate: startDate ? startDate.format("YYYY-MM-DD") : undefined,
                        endDate: endDate ? endDate.format("YYYY-MM-DD") : undefined,
                    },
                }
            );
            setData(res.data);
        } catch (err) {
            console.error("Error fetching user statistics:", err);
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
            <p className="text-center text-gray-600">No data available for users.</p>
        );

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Total Spent (EGP)",
            dataIndex: "totalSpent",
            key: "totalSpent",
            render: (value) => <CountUp end={value || 0} duration={1.5} separator="," />,
        },
        {
            title: "Orders",
            dataIndex: "orderCount",
            key: "orderCount",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header & Date Filters */}
            <Row justify="space-between" align="middle" className="mb-6">
                <Col>
                    <h2 className="text-2xl font-bold">Users Statistics</h2>
                </Col>
                <Col>
                    <Row gutter={8} align="middle">
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
                </Col>
            </Row>

            {/* Summary Cards */}
            <Row gutter={16}>
                <Col xs={24} sm={8}>
                    <SummaryCard title="Total Users" value={data.totalUsers} color="#2563eb" />
                </Col>
                <Col xs={24} sm={8}>
                    <SummaryCard title="New Users" value={data.newUsers} color="#10b981" />
                </Col>
                <Col xs={24} sm={8}>
                    <SummaryCard title="Active Users" value={data.activeUsers} color="#8b5cf6" />
                </Col>
            </Row>

            {/* User Growth Chart */}
            <Card title="User Growth Over Time" className="mt-6">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(d) =>
                                new Date(d).toLocaleDateString("en-GB")
                            }
                        />
                        <YAxis />
                        <Tooltip
                            formatter={(value) => [`${value} Users`, "New Users"]}
                            labelFormatter={(d) =>
                                new Date(d).toLocaleDateString("en-GB")
                            }
                        />
                        <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Top Spenders Table */}
            <Card title="Top Spenders" className="mt-6">
                <Table
                    dataSource={data.topSpenders}
                    columns={columns}
                    rowKey="userId"
                    pagination={false}
                    loading={loading}
                    className="overflow-x-auto"
                />
            </Card>
        </div>
    );
}

function SummaryCard({ title, value, color }) {
    return (
        <Card style={{ backgroundColor: color, color: "#fff" }}>
            <h4 className="text-sm uppercase opacity-80">{title}</h4>
            <p className="text-2xl font-bold mt-1">
                <CountUp end={value || 0} duration={2.5} separator="," />
            </p>
        </Card>
    );
}
