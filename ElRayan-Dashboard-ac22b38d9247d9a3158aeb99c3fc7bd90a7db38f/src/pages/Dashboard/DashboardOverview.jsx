import React, { useEffect, useState } from "react";
import axios from "axios";
import { DatePicker, Button, Card, Row, Col, Table, Statistic, Spin, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import CountUp from "react-countup";

const { RangePicker } = DatePicker;

const RevenueBreakdown = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dates, setDates] = useState([]);

    const fetchRevenue = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `https://api.maghni.acwad.tech/api/v1/dashboard/revenue/breakdown`,
                {
                    params: {
                        startDate: dates?.[0],
                        endDate: dates?.[1],
                    },
                }
            );
            setData(res.data);
            message.success("Revenue data loaded successfully");
        } catch (error) {
            message.error("Failed to fetch revenue data");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenue();
    }, []);

    if (loading)
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Spin size="large" />
            </div>
        );

    const cards = [
        {
            title: "Total Revenue",
            value: data?.totalRevenue,
            color: "#10b981",
        },
        {
            title: "Completed Orders Revenue",
            value: data?.totalCOMPLETEDAmount,
            color: "#3b82f6",
        },
        {
            title: "Total Shipping",
            value: data?.totalShipping,
            color: "#8b5cf6",
        },
        {
            title: "Total Discounts",
            value: data?.totalDiscounts,
            color: "#ef4444",
        },
    ];

    const vendorColumns = [
        { title: "Vendor Name", dataIndex: "vendorName", key: "vendorName" },
        {
            title: "Revenue (EGP)",
            dataIndex: "revenue",
            key: "revenue",
            render: (value) => (
                <span style={{ color: "#16a34a", fontWeight: 600 }}>
                    <CountUp end={value} separator="," />
                </span>
            ),
        },
        { title: "Orders", dataIndex: "orderCount", key: "orderCount" },
    ];

    const dailyColumns = [
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (d) => new Date(d).toLocaleDateString(),
        },
        {
            title: "Revenue (EGP)",
            dataIndex: "revenue",
            key: "revenue",
            render: (value) => (
                <span style={{ color: "#2563eb", fontWeight: 600 }}>
                    <CountUp end={value} separator="," />
                </span>
            ),
        },
        { title: "Orders", dataIndex: "orderCount", key: "orderCount" },
    ];

    return (
        <div className="p-6">

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    <RangePicker
                        onChange={(values) => {
                            if (values) {
                                setDates([
                                    values[0].format("YYYY-MM-DD"),
                                    values[1].format("YYYY-MM-DD"),
                                ]);
                            } else setDates([]);
                        }}
                    />

                    <Button
                        type="primary"
                        onClick={fetchRevenue}
                        icon={<ReloadOutlined />}
                    >
                        Apply
                    </Button>
                </div>
            </Card>

            {/* Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                {cards.map((card, i) => (
                    <Col xs={24} sm={12} lg={6} key={i}>
                        <Card
                            style={{
                                background: card.color,
                                color: "white",
                                borderRadius: 14,
                            }}
                            bordered={false}
                        >
                            <Statistic
                                title={<span style={{ color: "white" }}>{card.title}</span>}
                                value={card.value}
                                precision={2}
                                valueRender={(val) => (
                                    <span style={{ fontSize: 26, fontWeight: 700, color: "white" }}>
                                        <CountUp end={card.value || 0} separator="," /> EGP
                                    </span>
                                )}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Revenue by Vendor */}
            <Card title="Revenue by Vendor" className="mb-6" bordered={false}>
                <Table
                    columns={vendorColumns}
                    dataSource={data?.revenueByVendor}
                    rowKey="vendorId"
                    pagination={{ pageSize: 5 }}
                    className="overflow-x-auto"
                />
            </Card>

            {/* Daily Revenue */}
            <Card title="Daily Revenue" bordered={false}>
                <Table
                    columns={dailyColumns}
                    dataSource={data?.dailyRevenue}
                    rowKey="date"
                    pagination={{ pageSize: 7 }}
                    className="overflow-x-auto"
                />
            </Card>

        </div>
    );
};

export default RevenueBreakdown;
