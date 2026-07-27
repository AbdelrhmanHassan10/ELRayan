import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Upload, Popconfirm, Spin, message } from "antd";
import { Plus, Edit3, Trash2, Upload as UploadIcon, Eye, FolderTree, GitBranch, CheckCircle2, Sparkles, Layers } from "lucide-react";
import api from "../../Api/Api";
import { toast, ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";

const CategoryIconDisplay = ({ source, alt = "category", isSub = false }) => {
    const [imgSrc, setImgSrc] = useState(null);
    const [errStage, setErrStage] = useState(0);

    useEffect(() => {
        setErrStage(0);
        if (!source) {
            setImgSrc(null);
            return;
        }
        let url = source;
        if (typeof source === "object") {
            url = source.attach || source.url || source.path || source.image || source.imagePath || source.icon || source.logo || null;
        }
        if (typeof url !== "string" || !url.trim()) {
            setImgSrc(null);
            return;
        }
        url = url.trim();
        if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
            setImgSrc(url);
        } else {
            const path = url.startsWith("/") ? url : `/${url}`;
            setImgSrc(`https://api.elrayan.acwad.tech${path}`);
        }
    }, [source]);

    const handleError = () => {
        if (!source) return;
        let url = source;
        if (typeof source === "object") {
            url = source.attach || source.url || source.path || source.image || source.imagePath || source.icon || source.logo || null;
        }
        if (typeof url !== "string" || !url.trim()) return;
        const path = url.trim().startsWith("/") ? url.trim() : `/${url.trim()}`;

        if (errStage === 0) {
            setErrStage(1);
            if (url.startsWith("http://") || url.startsWith("https://")) {
                setErrStage(3);
                setImgSrc(null);
            } else {
                setImgSrc(`https://api.maghni.acwad.tech${path}`);
            }
        } else if (errStage === 1) {
            setErrStage(2);
            if (url.startsWith("http://") || url.startsWith("https://")) {
                setErrStage(3);
                setImgSrc(null);
            } else {
                setImgSrc(`https://ik.imagekit.io/yodskwyrw${path}`);
            }
        } else {
            setErrStage(3);
            setImgSrc(null);
        }
    };

    if (!imgSrc || errStage === 3) {
        return (
            <div className={`rounded-2xl border border-blue-100 bg-blue-50/70 p-2 flex items-center justify-center mx-auto shadow-2xs ${isSub ? "w-12 h-12" : "w-14 h-14"}`}>
                {isSub ? <GitBranch size={22} className="text-[#1e3a8a]/60" /> : <FolderTree size={24} className="text-[#1e3a8a]/60" />}
            </div>
        );
    }

    return (
        <div className={`rounded-2xl border border-blue-100 bg-white p-1 flex items-center justify-center mx-auto shadow-2xs group hover:border-[#1e3a8a] transition-all overflow-hidden ${isSub ? "w-12 h-12" : "w-14 h-14"}`}>
            <img
                src={imgSrc}
                alt={alt}
                onError={handleError}
                className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform"
            />
        </div>
    );
};

export default function Categories() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    // main modal (add/edit)
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCat, setSelectedCat] = useState(null);

    // subcategories modal
    const [subOpen, setSubOpen] = useState(false);
    const [subList, setSubList] = useState([]);

    const [form] = Form.useForm();
    const [subForm] = Form.useForm();
    
    const [subEditMode, setSubEditMode] = useState(false);
    const [subModal, setSubModal] = useState(false);
    const [selectedSub, setSelectedSub] = useState(null);

    // ============================
    // Fetch categories
    // ============================
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get("/category");
            setCategories(res.data.data || []);
        } catch (e) {
            console.error(e);
            message.error(isArabic ? "فشل جلب الأقسام" : "Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // ============================
    // Add modal
    // ============================
    const openAdd = () => {
        setEditMode(false);
        setSelectedCat(null);
        form.resetFields();
        setModalOpen(true);
    };

    // ============================
    // Edit modal
    // ============================
    const openEdit = async (catId) => {
        try {
            setEditMode(true);
            const res = await api.get(`/category/${catId}`);
            const c = res.data.data;

            setSelectedCat(c);

            form.setFieldsValue({
                name_en: c?.name?.en || "",
                name_ar: c?.name?.ar || "",
            });

            setModalOpen(true);
        } catch (e) {
            console.error(e);
            message.error(isArabic ? "فشل جلب بيانات القسم" : "Failed to fetch category data");
        }
    };

    // ============================
    // Show Subcategories
    // ============================
    const showSub = async (catId) => {
        try {
            const res = await api.get(`/sub-categories?main_category=${catId}`);
            const list = res.data.data || [];
            setSubList(list);
            setSelectedCat(catId);
            setSubOpen(true);
        } catch (e) {
            console.error(e);
            message.error(isArabic ? "فشل جلب الأقسام الفرعية" : "Failed to fetch subcategories");
        }
    };

    // ============================
    // delete
    // ============================
    const deleteCat = async (id) => {
        try {
            await api.delete(`/category/${id}`);
            message.success(isArabic ? "تم حذف القسم بنجاح" : "Category deleted successfully");
            fetchCategories();
        } catch (e) {
            console.error(e);
            message.error(isArabic ? "فشل حذف القسم" : "Failed to delete category");
        }
    };

    // ============================
    // SUBMIT FORM (ADD + EDIT)
    // ============================
    const onSubmit = async (values) => {
        setSubmitLoading(true);
        try {
            const fd = new FormData();
            fd.append("name[en]", values.name_en);
            fd.append("name[ar]", values.name_ar);

            let file;
            if (values && values.icon) {
                if (values.icon.originFileObj) {
                    file = values.icon.originFileObj;
                } else if (values.icon.file && values.icon.file.originFileObj) {
                    file = values.icon.file.originFileObj;
                } else if (values.icon instanceof File) {
                    file = values.icon;
                } else {
                    file = values.icon;
                }
            }

            if (file && (file instanceof File || file instanceof Blob || file.originFileObj)) {
                fd.append("icon", file.originFileObj || file);
            }

            if (editMode && selectedCat) {
                await api.patch(`/category/${selectedCat.id}`, fd);
                message.success(isArabic ? "تم تحديث القسم بنجاح" : "Category updated successfully");
            } else {
                await api.post("/category", fd);
                message.success(isArabic ? "تم إضافة القسم بنجاح" : "Category added successfully");
            }

            setModalOpen(false);
            fetchCategories();
        } catch (e) {
            console.error(e);
            message.error(isArabic ? "حدث خطأ أثناء الحفظ" : "An error occurred while saving");
        } finally {
            setSubmitLoading(false);
        }
    };

    // ============================
    // SUB-CATEGORIES HANDLERS
    // ============================
    const openAddSub = () => {
        setSubEditMode(false);
        setSelectedSub(null);
        subForm.resetFields();
        setSubModal(true);
    };

    const openEditSub = (sub) => {
        setSubEditMode(true);
        setSelectedSub(sub);

        subForm.setFieldsValue({
            name_en: sub?.name?.en || "",
            name_ar: sub?.name?.ar || "",
        });

        setSubModal(true);
    };

    const submitSub = async (values) => {
        setSubmitLoading(true);
        try {
            const fd = new FormData();
            fd.append("name[en]", values.name_en);
            fd.append("name[ar]", values.name_ar);
            fd.append("main_category_id", selectedCat);

            let file;
            if (values && values.icon) {
                if (values.icon.originFileObj) {
                    file = values.icon.originFileObj;
                } else if (values.icon.file && values.icon.file.originFileObj) {
                    file = values.icon.file.originFileObj;
                } else if (values.icon instanceof File) {
                    file = values.icon;
                } else {
                    file = values.icon;
                }
            }

            if (file && (file instanceof File || file instanceof Blob || file.originFileObj)) {
                fd.append("icon", file.originFileObj || file);
            }

            if (subEditMode && selectedSub) {
                await api.patch(`/sub-categories/${selectedSub.id}`, fd);
                message.success(isArabic ? "تم تحديث القسم الفرعي بنجاح" : "Subcategory updated successfully");
            } else {
                await api.post("/sub-categories", fd);
                message.success(isArabic ? "تم إضافة القسم الفرعي بنجاح" : "Subcategory added successfully");
            }

            setSubModal(false);
            showSub(selectedCat);
        } catch (e) {
            console.error(e);
            message.error(isArabic ? "حدث خطأ أثناء حفظ القسم الفرعي" : "Error saving subcategory");
        } finally {
            setSubmitLoading(false);
        }
    };

    const deleteSub = async (id) => {
        try {
            await api.delete(`/sub-categories/${id}`);
            message.success(isArabic ? "تم حذف القسم الفرعي بنجاح" : "Subcategory deleted successfully");
            showSub(selectedCat);
        } catch (e) {
            console.error(e);
            message.error(isArabic ? "فشل حذف القسم الفرعي" : "Failed to delete subcategory");
        }
    };

    // ============================
    // MAIN TABLE COLUMNS
    // ============================
    const columns = [
        {
            title: isArabic ? "أيقونة القسم" : "Icon",
            key: "icon",
            width: 100,
            align: "center",
            render: (_, row) => (
                <CategoryIconDisplay 
                    source={row.icon || row.image || row.attach || row.imagePath || row.photo || row.logo || row.icon_path || row.images?.[0]?.attach || row.images?.[0] || row.categoryIcon} 
                    alt={row.name?.en || "cat"} 
                    isSub={false} 
                />
            )
        },
        {
            title: isArabic ? "اسم القسم (بالإنجليزية)" : "Name (English)",
            dataIndex: "name",
            key: "name_en",
            render: (n) => (
                <span className="font-bold text-slate-800 text-sm md:text-base block">
                    {n?.en || "-"}
                </span>
            )
        },
        {
            title: isArabic ? "اسم القسم (بالعربية)" : "Name (Arabic)",
            dataIndex: "name",
            key: "name_ar",
            render: (n) => (
                <span className="font-black text-[#1e3a8a] text-sm md:text-base block">
                    {n?.ar || "-"}
                </span>
            )
        },
        {
            title: isArabic ? "التصنيفات الفرعية" : "Subcategories",
            dataIndex: "id",
            key: "subcategories",
            align: "center",
            width: 220,
            render: (catId) => (
                <Button 
                    onClick={() => showSub(catId)} 
                    className="h-10 px-5 rounded-xl font-bold bg-blue-50 hover:bg-[#1e3a8a] text-[#1e3a8a] hover:text-white border border-blue-200/80 hover:border-[#1e3a8a] flex items-center justify-center gap-2 transition-all shadow-2xs mx-auto"
                >
                    <GitBranch size={16} />
                    <span>{isArabic ? "إدارة الأقسام الفرعية" : "Manage Subcategories"}</span>
                </Button>
            )
        },
        {
            title: isArabic ? "الإجراءات" : "Actions",
            key: "actions",
            align: "center",
            width: 170,
            render: (_, row) => (
                <div className="flex items-center justify-center gap-2">
                    <Button 
                        onClick={() => openEdit(row.id)}
                        className="w-9 h-9 rounded-xl border border-blue-200 bg-blue-50 text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white flex items-center justify-center transition-all p-0 shadow-2xs"
                        title={isArabic ? "تعديل القسم" : "Edit Category"}
                    >
                        <Edit3 size={15} />
                    </Button>
                    <Popconfirm 
                        title={isArabic ? "هل أنت متأكد من حذف هذا القسم؟" : "Are you sure you want to delete this category?"}
                        onConfirm={() => deleteCat(row.id)}
                        okText={isArabic ? "نعم، احذف" : "Yes, Delete"}
                        cancelText={isArabic ? "إلغاء" : "Cancel"}
                        okButtonProps={{ danger: true, className: "rounded-lg font-bold" }}
                        cancelButtonProps={{ className: "rounded-lg font-bold" }}
                    >
                        <Button 
                            danger 
                            className="w-9 h-9 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all p-0 shadow-2xs"
                            title={isArabic ? "حذف القسم" : "Delete Category"}
                        >
                            <Trash2 size={15} />
                        </Button>
                    </Popconfirm>
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <div className="w-full min-h-[550px] flex flex-col justify-center items-center gap-4 bg-slate-50/50 p-10">
                <Spin size="large" />
                <span className="text-sm font-bold text-[#1e3a8a] animate-pulse">
                    {isArabic ? "جاري تحميل الأقسام والتصنيفات الملكية..." : "Loading categories directory..."}
                </span>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-slate-50/50 min-h-screen" dir={isArabic ? "rtl" : "ltr"}>
            <ToastContainer theme="colored" />
            
            {/* Clean Modern Header Banner */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-2.5 h-full bg-gradient-to-b from-[#1e3a8a] to-blue-600"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3.5 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-2xl shrink-0 mt-1 shadow-2xs">
                            <FolderTree size={28} />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight m-0">
                                {isArabic ? "إدارة الأقسام والتصنيفات" : "Categories & Taxonomy Directory"}
                            </h1>
                            <p className="text-slate-500 text-xs md:text-sm mt-1.5 max-w-2xl leading-relaxed m-0">
                                {isArabic 
                                    ? "تحكم كامل في الأقسام الرئيسية والفرعية لمتجرك، إضافة أيقونات وتعديل المسميات باللغتين وتنظيم شجرة المنتجات باحترافية وسهولة." 
                                    : "Complete control over main and sub-categories, add custom icons, manage bilingual labels, and structure your catalog taxonomy seamlessly."}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={openAdd}
                        type="primary"
                        className="h-11 px-6 bg-[#1e3a8a] hover:bg-blue-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-[#1e3a8a]/20 hover:shadow-lg transition-all border-0 text-sm self-start md:self-center"
                    >
                        <Plus size={16} /> 
                        <span>{isArabic ? "إضافة قسم رئيسي جديد" : "Add New Main Category"}</span>
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-8">
                {/* Card 1 */}
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow hover:border-[#1e3a8a]/30 transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1e3a8a]" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center shrink-0">
                            <FolderTree size={24} />
                        </div>
                        <div>
                            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">{isArabic ? "الأقسام الرئيسية" : "Main Categories"}</span>
                            <span className="text-2xl font-black text-[#1e3a8a] mt-0.5 block">{categories.length}</span>
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow hover:border-[#1e3a8a]/30 transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1e3a8a]" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center shrink-0">
                            <GitBranch size={24} />
                        </div>
                        <div>
                            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">{isArabic ? "الهيكل والتصنيفات" : "Taxonomy Tree"}</span>
                            <span className="text-lg font-black text-[#1e3a8a] mt-1 block">{isArabic ? "متعدد المستويات" : "Multi-Level"}</span>
                        </div>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow hover:border-[#1e3a8a]/30 transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1e3a8a]" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center shrink-0">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">{isArabic ? "حالة المزامنة والنشاط" : "Sync & Status"}</span>
                            <span className="text-lg font-black text-[#1e3a8a] mt-1 block">{isArabic ? "نشط ومزامن 100%" : "100% Active"}</span>
                        </div>
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow hover:border-[#1e3a8a]/30 transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1e3a8a]" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center shrink-0">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">{isArabic ? "تحديث شجرة المنتجات" : "Catalog Indexing"}</span>
                            <span className="text-sm font-black text-[#1e3a8a] mt-1 block">{isArabic ? "تحديث فوري مباشر" : "Real-time Live"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Container Card */}
            <div className="bg-white p-6 rounded-3xl border border-blue-100/80 shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#1e3a8a] text-white flex items-center justify-center font-bold shadow-md shadow-[#1e3a8a]/25">
                            <FolderTree size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-800 m-0">
                                {isArabic ? "قائمة الأقسام الرئيسية المسجلة" : "Main Categories Directory"}
                            </h2>
                            <span className="text-xs text-slate-400 font-medium">
                                {isArabic ? `عرض كافة الأقسام الرئيسية (${categories.length} قسم)` : `Showing all registered main categories (${categories.length})`}
                            </span>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={fetchCategories} 
                        className="h-10 px-4 rounded-xl font-bold border-blue-200 text-[#1e3a8a] hover:bg-blue-50 flex items-center gap-2"
                    >
                        <span>{isArabic ? "تحديث القائمة" : "Refresh List"}</span>
                    </Button>
                </div>

                <Table 
                    columns={columns} 
                    dataSource={categories} 
                    rowKey="id" 
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        className: "mt-6 font-bold",
                    }}
                    className="overflow-x-auto" 
                />
            </div>

            {/* ======================
              ADD / EDIT MAIN CATEGORY MODAL
            ====================== */}
            <Modal
                title={
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-lg font-black text-slate-800">
                        <span className="p-2.5 rounded-xl bg-[#1e3a8a]/10 text-[#1e3a8a]">
                            <FolderTree size={18} />
                        </span>
                        <span>{editMode ? (isArabic ? "تعديل بيانات القسم الرئيسي" : "Edit Main Category") : (isArabic ? "إضافة قسم رئيسي جديد" : "Add New Main Category")}</span>
                    </div>
                }
                open={modalOpen}
                onOk={() => form.submit()}
                onCancel={() => setModalOpen(false)}
                confirmLoading={submitLoading}
                okText={editMode ? (isArabic ? "حفظ التعديلات" : "Save Changes") : (isArabic ? "إضافة القسم" : "Add Category")}
                cancelText={isArabic ? "إلغاء" : "Cancel"}
                okButtonProps={{ 
                    className: "bg-[#1e3a8a] hover:bg-blue-800 rounded-xl font-bold h-10 px-6 border-0 shadow-sm",
                    style: { backgroundColor: "#1e3a8a" }
                }}
                cancelButtonProps={{ className: "rounded-xl font-bold h-10 px-5" }}
                width={550}
                className="rounded-3xl overflow-hidden"
            >
                <Form form={form} layout="vertical" onFinish={onSubmit} className="pt-4 space-y-4">
                    <Form.Item 
                        name="name_en" 
                        label={<span className="font-bold text-slate-700">{isArabic ? "اسم القسم (بالإنجليزية) :" : "Category Name (English) :"}</span>} 
                        rules={[{ required: true, message: isArabic ? "يرجى إدخال الاسم بالإنجليزية" : "Please enter name in English" }]}
                    >
                        <Input className="h-11 rounded-xl font-medium border-slate-200 focus:border-[#1e3a8a]" placeholder={isArabic ? "مثال: Electronics or Bakery" : "e.g. Electronics or Bakery"} />
                    </Form.Item>

                    <Form.Item 
                        name="name_ar" 
                        label={<span className="font-bold text-slate-700">{isArabic ? "اسم القسم (بالعربية) :" : "Category Name (Arabic) :"}</span>} 
                        rules={[{ required: true, message: isArabic ? "يرجى إدخال الاسم بالعربية" : "Please enter name in Arabic" }]}
                    >
                        <Input className="h-11 rounded-xl font-medium border-slate-200 focus:border-[#1e3a8a]" placeholder={isArabic ? "مثال: الإلكترونيات أو المخبوزات" : "e.g. الإلكترونيات أو المخبوزات"} />
                    </Form.Item>

                    <Form.Item 
                        name="icon" 
                        label={<span className="font-bold text-slate-700">{isArabic ? "أيقونة أو صورة القسم :" : "Category Icon / Image :"}</span>}
                    >
                        <Upload 
                            beforeUpload={() => false} 
                            maxCount={1} 
                            listType="picture"
                            onChange={({ fileList }) => {
                                let list = fileList;
                                if (list.length > 1) {
                                    list = list.slice(-1);
                                }
                                form.setFieldsValue({ icon: list[0] });
                            }}
                        >
                            <Button className="h-11 px-5 rounded-xl border-blue-200 text-[#1e3a8a] hover:bg-blue-50 font-bold flex items-center gap-2">
                                <UploadIcon size={16} />
                                <span>{isArabic ? "اختر صورة الأيقونة من جهازك" : "Upload Icon File"}</span>
                            </Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>

            {/* ======================
              SUBCATEGORIES LIST MODAL
            ====================== */}
            <Modal
                title={
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 pr-2">
                        <div className="flex items-center gap-3">
                            <span className="p-2.5 rounded-xl bg-[#1e3a8a] text-white shadow-sm">
                                <GitBranch size={18} />
                            </span>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 m-0">
                                    {isArabic ? "إدارة الأقسام الفرعية التابعة" : "Manage Subcategories"}
                                </h3>
                                <span className="text-xs text-slate-400 font-medium">
                                    {isArabic ? `تفريعات القسم الرئيسي المحدد` : `Sub-branches of selected main category`}
                                </span>
                            </div>
                        </div>
                    </div>
                }
                open={subOpen}
                onCancel={() => setSubOpen(false)}
                footer={null}
                width={750}
                className="rounded-3xl overflow-hidden"
            >
                <div className="pt-3">
                    <div className="flex justify-between items-center mb-5 bg-blue-50/70 p-4 rounded-2xl border border-blue-100">
                        <span className="text-xs font-bold text-[#1e3a8a] flex items-center gap-2">
                            <FolderTree size={16} />
                            <span>{isArabic ? `إجمالي الأقسام الفرعية المسجلة: (${subList.length})` : `Total registered subcategories: (${subList.length})`}</span>
                        </span>
                        <Button
                            type="primary"
                            icon={<Plus size={16} />}
                            onClick={openAddSub}
                            className="h-10 px-5 bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm border-0"
                            style={{ backgroundColor: "#1e3a8a" }}
                        >
                            <span>{isArabic ? "إضافة قسم فرعي جديد" : "Add Subcategory"}</span>
                        </Button>
                    </div>

                    <Table
                        dataSource={subList}
                        rowKey="id"
                        pagination={{ pageSize: 6 }}
                        className="overflow-x-auto"
                        columns={[
                            {
                                title: isArabic ? "الأيقونة" : "Icon",
                                key: "icon",
                                width: 90,
                                align: "center",
                                render: (_, row) => (
                                    <CategoryIconDisplay 
                                        source={row.icon || row.image || row.attach || row.imagePath || row.photo || row.logo || row.icon_path || row.images?.[0]?.attach || row.images?.[0] || row.categoryIcon} 
                                        alt={row.name?.en || "sub"} 
                                        isSub={true} 
                                    />
                                )
                            },
                            {
                                title: isArabic ? "الاسم (بالإنجليزية)" : "Name (English)",
                                dataIndex: "name",
                                render: n => <span className="font-bold text-slate-700">{n?.en || "-"}</span>
                            },
                            {
                                title: isArabic ? "الاسم (بالعربية)" : "Name (Arabic)",
                                dataIndex: "name",
                                render: n => <span className="font-extrabold text-[#1e3a8a]">{n?.ar || "-"}</span>
                            },
                            {
                                title: isArabic ? "الإجراءات" : "Actions",
                                align: "center",
                                width: 140,
                                render: (_, row) => (
                                    <div className="flex items-center justify-center gap-2">
                                        <Button 
                                            onClick={() => openEditSub(row)} 
                                            className="w-8 h-8 rounded-lg border border-blue-200 bg-blue-50 text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white flex items-center justify-center transition-all p-0"
                                            title={isArabic ? "تعديل" : "Edit"}
                                        >
                                            <Edit3 size={13} />
                                        </Button>
                                        <Popconfirm
                                            title={isArabic ? "حذف القسم الفرعي؟" : "Delete Subcategory?"}
                                            onConfirm={() => deleteSub(row.id)}
                                            okText={isArabic ? "حذف" : "Delete"}
                                            cancelText={isArabic ? "إلغاء" : "Cancel"}
                                            okButtonProps={{ danger: true, className: "rounded-md font-bold" }}
                                            cancelButtonProps={{ className: "rounded-md font-bold" }}
                                        >
                                            <Button 
                                                danger 
                                                className="w-8 h-8 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all p-0"
                                                title={isArabic ? "حذف" : "Delete"}
                                            >
                                                <Trash2 size={13} />
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                )
                            }
                        ]}
                    />
                </div>
            </Modal>

            {/* ======================
              ADD / EDIT SUBCATEGORY MODAL
            ====================== */}
            <Modal
                title={
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-lg font-black text-slate-800">
                        <span className="p-2.5 rounded-xl bg-[#1e3a8a]/10 text-[#1e3a8a]">
                            <GitBranch size={18} />
                        </span>
                        <span>{subEditMode ? (isArabic ? "تعديل القسم الفرعي" : "Edit Subcategory") : (isArabic ? "إضافة قسم فرعي جديد" : "Add New Subcategory")}</span>
                    </div>
                }
                open={subModal}
                onCancel={() => setSubModal(false)}
                onOk={() => subForm.submit()}
                confirmLoading={submitLoading}
                okText={subEditMode ? (isArabic ? "حفظ التعديلات" : "Save Changes") : (isArabic ? "إضافة القسم الفرعي" : "Add Subcategory")}
                cancelText={isArabic ? "إلغاء" : "Cancel"}
                okButtonProps={{ 
                    className: "bg-[#1e3a8a] hover:bg-blue-800 rounded-xl font-bold h-10 px-6 border-0 shadow-sm",
                    style: { backgroundColor: "#1e3a8a" }
                }}
                cancelButtonProps={{ className: "rounded-xl font-bold h-10 px-5" }}
                width={500}
                className="rounded-3xl overflow-hidden"
            >
                <Form layout="vertical" form={subForm} onFinish={submitSub} className="pt-4 space-y-4">
                    <Form.Item 
                        name="name_en" 
                        label={<span className="font-bold text-slate-700">{isArabic ? "الاسم (بالإنجليزية) :" : "Name (English) :"}</span>} 
                        rules={[{ required: true, message: isArabic ? "مطلوب" : "Required" }]}
                    >
                        <Input className="h-11 rounded-xl font-medium border-slate-200 focus:border-[#1e3a8a]" placeholder="in English" />
                    </Form.Item>

                    <Form.Item 
                        name="name_ar" 
                        label={<span className="font-bold text-slate-700">{isArabic ? "الاسم (بالعربية) :" : "Name (Arabic) :"}</span>} 
                        rules={[{ required: true, message: isArabic ? "مطلوب" : "Required" }]}
                    >
                        <Input className="h-11 rounded-xl font-medium border-slate-200 focus:border-[#1e3a8a]" placeholder="بالعربية" />
                    </Form.Item>

                    <Form.Item 
                        name="icon" 
                        label={<span className="font-bold text-slate-700">{isArabic ? "صورة الأيقونة :" : "Icon Image :"}</span>}
                    >
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            listType="picture"
                            onChange={({ fileList }) => {
                                let list = fileList;
                                if (list.length > 1) {
                                    list = list.slice(-1);
                                }
                                subForm.setFieldsValue({ icon: list[0] });
                            }}
                        >
                            <Button className="h-11 px-5 rounded-xl border-blue-200 text-[#1e3a8a] hover:bg-blue-50 font-bold flex items-center gap-2">
                                <UploadIcon size={16} />
                                <span>{isArabic ? "اختر صورة الأيقونة" : "Upload Icon File"}</span>
                            </Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
