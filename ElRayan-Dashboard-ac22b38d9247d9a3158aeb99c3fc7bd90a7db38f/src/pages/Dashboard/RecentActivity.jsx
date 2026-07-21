import React, { useEffect, useState } from "react";
import axios from "axios";
import { Tabs, Table, Card, Spin, message } from "antd";
import { UserOutlined, StarOutlined, ShoppingCartOutlined } from "@ant-design/icons";

const RecentActivity = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await axios.get(
                    "https://api.maghni.acwad.tech/api/v1/dashboard/recent-activity"
                );
                setData(res.data);
            } catch (err) {
                message.error("Failed to load recent activity");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, []);

    if (loading)
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Spin size="large" />
            </div>
        );

    // 🟦 Columns for Orders
    const orderColumns = [
        { title: "Order #", dataIndex: "orderNumber", key: "orderNumber" },
        {
            title: "Customer",
            dataIndex: ["user", "fullName"],
            key: "customer",
            render: (name) => name || "N/A",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (val) => val?.toUpperCase(),
        },
        { title: "Total (EGP)", dataIndex: "totalAmount", key: "totalAmount" },
        {
            title: "Date",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (d) => new Date(d).toLocaleDateString(),
        },
    ];

    // 🟩 Columns for Users
    const userColumns = [
        { title: "Name", dataIndex: "fullName", key: "fullName", render: (name) => name || "N/A" },
        { title: "Email", dataIndex: "email", key: "email", render: (e) => e || "N/A" },
        {
            title: "Vendor",
            dataIndex: "vendor",
            key: "vendor",
            render: (vendor) => vendor?.name || "-",
        },
        {
            title: "Joined",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (d) => new Date(d).toLocaleDateString(),
        },
    ];

    // 🟨 Columns for Reviews
    const reviewColumns = [
        {
            title: "User",
            dataIndex: ["user", "fullName"],
            key: "user",
        },
        {
            title: "Rating",
            dataIndex: "rating",
            key: "rating",
        },
        {
            title: "Comment",
            dataIndex: "comment",
            key: "comment",
        },
        {
            title: "Date",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (d) => new Date(d).toLocaleDateString(),
        },
    ];

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Recent Activity</h2>

            <Card>
                <Tabs
                    defaultActiveKey="orders"
                    items={[
                        {
                            key: "orders",
                            label: (
                                <span>
                                    <ShoppingCartOutlined /> Recent Orders
                                </span>
                            ),
                            children: (
                                <Table
                                    columns={orderColumns}
                                    dataSource={data?.recentOrders}
                                    rowKey="id"
                                    pagination={{ pageSize: 5 }}
                                    className="overflow-x-auto"
                                />
                            ),
                        },
                        {
                            key: "users",
                            label: (
                                <span>
                                    <UserOutlined /> Recent Users
                                </span>
                            ),
                            children: (
                                <Table
                                    columns={userColumns}
                                    dataSource={data?.recentUsers}
                                    rowKey="id"
                                    pagination={{ pageSize: 5 }}
                                    className="overflow-x-auto"
                                />
                            ),
                        },
                        {
                            key: "reviews",
                            label: (
                                <span>
                                    <StarOutlined /> Recent Reviews
                                </span>
                            ),
                            children: (
                                <Table
                                    columns={reviewColumns}
                                    dataSource={data?.recentReviews}
                                    rowKey="id"
                                    pagination={{ pageSize: 5 }}
                                />
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    );
};

export default RecentActivity;
