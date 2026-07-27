import { useState, useEffect } from "react";
import api from "../../Api/Api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    Card,
    Button,
    Spin,
    Form,
    Input,
    Modal,
    Switch,
    Tabs,
    Table,
    Select,
    Popconfirm,
    Tag,
    Empty,
    Tooltip as AntTooltip
} from "antd";
import { useTranslation } from "react-i18next";
import {
    Settings as SettingsIcon,
    Smartphone,
    PhoneCall,
    HelpCircle,
    ShieldCheck,
    RefreshCw,
    Edit3,
    Trash2,
    PlusCircle,
    ExternalLink,
    Mail,
    Phone,
    Globe,
    MessageSquare,
    Share2,
    CheckCircle2,
    AlertTriangle,
    FileText,
    Sparkles,
    Calendar,
    Power,
    HelpCircle as FaqIcon,
    ChevronDown,
    ChevronUp
} from "lucide-react";

const { TextArea } = Input;
const { Option } = Select;

export default function AppVersionSettings() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";
    const [form] = Form.useForm();
    const [contactForm] = Form.useForm();
    const [faqForm] = Form.useForm();
    const [policyForm] = Form.useForm();

    const [activeTab, setActiveTab] = useState("app_version");

    // --- State: App Version & Maintenance ---
    const [versionData, setVersionData] = useState(null);
    const [loadingVersion, setLoadingVersion] = useState(false);
    const [updatingVersion, setUpdatingVersion] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    // --- State: Contact Us ---
    const [contacts, setContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [addContactModal, setAddContactModal] = useState(false);

    // --- State: FAQ / Help Center ---
    const [faqs, setFaqs] = useState([]);
    const [loadingFaqs, setLoadingFaqs] = useState(false);
    const [faqModalOpen, setFaqModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [expandedFaq, setExpandedFaq] = useState(null);

    // --- State: Policies ---
    const [policies, setPolicies] = useState([]);
    const [loadingPolicies, setLoadingPolicies] = useState(false);
    const [policyModalOpen, setPolicyModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);

    // --- State: HTML Viewer Modal ---
    const [htmlModalOpen, setHtmlModalOpen] = useState(false);
    const [modalHtml, setModalHtml] = useState("");
    const [loadingHtml, setLoadingHtml] = useState(false);
    const [htmlTitle, setHtmlTitle] = useState("");

    // ==========================================
    // 1. FETCH & MANAGE APP VERSION
    // ==========================================
    const checkVersion = async () => {
        setLoadingVersion(true);
        try {
            const res = await api.get("/app-version/check");
            setVersionData(res.data?.data || res.data);
        } catch (err) {
            console.error("checkVersion error:", err);
            toast.error(t("general_settings.fetch_fail") || (isArabic ? "فشل في جلب بيانات إصدارات التطبيق" : "Failed to load app version info"));
        } finally {
            setLoadingVersion(false);
        }
    };

    const toggleAppStatus = async (checked) => {
        try {
            setUpdatingVersion(true);
            const res = await api.patch("/app-version/toggle-app-status");
            const newStatus = res.data?.isOpen !== undefined ? res.data.isOpen : checked;
            setVersionData(prev => ({ ...prev, isOpen: newStatus }));
            toast.success(
                newStatus 
                    ? (isArabic ? "🟢 تم تفعيل التطبيق وفتحه للجمهور بنجاح" : "🟢 App is now active and open to users") 
                    : (isArabic ? "🔴 تم إغلاق التطبيق وتفعيل وضع الصيانة" : "🔴 App is now closed (Maintenance Mode)")
            );
        } catch (err) {
            console.error("toggleAppStatus error:", err);
            toast.error(t("general_settings.status_fail") || (isArabic ? "فشل في تغيير حالة التطبيق" : "Failed to toggle app status"));
        } finally {
            setUpdatingVersion(false);
        }
    };

    const updateVersion = async (values) => {
        try {
            setUpdatingVersion(true);
            await api.put("/app-version/update", values);
            toast.success(t("general_settings.update_success") || (isArabic ? "تم تحديث بيانات إصدارات التطبيق والمتاجر بنجاح" : "App versions and store URLs updated successfully"));
            setShowUpdateModal(false);
            checkVersion();
        } catch (err) {
            console.error("updateVersion error:", err);
            toast.error(t("general_settings.update_fail") || (isArabic ? "فشل في تحديث بيانات الإصدار" : "Failed to update version info"));
        } finally {
            setUpdatingVersion(false);
        }
    };

    // ==========================================
    // 2. FETCH & MANAGE CONTACT US
    // ==========================================
    const fetchContacts = async () => {
        setLoadingContacts(true);
        try {
            const res = await api.get("/setting/contact-us");
            const data = res.data?.data || res.data;
            if (data && typeof data === "object") {
                // If backend returns object { email: "...", phone: "..." }, transform to array
                const arr = Object.entries(data).map(([k, v]) => ({ type: k, value: v }));
                setContacts(arr);
            } else if (Array.isArray(data)) {
                setContacts(data);
            } else {
                setContacts([]);
            }
        } catch (err) {
            console.error("fetchContacts error:", err);
            setContacts([]);
        } finally {
            setLoadingContacts(false);
        }
    };

    const handleAddContact = async (values) => {
        try {
            const res = await api.post("/setting/contact-us", values);
            if (res.status === 200 || res.data?.success) {
                toast.success(isArabic ? "تم حفظ قناة التواصل بنجاح" : "Contact channel saved successfully");
                setAddContactModal(false);
                contactForm.resetFields();
                fetchContacts();
            }
        } catch (err) {
            console.error("handleAddContact error:", err);
            toast.error(isArabic ? "فشل في حفظ بيانات التواصل" : "Failed to save contact info");
        }
    };

    const handleDeleteContact = async (type) => {
        try {
            await api.delete("/setting/contact-us/", { params: { value: type } });
            toast.success(isArabic ? "تم حذف قناة التواصل بنجاح" : "Contact channel deleted successfully");
            fetchContacts();
        } catch (err) {
            console.error("handleDeleteContact error:", err);
            toast.error(isArabic ? "فشل في حذف قناة التواصل" : "Failed to delete contact channel");
        }
    };

    // ==========================================
    // 3. FETCH & MANAGE FAQ / HELP CENTER
    // ==========================================
    const fetchFaqs = async () => {
        setLoadingFaqs(true);
        try {
            const res = await api.get("/setting/help-center");
            setFaqs(res.data?.data || res.data || []);
        } catch (err) {
            console.error("fetchFaqs error:", err);
            setFaqs([]);
        } finally {
            setLoadingFaqs(false);
        }
    };

    const handleSaveFaq = async (values) => {
        const body = {
            question: { en: values.question_en, ar: values.question_ar },
            answer: { en: values.answer_en, ar: values.answer_ar },
        };
        try {
            if (editingFaq) {
                await api.patch(`/setting/help-center/${editingFaq.id}`, body);
                toast.success(isArabic ? "تم تعديل السؤال الشائع بنجاح" : "FAQ updated successfully");
            } else {
                await api.post("/setting/help-center", body);
                toast.success(isArabic ? "تم إضافة السؤال الشائع بنجاح" : "FAQ added successfully");
            }
            setFaqModalOpen(false);
            setEditingFaq(null);
            faqForm.resetFields();
            fetchFaqs();
        } catch (err) {
            console.error("handleSaveFaq error:", err);
            toast.error(isArabic ? "فشل في حفظ السؤال الشائع" : "Failed to save FAQ");
        }
    };

    const handleDeleteFaq = async (id) => {
        try {
            await api.delete(`/setting/help-center/${id}`);
            toast.success(isArabic ? "تم حذف السؤال بنجاح" : "FAQ deleted successfully");
            fetchFaqs();
        } catch (err) {
            console.error("handleDeleteFaq error:", err);
            toast.error(isArabic ? "فشل في حذف السؤال" : "Failed to delete FAQ");
        }
    };

    // ==========================================
    // 4. FETCH & MANAGE POLICIES
    // ==========================================
    const fetchPolicies = async () => {
        setLoadingPolicies(true);
        try {
            const res = await api.get("/setting/policies");
            setPolicies(res.data?.data || res.data || []);
        } catch (err) {
            console.error("fetchPolicies error:", err);
            setPolicies([]);
        } finally {
            setLoadingPolicies(false);
        }
    };

    const handleSavePolicy = async (values) => {
        const body = {
            title: { en: values.title_en, ar: values.title_ar },
            content: { en: values.content_en, ar: values.content_ar },
        };
        try {
            if (editingPolicy) {
                await api.patch(`/setting/policies/${editingPolicy.id}`, body);
                toast.success(isArabic ? "تم تحديث السياسة القانونية بنجاح" : "Policy updated successfully");
            } else {
                await api.post("/setting/policies", body);
                toast.success(isArabic ? "تم إضافة السياسة القانونية بنجاح" : "Policy added successfully");
            }
            setPolicyModalOpen(false);
            setEditingPolicy(null);
            policyForm.resetFields();
            fetchPolicies();
        } catch (err) {
            console.error("handleSavePolicy error:", err);
            toast.error(isArabic ? "فشل في حفظ السياسة" : "Failed to save policy");
        }
    };

    const handleDeletePolicy = async (id) => {
        try {
            await api.delete(`/setting/policies/${id}`);
            toast.success(isArabic ? "تم حذف السياسة بنجاح" : "Policy deleted successfully");
            fetchPolicies();
        } catch (err) {
            console.error("handleDeletePolicy error:", err);
            toast.error(isArabic ? "فشل في حذف السياسة" : "Failed to delete policy");
        }
    };

    // ==========================================
    // 5. FETCH HTML VIEWER (Privacy / Deletion)
    // ==========================================
    const fetchHtmlPage = async (url, title) => {
        setHtmlTitle(title);
        setHtmlModalOpen(true);
        setLoadingHtml(true);
        setModalHtml("");
        try {
            const res = await api.get(url);
            setModalHtml(res.data || (isArabic ? "<p>لا توجد محتويات متاحة في الوقت الحالي</p>" : "<p>No content available at the moment</p>"));
        } catch (err) {
            console.error("fetchHtmlPage error:", err);
            toast.error(t("general_settings.fetch_fail") || (isArabic ? "فشل في جلب محتوى الصفحة القانونية" : "Failed to load policy page"));
            setModalHtml(isArabic ? "<p class='text-red-500 font-bold'>تعذر تحميل الصفحة من الخادم.</p>" : "<p class='text-red-500 font-bold'>Failed to load page from server.</p>");
        } finally {
            setLoadingHtml(false);
        }
    };

    // Load initial data based on active tab
    useEffect(() => {
        if (activeTab === "app_version") {
            checkVersion();
        } else if (activeTab === "contacts") {
            fetchContacts();
        } else if (activeTab === "faqs") {
            fetchFaqs();
        } else if (activeTab === "policies") {
            fetchPolicies();
        }
    }, [activeTab]);

    // Initial version fetch on mount
    useEffect(() => {
        checkVersion();
    }, []);

    // Icon helper for contacts
    const getContactIcon = (type) => {
        const t = (type || "").toLowerCase();
        if (t.includes("email") || t.includes("mail")) return <Mail size={18} className="text-indigo-600" />;
        if (t.includes("phone") || t.includes("tel")) return <Phone size={18} className="text-emerald-600" />;
        if (t.includes("whatsapp")) return <MessageSquare size={18} className="text-green-600" />;
        if (t.includes("web")) return <Globe size={18} className="text-blue-600" />;
        return <Share2 size={18} className="text-purple-600" />;
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50/60 min-h-screen" dir={isArabic ? "rtl" : "ltr"}>
            <ToastContainer theme="colored" position={isArabic ? "top-left" : "top-right"} autoClose={3000} />

            {/* Clean Modern Header Banner (Royal Sapphire & Indigo Theme #4f46e5) */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-2.5 h-full bg-gradient-to-b from-[#4f46e5] to-indigo-700"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3.5 bg-[#4f46e5]/10 text-[#4f46e5] rounded-2xl shrink-0 mt-1 shadow-2xs">
                            <SettingsIcon size={28} />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold border border-indigo-200/60 mb-2">
                                <Sparkles size={14} className="text-[#4f46e5]" />
                                <span>{isArabic ? "المنصة الشاملة لإدارة إعدادات النظام والتطبيقات (النسق الملكي النيلي)" : "Platform & App Configuration Center (Royal Indigo)"}</span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight m-0">
                                {isArabic ? "الإعدادات العامة، الإصدارات، وقنوات الدعم والسياسات" : "General Settings, App Versions & Legal Support"}
                            </h1>
                            <p className="text-slate-500 text-xs md:text-sm mt-1.5 max-w-2xl leading-relaxed m-0">
                                {isArabic
                                    ? "تحكم كامل في إصدارات تطبيق الجوال على Google Play و App Store، إدارة وضع الصيانة، إعداد قنوات التواصل الاجتماعي والدعم، تحرير الأسئلة الشائعة والسياسات القانونية للمتجر بسهولة واحترافية."
                                    : "Full control over mobile app versions on Google Play and App Store, manage maintenance mode, setup support & social channels, edit FAQs and legal policies seamlessly."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-center">
                        {versionData && (
                            <span className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black border shadow-2xs ${
                                versionData.isOpen ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                            }`}>
                                {versionData.isOpen ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-rose-600" />}
                                <span>{versionData.isOpen ? (isArabic ? "التطبيق نشط ومتاح" : "App is LIVE") : (isArabic ? "التطبيق في وضع الصيانة" : "Maintenance Mode")}</span>
                            </span>
                        )}
                        <Button
                            onClick={() => {
                                if (activeTab === "app_version") checkVersion();
                                else if (activeTab === "contacts") fetchContacts();
                                else if (activeTab === "faqs") fetchFaqs();
                                else if (activeTab === "policies") fetchPolicies();
                            }}
                            type="primary"
                            className="h-11 px-5 bg-[#4f46e5] hover:bg-[#3730a3] text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-[#4f46e5]/20 hover:shadow-lg transition-all border-0 text-sm"
                        >
                            <RefreshCw size={16} className={loadingVersion || loadingContacts || loadingFaqs || loadingPolicies ? "animate-spin" : ""} />
                            <span>{isArabic ? "تحديث البيانات" : "Refresh"}</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Interactive Tabs Layout */}
            <div className="bg-white p-6 rounded-3xl border border-indigo-100/80 shadow-md">
                <Tabs
                    activeKey={activeTab}
                    onChange={(k) => setActiveTab(k)}
                    type="card"
                    className="custom-indigo-tabs font-bold"
                    items={[
                        {
                            key: "app_version",
                            label: (
                                <span className="flex items-center gap-2 px-2 py-1 text-sm">
                                    <Smartphone size={16} className="text-[#4f46e5]" />
                                    <span>{isArabic ? "إصدارات التطبيق ووضع الصيانة" : "App Versions & Maintenance"}</span>
                                </span>
                            ),
                            children: (
                                <div className="pt-4 space-y-8">
                                    {loadingVersion ? (
                                        <div className="py-20 flex flex-col justify-center items-center gap-3">
                                            <Spin size="large" />
                                            <span className="text-sm font-bold text-[#4f46e5] animate-pulse">
                                                {isArabic ? "جاري فحص وإحضار بيانات إصدارات المتاجر..." : "Checking store app version data..."}
                                            </span>
                                        </div>
                                    ) : !versionData ? (
                                        <div className="py-12 text-center">
                                            <Empty description={isArabic ? "تعذر جلب بيانات الإصدارات" : "No version data loaded"} />
                                            <Button onClick={checkVersion} className="mt-4 h-10 px-6 rounded-xl bg-[#4f46e5] text-white hover:bg-[#3730a3] font-bold">
                                                {isArabic ? "إعادة المحاولة" : "Try Again"}
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Maintenance Mode Banner Card */}
                                            <div className={`p-6 rounded-2xl border-2 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                                                versionData.isOpen 
                                                    ? "bg-emerald-50/50 border-emerald-200/80" 
                                                    : "bg-rose-50/80 border-rose-300 shadow-md animate-pulse"
                                            }`}>
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-2xl ${versionData.isOpen ? "bg-emerald-500 text-white" : "bg-rose-600 text-white"} shadow-md shrink-0 mt-0.5`}>
                                                        <Power size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-slate-800 m-0">
                                                            {versionData.isOpen 
                                                                ? (isArabic ? "تطبيق الجوال نشط ومتاح لكافة العملاء" : "Mobile App is LIVE & Operational")
                                                                : (isArabic ? "تطبيق الجوال مغلق حالياً (وضع الصيانة الطارئ)" : "Mobile App is CLOSED (Emergency Maintenance Mode)")}
                                                        </h3>
                                                        <p className="text-slate-600 text-xs md:text-sm mt-1 max-w-xl m-0 font-medium leading-relaxed">
                                                            {versionData.isOpen
                                                                ? (isArabic ? "يمكن للمستخدمين الآن فتح التطبيق والتسوق وإتمام الطلبات بشكل طبيعي عبر المتاجر." : "Customers can open the app, browse products, and place orders normally.")
                                                                : (isArabic ? "تنبيه: سيظهر لجميع العملاء عند فتح التطبيق شاشة صيانة تمنعهم من الدخول أو إتمام الطلبات لحين إعادة تفعيله من هنا." : "Warning: Customers opening the app will see a maintenance screen blocking access until reactivated.")}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs shrink-0 self-end md:self-center">
                                                    <span className="text-xs font-black text-slate-700">
                                                        {versionData.isOpen ? (isArabic ? "حالة التشغيل: مفتوح" : "Status: Open") : (isArabic ? "حالة التشغيل: مغلق" : "Status: Closed")}
                                                    </span>
                                                    <Switch
                                                        checked={versionData.isOpen}
                                                        onChange={(val) => toggleAppStatus(val)}
                                                        loading={updatingVersion}
                                                        className={versionData.isOpen ? "bg-emerald-500" : "bg-slate-400"}
                                                    />
                                                </div>
                                            </div>

                                            {/* Side-by-Side Android & iOS Store Cards */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Android Card */}
                                                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow hover:border-emerald-300 transition-all relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-green-600" />
                                                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                                                <Smartphone size={24} />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-base font-black text-slate-800 m-0">{isArabic ? "إصدار متجر أندرويد (Google Play)" : "Android App (Google Play)"}</h4>
                                                                <span className="text-2xs font-bold text-slate-400">{isArabic ? "منصة نظام التشغيل Android" : "Android OS Platform"}</span>
                                                            </div>
                                                        </div>
                                                        <Tag color="green" className="font-extrabold px-2.5 py-1 text-xs rounded-lg m-0">
                                                            v{versionData.androidVersion || "1.0.0"}
                                                        </Tag>
                                                    </div>

                                                    <div className="space-y-3 my-5 text-sm font-semibold text-slate-700">
                                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                            <span className="text-slate-500 flex items-center gap-1.5">
                                                                <Calendar size={15} className="text-emerald-600" />
                                                                <span>{isArabic ? "مهلة الإجبار على التحديث:" : "Mandatory Deadline:"}</span>
                                                            </span>
                                                            <span className="font-bold text-slate-800">{versionData.androidEndDate || (isArabic ? "غير محدد" : "None")}</span>
                                                        </div>
                                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                                                            <span className="text-slate-500 text-xs truncate max-w-[220px]" dir="ltr">
                                                                {versionData.androidUrl || "https://play.google.com/..."}
                                                            </span>
                                                            {versionData.androidUrl && (
                                                                <a href={versionData.androidUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800 font-extrabold text-xs flex items-center gap-1 shrink-0">
                                                                    <span>{isArabic ? "فتح المتجر" : "Open Store"}</span>
                                                                    <ExternalLink size={12} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* iOS Card */}
                                                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow hover:border-blue-400 transition-all relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-700" />
                                                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                                <Smartphone size={24} />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-base font-black text-slate-800 m-0">{isArabic ? "إصدار متجر آبل (App Store)" : "iOS App (App Store)"}</h4>
                                                                <span className="text-2xs font-bold text-slate-400">{isArabic ? "منصة أجهزة Apple iOS" : "Apple iOS Platform"}</span>
                                                            </div>
                                                        </div>
                                                        <Tag color="blue" className="font-extrabold px-2.5 py-1 text-xs rounded-lg m-0">
                                                            v{versionData.iosVersion || "1.0.0"}
                                                        </Tag>
                                                    </div>

                                                    <div className="space-y-3 my-5 text-sm font-semibold text-slate-700">
                                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                            <span className="text-slate-500 flex items-center gap-1.5">
                                                                <Calendar size={15} className="text-blue-600" />
                                                                <span>{isArabic ? "مهلة الإجبار على التحديث:" : "Mandatory Deadline:"}</span>
                                                            </span>
                                                            <span className="font-bold text-slate-800">{versionData.iosEndDate || (isArabic ? "غير محدد" : "None")}</span>
                                                        </div>
                                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                                                            <span className="text-slate-500 text-xs truncate max-w-[220px]" dir="ltr">
                                                                {versionData.iosUrl || "https://apps.apple.com/..."}
                                                            </span>
                                                            {versionData.iosUrl && (
                                                                <a href={versionData.iosUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-extrabold text-xs flex items-center gap-1 shrink-0">
                                                                    <span>{isArabic ? "فتح المتجر" : "Open Store"}</span>
                                                                    <ExternalLink size={12} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Button to Open Edit Form */}
                                            <div className="flex justify-center pt-2">
                                                <Button
                                                    onClick={() => {
                                                        form.setFieldsValue({
                                                            androidVersion: versionData?.androidVersion || "",
                                                            androidEndDate: versionData?.androidEndDate || "",
                                                            androidUrl: versionData?.androidUrl || "",
                                                            iosVersion: versionData?.iosVersion || "",
                                                            iosEndDate: versionData?.iosEndDate || "",
                                                            iosUrl: versionData?.iosUrl || "",
                                                        });
                                                        setShowUpdateModal(true);
                                                    }}
                                                    type="primary"
                                                    className="h-12 px-8 bg-[#4f46e5] hover:bg-[#3730a3] text-white rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-[#4f46e5]/25 hover:scale-102 transition-all border-0"
                                                >
                                                    <Edit3 size={18} />
                                                    <span>{isArabic ? "تعديل أرقام الإصدارات، التواريخ وروابط المتاجر" : "Edit Store Versions, Deadlines & Store URLs"}</span>
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ),
                        },
                        {
                            key: "contacts",
                            label: (
                                <span className="flex items-center gap-2 px-2 py-1 text-sm">
                                    <PhoneCall size={16} className="text-emerald-600" />
                                    <span>{isArabic ? "قنوات التواصل والدعم الفني" : "Contact & Support Channels"}</span>
                                </span>
                            ),
                            children: (
                                <div className="pt-4 space-y-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-base font-black text-slate-800 m-0">{isArabic ? "قنوات الاتصال المتاحة للجمهور داخل التطبيق" : "Public Contact & Support Channels"}</h3>
                                            <span className="text-xs text-slate-500">{isArabic ? "تظهر هذه الروابط والأرقام في صفحة تواصل معنا داخل تطبيق الجوال" : "These contacts appear in the 'Contact Us' screen in the mobile app"}</span>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                contactForm.resetFields();
                                                setAddContactModal(true);
                                            }}
                                            type="primary"
                                            className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 border-0 shadow-sm"
                                        >
                                            <PlusCircle size={16} />
                                            <span>{isArabic ? "إضافة قناة تواصل جديدة" : "Add Contact Channel"}</span>
                                        </Button>
                                    </div>

                                    {loadingContacts ? (
                                        <div className="py-16 flex justify-center items-center"><Spin size="large" /></div>
                                    ) : contacts.length === 0 ? (
                                        <Empty description={isArabic ? "لا توجد قنوات تواصل مسجلة حالياً" : "No contact channels found"} />
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {contacts.map((c, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow hover:border-[#4f46e5]/30 transition-all flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3.5 min-w-0">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                            {getContactIcon(c.type)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block capitalize">
                                                                {c.type || "Contact"}
                                                            </span>
                                                            <span className="font-black text-slate-800 text-sm block truncate mt-0.5" dir="ltr">
                                                                {c.value || "-"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Popconfirm
                                                        title={isArabic ? "هل أنت متأكد من حذف هذه القناة؟" : "Delete this contact?"}
                                                        onConfirm={() => handleDeleteContact(c.type)}
                                                        okText={isArabic ? "نعم، احذف" : "Yes"}
                                                        cancelText={isArabic ? "إلغاء" : "No"}
                                                        okButtonProps={{ danger: true }}
                                                    >
                                                        <Button danger type="text" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rose-50">
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </Popconfirm>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ),
                        },
                        {
                            key: "faqs",
                            label: (
                                <span className="flex items-center gap-2 px-2 py-1 text-sm">
                                    <HelpCircle size={16} className="text-amber-600" />
                                    <span>{isArabic ? "مركز المساعدة والأسئلة الشائعة" : "Help Center & FAQs"}</span>
                                </span>
                            ),
                            children: (
                                <div className="pt-4 space-y-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-base font-black text-slate-800 m-0">{isArabic ? "إدارة أسئلة وأجوبة مركز المساعدة (Help Center)" : "Manage FAQ Questions & Answers"}</h3>
                                            <span className="text-xs text-slate-500">{isArabic ? "تظهر هذه الأسئلة للعملاء باللغتين العربية والإنجليزية لإرشادهم وحل استفساراتهم" : "Displayed to users in Arabic & English to assist and resolve inquiries"}</span>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                setEditingFaq(null);
                                                faqForm.resetFields();
                                                setFaqModalOpen(true);
                                            }}
                                            type="primary"
                                            className="h-10 px-5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-2 border-0 shadow-sm"
                                        >
                                            <PlusCircle size={16} />
                                            <span>{isArabic ? "إضافة سؤال شائع جديد" : "Add New FAQ"}</span>
                                        </Button>
                                    </div>

                                    {loadingFaqs ? (
                                        <div className="py-16 flex justify-center items-center"><Spin size="large" /></div>
                                    ) : faqs.length === 0 ? (
                                        <Empty description={isArabic ? "لا توجد أسئلة شائعة مسجلة حالياً" : "No FAQs recorded yet"} />
                                    ) : (
                                        <div className="space-y-3">
                                            {faqs.map((faq) => {
                                                const isExp = expandedFaq === faq.id;
                                                return (
                                                    <div key={faq.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all">
                                                        <div 
                                                            onClick={() => setExpandedFaq(isExp ? null : faq.id)}
                                                            className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="p-2 rounded-xl bg-amber-50 text-amber-700 font-bold">
                                                                    <FaqIcon size={18} />
                                                                </span>
                                                                <div>
                                                                    <h4 className="text-sm md:text-base font-black text-slate-800 m-0">
                                                                        {isArabic ? (faq.question?.ar || faq.question?.en) : (faq.question?.en || faq.question?.ar)}
                                                                    </h4>
                                                                    <span className="text-2xs text-slate-400 font-semibold block mt-0.5">
                                                                        {isArabic ? `بالانجليزية: ${faq.question?.en || "-"}` : `Arabic: ${faq.question?.ar || "-"}`}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                                <Button
                                                                    onClick={() => {
                                                                        setEditingFaq(faq);
                                                                        faqForm.setFieldsValue({
                                                                            question_en: faq.question?.en || "",
                                                                            question_ar: faq.question?.ar || "",
                                                                            answer_en: faq.answer?.en || "",
                                                                            answer_ar: faq.answer?.ar || "",
                                                                        });
                                                                        setFaqModalOpen(true);
                                                                    }}
                                                                    size="small"
                                                                    className="h-8 px-2.5 rounded-lg border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs"
                                                                >
                                                                    <Edit3 size={13} />
                                                                </Button>
                                                                <Popconfirm
                                                                    title={isArabic ? "هل أنت متأكد من حذف هذا السؤال؟" : "Delete this FAQ?"}
                                                                    onConfirm={() => handleDeleteFaq(faq.id)}
                                                                    okText={isArabic ? "نعم، احذف" : "Yes"}
                                                                    cancelText={isArabic ? "إلغاء" : "No"}
                                                                    okButtonProps={{ danger: true }}
                                                                >
                                                                    <Button danger size="small" className="h-8 px-2 rounded-lg">
                                                                        <Trash2 size={13} />
                                                                    </Button>
                                                                </Popconfirm>
                                                                <span className="p-1 text-slate-400">
                                                                    {isExp ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {isExp && (
                                                            <div className="p-4 bg-slate-50/80 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 leading-relaxed">
                                                                <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                                                                    <span className="text-2xs font-extrabold text-amber-700 uppercase tracking-wider block mb-1">
                                                                        {isArabic ? "الإجابة باللغة العربية (AR):" : "Arabic Answer (AR):"}
                                                                    </span>
                                                                    <p className="m-0 text-slate-800 font-bold">{faq.answer?.ar || (isArabic ? "بدون إجابة" : "No answer")}</p>
                                                                </div>
                                                                <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs" dir="ltr">
                                                                    <span className="text-2xs font-extrabold text-indigo-700 uppercase tracking-wider block mb-1">
                                                                        {isArabic ? "الإجابة باللغة الإنجليزية (EN):" : "English Answer (EN):"}
                                                                    </span>
                                                                    <p className="m-0 text-slate-800 font-bold">{faq.answer?.en || "No answer"}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ),
                        },
                        {
                            key: "policies",
                            label: (
                                <span className="flex items-center gap-2 px-2 py-1 text-sm">
                                    <ShieldCheck size={16} className="text-blue-600" />
                                    <span>{isArabic ? "السياسات القانونية والشروط" : "Legal Policies & Terms"}</span>
                                </span>
                            ),
                            children: (
                                <div className="pt-4 space-y-8">
                                    {/* Quick Official Links Box */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-200/70 shadow-2xs">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-base font-black text-[#4f46e5] m-0 flex items-center gap-2">
                                                    <FileText size={18} />
                                                    <span>{isArabic ? "صفحات السياسات القانونية المعتمدة لمتجر جوجل وآبل" : "Official Legal Policy Links (For Apple & Google Play)"}</span>
                                                </h4>
                                                <p className="text-slate-600 text-xs mt-1 m-0 font-medium max-w-xl">
                                                    {isArabic
                                                        ? "يمكنك معاينة صفحات سياسة الخصوصية وحذف الحساب بالصيغة القانونية المعتمدة والتي يتم ربطها مباشرة داخل المتاجر."
                                                        : "Preview the official legal HTML pages for Privacy Policy and Account Deletion integrated directly with app stores."}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <Button
                                                    onClick={() => fetchHtmlPage("/app-version/privacy-policy-link", isArabic ? "وثيقة سياسة الخصوصية (Privacy Policy)" : "Privacy Policy Document")}
                                                    className="h-10 px-5 bg-white hover:bg-[#4f46e5] hover:text-white text-[#4f46e5] border border-[#4f46e5]/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                                                >
                                                    <ShieldCheck size={15} />
                                                    <span>{isArabic ? "معاينة سياسة الخصوصية" : "Privacy Policy"}</span>
                                                </Button>
                                                <Button
                                                    onClick={() => fetchHtmlPage("/app-version/deletion-link", isArabic ? "وثيقة سياسة حذف الحساب والبيانات (Account Deletion)" : "Account Deletion Policy")}
                                                    className="h-10 px-5 bg-white hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                                                >
                                                    <Trash2 size={15} />
                                                    <span>{isArabic ? "معاينة سياسة حذف الحساب" : "Deletion Policy"}</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dynamic Policies Management */}
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-100">
                                            <div>
                                                <h3 className="text-base font-black text-slate-800 m-0">{isArabic ? "إدارة الشروط والبنود القانونية المخصصة" : "Manage Dynamic Legal Terms & Policies"}</h3>
                                                <span className="text-xs text-slate-500">{isArabic ? "أضف أو عدل بنود الاستخدام والشروط باللغتين العربية والإنجليزية" : "Add or edit custom terms of use in Arabic & English"}</span>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    setEditingPolicy(null);
                                                    policyForm.resetFields();
                                                    setPolicyModalOpen(true);
                                                }}
                                                type="primary"
                                                className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 border-0 shadow-sm"
                                            >
                                                <PlusCircle size={16} />
                                                <span>{isArabic ? "إضافة بند قانوني جديد" : "Add Legal Policy"}</span>
                                            </Button>
                                        </div>

                                        {loadingPolicies ? (
                                            <div className="py-16 flex justify-center items-center"><Spin size="large" /></div>
                                        ) : policies.length === 0 ? (
                                            <Empty description={isArabic ? "لا توجد بنود قانونية مخصصة مسجلة حالياً" : "No custom policies recorded yet"} />
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {policies.map((p) => (
                                                    <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow transition-all flex flex-col justify-between gap-4">
                                                        <div>
                                                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 mb-2">
                                                                <h4 className="text-base font-black text-[#4f46e5] m-0 truncate">
                                                                    {isArabic ? (p.title?.ar || p.title?.en) : (p.title?.en || p.title?.ar)}
                                                                </h4>
                                                                <span className="text-2xs font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                                                                    ID: #{p.id}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 font-semibold line-clamp-3 leading-relaxed m-0">
                                                                {isArabic ? (p.content?.ar || p.content?.en) : (p.content?.en || p.content?.ar)}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                                            <Button
                                                                onClick={() => {
                                                                    setEditingPolicy(p);
                                                                    policyForm.setFieldsValue({
                                                                        title_en: p.title?.en || "",
                                                                        title_ar: p.title?.ar || "",
                                                                        content_en: p.content?.en || "",
                                                                        content_ar: p.content?.ar || "",
                                                                    });
                                                                    setPolicyModalOpen(true);
                                                                }}
                                                                size="small"
                                                                className="h-8 px-3 rounded-lg border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs flex items-center gap-1"
                                                            >
                                                                <Edit3 size={13} />
                                                                <span>{isArabic ? "تعديل" : "Edit"}</span>
                                                            </Button>
                                                            <Popconfirm
                                                                title={isArabic ? "هل أنت متأكد من حذف هذا البند؟" : "Delete this policy?"}
                                                                onConfirm={() => handleDeletePolicy(p.id)}
                                                                okText={isArabic ? "نعم، احذف" : "Yes"}
                                                                cancelText={isArabic ? "إلغاء" : "No"}
                                                                okButtonProps={{ danger: true }}
                                                            >
                                                                <Button danger size="small" className="h-8 px-2.5 rounded-lg flex items-center gap-1 font-bold text-xs">
                                                                    <Trash2 size={13} />
                                                                    <span>{isArabic ? "حذف" : "Delete"}</span>
                                                                </Button>
                                                            </Popconfirm>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>

            {/* ==========================================
                MODAL 1: UPDATE APP VERSIONS & STORES
            ========================================== */}
            <Modal
                title={
                    <div className="flex items-center gap-2.5 text-[#4f46e5] font-black text-lg pb-3 border-b border-slate-100">
                        <Smartphone size={22} />
                        <span>{isArabic ? "تحديث أرقام الإصدارات وروابط المتاجر" : "Update App Versions & Store URLs"}</span>
                    </div>
                }
                open={showUpdateModal}
                onCancel={() => setShowUpdateModal(false)}
                footer={null}
                width={700}
                className="rounded-3xl overflow-hidden"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={updateVersion}
                    className="pt-3 font-bold"
                >
                    <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 mb-6">
                        <h4 className="text-sm font-black text-emerald-800 m-0 mb-3 flex items-center gap-2">
                            <Smartphone size={16} />
                            <span>{isArabic ? "إعدادات متجر أندرويد (Google Play)" : "Android Store Settings"}</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Form.Item label={isArabic ? "رقم إصدار الأندرويد (مثل 1.2.0)" : "Android Version"} name="androidVersion" rules={[{ required: true }]}>
                                <Input placeholder="1.0.0" className="h-10 rounded-xl font-semibold text-xs" />
                            </Form.Item>
                            <Form.Item label={isArabic ? "تاريخ إجبار التحديث (YYYY-MM-DD)" : "Mandatory Deadline"} name="androidEndDate">
                                <Input placeholder="2026-12-31" className="h-10 rounded-xl font-semibold text-xs" />
                            </Form.Item>
                        </div>
                        <Form.Item label={isArabic ? "رابط تحميل التطبيق من متجر Google Play" : "Google Play Store URL"} name="androidUrl" className="m-0">
                            <Input placeholder="https://play.google.com/store/apps/details?id=..." className="h-10 rounded-xl font-semibold text-xs" dir="ltr" />
                        </Form.Item>
                    </div>

                    <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 mb-6">
                        <h4 className="text-sm font-black text-blue-800 m-0 mb-3 flex items-center gap-2">
                            <Smartphone size={16} />
                            <span>{isArabic ? "إعدادات متجر آبل (App Store)" : "iOS Store Settings"}</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Form.Item label={isArabic ? "رقم إصدار الآيفون (مثل 1.2.0)" : "iOS Version"} name="iosVersion" rules={[{ required: true }]}>
                                <Input placeholder="1.0.0" className="h-10 rounded-xl font-semibold text-xs" />
                            </Form.Item>
                            <Form.Item label={isArabic ? "تاريخ إجبار التحديث (YYYY-MM-DD)" : "Mandatory Deadline"} name="iosEndDate">
                                <Input placeholder="2026-12-31" className="h-10 rounded-xl font-semibold text-xs" />
                            </Form.Item>
                        </div>
                        <Form.Item label={isArabic ? "رابط تحميل التطبيق من متجر Apple App Store" : "App Store URL"} name="iosUrl" className="m-0">
                            <Input placeholder="https://apps.apple.com/app/id..." className="h-10 rounded-xl font-semibold text-xs" dir="ltr" />
                        </Form.Item>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <Button onClick={() => setShowUpdateModal(false)} className="h-10 px-5 rounded-xl font-bold">
                            {isArabic ? "إلغاء" : "Cancel"}
                        </Button>
                        <Button type="primary" htmlType="submit" loading={updatingVersion} className="h-10 px-6 rounded-xl bg-[#4f46e5] hover:bg-[#3730a3] font-bold border-0">
                            {isArabic ? "حفظ كافة التغييرات" : "Save Changes"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* ==========================================
                MODAL 2: ADD CONTACT CHANNEL
            ========================================== */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-emerald-700 font-black text-base pb-3 border-b border-slate-100">
                        <PhoneCall size={20} />
                        <span>{isArabic ? "إضافة قناة تواصل أو دعم فني" : "Add Contact Channel"}</span>
                    </div>
                }
                open={addContactModal}
                onCancel={() => setAddContactModal(false)}
                footer={null}
                width={500}
                className="rounded-3xl overflow-hidden"
            >
                <Form
                    form={contactForm}
                    layout="vertical"
                    onFinish={handleAddContact}
                    className="pt-3 font-bold"
                >
                    <Form.Item label={isArabic ? "نوع القناة أو المنصة" : "Channel Type"} name="type" rules={[{ required: true }]}>
                        <Select placeholder={isArabic ? "اختر المنصة..." : "Select type..."} className="h-10 font-bold text-xs" popupClassName="font-bold">
                            <Option value="email">📧 البريد الإلكتروني (Email)</Option>
                            <Option value="phone">📞 رقم الهاتف الخط الساخن (Phone)</Option>
                            <Option value="whatsapp">💬 واتساب الدعم السريع (WhatsApp)</Option>
                            <Option value="facebook">📘 فيسبوك (Facebook)</Option>
                            <Option value="instagram">📸 إنستغرام (Instagram)</Option>
                            <Option value="tiktok">🎵 تيك توك (TikTok)</Option>
                            <Option value="twitter">🐦 تويتر / X (Twitter)</Option>
                            <Option value="website">🌐 الموقع الرسمي (Website)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label={isArabic ? "الرابط، رقم الهاتف أو البريد الإلكتروني" : "Value / URL / Number"} name="value" rules={[{ required: true }]}>
                        <Input placeholder={isArabic ? "أدخل الرابط أو الرقم هنا..." : "Enter URL or Phone..."} className="h-10 rounded-xl font-semibold text-xs" dir="ltr" />
                    </Form.Item>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                        <Button onClick={() => setAddContactModal(false)} className="h-10 px-5 rounded-xl font-bold">
                            {isArabic ? "إلغاء" : "Cancel"}
                        </Button>
                        <Button type="primary" htmlType="submit" className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold border-0">
                            {isArabic ? "حفظ القناة" : "Save Channel"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* ==========================================
                MODAL 3: ADD / EDIT FAQ
            ========================================== */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-amber-700 font-black text-base pb-3 border-b border-slate-100">
                        <HelpCircle size={20} />
                        <span>{editingFaq ? (isArabic ? "تعديل السؤال الشائع" : "Edit FAQ") : (isArabic ? "إضافة سؤال شائع جديد" : "Add New FAQ")}</span>
                    </div>
                }
                open={faqModalOpen}
                onCancel={() => {
                    setFaqModalOpen(false);
                    setEditingFaq(null);
                }}
                footer={null}
                width={650}
                className="rounded-3xl overflow-hidden"
            >
                <Form
                    form={faqForm}
                    layout="vertical"
                    onFinish={handleSaveFaq}
                    className="pt-3 font-bold"
                >
                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 mb-4 space-y-3">
                        <span className="text-2xs font-extrabold text-amber-800 uppercase block">{isArabic ? "السؤال والإجابة باللغة العربية (AR)" : "Arabic Question & Answer (AR)"}</span>
                        <Form.Item label={isArabic ? "نص السؤال (عربي)" : "Question (Arabic)"} name="question_ar" rules={[{ required: true }]} className="m-0 mb-3">
                            <Input placeholder="مثال: كيف أستطيع تتبع طلبي؟" className="h-10 rounded-xl font-semibold text-xs" />
                        </Form.Item>
                        <Form.Item label={isArabic ? "الإجابة التفصيلية (عربي)" : "Answer (Arabic)"} name="answer_ar" rules={[{ required: true }]} className="m-0">
                            <TextArea rows={3} placeholder="أدخل الإجابة هنا..." className="rounded-xl font-semibold text-xs" />
                        </Form.Item>
                    </div>

                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mb-6 space-y-3" dir="ltr">
                        <span className="text-2xs font-extrabold text-indigo-800 uppercase block">{isArabic ? "السؤال والإجابة باللغة الإنجليزية (EN)" : "English Question & Answer (EN)"}</span>
                        <Form.Item label={isArabic ? "نص السؤال (إنجليزي)" : "Question (English)"} name="question_en" rules={[{ required: true }]} className="m-0 mb-3">
                            <Input placeholder="e.g.: How can I track my order?" className="h-10 rounded-xl font-semibold text-xs" />
                        </Form.Item>
                        <Form.Item label={isArabic ? "الإجابة التفصيلية (إنجليزي)" : "Answer (English)"} name="answer_en" rules={[{ required: true }]} className="m-0">
                            <TextArea rows={3} placeholder="Enter answer in English..." className="rounded-xl font-semibold text-xs" />
                        </Form.Item>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100" dir={isArabic ? "rtl" : "ltr"}>
                        <Button onClick={() => { setFaqModalOpen(false); setEditingFaq(null); }} className="h-10 px-5 rounded-xl font-bold">
                            {isArabic ? "إلغاء" : "Cancel"}
                        </Button>
                        <Button type="primary" htmlType="submit" className="h-10 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 font-bold border-0">
                            {isArabic ? "حفظ السؤال والجواب" : "Save FAQ"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* ==========================================
                MODAL 4: ADD / EDIT POLICY
            ========================================== */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-blue-700 font-black text-base pb-3 border-b border-slate-100">
                        <ShieldCheck size={20} />
                        <span>{editingPolicy ? (isArabic ? "تعديل البند القانوني" : "Edit Legal Policy") : (isArabic ? "إضافة بند قانوني جديد" : "Add Legal Policy")}</span>
                    </div>
                }
                open={policyModalOpen}
                onCancel={() => {
                    setPolicyModalOpen(false);
                    setEditingPolicy(null);
                }}
                footer={null}
                width={650}
                className="rounded-3xl overflow-hidden"
            >
                <Form
                    form={policyForm}
                    layout="vertical"
                    onFinish={handleSavePolicy}
                    className="pt-3 font-bold"
                >
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-4 space-y-3">
                        <span className="text-2xs font-extrabold text-blue-800 uppercase block">{isArabic ? "عنوان البند والتفاصيل بالعربية (AR)" : "Arabic Title & Content (AR)"}</span>
                        <Form.Item label={isArabic ? "عنوان البند (عربي)" : "Title (Arabic)"} name="title_ar" rules={[{ required: true }]} className="m-0 mb-3">
                            <Input placeholder="مثال: سياسة الاسترجاع واسترداد الأموال" className="h-10 rounded-xl font-semibold text-xs" />
                        </Form.Item>
                        <Form.Item label={isArabic ? "نص البند القانوني (عربي)" : "Content (Arabic)"} name="content_ar" rules={[{ required: true }]} className="m-0">
                            <TextArea rows={4} placeholder="أدخل الشروط والتفاصيل هنا..." className="rounded-xl font-semibold text-xs" />
                        </Form.Item>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 space-y-3" dir="ltr">
                        <span className="text-2xs font-extrabold text-slate-700 uppercase block">{isArabic ? "عنوان البند والتفاصيل بالإنجليزية (EN)" : "English Title & Content (EN)"}</span>
                        <Form.Item label={isArabic ? "عنوان البند (إنجليزي)" : "Title (English)"} name="title_en" rules={[{ required: true }]} className="m-0 mb-3">
                            <Input placeholder="e.g.: Return & Refund Policy" className="h-10 rounded-xl font-semibold text-xs" />
                        </Form.Item>
                        <Form.Item label={isArabic ? "نص البند القانوني (إنجليزي)" : "Content (English)"} name="content_en" rules={[{ required: true }]} className="m-0">
                            <TextArea rows={4} placeholder="Enter policy content in English..." className="rounded-xl font-semibold text-xs" />
                        </Form.Item>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100" dir={isArabic ? "rtl" : "ltr"}>
                        <Button onClick={() => { setPolicyModalOpen(false); setEditingPolicy(null); }} className="h-10 px-5 rounded-xl font-bold">
                            {isArabic ? "إلغاء" : "Cancel"}
                        </Button>
                        <Button type="primary" htmlType="submit" className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold border-0">
                            {isArabic ? "حفظ البند القانوني" : "Save Policy"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* ==========================================
                MODAL 5: HTML VIEWER (Privacy & Deletion)
            ========================================== */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-[#4f46e5] font-black text-base pb-3 border-b border-slate-100">
                        <FileText size={20} />
                        <span>{htmlTitle || (isArabic ? "المستند القانوني الرسمي" : "Official Legal Document")}</span>
                    </div>
                }
                open={htmlModalOpen}
                onCancel={() => setHtmlModalOpen(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setHtmlModalOpen(false)}
                        className="h-10 px-6 bg-[#4f46e5] hover:bg-[#3730a3] text-white font-bold rounded-xl border-0"
                        style={{ backgroundColor: "#4f46e5" }}
                    >
                        {isArabic ? "إغلاق النافذة" : "Close Document"}
                    </Button>,
                ]}
                width={850}
                className="rounded-3xl overflow-hidden"
            >
                {loadingHtml ? (
                    <div className="py-20 flex flex-col justify-center items-center gap-3">
                        <Spin size="large" />
                        <span className="text-sm font-bold text-[#4f46e5]">
                            {isArabic ? "جاري تحميل المستند الرسمي من السيرفر..." : "Loading document from server..."}
                        </span>
                    </div>
                ) : (
                    <div 
                        className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 max-h-[60vh] overflow-y-auto prose prose-sm max-w-none text-slate-800 leading-relaxed font-medium"
                        dangerouslySetInnerHTML={{ __html: modalHtml }} 
                    />
                )}
            </Modal>
        </div>
    );
}
