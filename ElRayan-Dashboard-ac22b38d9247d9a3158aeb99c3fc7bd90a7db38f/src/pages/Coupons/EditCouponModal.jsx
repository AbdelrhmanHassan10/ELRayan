// EditCouponModal.jsx
import { useEffect, useState } from "react";
import { Modal, Input, Select, InputNumber, Switch } from "antd";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  Ticket,
  Percent,
  Tag,
  Layers,
  Package,
  Truck,
  Sparkles,
  Hash,
  Shield,
  Users,
  Edit3,
  AlignLeft,
  Type
} from "lucide-react";

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
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(
        "https://api.elrayan.acwad.tech/api/v1/category",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      setLoadingProducts(true);
      const res = await fetch("https://api.elrayan.acwad.tech/api/v1/product", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProducts(data.data.items);
    } catch (err) {
      toast.error("⚠️ Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchProducts();
    }
  }, [open]);

  if (!editData) return null;

  const isFreeShipping = editData.discountType === "free_shipping";

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
      onOk={onSave}
      okText={t("common.save")}
      cancelText={t("common.cancel")}
      width={700}
      confirmLoading={confirmLoading}
      okButtonProps={{
        className: "h-10 px-8 bg-[#172554] hover:bg-[#1e3a8a] rounded-xl font-bold border-0 shadow-md",
      }}
      cancelButtonProps={{
        className: "h-10 px-6 rounded-xl font-bold",
      }}
      className="coupon-modal"
    >
      {/* Modal Header */}
      <div className="flex items-center gap-3 pb-5 mb-5 border-b border-gray-100">
        <div className="p-3 bg-[#172554]/10 text-[#172554] rounded-2xl shadow-sm">
          <Edit3 size={24} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800">{t("coupons.edit_coupon")}</h2>
          <p className="text-xs text-slate-500">{isArabic ? "تعديل بيانات كوبون الخصم الحالي" : "Edit existing discount coupon details"}</p>
        </div>
      </div>

      <div className="space-y-5" dir={isArabic ? "rtl" : "ltr"}>
        
        {/* Code & Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Hash size={13} className="text-[#172554]" />
              {t("coupons.code")}
            </label>
            <Input
              value={editData.code}
              onChange={(e) => setEditData({ ...editData, code: e.target.value.toUpperCase() })}
              placeholder={isArabic ? "مثال: SUMMER2026" : "e.g. SUMMER2026"}
              className="h-11 rounded-xl font-mono font-bold text-[#172554] uppercase tracking-widest bg-slate-50"
            />
          </div>
        </div>

        {/* Name Fields */}
        <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-2">
            <Type size={13} className="text-[#172554]" />
            {isArabic ? "اسم الكوبون" : "Coupon Name"}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder={t("coupons.name_en")}
              value={editData?.name?.en}
              onChange={(e) =>
                setEditData({ ...editData, name: { ...editData.name, en: e.target.value } })
              }
              className="h-11 rounded-xl font-medium"
            />
            <Input
              placeholder={t("coupons.name_ar")}
              value={editData?.name?.ar}
              dir="rtl"
              onChange={(e) =>
                setEditData({ ...editData, name: { ...editData.name, ar: e.target.value } })
              }
              className="h-11 rounded-xl font-medium"
            />
          </div>
        </div>

        {/* Description Fields */}
        <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-2">
            <AlignLeft size={13} className="text-[#172554]" />
            {isArabic ? "وصف الكوبون" : "Description"}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input.TextArea
              placeholder={t("coupons.desc_en")}
              value={editData.description?.en}
              rows={3}
              onChange={(e) =>
                setEditData({ ...editData, description: { ...editData.description, en: e.target.value } })
              }
              className="rounded-xl font-medium resize-none"
            />
            <Input.TextArea
              placeholder={t("coupons.desc_ar")}
              value={editData.description?.ar}
              dir="rtl"
              rows={3}
              onChange={(e) =>
                setEditData({ ...editData, description: { ...editData.description, ar: e.target.value } })
              }
              className="rounded-xl font-medium resize-none"
            />
          </div>
        </div>

        {/* Discount Type Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Percent size={13} className="text-[#172554]" />
            {t("coupons.discount_type")}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {discountTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = editData.discountType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setEditData({ ...editData, discountType: type.value, discountValue: 0 })}
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

        {/* Discount Value */}
        {!isFreeShipping && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Tag size={13} className="text-[#172554]" />
              {t("coupons.discount_value")}
            </label>
            <div className="relative max-w-[50%]">
              <InputNumber
                value={editData.discountValue}
                max={editData.discountType === "percentage" ? 100 : undefined}
                min={0}
                onChange={(val) => setEditData({ ...editData, discountValue: val || 0 })}
                className="w-full h-11 rounded-xl font-bold text-lg"
              />
              {editData.discountType === "percentage" && (
                <span className={`absolute top-1/2 -translate-y-1/2 font-bold text-slate-400 ${isArabic ? 'left-4' : 'right-4'}`}>%</span>
              )}
            </div>
          </div>
        )}

        {/* Split Coupon Logic */}
        {editData.discountType === "split_coupon" && editData.usageLimitPerUser > 0 && (
          <div className="p-3 bg-pink-50 rounded-xl border border-pink-200 flex items-center justify-between">
            <div className="text-xs font-bold text-pink-700">
              {t("coupons.discount_per_one")}
            </div>
            <div className="text-lg font-black text-pink-800">
              {(editData.discountValue / editData.usageLimitPerUser).toFixed(2)}
              <span className="text-xs font-medium text-pink-500 mx-1">{isArabic ? "لكل استخدام" : "per use"}</span>
            </div>
          </div>
        )}

        {/* Categories */}
        {editData.discountType === "category_specific" && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Layers size={13} className="text-violet-600" />
              {t("coupons.applicable_categories")}
            </label>
            <Select
              mode="multiple"
              className="w-full min-h-[44px]"
              placeholder={isArabic ? "اختر الأقسام..." : "Select categories"}
              value={editData.applicableCategories?.map((c) => typeof c === 'object' ? c.id : c)}
              onChange={(ids) => {
                const selected = categories.filter((c) => ids.includes(c.id));
                setEditData({ ...editData, applicableCategories: selected }); // Ensure backend accepts array of objects/ids
              }}
              options={categories.map((cat) => ({
                value: cat.id,
                label: cat.name.en,
                icon: cat.icon,
              }))}
              tagRender={({ label, value, closable, onClose }) => {
                const cat = categories.find((c) => c.id === value);
                return (
                  <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 rounded-lg px-2 py-1 m-1 text-xs font-bold border border-violet-200">
                    {cat?.icon && <img src={cat.icon} alt="" className="w-4 h-4 rounded" />}
                    {label}
                    {closable && (
                      <span onClick={onClose} className="mx-1 cursor-pointer hover:text-red-500 transition-colors">&times;</span>
                    )}
                  </span>
                );
              }}
            />
          </div>
        )}

        {/* Products */}
        {editData.discountType === "product_specific" && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Package size={13} className="text-orange-600" />
              {t("coupons.applicable_products")}
            </label>
            <Select
              mode="multiple"
              className="w-full min-h-[44px]"
              loading={loadingProducts}
              placeholder={isArabic ? "اختر المنتجات..." : "Select products"}
              value={editData.applicableProducts?.map((p) => typeof p === 'object' ? p.id : p)}
              onChange={(ids) => {
                const selected = products.filter((p) => ids.includes(p.id));
                setEditData({ ...editData, applicableProducts: selected }); 
              }}
              options={products.map((p) => ({
                value: p.id,
                label: p.name.en,
                icon: p.images?.[0]?.attach,
              }))}
              tagRender={({ label, value, closable, onClose }) => {
                const prod = products.find((p) => p.id === value);
                return (
                  <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 rounded-lg px-2 py-1 m-1 text-xs font-bold border border-orange-200">
                    {prod?.images?.[0]?.attach && (
                      <img src={prod.images[0].attach} alt="" className="w-4 h-4 rounded object-cover" />
                    )}
                    {label}
                    {closable && (
                      <span onClick={onClose} className="mx-1 cursor-pointer hover:text-red-500 transition-colors">&times;</span>
                    )}
                  </span>
                );
              }}
            />
          </div>
        )}

        {/* Status & Stackable */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Shield size={13} className="text-[#172554]" />
              {t("coupons.status")}
            </label>
            <Select
              value={editData.status}
              onChange={(val) => setEditData({ ...editData, status: val })}
              className="w-full h-11"
              options={[
                { value: "active", label: t("coupons.active") },
                { value: "inactive", label: t("coupons.inactive") },
              ]}
            />
          </div>
          <div className="flex items-center justify-end h-full pb-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <Switch
                checked={editData.isStackable}
                onChange={(checked) => setEditData({ ...editData, isStackable: checked })}
                className={editData.isStackable ? "bg-[#172554]" : ""}
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

