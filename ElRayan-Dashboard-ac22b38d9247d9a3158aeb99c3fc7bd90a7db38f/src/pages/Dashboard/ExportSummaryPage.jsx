import { useEffect, useState } from "react";
import axios from "axios";
import { Table } from "antd";
import { useTranslation } from "react-i18next";

export default function InventoryAnalytics() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchData();
  }, [page, limit]); // ⬅ مهم جداً

  const fetchData = async () => {
    try {
      let res = await axios.get(
        `https://api.elrayan.acwad.tech/api/v1/orders/inventory-analytics`
      );
      setData(res.data);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: t("products_performance.product"), dataIndex: "name" },
    { title: t("inventory.current_stock"), dataIndex: "currentStock" },
    { title: t("inventory.total_sold"), dataIndex: "totalSold" },
    { title: t("inventory.price"), dataIndex: "currentPrice" },
    { title: t("inventory.total_inventory"), dataIndex: "totalInventory" },
    {
      title: t("inventory.sell_rate"),
      dataIndex: "sellThroughRate",
      render: (v) => v.toFixed(2),
      sorter: (a, b) => a.sellThroughRate - b.sellThroughRate
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey={(x) => x.id}
      pagination={{
        current: page,
        pageSize: limit,
        total: data.length,
        showSizeChanger: true,
        onChange: (p) => setPage(p),
        onShowSizeChange: (p, size) => {
          setLimit(size);
          setPage(1); // ⬅ رجّع الصفحة للأولى
        },
      }}
    />
  );
}
