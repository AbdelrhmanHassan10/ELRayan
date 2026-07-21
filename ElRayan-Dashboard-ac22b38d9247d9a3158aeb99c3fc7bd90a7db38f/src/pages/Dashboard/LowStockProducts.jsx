import { useEffect, useState } from "react";
import axios from "axios";
import { Table, InputNumber, Button, Card, Space, Tag } from "antd";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LowStockProducts() {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // params
    const [threshold, setThreshold] = useState(10);
    const [limit, setLimit] = useState(20);

    // pagination
    const [page, setPage] = useState(1);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `https://api.elrayan.acwad.tech/api/v1/orders/low-stock-products`,
                {
                    params: {
                        threshold,
                        limit
                    }
                }
            );
            setData(res.data);
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: (a, b) => a.id - b.id
        },
        {
            title: t("products_performance.product"),
            dataIndex: "name",
        },
        {
            title: t("inventory.current_stock"),
            dataIndex: "currentStock",
            sorter: (a, b) => a.currentStock - b.currentStock,
            render: (v) => (
                <span style={{ color: v <= 3 ? "red" : "#333", fontWeight: 600 }}>
                    {v}
                </span>
            ),
        },
        {
            title: t("inventory.total_sold"),
            dataIndex: "sold",
            sorter: (a, b) => a.sold - b.sold
        },
        {
            title: t("low_stock.recommended"),
            dataIndex: "isRecommended",
            render: (v) =>
                v ? <Tag color="green">{t("low_stock.recommended")}</Tag> : <Tag>{t("low_stock.normal")}</Tag>
        },
    ];

    return (
        <div className="space-y-5">

            {/* Filters */}
            <Card className="p-4">
                <Space wrap size="large">

                    <div>
                        <div style={{ fontSize: 12, color: "#666" }}>{t("low_stock.threshold")}</div>
                        <InputNumber
                            min={0}
                            value={threshold}
                            onChange={(v) => setThreshold(v)}
                            style={{ width: 120 }}
                        />
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: "#666" }}>{t("low_stock.limit")}</div>
                        <InputNumber
                            min={1}
                            max={1000}
                            value={limit}
                            onChange={(v) => setLimit(v)}
                            style={{ width: 120 }}
                        />
                    </div>

                    <Button
                        type="primary"
                        icon={<Search size={16} />}
                        onClick={() => { setPage(1); fetchData(); }}
                        style={{
                            marginTop: 20
                        }}
                    >
                        {t("low_stock.apply")}
                    </Button>

                </Space>
            </Card>

            {/* Table */}
            <Card>
                <div style={{ overflowX: "auto" }}>
                    <Table
                        rowKey={(r) => r.id}
                        loading={loading}
                        columns={columns}
                        dataSource={data}
                        pagination={{
                            current: page,
                            pageSize: limit,
                            total: data.length,
                            showSizeChanger: false,
                            onChange: (p) => setPage(p),
                        }}
                    />
                </div>
            </Card>

        </div>
    );
}
