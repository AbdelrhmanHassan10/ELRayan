import { useEffect, useState } from "react";
import { Modal, Input, Select, Checkbox, DatePicker, InputNumber, Switch } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import {
  Ticket,
  Percent,
  Tag,
  Calendar,
  Users,
  Truck,
  Package,
  Layers,
  Hash,
  Shield,
  Sparkles,
} from "lucide-react";

const { RangePicker } = DatePicker;

export default function AddCouponModal({
  open,
  onCancel,
  onSave,
  token,
  confirmLoading,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [coupon, setCoupon] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    applicableCategories: [],
    applicableProducts: [],
    validFrom: null,
    validTo: null,
    usageLimit: 0,
    usageLimitPerUser: 0,
    status: "active",
    isStackable: true,
  });

  // Fetch categories on mount
  useEffect(() => {
    fetch("https://api.elrayan.acwad.tech/api/v1/category", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch(console.error);
  }, []);

  // Fetch products based on selected categories
  useEffect(() => {
    if (coupon.applicableCategories.length === 0) {
      setProducts([]);
      return;
    }

    setLoadingProducts(true);
    Promise.all(
      coupon.applicableCategories.map((catId) =>
        fetch(
          `https://api.elrayan.acwad.tech/api/v1/product?categoryId=${catId}&subCategoryId=1`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ).then((res) => res.json()),
      ),
    )
      .then((results) => {
        const allProducts = results.flatMap((r) => r.data.items);
        setProducts(allProducts);
        setLoadingProducts(false);
      })
      .catch(() => setLoadingProducts(false));
  }, [coupon.applicableCategories]);

  const isFreeShipping = coupon.discountType === "free_shipping";

  const discountTypes = [
    { value: "percentage", label: t("coupons.percentage"), icon: Percent, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { value: "fixed_amount", label: t("coupons.fixed"), icon: Tag, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    { value: "category_specific", label: t("coupons.category_specific"), icon: Layers, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
    { value: "product_specific", label: t("coupons.product_specific"), icon: Package, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
    { value: "free_shipping", label: t("coupons.free_shipping"), icon: Truck, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200" },
    { value: "split_coupon", label: t("coupons.split_coupon"), icon: Sparkles, color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-200" },
  ];

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      onOk={() => onSave(coupon)}
      okText={t("common.save")}
      cancelText={t("common.cancel")}
      width={680}
      confirmLoading={confirmLoading}
      okButtonProps={{
        className: "h-10 px-8 bg-[#172554] hover:bg-[#1e3a8a] rounded-xl font-bold",
      }}
      cancelButtonProps={{
        className: "h-10 px-6 rounded-xl font-bold",
      }}
      className="coupon-modal"
    >
      {/* Modal Header */}
      <div className="flex items-center gap-3 pb-5 mb-5 border-b border-gray-100">
        <div className="p-3 bg-[#172554]/10 text-[#172554] rounded-2xl">
          <Ticket size={24} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800">{t("coupons.add_coupon")}</h2>
          <p className="text-xs text-slate-500">{isArabic ? "أنشئ كوبون خصم جديد للمتجر" : "Create a new discount coupon for your store"}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Section 1: Coupon Code */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Hash size={13} className="text-[#172554]" />
            {t("coupons.code")}
          </label>
          <Input
            value={coupon.code}
            onChange={(e) => setCoupon({ ...coupon, code: e.target.value.toUpperCase() })}
            placeholder={isArabic ? "مثال: SUMMER2026" : "e.g. SUMMER2026"}
            className="h-11 rounded-xl font-mono font-bold text-[#172554] uppercase tracking-widest"
          />
        </div>

        {/* Section 2: Discount Type — Visual Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Percent size={13} className="text-[#172554]" />
            {t("coupons.discount_type")}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {discountTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = coupon.discountType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setCoupon({ ...coupon, discountType: type.value, discountValue: 0 })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? `${type.bg} ${type.color} ${type.border} ring-2 ring-offset-1 ring-current/20 shadow-sm`
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <Icon size={14} />
                  <span className="truncate">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Discount Value */}
        {!isFreeShipping && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Tag size={13} className="text-[#172554]" />
              {t("coupons.discount_value")}
            </label>
            <div className="relative">
              <InputNumber
                value={coupon.discountValue}
                max={coupon.discountType === "percentage" ? 100 : undefined}
                min={0}
                onChange={(val) => setCoupon({ ...coupon, discountValue: val || 0 })}
                className="w-full h-11 rounded-xl font-bold text-lg"
              />
              {coupon.discountType === "percentage" && (
                <span className="absolute top-1/2 -translate-y-1/2 end-12 text-slate-400 font-bold">%</span>
              )}
            </div>
          </div>
        )}

        {/* Section 4: Applicable Categories */}
        {(coupon.discountType === "category_specific" || coupon.discountType === "product_specific") && !isFreeShipping && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Layers size={13} className="text-violet-600" />
              {t("coupons.applicable_categories")}
            </label>
            <Select
              mode="multiple"
              value={coupon.applicableCategories}
              onChange={(val) => setCoupon({ ...coupon, applicableCategories: val })}
              options={categories.map((cat) => ({
                value: cat.id,
                label: cat.name.en,
                icon: cat.icon,
              }))}
              className="w-full"
              dropdownMatchSelectWidth={false}
              placeholder={isArabic ? "اختر الأقسام..." : "Select categories..."}
              tagRender={({ label, value, closable, onClose }) => {
                const cat = categories.find((c) => c.id === value);
                return (
                  <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 rounded-lg px-2 py-0.5 me-1 text-xs font-bold border border-violet-200">
                    {cat?.icon && <img src={cat.icon} alt="" className="w-4 h-4 rounded" />}
                    {label}
                    {closable && (
                      <span onClick={onClose} className="ms-1 cursor-pointer hover:text-red-500 transition-colors">&times;</span>
                    )}
                  </span>
                );
              }}
            />
          </div>
        )}

        {/* Section 5: Applicable Products */}
        {coupon.discountType === "product_specific" && !isFreeShipping && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Package size={13} className="text-orange-600" />
              {t("coupons.applicable_products")}
            </label>
            <Select
              mode="multiple"
              value={coupon.applicableProducts}
              onChange={(val) => setCoupon({ ...coupon, applicableProducts: val })}
              loading={loadingProducts}
              options={products.map((p) => ({
                value: p.id,
                label: p.name.en,
                icon: p.images?.[0]?.attach,
              }))}
              className="w-full"
              dropdownMatchSelectWidth={false}
              placeholder={isArabic ? "اختر المنتجات..." : "Select products..."}
              tagRender={({ label, value, closable, onClose }) => {
                const prod = products.find((p) => p.id === value);
                return (
                  <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 rounded-lg px-2 py-0.5 me-1 text-xs font-bold border border-orange-200">
                    {prod?.images?.[0]?.attach && (
                      <img src={prod.images[0].attach} alt="" className="w-4 h-4 rounded object-cover" />
                    )}
                    {label}
                    {closable && (
                      <span onClick={onClose} className="ms-1 cursor-pointer hover:text-red-500 transition-colors">&times;</span>
                    )}
                  </span>
                );
              }}
            />
          </div>
        )}

        {/* Section 6: Valid Period */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Calendar size={13} className="text-[#172554]" />
            {t("coupons.valid_period")}
          </label>
          <RangePicker
            value={
              coupon.validFrom && coupon.validTo
                ? [dayjs(coupon.validFrom), dayjs(coupon.validTo)]
                : []
            }
            onChange={(dates) =>
              setCoupon({
                ...coupon,
                validFrom: dates?.[0]?.toISOString(),
                validTo: dates?.[1]?.toISOString(),
              })
            }
            className="w-full h-11 rounded-xl"
            format="DD/MM/YYYY"
          />
        </div>

        {/* Section 7: Usage Limits */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Shield size={13} className="text-[#172554]" />
              {t("coupons.usage_limit")}
            </label>
            <InputNumber
              min={0}
              value={coupon.usageLimit}
              onChange={(val) => setCoupon({ ...coupon, usageLimit: val || 0 })}
              className="w-full h-11 rounded-xl font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Users size={13} className="text-[#172554]" />
              {t("coupons.usage_limit_per_user")}
            </label>
            <InputNumber
              min={0}
              value={coupon.usageLimitPerUser}
              onChange={(val) => setCoupon({ ...coupon, usageLimitPerUser: val || 0 })}
              className="w-full h-11 rounded-xl font-bold"
            />
          </div>
        </div>

        {/* Split Coupon Info */}
        {coupon.discountType === "split_coupon" && coupon.usageLimitPerUser > 0 && (
          <div className="p-3 bg-pink-50 rounded-xl border border-pink-200">
            <div className="text-xs font-bold text-pink-700 mb-1">
              {t("coupons.discount_per_one")}
            </div>
            <div className="text-lg font-black text-pink-800">
              {(coupon.discountValue / coupon.usageLimitPerUser).toFixed(2)}
              <span className="text-xs font-medium text-pink-500 ms-1">{isArabic ? "لكل استخدام" : "per use"}</span>
            </div>
          </div>
        )}

        {/* Section 8: Status & Stackable */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">{t("coupons.status")}</label>
            <Select
              value={coupon.status}
              onChange={(val) => setCoupon({ ...coupon, status: val })}
              className="w-full h-10"
              options={[
                { value: "active", label: t("coupons.active") },
                { value: "inactive", label: t("coupons.inactive") },
              ]}
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <Switch
                checked={coupon.isStackable}
                onChange={(checked) => setCoupon({ ...coupon, isStackable: checked })}
                className={coupon.isStackable ? "bg-[#172554]" : ""}
              />
              <span className="text-sm font-bold text-slate-700 group-hover:text-[#172554] transition-colors">
                {t("coupons.is_stackable")}
              </span>
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}
