import { useEffect, useState } from "react";
import api from "../../Api/Api";
import {
  Table,
  Button,
  Modal,
  Tag,
  Popconfirm,
  Spin,
  Typography,
  Select,
} from "antd";
import { Eye, Trash2, EyeOff, EyeIcon, Edit } from "lucide-react";
import { Link } from "react-router-dom";

const { Title } = Typography;
import { useTranslation } from "react-i18next";

export default function Products() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [viewModal, setViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [selectedMain, setSelectedMain] = useState("");
  const [selectedSub, setSelectedSub] = useState("");

  const language = i18n.language || "en";

  // ===========================
  // Fetch Products
  // ===========================
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/product?page=${page}&limit=${limit}&sortOrder=ASC${
          selectedMain ? `&categoryId=${selectedMain}` : ""
        }${selectedSub ? `&subCategoryId=${selectedSub}` : ""}`,
      );

      if (res.data.success) {
        setProducts(res.data.data.items);
        setMeta(res.data.data.metadata);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // Delete Product
  // ===========================
  const deleteProduct = async (id) => {
    try {
      await api.delete(`/product/${id}`);
      fetchProducts();
    } catch (e) {
      console.log(e);
    }
  };

  // ===========================
  // Toggle Hidden
  // ===========================
  const toggleHidden = async (id) => {
    try {
      await api.patch(`/product/toggle-hidden/${id}`);
      fetchProducts();
    } catch (e) {
      console.log(e);
    }
  };

  // ===========================
  // Open View Modal
  // ===========================
  const openView = async (id) => {
    try {
      const res = await api.get(`/product/${id}`);
      if (res.data.success) {
        setSelectedProduct(res.data.data);
        setViewModal(true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  // ===========================
  // Fetch Categories
  // ==========================
  useEffect(() => {
    const fetchMain = async () => {
      try {
        const res = await api.get("/category");
        if (res.data.success) setMainCategories(res.data.data);
      } catch (e) {
        console.log(e);
      }
    };
    fetchMain();
  }, []);

  // ===========================
  // Fetch Sub Categories
  // =========================
  useEffect(() => {
    if (!selectedMain) return;
    const fetchSubs = async () => {
      try {
        const res = await api.get(
          `/sub-categories?main_category=${selectedMain}`
        );
        if (res.data.success) setSubCategories(res.data.data);
      } catch (e) {
        console.log(e);
      }
    };
    fetchSubs();
  }, [selectedMain]);

  // Fetch products on page/limit change
  useEffect(() => {
    fetchProducts();
  }, [page, limit]);

  // ===========================
  // Table Columns
  // ===========================
  const columns = [
    {
      title: t("products.image"),
      dataIndex: "images",
      render: (img) => (
        <img
          src={img?.[0]?.attach}
          style={{ width: 55, height: 55, objectFit: "cover", borderRadius: 6 }}
        />
      ),
    },
    {
      title: t("products.name"),
      dataIndex: "name",
      render: (n) => (language === "ar" ? n.ar : n.en),
    },
    {
      title: t("products.price"),
      dataIndex: "price_after_discount",
      render: (p) => `${p} ${language === "ar" ? "ج.م" : "EGP"}`,
    },
    {
      title: t("products.stock"),
      dataIndex: "stock",
    },
    {
      title: t("products.status"),
      dataIndex: "isHidden",
      render: (h) =>
        h ? (
          <Tag color="red">{t("products.hidden")}</Tag>
        ) : (
          <Tag color="green">{t("products.visible")}</Tag>
        ),
    },
    {
      title: t("common.actions"),
      render: (_, row) => (
        <div style={{ display: "flex", gap: 10 }}>
          <Link to={`/products/${row.id}`}>
            <Edit
              size={18}
              style={{ cursor: "pointer" }}
              title={t("products.edit_product")}
              className="text-blue-600"
            />
          </Link>

          <Eye
            size={18}
            style={{ cursor: "pointer" }}
            onClick={() => openView(row.id)}
          />

          <Popconfirm
            title={t("products.delete_confirm")}
            okText={t("common.delete")}
            cancelText={t("common.cancel")}
            okType="danger"
            onConfirm={() => deleteProduct(row.id)}
          >
            <Trash2 size={18} color="red" style={{ cursor: "pointer" }} />
          </Popconfirm>

          {row.isHidden ? (
            <EyeIcon
              size={18}
              color="green"
              style={{ cursor: "pointer" }}
              onClick={() => toggleHidden(row.id)}
              title={t("products.make_visible")}
            />
          ) : (
            <EyeOff
              size={18}
              color="red"
              style={{ cursor: "pointer" }}
              onClick={() => toggleHidden(row.id)}
              title={t("products.make_hidden")}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <div>
        <Title level={2} style={{ marginBottom: 20 }}>
          {t("products.title")}
        </Title>

        <div style={{ marginBottom: 20, textAlign: "right" }}>
          <Link to="/products/add">
            <Button type="primary">{t("products.add_product")}</Button>
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <p className="self-start m-0 text-red-500">
            {t("products.filter_category")}
          </p>
          <Select
            value={selectedMain}
            placeholder={t("products.select_main")}
            style={{ width: 200 }}
            onChange={(value) => {
              setSelectedMain(value);
              setSelectedSub("");
            }}
            options={mainCategories.map((c) => ({
              value: c.id,
              label: language === "ar" ? (c.name?.ar || c.name?.en) : (c.name?.en || c.name?.ar),
            }))}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <p className="self-start m-0 text-red-500">
            {t("products.filter_subcategory")}
          </p>
          <Select
            value={selectedSub}
            placeholder={t("products.select_sub")}
            disabled={!selectedMain}
            style={{ width: 200 }}
            onChange={(value) => setSelectedSub(value)}
            options={subCategories.map((s) => ({
              value: s.id,
              label: language === "ar" ? (s.name?.ar || s.name?.en) : (s.name?.en || s.name?.ar),
            }))}
          />
        </div>

        <Button
          onClick={() => {
            setSelectedMain("");
            setSelectedSub("");
            setPage(1);
            setLimit(10);
            fetchProducts();
          }}
          style={{ marginTop: 20 }}
        >
          {t("products.clear_filters")}
        </Button>

        <Button
          type="primary"
          style={{ marginTop: 20 }}
          onClick={() => fetchProducts()}
        >
          {t("products.filter")}
        </Button>
      </div>

      {/* Table */}
      {!loading && (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={products}
          pagination={{
            current: meta.currentPage,
            total: meta.totalItems,
            pageSize: limit,
            onChange: (p, pageSize) => {
              setPage(p);
              setLimit(pageSize);
            },
          }}
        />
      )}
      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", marginTop: 50 }}>
          <Spin size="large" />
        </div>
      )}

      {/* VIEW MODAL */}
      <Modal
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={null}
        title={t("products.details_modal")}
        width={600}
      >
        {selectedProduct && (
          <div>
            {selectedProduct.images.length === 1 ? (
              <img
                src={selectedProduct.images?.[0]?.attach}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  marginBottom: 10,
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  overflowX: "auto",
                  justifyContent: "start",
                  marginBottom: 10,
                }}
              >
                {selectedProduct.images.map((img) => (
                  <img
                    key={img.id}
                    src={img.attach}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 10,
                      objectFit: "cover",
                    }}
                  />
                ))}
              </div>
            )}
            <h2>{language === "ar" ? (selectedProduct.name?.ar || selectedProduct.name?.en) : (selectedProduct.name?.en || selectedProduct.name?.ar)}</h2>
            <p>{language === "ar" ? (selectedProduct.description?.ar || selectedProduct.description?.en) : (selectedProduct.description?.en || selectedProduct.description?.ar)}</p>

            <p>
              <strong>{t("products.price")}:</strong>{" "}
              {selectedProduct.price_after_discount} {language === "ar" ? "ج.م" : "EGP"}
            </p>

            <p>
              <strong>{t("products.stock")}:</strong> {selectedProduct.stock}
            </p>

            <p>
              <strong>{t("products.main_category")}</strong>{" "}
              {selectedProduct.mainCategory?.name}
            </p>

            <p>
              <strong>{t("products.sub_category")}</strong>{" "}
              {selectedProduct.subCategory?.name}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
