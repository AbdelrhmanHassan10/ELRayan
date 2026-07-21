import { useEffect, useState } from "react";
import { FaEdit, FaChartBar, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Modal,
  Input,
  Select,
  Checkbox,
  Button,
  DatePicker,
  InputNumber,
  Spin,
  Tag,
} from "antd";
import AddCouponModal from "./AddCouponModal";
import EditCouponModal from "./EditCouponModal";
import { useTranslation } from "react-i18next";

export default function Coupons() {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  // تعديل
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(null);

  // إضافة
  const [showAdd, setShowAdd] = useState(false);

  // API filters
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortOrder, setSortOrder] = useState("DESC");
  const [discountType, setDiscountType] = useState("");

  const token = localStorage.getItem("token");

  const buildAPIUrl = () => {
    let url = `https://api.elrayan.acwad.tech/api/v1/coupons?status=${status}&page=${page}&limit=${limit}&sortOrder=${sortOrder}`;
    if (discountType) url += `&discountType=${discountType}`;
    return url;
  };
  // Fetch coupons
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch(buildAPIUrl(), {
        headers: {
          Authorization: `Bearer ${token}`,
          lang: localStorage.getItem("i18nextLng") || "en",
        },
      });
      const data = await res.json();
      setCoupons(data.data.items || []);
    } catch (err) {
      toast.error(t("coupons.fetch_fail"));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle analytics
  const handleAnalytics = async (id, code) => {
    try {
      const res = await fetch(
        `https://api.elrayan.acwad.tech/api/v1/coupons/${id}/analytics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            lang: localStorage.getItem("i18nextLng") || "en",
          },
        },
      );
      const data = await res.json();
      if (data.success) {
        setAnalyticsData({ ...data.data, code });
        setShowAnalytics(true);
        setShowAnalytics(true);
      } else {
        toast.error(t("coupons.analytics_fail"));
      }
    } catch (err) {
      toast.error(t("coupons.analytics_fail"));
    }
  };

  // Handle edit open
  const openEditModal = (coupon) => {
    setEditData(coupon);
    setShowEdit(true);
  };

  // Handle edit save (PATCH)
  const handleEditSave = async () => {
    setSubmitLoading(true);
    const body = {
      code: editData.code || "",
      name: editData.name || { en: "Default name" },
      description: editData.description || { en: "Default description" },
      discountType: editData.discountType || "percentage",
      discountValue: editData.discountValue || 0,
      maxDiscountAmount: editData.maxDiscountAmount || 0,
      minOrderAmount: editData.minOrderAmount || 0,
      status: editData.status || "active",
      validFrom: editData.validFrom
        ? new Date(editData.validFrom).toISOString()
        : new Date().toISOString(),
      validTo: editData.validTo
        ? new Date(editData.validTo).toISOString()
        : new Date().toISOString(),
      usageLimit: editData.usageLimit || 0,
      usageLimitPerUser: editData.usageLimitPerUser || 0,
      applicableCategories: editData.applicableCategories || [],
      // applicableVendors: editData.applicableVendors || [],
      applicableProducts: editData.applicableProducts || [],
      excludedCategories: editData.excludedCategories || [],
      excludedProducts: editData.excludedProducts || [],
      applicableUserGroups: editData.applicableUserGroups || [],
      isStackable:
        editData.isStackable !== undefined ? editData.isStackable : true,
      createdBy: editData.createdBy || 0,
      splitValue: editData.splitValue || 0,
    };

    try {
      const res = await fetch(
        `https://api.elrayan.acwad.tech/api/v1/coupons/${editData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            lang: localStorage.getItem("i18nextLng") || "en",
          },
          body: JSON.stringify(body),
        },
      );

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(t("coupons.update_success"));
        setShowEdit(false);
        fetchCoupons();
      } else {
        toast.error(t("coupons.update_fail"));
        console.error("PATCH error:", data);
      }
    } catch (err) {
      toast.error(t("coupons.update_fail"));
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle add save (POST)
  const handleAddSave = async (couponData) => {
    setSubmitLoading(true);
    const body = {
      ...couponData,
      validFrom: couponData.validFrom
        ? new Date(couponData.validFrom).toISOString()
        : new Date().toISOString(),
      validTo: couponData.validTo
        ? new Date(couponData.validTo).toISOString()
        : new Date().toISOString(),
    };

    try {
      const res = await fetch(`https://api.elrayan.acwad.tech/api/v1/coupons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(t("coupons.save_success"));
        setShowAdd(false);
        fetchCoupons();
      } else {
        toast.error(t("coupons.save_fail"));
        console.error("POST error:", data);
      }
    } catch (err) {
      toast.error(t("coupons.save_fail"));
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">
          🎟️ {t("coupons.title")}
        </h1>
        <Button
          onClick={() => setShowAdd(true)}
          type="primary"
          className="flex items-center gap-2 text-white px-4 py-2 rounded-lg"
        >
          <FaPlus /> {t("coupons.add_coupon")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <div className="flex flex-col items-start ">
          <span className="font-medium text-gray-700">
            {t("coupons.status")}
          </span>
          <Select value={status} onChange={setStatus} style={{ width: 150 }}>
            <Select.Option value="active">{t("coupons.active")}</Select.Option>
            <Select.Option value="inactive">
              {t("coupons.inactive")}
            </Select.Option>
          </Select>
        </div>
        <div className="flex flex-col items-start ">
          <span className="font-medium text-gray-700">{t("coupons.page")}</span>
          <InputNumber
            min={1}
            value={page}
            onChange={setPage}
            placeholder={t("coupons.page")}
          />
        </div>
        <div className="flex flex-col items-start ">
          <span className="font-medium text-gray-700">
            {t("coupons.limit")}
          </span>
          <InputNumber
            min={1}
            value={limit}
            onChange={setLimit}
            placeholder={t("coupons.limit")}
          />
        </div>

        <div className="flex flex-col items-start ">
          <span className="font-medium text-gray-700">
            {t("coupons.sort_order")}
          </span>
          <Select
            value={sortOrder}
            onChange={setSortOrder}
            style={{ width: 150 }}
          >
            <Select.Option value="ASC">{t("coupons.asc")}</Select.Option>
            <Select.Option value="DESC">{t("coupons.desc")}</Select.Option>
          </Select>
        </div>
        <div className="flex flex-col items-start ">
          <span className="font-medium text-gray-700">
            {t("coupons.discount_type")}
          </span>
          <Select
            value={discountType}
            onChange={setDiscountType}
            style={{ width: 180 }}
            placeholder={t("coupons.discount_type")}
            allowClear
          >
            <Select.Option disabled value="">
              {t("coupons.discount_type")}
            </Select.Option>
            <Select.Option value="percentage">
              {t("coupons.percentage")}
            </Select.Option>
            <Select.Option value="fixed_amount">
              {t("coupons.fixed")}
            </Select.Option>
            <Select.Option value="category_specific">
              {t("coupons.category_specific")}
            </Select.Option>
            <Select.Option value="product_specific">
              {t("coupons.product_specific")}
            </Select.Option>
            <Select.Option value="free_shipping">
              {t("coupons.free_shipping")}
            </Select.Option>
          </Select>
        </div>

        <Button onClick={fetchCoupons} type="primary">
          {t("coupons.apply_filters")}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Spin size="large" className="mx-auto mt-20" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2  gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-2xl shadow-lg p-6 relative hover:shadow-2xl transition"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-500 mb-2">
                  {localStorage.getItem("i18nextLng") === "ar"
                    ? coupon.name?.ar || "لا يوجد اسم"
                    : coupon.name?.en || "No Name"}
                </h2>
                <Tag color={"blue"} className="mb-2">
                  {coupon.code}
                </Tag>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-gray-700 mb-2">
                  {localStorage.getItem("i18nextLng") === "ar"
                    ? coupon.description?.ar || "لا يوجد وصف"
                    : coupon.description?.en || "No Description"}
                </p>

                <Tag className="text-gray-600 text-sm">
                  {coupon.discountType === "fixed_amount"
                    ? t("coupons.fixed")
                    : coupon.discountType === "percentage"
                      ? t("coupons.percentage")
                      : coupon.discountType === "category_specific"
                        ? t("coupons.category_specific")
                        : coupon.discountType === "product_specific"
                          ? t("coupons.product_specific")
                          : coupon.discountType === "free_shipping"
                            ? t("coupons.free_shipping")
                            : ""}
                </Tag>

                <Tag
                  color={coupon.status === "active" ? "green" : "red"}
                  className="mb-2"
                >
                  {coupon.status === "active"
                    ? t("coupons.active")
                    : t("coupons.inactive")}
                </Tag>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-800 font-medium mt-2">
                    {t("coupons.discount")}:
                  </span>
                  <Tag color="purple" className="mt-2">
                    {coupon.discountValue} %
                  </Tag>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-800 font-medium mt-2">
                    {t("coupons.max_discount_amount")}:
                  </span>
                  <Tag color="orange" className="mt-2">
                    {coupon.maxDiscountAmount}
                  </Tag>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-800 font-medium mt-2">
                    {t("coupons.min_order_amount")}:
                  </span>
                  <Tag color="cyan" className="mt-2">
                    {coupon.minOrderAmount}
                  </Tag>
                </div>
              </div>

              <div className="flex items-center justify-between ">
                <p className="text-gray-600 text-sm mt-2">
                  {t("coupons.usage_limit")}: {coupon.usageLimit}
                </p>

                <p className="text-gray-600 text-sm mt-1">
                  {t("coupons.used_count")}: {coupon.usedCount}
                </p>

                <p className="text-gray-600 text-sm mt-1">
                  {t("coupons.usage_limit_per_user")}:{" "}
                  {coupon.usageLimitPerUser}
                </p>
              </div>

              {coupon.products && (
                <div className="flex gap-4 flex-wrap items-center">
                  <span className="font-medium text-gray-700">
                    {t("coupons.applicable_products")}:
                  </span>

                  {coupon.products.map((prod) => (
                    <div className="flex flex-wrap mt-2 items-center">
                      <Tag key={prod.id} color="geekblue" className="mb-2">
                        {prod.name}
                      </Tag>
                      <img
                        src={prod.images?.[0]?.attach}
                        alt={prod.name}
                        className="w-8 h-8 object-cover rounded ml-2 mb-2"
                      />
                    </div>
                  ))}
                </div>
              )}

              {coupon.categories && (
                <div className="flex gap-4 flex-wrap items-center">
                  <span className="font-medium text-gray-700">
                    {t("coupons.applicable_categories")}:
                  </span>

                  {coupon.categories.map((cat) => (
                    <div className="flex flex-wrap mt-2 items-center">
                      <Tag key={cat.id} color="geekblue" className="mb-2">
                        {cat.name}
                      </Tag>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-start gap-4 mt-2">
                <p className="text-gray-600 text-sm">
                  {t("coupons.valid_from")}:{" "}
                  {new Date(coupon.validFrom).toLocaleDateString()}
                </p>
                <p className="text-gray-600 text-sm">
                  {t("coupons.valid_to")}:{" "}
                  {new Date(coupon.validTo).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-4 mt-4 text-gray-500">
                <FaEdit
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => openEditModal(coupon)}
                />
                <FaChartBar
                  className="cursor-pointer hover:text-green-600"
                  onClick={() => handleAnalytics(coupon.id, coupon.code)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add */}
      {showAdd && (
        <AddCouponModal
          open={showAdd}
          onCancel={() => setShowAdd(false)}
          onSave={handleAddSave}
          token={token}
          confirmLoading={submitLoading}
        />
      )}

      {/* Modal Edit */}
      {showEdit && editData && (
        <EditCouponModal
          open={showEdit}
          editData={editData}
          setEditData={setEditData}
          onSave={handleEditSave}
          onCancel={() => setShowEdit(false)}
          token={token}
          confirmLoading={submitLoading}
          coupon={editData}
        />
      )}

      {/* Modal Analytics */}
      {showAnalytics && analyticsData && (
        <Modal
          title={`📊 ${t("coupons.analytics")} - ${analyticsData?.code}`}
          open={showAnalytics && analyticsData}
          onCancel={() => setShowAnalytics(false)}
          footer={null}
          width={800}
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg shadow text-center">
              <p className="text-sm text-gray-600">{t("coupons.total_uses")}</p>
              <p className="text-xl font-bold text-blue-700">
                {analyticsData.analytics.totalUses}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg shadow text-center">
              <p className="text-sm text-gray-600">
                {t("coupons.total_discount")}
              </p>
              <p className="text-xl font-bold text-green-700">
                {analyticsData.analytics.totalDiscount}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg shadow text-center">
              <p className="text-sm text-gray-600">{t("coupons.avg_order")}</p>
              <p className="text-xl font-bold text-yellow-700">
                {analyticsData.analytics.avgOrderTotal}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg shadow text-center">
              <p className="text-sm text-gray-600">
                {t("coupons.unique_users")}
              </p>
              <p className="text-xl font-bold text-purple-700">
                {analyticsData.analytics.uniqueUsers}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* PieChart */}
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: t("coupons.uses"),
                        value: analyticsData.analytics.totalUses,
                      },
                      {
                        name: t("coupons.unique_users"),
                        value: analyticsData.analytics.uniqueUsers,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {[
                      analyticsData.analytics.totalUses,
                      analyticsData.analytics.uniqueUsers,
                    ].map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* BarChart */}
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart
                  data={[
                    {
                      name: t("coupons.total_uses"),
                      value: analyticsData.analytics.totalUses,
                    },
                    {
                      name: t("coupons.unique_users"),
                      value: analyticsData.analytics.uniqueUsers,
                    },
                    {
                      name: t("coupons.total_discount"),
                      value: analyticsData.analytics.totalDiscount,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
