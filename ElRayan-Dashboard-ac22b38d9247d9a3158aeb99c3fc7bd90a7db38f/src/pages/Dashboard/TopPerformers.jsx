import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// ANTD
import { Card, Table, Row, Col, Button, DatePicker, Spin } from "antd";
const { RangePicker } = DatePicker;

export default function TopPerformers() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
    });

    const fetchTopPerformers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                `https://api.maghni.acwad.tech/api/v1/dashboard/top-performers`,
                {
                    params: {
                        startDate: filters.startDate,
                        endDate: filters.endDate,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setData(res.data);
            toast.success("Top performers loaded successfully!");
        } catch (err) {
            toast.error("Failed to fetch top performers!");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopPerformers();
    }, []);

    // Table Columns
    const productColumns = [
        {
            title: "Product", dataIndex: "productName", key: "name",
            render: (name) => JSON.parse(name || "{}")?.en || "N/A"
        },
        { title: "Total Sold", dataIndex: "totalSold", key: "sold" },
        { title: "Revenue", dataIndex: "revenue", key: "revenue" },
    ];

    const vendorColumns = [
        { title: "Vendor", dataIndex: "vendorName", key: "name" },
        { title: "Orders", dataIndex: "orderCount", key: "orders" },
        { title: "Revenue", dataIndex: "revenue", key: "revenue" },
    ];

    const customerColumns = [
        { title: "Customer", dataIndex: "name", key: "name" },
        { title: "Orders", dataIndex: "orderCount", key: "orders" },
        { title: "Total Spent", dataIndex: "totalSpent", key: "spent" },
    ];

    return (
        <Card title="🏆 Top Performers" className="shadow-md rounded-xl">

            {/* Filters */}
            <Row gutter={16} className="mb-6">

                <Col xs={24} sm={12} lg={8}>
                    <label className="block mb-2 text-gray-600 font-medium">Date Range</label>

                    <RangePicker
                        className="w-full"
                        onChange={(dates) => {
                            if (!dates) return;

                            setFilters({
                                startDate: dates[0].format("YYYY-MM-DD"),
                                endDate: dates[1].format("YYYY-MM-DD"),
                            });
                        }}
                    />
                </Col>

                <Col xs={24} sm={12} lg={4}>
                    <Button
                        type="primary"
                        className="w-full mt-8"
                        onClick={fetchTopPerformers}
                    >
                        Filter
                    </Button>
                </Col>
            </Row>

            {/* Loader */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Spin size="large" />
                </div>
            ) : (
                data && (
                    <div className="space-y-10">

                        {/* Top Products */}
                        <Card title="🛒 Top Products" bordered={false}>
                            <Table
                                dataSource={data.topProducts || []}
                                columns={productColumns}
                                rowKey="productId"
                                pagination={false}
                            />
                        </Card>

                        {/* Top Vendors */}
                        <Card title="🧑‍🍳 Top Vendors" bordered={false}>
                            <Table
                                dataSource={data.topVendors || []}
                                columns={vendorColumns}
                                rowKey="vendorId"
                                pagination={false}
                            />
                        </Card>

                        {/* Top Customers */}
                        <Card title="👤 Top Customers" bordered={false}>
                            <Table
                                dataSource={data.topCustomers || []}
                                columns={customerColumns}
                                rowKey="userId"
                                pagination={false}
                            />
                        </Card>
                    </div>
                )
            )}
        </Card>
    );
}
