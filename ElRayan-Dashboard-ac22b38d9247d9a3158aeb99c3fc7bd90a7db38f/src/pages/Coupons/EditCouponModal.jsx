// EditCouponModal.jsx
import { useEffect, useState } from "react";
import { Modal, Input, Select, Checkbox, InputNumber } from "antd";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function EditCouponModal({
  open,
  editData,
  setEditData,
  onSave,
  onCancel,
  token,
  confirmLoading,
  coupon,
}) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  console.log(coupon);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(
        "https://api.elrayan.acwad.tech/api/v1/category",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      toast.error("⚠️ Failed to load categories");
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch("https://api.elrayan.acwad.tech/api/v1/product", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProducts(data.data.items);
    } catch (err) {
      toast.error("⚠️ Failed to load products");
    }
  };

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchProducts();
    }
  }, [open]);

  if (!editData) return null;

  return (
    <Modal
      title={t("coupons.edit_coupon")}
      open={open}
      onCancel={onCancel}
      onOk={onSave}
      okText={t("common.save")}
      cancelText={t("common.cancel")}
      width={700}
      confirmLoading={confirmLoading}
    >
      {/* Code */}
      <label>{t("coupons.code")}</label>
      <Input
        value={editData.code}
        onChange={(e) => setEditData({ ...editData, code: e.target.value })}
        className="mb-3"
      />

      {/* Name */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <Input
          placeholder={t("coupons.name_en")}
          value={editData?.name?.en}
          onChange={(e) =>
            setEditData({
              ...editData,
              name: { ...editData.name, en: e.target.value },
            })
          }
        />
        <Input
          placeholder={t("coupons.name_ar")}
          value={editData?.name?.ar}
          onChange={(e) =>
            setEditData({
              ...editData,
              name: { ...editData.name, ar: e.target.value },
            })
          }
        />
      </div>

      {/* Description */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <Input.TextArea
          placeholder={t("coupons.desc_en")}
          value={editData.description?.en}
          onChange={(e) =>
            setEditData({
              ...editData,
              description: { ...editData.description, en: e.target.value },
            })
          }
        />
        <Input.TextArea
          placeholder={t("coupons.desc_ar")}
          value={editData.description?.ar}
          onChange={(e) =>
            setEditData({
              ...editData,
              description: { ...editData.description, ar: e.target.value },
            })
          }
        />
      </div>

      {/* Discount */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <Select
          value={editData.discountType}
          onChange={(val) => setEditData({ ...editData, discountType: val })}
          options={[
            { value: "percentage", label: t("coupons.percentage") },
            { value: "fixed_amount", label: t("coupons.fixed") },
            {
              value: "category_specific",
              label: t("coupons.category_specific"),
            },
            { value: "product_specific", label: t("coupons.product_specific") },
            { value: "free_shipping", label: t("coupons.free_shipping") },
            { value: "split_coupon", label: t("coupons.split_coupon") },
          ]}
        />
        <InputNumber
          min={0}
          value={editData.discountValue}
          onChange={(val) => setEditData({ ...editData, discountValue: val })}
          style={{ width: "100%" }}
        />
      </div>

      {/* Categories */}
      {editData.discountType === "category_specific" && (
        <div className="mb-3">
          <label>{t("coupons.applicable_categories")}</label>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select categories"
            value={editData.applicableCategories?.map((c) => c.id)}
            onChange={(ids) => {
              const selected = categories.filter((c) => ids.includes(c.id));
              setEditData({ ...editData, applicableCategories: selected.id });
            }}
            optionLabelProp="label"
          >
            {categories.map((cat) => (
              <Select.Option key={cat.id} value={cat.id} label={cat.name.en}>
                <div className="flex items-center gap-2">
                  {cat.icon && <img src={cat.icon} className="w-5 h-5" />}
                  <span>{cat.name.en}</span>
                </div>
              </Select.Option>
            ))}
          </Select>
        </div>
      )}

      {/* Products */}
      {editData.discountType === "product_specific" && (
        <div className="mb-3">
          <label>{t("coupons.applicable_products")}</label>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select products"
            value={editData.applicableProducts.map((p) => p.id)}
            onChange={(ids) => {
              const selected = products.filter((p) => ids.includes(p.id));
              setEditData({ ...editData, applicableProducts: selected.id });
            }}
            optionLabelProp="label"
          >
            {products.map((p) => (
              <Select.Option key={p.id} value={p.id} label={p.name.en}>
                <div className="flex items-center gap-2">
                  {p.images[0]?.attach && (
                    <img src={p.images[0].attach} className="w-5 h-5" />
                  )}
                  <span>{p.name.en}</span>
                </div>
              </Select.Option>
            ))}
          </Select>
        </div>
      )}

      {editData.discountType === "split_coupon" && (
        <div className="mb-3">
          <label>{t("coupons.discount_per_one")}</label>
          <Input
            type="number"
            value={editData.discountValue / editData.usageLimitPerUser}
            disabled
            onChange={(e) =>
              setEditData({
                ...editData,
                discountPerOne: Number(e.target.value),
              })
            }
          />
        </div>
      )}

      {/* Status + Stackable */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          value={editData.status}
          onChange={(val) => setEditData({ ...editData, status: val })}
          options={[
            { value: "active", label: t("coupons.active") },
            { value: "inactive", label: t("coupons.inactive") },
          ]}
        />
        <Checkbox
          checked={editData.isStackable}
          onChange={(e) =>
            setEditData({ ...editData, isStackable: e.target.checked })
          }
        >
          {t("coupons.is_stackable")}
        </Checkbox>
      </div>
    </Modal>
  );
}
