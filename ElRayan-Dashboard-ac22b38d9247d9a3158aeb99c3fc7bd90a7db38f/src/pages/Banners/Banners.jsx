import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Plus, 
  X, 
  Pencil, 
  Trash2, 
  Megaphone, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Tag, 
  Layers, 
  Package, 
  ExternalLink,
  Sparkles,
  Upload as UploadIcon
} from "lucide-react";
import { Spin, Button, Modal, Input, Select, Upload, Empty, Popconfirm } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const API_URL = "https://api.elrayan.acwad.tech/api/v1/banners";

export default function Banners() {
  const { t, i18n } = useTranslation();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // form states
  const [imageFile, setImageFile] = useState(null);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [productId, setProductId] = useState(0);
  const [type, setType] = useState("discount");

  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  const isArabic = i18n.language === "ar";
  const currency = isArabic ? "ج.م" : "EGP";

  // ------------------ FETCH ------------------
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (response.ok) setBanners(result.data || []);
      else toast.error(result.message || (isArabic ? "فشل جلب الإعلانات" : "Failed to fetch banners"));
    } catch (err) {
      toast.error(t("banners.fetch_fail") || (isArabic ? "فشل جلب الإعلانات" : "Failed to fetch banners"));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ------------------ ADD ------------------
  const addBanner = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const formData = new FormData();
    if (imageFile) formData.append("imagePath", imageFile);
    formData.append("title", title);
    formData.append("link", link);
    formData.append("productId", productId || 0);
    formData.append("type", type);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const res = await response.json();

      if (response.ok) {
        toast.success(t("banners.add_success") || (isArabic ? "تمت إضافة الإعلان بنجاح" : "Banner added successfully"));
        fetchBanners();
        setIsAddModalOpen(false);
        resetForm();
      } else toast.error(res.message || (isArabic ? "فشل إضافة الإعلان" : "Failed to add banner"));
    } catch {
      toast.error(t("banners.add_fail") || (isArabic ? "حدث خطأ أثناء إضافة الإعلان" : "Error adding banner"));
    } finally {
      setSubmitLoading(false);
    }
  };

  // ------------------ EDIT ------------------
  const editBanner = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const formData = new FormData();
    if (imageFile) formData.append("imagePath", imageFile);
    formData.append("title", title);
    formData.append("link", link);
    formData.append("productId", productId || 0);
    formData.append("type", type);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/${selectedBanner.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const res = await response.json();
      if (response.ok) {
        toast.success(t("banners.update_success") || (isArabic ? "تم تحديث الإعلان بنجاح" : "Banner updated successfully"));
        fetchBanners();
        setIsEditModalOpen(false);
        resetForm();
      } else toast.error(res.message || (isArabic ? "فشل تحديث الإعلان" : "Failed to update banner"));
    } catch {
      toast.error(t("banners.update_fail") || (isArabic ? "حدث خطأ أثناء التحديث" : "Error updating banner"));
    } finally {
      setSubmitLoading(false);
    }
  };

  // ------------------ DELETE ------------------
  const deleteBanner = async (id) => {
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success(t("banners.delete_success") || (isArabic ? "تم حذف الإعلان بنجاح" : "Banner deleted successfully"));
        setBanners(banners.filter((b) => b.id !== id));
        setIsModalOpen(false);
      } else toast.error(t("banners.delete_fail") || (isArabic ? "فشل حذف الإعلان" : "Failed to delete banner"));
    } catch {
      toast.error(t("banners.delete_fail") || (isArabic ? "حدث خطأ أثناء حذف الإعلان" : "Error deleting banner"));
    } finally {
      setSubmitLoading(false);
    }
  };

  // ---------------- FETCH CATEGORIES & PRODUCTS --------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "https://api.elrayan.acwad.tech/api/v1/category",
          { headers: { lang: isArabic ? "ar" : "en" } }
        );
        const data = await res.json();
        if (data.success) setMainCategories(data.data || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchCategories();
  }, [isArabic]);

  useEffect(() => {
    if (!selectedMain) return;

    const fetchSubs = async () => {
      try {
        const res = await fetch(
          `https://api.elrayan.acwad.tech/api/v1/sub-categories?main_category=${selectedMain}`,
          { headers: { lang: isArabic ? "ar" : "en" } }
        );
        const data = await res.json();
        if (data.success) setSubCategories(data.data || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchSubs();
  }, [selectedMain, isArabic]);

  useEffect(() => {
    if (!selectedMain || !selectedSub) return;

    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `https://api.elrayan.acwad.tech/api/v1/product?categoryId=${selectedMain}&subCategoryId=${selectedSub}`,
          { headers: { lang: isArabic ? "ar" : "en" } }
        );
        const data = await res.json();
        if (data.success) setProducts(data.data.items || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchProducts();
  }, [selectedSub, isArabic]);

  // ------------------ RESET FORM ------------------
  const resetForm = () => {
    setTitle("");
    setLink("");
    setProductId(0);
    setType("discount");
    setImageFile(null);
    setSelectedMain(null);
    setSelectedSub(null);
    setProducts([]);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10" dir={isArabic ? "rtl" : "ltr"}>
      <ToastContainer position={isArabic ? "top-left" : "top-right"} autoClose={3000} />

      {/* Clean Modern Header Banner */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-[#172554] to-blue-600"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-[#172554]/10 text-[#172554] rounded-2xl shrink-0 mt-1 shadow-2xs">
              <Megaphone size={28} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#172554] text-xs font-bold border border-blue-100 mb-2">
                <Sparkles size={14} className="text-[#172554]" />
                <span>{isArabic ? "إدارة واجهة متجر الريان" : "Storefront Banner Management"}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                {t("banners.title") || (isArabic ? "الإعلانات واللافتات (البنرات)" : "Promotional Banners")}
              </h1>
              <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-xl leading-relaxed">
                {isArabic 
                  ? "تحكم في بنرات العروض والخصومات الرئيسية التي تظهر للعملاء في الصفحة الرئيسية للمتجر." 
                  : "Manage main promotional banners, discount sliders, and featured product ads displayed to customers."}
              </p>
            </div>
          </div>
          <Button
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            type="primary"
            className="h-11 px-6 bg-[#172554] hover:bg-[#1e3a8a] text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-[#172554]/20 hover:shadow-lg transition-all"
          >
            <Plus size={16} /> 
            <span>{t("banners.add_banner") || (isArabic ? "إضافة إعلان جديد" : "Add Banner")}</span>
          </Button>
        </div>
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Spin size="large" />
          <span className="text-sm font-medium text-slate-500 animate-pulse">
            {isArabic ? "جاري تحميل البنرات والإعلانات..." : "Loading promotional banners..."}
          </span>
        </div>
      ) : banners.length === 0 ? (
        <div className="py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Empty description={t("banners.no_banners") || (isArabic ? "لا توجد إعلانات أو بنرات ترويجية حالياً" : "No banners available")} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              onClick={() => {
                setSelectedBanner(banner);
                setIsModalOpen(true);
              }}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#172554]/30 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
            >
              {/* Banner Image with Badges */}
              <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                <img
                  src={banner.imagePath}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black shadow-md backdrop-blur-md ${
                    banner.type === "discount" ? "bg-rose-600/90 text-white" : "bg-[#172554]/90 text-white"
                  }`}>
                    {banner.type === "discount" ? (isArabic ? "خصم وترويج" : "Discount") : (isArabic ? "منتج جديد" : "New Arrival")}
                  </span>
                </div>
              </div>

              {/* Banner Details */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base md:text-lg leading-snug line-clamp-1 group-hover:text-[#172554] transition-colors">
                    {banner.title || (isArabic ? "إعلان بدون عنوان" : "Untitled Banner")}
                  </h3>

                  {banner.product ? (
                    <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100/90 flex items-center justify-between gap-3 group-hover:bg-[#172554]/5 group-hover:border-[#172554]/15 transition-all">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                          <Package size={16} className="text-[#172554]" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">{isArabic ? "المنتج المرتبط" : "Linked Product"}</span>
                          <span className="text-xs font-bold text-slate-700 truncate block">{banner.product.name}</span>
                        </div>
                      </div>
                      <div className="text-end shrink-0">
                        <span className="line-through text-3xs text-rose-500 font-bold block">{banner.product.price} {currency}</span>
                        <span className="font-black text-xs text-emerald-600 block">{banner.product.price_after_discount} {currency}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100/90 flex items-center justify-center text-slate-400 text-xs italic">
                      {t("banners.no_product") || (isArabic ? "لا يوجد منتج مرتبط بهذا البنر" : "No linked product")}
                    </div>
                  )}
                </div>

                {banner.link && (
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold truncate">
                    <span className="truncate flex items-center gap-1.5">
                      <LinkIcon size={12} className="shrink-0" />
                      <span className="truncate">{banner.link}</span>
                    </span>
                    <span className="text-slate-400 shrink-0 rtl:rotate-180">↗</span>
                  </div>
                )}
              </div>

              {/* Footer action hint */}
              <div className="px-5 py-3 border-t border-gray-100 bg-slate-50/70 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-[#172554] group-hover:bg-slate-100 transition-colors">
                <span>{isArabic ? "انقر للعرض والتعديل والحذف" : "Click to view or edit"}</span>
                <span className="rtl:rotate-180 font-black">→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------ VIEW MODAL ------------------ */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={650}
        className="rounded-3xl overflow-hidden"
      >
        {selectedBanner && (
          <div className="space-y-5 p-2" dir={isArabic ? "rtl" : "ltr"}>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
              <img
                src={selectedBanner.imagePath}
                alt={selectedBanner.title}
                className="w-full h-72 object-cover"
              />
              <span className={`absolute top-4 right-4 px-3.5 py-1.5 rounded-full text-xs font-black text-white shadow-md ${
                selectedBanner.type === "discount" ? "bg-rose-600" : "bg-[#172554]"
              }`}>
                {selectedBanner.type === "discount" ? (isArabic ? "خصم وترويج" : "Discount") : (isArabic ? "منتج جديد" : "New Arrival")}
              </span>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-snug">{selectedBanner.title}</h2>
              {selectedBanner.link && (
                <a 
                  href={selectedBanner.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-bold mt-1.5 hover:underline break-all"
                >
                  <LinkIcon size={14} />
                  <span>{selectedBanner.link}</span>
                </a>
              )}
            </div>

            {selectedBanner.product ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    <Package size={22} className="text-[#172554]" />
                  </div>
                  <div>
                    <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">{isArabic ? "المنتج المرتبط بالإعلان" : "Linked Product"}</span>
                    <span className="font-extrabold text-slate-800 text-sm md:text-base">{selectedBanner.product.name}</span>
                  </div>
                </div>
                <div className="text-end shrink-0">
                  <span className="line-through text-xs text-rose-500 font-bold block">{selectedBanner.product.price} {currency}</span>
                  <span className="font-black text-lg text-emerald-600 block">{selectedBanner.product.price_after_discount} {currency}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center text-slate-400 text-sm italic font-medium">
                {t("banners.no_product") || (isArabic ? "لا يوجد منتج مرتبط بهذا الإعلان" : "No linked product")}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Popconfirm
                title={isArabic ? "هل أنت متأكد من حذف هذا الإعلان؟" : "Are you sure to delete this banner?"}
                onConfirm={() => deleteBanner(selectedBanner.id)}
                okText={isArabic ? "نعم، احذف" : "Yes, delete"}
                cancelText={isArabic ? "إلغاء" : "Cancel"}
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  icon={<Trash2 size={16} />}
                  loading={submitLoading}
                  className="h-10 px-5 rounded-xl font-bold flex items-center gap-1.5"
                >
                  {t("common.delete") || (isArabic ? "حذف الإعلان" : "Delete Banner")}
                </Button>
              </Popconfirm>

              <Button
                type="primary"
                icon={<Pencil size={16} />}
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditModalOpen(true);
                  setTitle(selectedBanner.title || "");
                  setLink(selectedBanner.link || "");
                  setProductId(selectedBanner.productId || 0);
                  setType(selectedBanner.type || "discount");
                }}
                loading={submitLoading}
                className="h-10 px-6 bg-[#172554] hover:bg-[#1e3a8a] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
              >
                {t("common.edit") || (isArabic ? "تعديل الإعلان" : "Edit Banner")}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ------------------ ADD MODAL ------------------ */}
      <Modal
        open={isAddModalOpen}
        title={
          <div className="flex items-center gap-2.5 text-lg font-black text-slate-800 border-b border-slate-100 pb-3.5">
            <span className="p-2.5 rounded-xl bg-[#172554]/10 text-[#172554]">
              <Plus size={18} />
            </span>
            <span>{t("banners.add_banner") || (isArabic ? "إضافة بنر إعلاني جديد" : "Add New Banner")}</span>
          </div>
        }
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={580}
      >
        <form onSubmit={addBanner} className="space-y-4 pt-4" dir={isArabic ? "rtl" : "ltr"}>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-[#172554]" />
              <span>{isArabic ? "صورة البنر الإعلاني (يفضل أبعاد عرضية دقيقة)" : "Banner Image"}</span>
            </label>
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              onChange={({ fileList }) =>
                setImageFile(fileList[0]?.originFileObj || null)
              }
              listType="picture"
              className="w-full"
            >
              <Button icon={<UploadOutlined />} className="w-full h-12 rounded-xl font-bold border-dashed border-slate-300 hover:border-[#172554] hover:text-[#172554]">
                {t("banners.upload") || (isArabic ? "اختر ملف صورة البنر من جهازك..." : "Upload image...")}
              </Button>
            </Upload>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Megaphone size={14} className="text-[#172554]" />
              <span>{t("banners.banner_title") || (isArabic ? "عنوان الإعلان أو العرض الترويجي" : "Banner Title")}</span>
            </label>
            <Input
              placeholder={isArabic ? "مثال: خصومات كبرى على المنتجات الطازجة يصل لـ 50%..." : "Enter banner title..."}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-11 rounded-xl font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <LinkIcon size={14} className="text-[#172554]" />
              <span>{t("banners.link") || (isArabic ? "رابط التوجيه عند النقر (اختياري)" : "Redirect Link (Optional)")}</span>
            </label>
            <Input
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="h-11 rounded-xl font-medium dir-ltr"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers size={14} className="text-[#172554]" />
                <span>{t("banners.select_main_category") || (isArabic ? "القسم الرئيسي (لتصفية المنتجات)" : "Main Category")}</span>
              </label>
              <Select
                placeholder={isArabic ? "اختر القسم الرئيسي..." : "Select Main Category"}
                className="w-full h-11"
                value={selectedMain}
                onChange={(value) => {
                  setSelectedMain(value);
                  setSelectedSub(null);
                  setProducts([]);
                }}
                options={mainCategories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                allowClear
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers size={14} className="text-[#172554]" />
                <span>{isArabic ? "القسم الفرعي" : "Sub Category"}</span>
              </label>
              <Select
                placeholder={isArabic ? "اختر القسم الفرعي..." : "Select Sub Category"}
                className="w-full h-11"
                value={selectedSub}
                onChange={(value) => setSelectedSub(value)}
                disabled={!selectedMain}
                options={subCategories.map((sub) => ({
                  value: sub.id,
                  label: sub.name,
                }))}
                allowClear
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Package size={14} className="text-[#172554]" />
                <span>{t("banners.select_product") || (isArabic ? "المنتج المرتبط (اختياري)" : "Select Product (Optional)")}</span>
              </label>
              <Select
                placeholder={isArabic ? "اختر المنتج المرتبط..." : "Select Product"}
                className="w-full h-11"
                value={productId || undefined}
                onChange={(value) => setProductId(value)}
                disabled={!selectedSub && products.length === 0}
                options={products.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
                showSearch
                allowClear
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Tag size={14} className="text-[#172554]" />
                <span>{isArabic ? "تصنيف الإعلان" : "Banner Type"}</span>
              </label>
              <Select
                value={type}
                onChange={setType}
                options={[
                  { value: "discount", label: t("banners.discount") || (isArabic ? "خصم وعرض ترويجي (Discount)" : "Discount") },
                  { value: "new", label: t("banners.new") || (isArabic ? "منتج وصول جديد (New)" : "New") },
                ]}
                className="w-full h-11"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-2">
            <Button onClick={() => setIsAddModalOpen(false)} className="h-11 px-5 rounded-xl font-bold">
              {t("common.cancel") || (isArabic ? "إلغاء" : "Cancel")}
            </Button>
            <Button
              htmlType="submit"
              type="primary"
              loading={submitLoading}
              className="h-11 px-7 bg-[#172554] hover:bg-[#1e3a8a] text-white rounded-xl font-bold shadow-md shadow-[#172554]/20"
            >
              {t("common.save") || (isArabic ? "حفظ الإعلان" : "Save Banner")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------ EDIT MODAL ------------------ */}
      <Modal
        open={isEditModalOpen}
        title={
          <div className="flex items-center gap-2.5 text-lg font-black text-slate-800 border-b border-slate-100 pb-3.5">
            <span className="p-2.5 rounded-xl bg-[#172554]/10 text-[#172554]">
              <Pencil size={18} />
            </span>
            <span>{t("banners.edit_banner") || (isArabic ? "تعديل بيانات البنر الإعلاني" : "Edit Banner")}</span>
          </div>
        }
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={580}
      >
        <form onSubmit={editBanner} className="space-y-4 pt-4" dir={isArabic ? "rtl" : "ltr"}>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-[#172554]" />
              <span>{isArabic ? "تغيير صورة البنر (اتركه فارغاً للاحتفاظ بالصورة الحالية)" : "Change Banner Image"}</span>
            </label>
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              onChange={({ fileList }) =>
                setImageFile(fileList[0]?.originFileObj || null)
              }
              listType="picture"
              className="w-full"
            >
              <Button icon={<UploadOutlined />} className="w-full h-12 rounded-xl font-bold border-dashed border-slate-300 hover:border-[#172554] hover:text-[#172554]">
                {t("banners.upload_new") || (isArabic ? "اختر صورة جديدة من جهازك..." : "Upload new image...")}
              </Button>
            </Upload>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Megaphone size={14} className="text-[#172554]" />
              <span>{t("banners.banner_title") || (isArabic ? "عنوان الإعلان" : "Banner Title")}</span>
            </label>
            <Input
              placeholder={isArabic ? "عنوان الإعلان..." : "Enter banner title..."}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-11 rounded-xl font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <LinkIcon size={14} className="text-[#172554]" />
              <span>{t("banners.link") || (isArabic ? "رابط التوجيه (اختياري)" : "Redirect Link (Optional)")}</span>
            </label>
            <Input
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="h-11 rounded-xl font-medium dir-ltr"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers size={14} className="text-[#172554]" />
                <span>{t("banners.select_main_category") || (isArabic ? "تحديث القسم الرئيسي" : "Main Category")}</span>
              </label>
              <Select
                placeholder={isArabic ? "اختر القسم الرئيسي..." : "Select Main Category"}
                className="w-full h-11"
                value={selectedMain}
                onChange={(value) => {
                  setSelectedMain(value);
                  setSelectedSub(null);
                  setProducts([]);
                }}
                options={mainCategories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                allowClear
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers size={14} className="text-[#172554]" />
                <span>{isArabic ? "تحديث القسم الفرعي" : "Sub Category"}</span>
              </label>
              <Select
                placeholder={isArabic ? "اختر القسم الفرعي..." : "Select Sub Category"}
                className="w-full h-11"
                value={selectedSub}
                onChange={(value) => setSelectedSub(value)}
                disabled={!selectedMain}
                options={subCategories.map((sub) => ({
                  value: sub.id,
                  label: sub.name,
                }))}
                allowClear
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Package size={14} className="text-[#172554]" />
                <span>{t("banners.select_product") || (isArabic ? "المنتج المرتبط" : "Select Product")}</span>
              </label>
              <Select
                placeholder={isArabic ? "اختر المنتج..." : "Select Product"}
                className="w-full h-11"
                value={productId || undefined}
                onChange={(value) => setProductId(value)}
                disabled={!selectedSub && products.length === 0}
                options={products.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
                showSearch
                allowClear
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Tag size={14} className="text-[#172554]" />
                <span>{isArabic ? "تصنيف الإعلان" : "Banner Type"}</span>
              </label>
              <Select
                value={type}
                onChange={setType}
                options={[
                  { value: "discount", label: t("banners.discount") || (isArabic ? "خصم وعرض ترويجي (Discount)" : "Discount") },
                  { value: "new", label: t("banners.new") || (isArabic ? "منتج وصول جديد (New)" : "New") },
                ]}
                className="w-full h-11"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-2">
            <Button onClick={() => setIsEditModalOpen(false)} className="h-11 px-5 rounded-xl font-bold">
              {t("common.cancel") || (isArabic ? "إلغاء" : "Cancel")}
            </Button>
            <Button
              htmlType="submit"
              type="primary"
              loading={submitLoading}
              className="h-11 px-7 bg-[#172554] hover:bg-[#1e3a8a] text-white rounded-xl font-bold shadow-md shadow-[#172554]/20"
            >
              {t("common.update") || (isArabic ? "تحديث الإعلان" : "Update Banner")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

