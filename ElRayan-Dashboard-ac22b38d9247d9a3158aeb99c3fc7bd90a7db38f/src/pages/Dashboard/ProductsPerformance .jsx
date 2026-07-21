import { useState, useEffect } from "react";
import axios from "axios";
import { Card, InputNumber, Button, Table, Space, message } from "antd";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TopProducts() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [limit, setLimit] = useState(20);
    const language = localStorage.getItem("i18nextLng") || "en";

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                "https://api.elrayan.acwad.tech/api/v1/orders/top-products",
                { params: { limit } }
            );
            setProducts(res.data);
        } catch (e) {
            console.error(e);
            message.error(t("products_performance.fetch_fail"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        {
            title: t("products_performance.product"),
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <Space>
                    <img
                        src={record.Image?.startsWith("/") ? `https://api.elrayan.acwad.tech${record.Image}` : record.Image}
                        alt=""
                        style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }}
                    />
                    {text}
                </Space>
            )
        },
        { title: t("products_performance.main_category"), dataIndex: "mainCategoryName", key: "mainCategoryName" },
        { title: t("products_performance.sub_category"), dataIndex: "subCategoryName", key: "subCategoryName" },
        { title: t("products_performance.total_sold"), dataIndex: "totalSold", key: "totalSold", sorter: (a, b) => a.totalSold - b.totalSold },
        { title: t("products_performance.revenue"), dataIndex: "revenue", key: "revenue", sorter: (a, b) => a.revenue - b.revenue, render: v => `${v} ${language === "ar" ? "ج.م" : "EGP"}` },
        { title: t("products_performance.avg_price"), dataIndex: "averagePrice", key: "averagePrice", render: v => `${v} ${language === "ar" ? "ج.م" : "EGP"}` }
    ];

    return (
        <div className="space-y-5">
            {/* Filters */}
            <Card className="p-4">
                <Space wrap size="large">
                    <div>
                        <div style={{ fontSize: 12, color: "#666" }}>{t("products_performance.limit")}</div>
                        <InputNumber min={1} max={100} value={limit} onChange={v => setLimit(v)} />
                    </div>

                    <Button
                        type="primary"
                        icon={<Search size={16} />}
                        onClick={fetchData}
                        loading={loading}
                        style={{ marginTop: 20 }}
                    >
                        {t("products_performance.apply")}
                    </Button>
                </Space>
            </Card>

            {/* Table */}
            <Card title={t("products_performance.title")}>
                <div style={{ overflowX: "auto" }}>
                    <Table
                        columns={columns}
                        dataSource={products}
                        rowKey={r => r.id}
                        pagination={{ pageSize: 10 }}
                        loading={loading}
                    />
                </div>
            </Card>
        </div>
    );
}
