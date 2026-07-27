import { useEffect, useState } from "react";
import axios from "axios";
import { Table } from "antd";
import { useTranslation } from "react-i18next";

export default function InventoryAnalytics() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const isArabic = i18n.language === "ar";

  useEffect(() => {
    fetchData();
  }, []); // ⬅ تم التعديل: جلب البيانات مرة واحدة فقط عند الفتح لعدم تجميد الترتيب وإعادة تحميل القائمة الخام مع كل ضغطة

  const fetchData = async () => {
    try {
      let res = await axios.get(
        `https://api.elrayan.acwad.tech/api/v1/orders/inventory-analytics`
      );
      const rawList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      
      // ⬅ دالة لتوحيد النصوص العربية (إزالة الفروقات بين الهاء والتاء المربوطة، أو الهمزات، أو المسافات الزائدة)
      const normalizeArabic = (str) => {
        if (!str) return "";
        return String(str)
          .trim()
          .toLowerCase()
          .replace(/[أإآ]/g, "ا")
          .replace(/ة/g, "ه")
          .replace(/\s+/g, " ");
      };

      const seenIds = new Set();
      const seenNames = new Set();
      const cleanList = [];

      rawList.forEach((item) => {
        const rawId = item.id ?? item.productId ?? item._id ?? item.code;
        const idKey = rawId != null ? String(rawId) : null;
        const nameKey = normalizeArabic(item.name || item.productName || item.title);

        const isIdDup = idKey && seenIds.has(idKey);
        const isNameDup = nameKey && seenNames.has(nameKey);

        if (!isIdDup && !isNameDup) {
          if (idKey) seenIds.add(idKey);
          if (nameKey) seenNames.add(nameKey);
          cleanList.push(item);
        }
      });

      setData(cleanList);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: t("products_performance.product"), dataIndex: "name" },
    { 
      title: t("inventory.current_stock"), 
      dataIndex: "currentStock",
      sorter: (a, b) => (a.currentStock || 0) - (b.currentStock || 0)
    },
    { 
      title: t("inventory.total_sold"), 
      dataIndex: "totalSold",
      sorter: (a, b) => (a.totalSold || 0) - (b.totalSold || 0)
    },
    { 
      title: t("inventory.price"), 
      dataIndex: "currentPrice",
      sorter: (a, b) => (a.currentPrice || 0) - (b.currentPrice || 0)
    },
    { 
      title: t("inventory.total_inventory"), 
      dataIndex: "totalInventory",
      sorter: (a, b) => (a.totalInventory || 0) - (b.totalInventory || 0)
    },
    {
      title: t("inventory.sell_rate"),
      dataIndex: "sellThroughRate",
      defaultSortOrder: "descend",
      sortDirections: ["descend", "ascend"],
      render: (v) => (v != null && !isNaN(Number(v)) ? Number(v).toFixed(2) : "0.00"),
      sorter: (a, b) => parseFloat(a.sellThroughRate || 0) - parseFloat(b.sellThroughRate || 0)
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey={(x, index) => `${x.id}-${index}`}
      locale={{
        triggerDesc: isArabic ? "اضغط للترتيب تنازلياً" : "Click to sort descending",
        triggerAsc: isArabic ? "اضغط للترتيب تصاعدياً" : "Click to sort ascending",
        cancelSort: isArabic ? "اضغط لإلغاء الترتيب" : "Click to cancel sorting",
      }}
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

