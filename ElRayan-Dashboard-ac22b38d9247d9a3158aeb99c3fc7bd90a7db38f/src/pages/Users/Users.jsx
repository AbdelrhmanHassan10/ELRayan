import { useEffect, useState, useMemo } from "react";
import api from "../../Api/Api";
import {
    Table,
    Input,
    Button,
    Modal,
    Tag,
    Pagination,
    Spin,
    Avatar,
    message,
    Select,
    Empty
} from "antd";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import {
    Users as UsersIcon,
    UserCheck,
    UserX,
    UserPlus,
    Search,
    Filter,
    RotateCcw,
    Eye,
    TrendingUp,
    ShieldAlert,
    CheckCircle2,
    Trash2,
    RefreshCw,
    Sparkles,
    Mail,
    Phone,
    Calendar,
    MapPin,
    ShoppingBag,
    DollarSign,
    Award,
    Clock,
    ArrowUpDown,
    Shield
} from "lucide-react";

const { Option } = Select;

export default function UsersPage() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";

    const [users, setUsers] = useState([]);
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Filter & Sort States
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [genderFilter, setGenderFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    // Modals
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [analysis, setAnalysis] = useState(null);
    const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch Users & Statistics in parallel
    const fetchUsers = async () => {
        setLoading(true);
        try {
            // When filtering client-side, let's fetch a slightly larger batch to ensure good filtering
            const isFiltering = roleFilter !== "all" || statusFilter !== "all" || genderFilter !== "all" || searchQuery.trim() !== "";
            const fetchLimit = isFiltering ? 100 : limit;
            const fetchPage = isFiltering ? 1 : page;

            const params = {
                page: fetchPage,
                limit: fetchLimit,
                sortOrder: "DESC",
            };
            if (searchQuery.trim()) {
                params.keyword = searchQuery.trim();
            }

            const [usersRes, statsRes] = await Promise.all([
                api.get(`/user`, { params }),
                api.get(`/user/dashboard/statistics`).catch(() => null)
            ]);

            const items = usersRes.data?.data?.items || [];
            const meta = usersRes.data?.data?.metadata || {};
            const fetchedTotal = meta.totalItems || meta.totalCount || items.length || 0;

            setUsers(items);
            setTotalItems(fetchedTotal);

            if (statsRes?.data?.data?.statistics) {
                setStatsData(statsRes.data.data.statistics);
            }
        } catch (err) {
            console.error("fetchUsers error:", err);
            toast.error(t("users.fetch_fail") || (isArabic ? "فشل في جلب قائمة المستخدمين" : "Failed to fetch users list"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, limit, roleFilter, statusFilter, genderFilter, sortBy]);

    const handleSearchSubmit = () => {
        setPage(1);
        fetchUsers();
    };

    const resetFilters = () => {
        setSearchQuery("");
        setRoleFilter("all");
        setStatusFilter("all");
        setGenderFilter("all");
        setSortBy("newest");
        setPage(1);
    };

    // Calculate logical statistics (Fallback to items if backend stats absent)
    const computedTotalUsers = useMemo(() => {
        return statsData?.totalUsers || totalItems || users.length || 0;
    }, [statsData, totalItems, users]);

    const computedActiveUsers = useMemo(() => {
        if (statsData?.activeUsers !== undefined && statsData?.activeUsers !== null) {
            return statsData.activeUsers;
        }
        return users.filter(u => u.status !== "blocked").length;
    }, [statsData, users]);

    const computedBlockedUsers = useMemo(() => {
        if (statsData?.blockedUsers !== undefined && statsData?.blockedUsers !== null) {
            return statsData.blockedUsers;
        }
        return users.filter(u => u.status === "blocked").length;
    }, [statsData, users]);

    const computedVerifiedUsers = useMemo(() => {
        if (statsData?.verifiedUsers !== undefined && statsData?.verifiedUsers !== null) {
            return statsData.verifiedUsers;
        }
        return users.filter(u => u.isEmailVerified).length;
    }, [statsData, users]);

    // Client-side Filtering and Sorting
    const filteredAndSortedUsers = useMemo(() => {
        let result = [...users];

        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            result = result.filter(u => 
                (u.fullName && u.fullName.toLowerCase().includes(q)) ||
                (u.email && u.email.toLowerCase().includes(q)) ||
                (u.phoneNumber && u.phoneNumber.includes(q))
            );
        }

        if (roleFilter !== "all") {
            result = result.filter(u => (u.role || "").toLowerCase() === roleFilter.toLowerCase());
        }

        if (statusFilter !== "all") {
            if (statusFilter === "blocked") {
                result = result.filter(u => u.status === "blocked");
            } else {
                result = result.filter(u => u.status !== "blocked");
            }
        }

        if (genderFilter !== "all") {
            result = result.filter(u => (u.gender || "").toLowerCase() === genderFilter.toLowerCase());
        }

        result.sort((a, b) => {
            if (sortBy === "newest") {
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
            if (sortBy === "oldest") {
                return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            }
            if (sortBy === "name_asc") {
                return (a.fullName || "").localeCompare(b.fullName || "");
            }
            return 0;
        });

        return result;
    }, [users, searchQuery, roleFilter, statusFilter, genderFilter, sortBy]);

    // View User Details
    const fetchUserDetails = async (id) => {
        setLoadingDetails(true);
        setDetailsModalOpen(true);
        setSelectedUser(null);
        try {
            const res = await api.get(`/user/${id}`);
            setSelectedUser(res.data?.data || null);
        } catch (err) {
            console.error("fetchUserDetails error:", err);
            toast.error(t("users.fetch_fail") || (isArabic ? "فشل في جلب تفاصيل المستخدم" : "Failed to fetch user details"));
            setDetailsModalOpen(false);
        } finally {
            setLoadingDetails(false);
        }
    };

    // Toggle Block / Unblock User
    const toggleBlock = async (id, currentStatus) => {
        try {
            const hide = message.loading(isArabic ? "جاري تنفيذ العملية..." : "Processing...", 0);
            const res = await api.patch(`/user/${id}/toggle-block`);
            hide();

            if (res.status === 200 || res.data?.success) {
                const isNowBlocked = currentStatus !== "blocked";
                toast.success(
                    isNowBlocked 
                        ? (isArabic ? "تم حظر الحساب بنجاح" : "User has been blocked successfully")
                        : (isArabic ? "تم إلغاء الحظر وتنشيط الحساب بنجاح" : "User has been unblocked and activated successfully")
                );
                
                setUsers(prev => prev.map(u => {
                    if (u.id === id) {
                        const newStatus = res.data?.data?.status ?? (u.status === "blocked" ? "active" : "blocked");
                        return { ...u, status: newStatus };
                    }
                    return u;
                }));
                fetchUsers();
            } else {
                toast.error(isArabic ? "فشل في تغيير حالة الحظر" : "Failed to toggle block status");
            }
        } catch (err) {
            console.error("toggleBlock error:", err);
            toast.error(t("users.block_fail") || (isArabic ? "حدث خطأ أثناء تغيير حالة المستخدم" : "An error occurred while toggling user status"));
        }
    };

    // Show Delete Modal
    const showDeleteModal = (id) => {
        setDeleteUserId(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteOk = async () => {
        if (!deleteUserId) return;
        setDeleting(true);
        try {
            const res = await api.delete(`/user/${deleteUserId}`);
            if (res.status === 200 || res.data?.success) {
                setUsers(prev => prev.filter(u => u.id !== deleteUserId));
                toast.success(t("users.delete_success") || (isArabic ? "تم حذف حساب المستخدم بنجاح" : "User deleted successfully"));
                fetchUsers();
            }
        } catch (err) {
            console.error(err);
            toast.error(t("users.delete_fail") || (isArabic ? "فشل في حذف حساب المستخدم" : "Failed to delete user account"));
        } finally {
            setDeleting(false);
            setIsDeleteModalOpen(false);
            setDeleteUserId(null);
        }
    };

    // Handle Customer Lifetime Value (CLV) Analysis
    const handleAnalysis = async (id) => {
        setLoadingAnalysis(true);
        setAnalysisModalOpen(true);
        setAnalysis(null);
        try {
            const res = await api.get(`/orders/customer-lifetime-value/${id}`);
            if (res.status === 200 && res.data) {
                setAnalysis(res.data?.data || res.data);
            }
        } catch (err) {
            console.error(err);
            toast.error(t("users.analysis_fail") || (isArabic ? "فشل في جلب تحليل مبيعات العميل" : "Failed to load user financial analysis"));
            setAnalysisModalOpen(false);
        } finally {
            setLoadingAnalysis(false);
        }
    };

    // Table Columns
    const columns = [
        {
            title: isArabic ? "#" : "#",
            key: "index",
            width: 60,
            align: "center",
            render: (_, __, idx) => (
                <span className="font-bold text-slate-500 text-xs">
                    {(page - 1) * limit + idx + 1}
                </span>
            ),
        },
        {
            title: isArabic ? "المستخدم والبيانات الشخصية" : "User Profile & Details",
            dataIndex: "fullName",
            key: "fullName",
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        src={record.profileImage || null}
                        alt={text || "-"}
                        size={44}
                        className="border border-[#1e3a8a]/20 shrink-0 font-extrabold text-sm shadow-2xs"
                        style={{ backgroundColor: !record.profileImage ? "#1e3a8a" : undefined, color: "#ffffff" }}
                    >
                        {!record.profileImage && (text ? text[0].toUpperCase() : "?")}
                    </Avatar>
                    <div className="min-w-0">
                        <p className="font-black text-slate-800 text-sm m-0 truncate hover:text-[#1e3a8a] transition-colors">
                            {text || (isArabic ? "بدون اسم" : "Unnamed User")}
                        </p>
                        <p className="text-xs font-semibold text-slate-500 m-0 truncate mt-0.5 flex items-center gap-1">
                            <Mail size={12} className="text-[#1e3a8a]/70 shrink-0" />
                            <span>{record.email || "-"}</span>
                        </p>
                    </div>
                </div>
            ),
        },
        {
            title: isArabic ? "رقم الهاتف" : "Phone Number",
            dataIndex: "phoneNumber",
            key: "phoneNumber",
            render: (phone) => (
                <span className="font-extrabold text-slate-700 text-xs flex items-center gap-1.5" dir="ltr">
                    <Phone size={13} className="text-[#1e3a8a]" />
                    <span>{phone || (isArabic ? "غير مسجل" : "Not registered")}</span>
                </span>
            ),
        },
        {
            title: isArabic ? "الدور والصلاحية" : "Role",
            dataIndex: "role",
            key: "role",
            align: "center",
            render: (role) => {
                const r = (role || "user").toLowerCase();
                let color = "blue";
                let label = isArabic ? "مستخدم عميل" : "Customer User";
                if (r === "admin" || r === "superadmin") {
                    color = "purple";
                    label = isArabic ? "مدير نظام" : "System Admin";
                } else if (r === "vendor" || r === "seller") {
                    color = "cyan";
                    label = isArabic ? "تاجر / بائع" : "Vendor";
                }
                return (
                    <Tag color={color} className="font-extrabold px-2.5 py-0.5 rounded-md text-2xs m-0">
                        {label}
                    </Tag>
                );
            },
        },
        {
            title: isArabic ? "الجنس" : "Gender",
            dataIndex: "gender",
            key: "gender",
            align: "center",
            render: (gender) => {
                if (!gender) return <span className="text-xs font-bold text-slate-400">{isArabic ? "غير محدد" : "Unspecified"}</span>;
                const isMale = gender.toLowerCase() === "male";
                return (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-bold ${isMale ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-pink-50 text-pink-700 border border-pink-200"}`}>
                        {isMale ? (isArabic ? "ذكر" : "Male") : (isArabic ? "أنثى" : "Female")}
                    </span>
                );
            },
        },
        {
            title: isArabic ? "حالة الحساب" : "Status",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (status) => {
                const isBlocked = status === "blocked";
                return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black border ${isBlocked ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                        {isBlocked ? <ShieldAlert size={13} className="text-rose-600" /> : <CheckCircle2 size={13} className="text-emerald-600" />}
                        <span>{isBlocked ? (isArabic ? "محظور / مجمد" : "Blocked") : (isArabic ? "نشط ومؤكد" : "Active")}</span>
                    </span>
                );
            },
        },
        {
            title: isArabic ? "الإجراءات والتحكم" : "Actions & Control",
            key: "actions",
            align: "center",
            width: 320,
            render: (_, user) => {
                const isBlocked = user.status === "blocked";
                return (
                    <div className="flex gap-2 items-center justify-center flex-wrap">
                        <Button
                            onClick={() => fetchUserDetails(user.id)}
                            className="h-8 px-3 rounded-lg border border-[#1e3a8a]/20 bg-[#1e3a8a]/[0.05] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white font-bold text-xs flex items-center gap-1 transition-all shadow-2xs"
                        >
                            <Eye size={14} />
                            <span>{isArabic ? "التفاصيل" : "Details"}</span>
                        </Button>

                        <Button
                            onClick={() => handleAnalysis(user.id)}
                            className="h-8 px-3 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-700 hover:text-white font-bold text-xs flex items-center gap-1 transition-all shadow-2xs"
                        >
                            <TrendingUp size={14} />
                            <span>{isArabic ? "المبيعات" : "CLV"}</span>
                        </Button>

                        <Button
                            onClick={() => toggleBlock(user.id, user.status)}
                            className={`h-8 px-3 rounded-lg font-bold text-xs flex items-center gap-1 transition-all shadow-2xs ${
                                isBlocked 
                                    ? "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-700 hover:text-white" 
                                    : "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-700 hover:text-white"
                            }`}
                        >
                            {isBlocked ? <UserCheck size={14} /> : <UserX size={14} />}
                            <span>{isBlocked ? (isArabic ? "تنشيط" : "Unblock") : (isArabic ? "حظر" : "Block")}</span>
                        </Button>

                        <Button
                            onClick={() => showDeleteModal(user.id)}
                            danger
                            className="h-8 px-2.5 rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs"
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="p-4 md:p-8 bg-slate-50/50 min-h-screen" dir={isArabic ? "rtl" : "ltr"}>
            <ToastContainer theme="colored" position={isArabic ? "top-left" : "top-right"} autoClose={3000} />

            {/* Clean Modern Header Banner (Royal Navy Theme #1e3a8a) */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-2.5 h-full bg-gradient-to-b from-[#1e3a8a] to-blue-600"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3.5 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-2xl shrink-0 mt-1 shadow-2xs">
                            <UsersIcon size={28} />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1e3a8a] text-xs font-bold border border-blue-200/60 mb-2">
                                <Sparkles size={14} className="text-[#1e3a8a]" />
                                <span>{isArabic ? "نظام إدارة الحسابات والعملاء (النسق الكحلي الملكي)" : "User & Customer Management (Royal Navy)"}</span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight m-0">
                                {isArabic ? "إدارة المستخدمين وحسابات المتجر" : "Users & Customers Directory"}
                            </h1>
                            <p className="text-slate-500 text-xs md:text-sm mt-1.5 max-w-2xl leading-relaxed m-0">
                                {isArabic
                                    ? "تحكم كامل في حسابات العملاء والمديرين، متابعة نشاط المستخدمين، تحليل القيمة المالية الدائمة للعميل (CLV)، وتنشيط أو حظر الحسابات بمرونة تامة."
                                    : "Full control over user and admin accounts, track user activity, analyze Customer Lifetime Value (CLV), and toggle account restrictions seamlessly."}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={fetchUsers}
                        type="primary"
                        disabled={loading}
                        className="h-11 px-6 bg-[#1e3a8a] hover:bg-[#172554] text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-[#1e3a8a]/20 hover:shadow-lg transition-all border-0 text-sm self-start md:self-center"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        <span>{isArabic ? "تحديث قائمة الحسابات" : "Refresh Users"}</span>
                    </Button>
                </div>
            </div>

            {/* Navy Blue Unified Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-8">
                {/* Card 1 */}
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow hover:border-[#1e3a8a]/30 transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1e3a8a]" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center shrink-0">
                            <UsersIcon size={24} />
                        </div>
                        <div>
                            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                                {isArabic ? "إجمالي الحسابات المسجلة" : "Total Users"}
                            </span>
                            <span className="text-2xl font-black text-[#1e3a8a] mt-0.5 block">
                                {computedTotalUsers.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow hover:border-[#1e3a8a]/30 transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1e3a8a]" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center shrink-0">
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                                {isArabic ? "الحسابات النشطة والمؤكدة" : "Active Users"}
                            </span>
                            <span className="text-lg font-black text-[#1e3a8a] mt-1 block">
                                {computedActiveUsers.toLocaleString()} <span className="text-xs font-bold text-emerald-600">({isArabic ? "نشط" : "Active"})</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow hover:border-[#1e3a8a]/30 transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1e3a8a]" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center shrink-0">
                            <UserX size={24} />
                        </div>
                        <div>
                            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                                {isArabic ? "الحسابات المحظورة والمجمدة" : "Blocked Users"}
                            </span>
                            <span className="text-lg font-black text-[#1e3a8a] mt-1 block">
                                {computedBlockedUsers.toLocaleString()} <span className="text-xs font-bold text-rose-600">({isArabic ? "محظور" : "Blocked"})</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow hover:border-[#1e3a8a]/30 transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1e3a8a]" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center shrink-0">
                            <Shield size={24} />
                        </div>
                        <div>
                            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                                {isArabic ? "الحسابات مؤكدة البريد" : "Verified Emails"}
                            </span>
                            <span className="text-lg font-black text-[#1e3a8a] mt-1 block">
                                {computedVerifiedUsers.toLocaleString()} <span className="text-xs font-bold text-slate-500">({isArabic ? "حساب مؤكد" : "Verified"})</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table Card with Comprehensive Filters */}
            <div className="bg-white p-6 rounded-3xl border border-blue-100/80 shadow-md">
                
                {/* Filter Bar Section */}
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 mb-6">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-100/80">
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-[#1e3a8a]" />
                            <span className="font-black text-slate-800 text-sm">
                                {isArabic ? "تصفية وفلترة الحسابات والبحث السريع" : "Filter Users & Quick Search"}
                            </span>
                        </div>
                        <Button
                            onClick={resetFilters}
                            size="small"
                            className="h-8 px-3 rounded-lg bg-white border border-blue-200 text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                        >
                            <RotateCcw size={13} />
                            <span>{isArabic ? "إعادة ضبط الفلاتر" : "Reset Filters"}</span>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                        {/* Search Input */}
                        <div className="md:col-span-1 sm:col-span-2">
                            <span className="text-2xs font-bold text-slate-600 block mb-1">
                                {isArabic ? "بحث سريع بالاسم، البريد أو الهاتف:" : "Search by Name, Email, Phone:"}
                            </span>
                            <Input
                                placeholder={isArabic ? "الاسم، البريد الإلكتروني أو الهاتف..." : "Name, Email, Phone..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onPressEnter={handleSearchSubmit}
                                allowClear
                                prefix={<Search size={15} className="text-slate-400" />}
                                className="h-10 rounded-xl font-semibold text-xs border-slate-200 focus:border-[#1e3a8a]"
                            />
                        </div>

                        {/* Role Filter */}
                        <div>
                            <span className="text-2xs font-bold text-slate-600 block mb-1">
                                {isArabic ? "الدور والصلاحية:" : "User Role:"}
                            </span>
                            <Select
                                value={roleFilter}
                                onChange={(val) => setRoleFilter(val)}
                                className="w-full font-bold text-xs h-10"
                                popupClassName="font-bold"
                            >
                                <Option value="all">{isArabic ? "الكل (جميع الأدوار)" : "All Roles"}</Option>
                                <Option value="user">{isArabic ? "مستخدم / عميل" : "Customer / User"}</Option>
                                <Option value="admin">{isArabic ? "مدير نظام" : "Admin"}</Option>
                                <Option value="vendor">{isArabic ? "تاجر / بائع" : "Vendor / Seller"}</Option>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <span className="text-2xs font-bold text-slate-600 block mb-1">
                                {isArabic ? "حالة الحساب:" : "Account Status:"}
                            </span>
                            <Select
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                className="w-full font-bold text-xs h-10"
                                popupClassName="font-bold"
                            >
                                <Option value="all">{isArabic ? "الكل (جميع الحالات)" : "All Statuses"}</Option>
                                <Option value="active">{isArabic ? "نشط ومؤكد" : "Active"}</Option>
                                <Option value="blocked">{isArabic ? "محظور / مجمد" : "Blocked"}</Option>
                            </Select>
                        </div>

                        {/* Gender Filter */}
                        <div>
                            <span className="text-2xs font-bold text-slate-600 block mb-1">
                                {isArabic ? "الجنس:" : "Gender:"}
                            </span>
                            <Select
                                value={genderFilter}
                                onChange={(val) => setGenderFilter(val)}
                                className="w-full font-bold text-xs h-10"
                                popupClassName="font-bold"
                            >
                                <Option value="all">{isArabic ? "الكل (جميع الأجناس)" : "All Genders"}</Option>
                                <Option value="male">{isArabic ? "ذكر (Male)" : "Male"}</Option>
                                <Option value="female">{isArabic ? "أنثى (Female)" : "Female"}</Option>
                            </Select>
                        </div>

                        {/* Sort By Filter */}
                        <div>
                            <span className="text-2xs font-bold text-slate-600 block mb-1">
                                {isArabic ? "ترتيب وعرض حسب:" : "Sort By:"}
                            </span>
                            <Select
                                value={sortBy}
                                onChange={(val) => setSortBy(val)}
                                className="w-full font-bold text-xs h-10"
                                popupClassName="font-bold"
                                suffixIcon={<ArrowUpDown size={14} className="text-[#1e3a8a]" />}
                            >
                                <Option value="newest">{isArabic ? "الأحدث تسجيلاً أولاً" : "Newest Registered"}</Option>
                                <Option value="oldest">{isArabic ? "الأقدم تسجيلاً أولاً" : "Oldest Registered"}</Option>
                                <Option value="name_asc">{isArabic ? "الاسم (أ - ي)" : "Name (A - Z)"}</Option>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Table Title Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#1e3a8a] text-white flex items-center justify-center font-bold shadow-md shadow-[#1e3a8a]/25">
                            <UsersIcon size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-800 m-0">
                                {isArabic ? "سجل كافة الحسابات والعملاء" : "All Accounts & Customers Log"}
                            </h2>
                            <span className="text-xs text-slate-400 font-medium">
                                {isArabic
                                    ? `عرض النتائج المصفاة (${filteredAndSortedUsers.length} مستخدم)`
                                    : `Showing filtered results (${filteredAndSortedUsers.length} users)`}
                            </span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col justify-center items-center gap-3">
                        <Spin size="large" />
                        <span className="text-sm font-bold text-[#1e3a8a] animate-pulse">
                            {isArabic ? "جاري تحميل وتصفية قائمة المستخدمين الملكية..." : "Loading and filtering users log..."}
                        </span>
                    </div>
                ) : filteredAndSortedUsers.length === 0 ? (
                    <div className="py-16">
                        <Empty description={<span className="font-bold text-slate-400">{isArabic ? "لا توجد حسابات تطابق معايير الفلترة المحددة" : "No users match the selected filters"}</span>}>
                            <Button
                                onClick={resetFilters}
                                className="mt-3 h-10 px-6 rounded-xl bg-[#1e3a8a] text-white hover:bg-[#172554] font-bold border-0 shadow-sm"
                            >
                                {isArabic ? "إعادة ضبط الفلاتر وعرض الكل" : "Reset Filters & Show All"}
                            </Button>
                        </Empty>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table
                            columns={columns}
                            dataSource={filteredAndSortedUsers}
                            rowKey="id"
                            pagination={false}
                            className="overflow-x-auto"
                        />
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100 font-bold">
                            <span className="text-xs text-slate-500 font-semibold">
                                {isArabic ? `إجمالي عدد الحسابات في قاعدة البيانات: ${computedTotalUsers}` : `Total registered accounts in DB: ${computedTotalUsers}`}
                            </span>
                            <Pagination
                                current={page}
                                pageSize={limit}
                                total={totalItems}
                                onChange={(p, l) => {
                                    setPage(p);
                                    setLimit(l);
                                }}
                                showSizeChanger
                                pageSizeOptions={["5", "10", "20", "50", "100"]}
                                className="font-bold"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ======================
                USER DETAILS MODAL (Royal Navy Theme)
            ====================== */}
            <Modal
                open={detailsModalOpen}
                onCancel={() => setDetailsModalOpen(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setDetailsModalOpen(false)}
                        className="h-10 px-6 bg-[#1e3a8a] hover:bg-[#172554] text-white font-bold rounded-xl border-0 shadow-sm"
                        style={{ backgroundColor: "#1e3a8a" }}
                    >
                        {isArabic ? "إغلاق النافذة" : "Close"}
                    </Button>,
                ]}
                title={
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 pr-2">
                        <span className="p-2.5 rounded-xl bg-[#1e3a8a] text-white shadow-sm">
                            <UserCheck size={18} />
                        </span>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 m-0">
                                {isArabic ? "الملف الشخصي وتفاصيل العميل" : "User Profile & Account Details"}
                            </h3>
                            {selectedUser && (
                                <span className="text-xs text-[#1e3a8a] font-bold">
                                    {selectedUser.email || "-"}
                                </span>
                            )}
                        </div>
                    </div>
                }
                width={700}
                className="rounded-3xl overflow-hidden"
            >
                {loadingDetails || !selectedUser ? (
                    <div className="flex flex-col justify-center items-center py-16 gap-3">
                        <Spin size="large" />
                        <span className="text-sm font-bold text-[#1e3a8a]">
                            {isArabic ? "جاري جلب تفاصيل الحساب..." : "Fetching user profile details..."}
                        </span>
                    </div>
                ) : (
                    <div className="pt-3 space-y-6">
                        {/* Header Profile Box */}
                        <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100/80 flex items-center gap-4">
                            <Avatar
                                src={selectedUser.profileImage || null}
                                size={84}
                                className="border-2 border-[#1e3a8a] shadow-md shrink-0 font-extrabold text-2xl"
                                style={{ backgroundColor: !selectedUser.profileImage ? "#1e3a8a" : undefined, color: "#ffffff" }}
                            >
                                {!selectedUser.profileImage && (selectedUser.fullName ? selectedUser.fullName[0].toUpperCase() : "?")}
                            </Avatar>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <h3 className="text-xl font-black text-slate-800 m-0">{selectedUser.fullName || (isArabic ? "بدون اسم" : "Unnamed User")}</h3>
                                    <Tag color={selectedUser.role === "admin" ? "purple" : "blue"} className="font-extrabold px-3 py-0.5 rounded-md text-xs m-0">
                                        {selectedUser.role || "user"}
                                    </Tag>
                                </div>
                                <p className="text-sm font-semibold text-slate-600 mt-1 mb-2 flex items-center gap-1.5">
                                    <Mail size={14} className="text-[#1e3a8a]" />
                                    <span>{selectedUser.email || "-"}</span>
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-2xs font-extrabold ${selectedUser.isEmailVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                        {selectedUser.isEmailVerified ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                        <span>{selectedUser.isEmailVerified ? (isArabic ? "البريد الإلكتروني مؤكد" : "Email Verified") : (isArabic ? "البريد غير مؤكد بعد" : "Unverified Email")}</span>
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-2xs font-extrabold ${selectedUser.status === "blocked" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
                                        <span>{selectedUser.status === "blocked" ? (isArabic ? "حساب محظور" : "Blocked") : (isArabic ? "حساب نشط" : "Active")}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info Grid */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                            <h4 className="text-sm font-black text-[#1e3a8a] mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                                <UsersIcon size={16} className="text-[#1e3a8a]" />
                                <span>{isArabic ? "البيانات الأساسية وتواريخ النشاط" : "Basic Information & Activity Logs"}</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-slate-400" />
                                    <span className="font-bold text-slate-700">{isArabic ? "رقم الهاتف:" : "Phone:"} </span>
                                    <span className="font-black text-[#1e3a8a]" dir="ltr">{selectedUser.phoneNumber || (isArabic ? "غير مسجل" : "N/A")}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-slate-700">{isArabic ? "الجنس:" : "Gender:"} </span>
                                    <span className="font-semibold text-slate-800">{selectedUser.gender || (isArabic ? "غير محدد" : "Unspecified")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-400" />
                                    <span className="font-bold text-slate-700">{isArabic ? "تاريخ التسجيل:" : "Registered At:"} </span>
                                    <span className="font-semibold text-slate-700">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-slate-400" />
                                    <span className="font-bold text-slate-700">{isArabic ? "آخر تسجيل دخول:" : "Last Login:"} </span>
                                    <span className="font-semibold text-slate-700">{selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : (isArabic ? "لم يسجل دخول بعد" : "Never")}</span>
                                </div>
                            </div>
                        </div>

                        {/* Default Address */}
                        {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                                <h4 className="text-sm font-black text-[#1e3a8a] mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <MapPin size={16} className="text-[#1e3a8a]" />
                                    <span>{isArabic ? "عنوان التوصيل الافتراضي للعميل" : "Default Shipping Address"}</span>
                                </h4>
                                {(() => {
                                    const addr = selectedUser.addresses.find(a => a.isDefault) || selectedUser.addresses[0];
                                    return (
                                        <div className="space-y-1.5 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="font-extrabold text-slate-800">{addr.title || (isArabic ? "عنوان رئيسي" : "Main Address")}</span>
                                                <Tag color="blue" className="font-bold m-0">{addr.type || "Home"}</Tag>
                                            </div>
                                            <p className="text-slate-600 text-xs leading-relaxed m-0 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                {addr.description || (isArabic ? "بدون تفاصيل عنوان" : "No details provided")}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* Cart Info if available */}
                        {selectedUser.cart && selectedUser.cart.length > 0 && (
                            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                                <h4 className="text-sm font-black text-[#1e3a8a] mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <ShoppingBag size={16} className="text-[#1e3a8a]" />
                                    <span>{isArabic ? `عربة التسوق الحالية (${selectedUser.cart.length} عناصر)` : `Active Shopping Cart (${selectedUser.cart.length} items)`}</span>
                                </h4>
                                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                    {selectedUser.cart.map((c, i) => (
                                        <div key={c.id || i} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs font-semibold text-slate-700 flex justify-between items-center">
                                            <span>{isArabic ? `عنصر عربة رقم #${c.id || i + 1}` : `Cart Item #${c.id || i + 1}`}</span>
                                            {c.defaultAddress && <span className="text-slate-400">{c.defaultAddress.title}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* ======================
                CLV / FINANCIAL ANALYSIS MODAL (Royal Navy Theme)
            ====================== */}
            <Modal
                open={analysisModalOpen}
                onCancel={() => setAnalysisModalOpen(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setAnalysisModalOpen(false)}
                        className="h-10 px-6 bg-[#1e3a8a] hover:bg-[#172554] text-white font-bold rounded-xl border-0 shadow-sm"
                        style={{ backgroundColor: "#1e3a8a" }}
                    >
                        {isArabic ? "إغلاق التحليل" : "Close Analysis"}
                    </Button>,
                ]}
                title={
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 pr-2">
                        <span className="p-2.5 rounded-xl bg-[#1e3a8a] text-white shadow-sm">
                            <TrendingUp size={18} />
                        </span>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 m-0">
                                {isArabic ? "تحليل القيمة المالية الدائمة للعميل (CLV)" : "Customer Lifetime Value Analysis"}
                            </h3>
                            <span className="text-xs text-[#1e3a8a] font-bold">
                                {isArabic ? "تقرير تفصيلي لإنفاق ونشاط العميل داخل المتجر" : "Comprehensive report on user spending and activity"}
                            </span>
                        </div>
                    </div>
                }
                width={720}
                className="rounded-3xl overflow-hidden"
            >
                {loadingAnalysis || !analysis ? (
                    <div className="flex flex-col justify-center items-center py-16 gap-3">
                        <Spin size="large" />
                        <span className="text-sm font-bold text-[#1e3a8a]">
                            {isArabic ? "جاري جلب وتحليل البيانات المالية للعميل..." : "Calculating Customer Lifetime Value metrics..."}
                        </span>
                    </div>
                ) : (
                    <div className="pt-3 space-y-6">
                        {(() => {
                            const currencyFormatter = new Intl.NumberFormat(isArabic ? "ar-EG" : "en-EG", {
                                style: "currency",
                                currency: "EGP",
                                maximumFractionDigits: 2,
                            });
                            const safeNum = (v) => (v === null || v === undefined || isNaN(v) ? 0 : Number(v));

                            return (
                                <>
                                    {/* 5-Card Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex flex-col justify-center items-center text-center">
                                            <span className="text-2xs font-bold text-slate-500 uppercase">{isArabic ? "إجمالي الطلبات المكتملة" : "Total Orders"}</span>
                                            <span className="text-2xl font-black text-[#1e3a8a] mt-1">{safeNum(analysis.totalOrders)}</span>
                                        </div>

                                        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 flex flex-col justify-center items-center text-center">
                                            <span className="text-2xs font-bold text-slate-500 uppercase">{isArabic ? "إجمالي الإنفاق المالي" : "Total Spent"}</span>
                                            <span className="text-lg font-black text-emerald-700 mt-1">{currencyFormatter.format(safeNum(analysis.totalSpent))}</span>
                                        </div>

                                        <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 flex flex-col justify-center items-center text-center col-span-2 md:col-span-1">
                                            <span className="text-2xs font-bold text-slate-500 uppercase">{isArabic ? "متوسط قيمة الطلب (AOV)" : "Avg Order Value"}</span>
                                            <span className="text-lg font-black text-indigo-700 mt-1">{currencyFormatter.format(safeNum(analysis.averageOrderValue))}</span>
                                        </div>

                                        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100 flex flex-col justify-center items-center text-center">
                                            <span className="text-2xs font-bold text-slate-500 uppercase">{isArabic ? "الكوبونات المستخدمة" : "Used Coupons"}</span>
                                            <span className="text-xl font-black text-amber-800 mt-1">{safeNum(analysis.totalUsedCoupons)}</span>
                                        </div>

                                        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-100 flex flex-col justify-center items-center text-center">
                                            <span className="text-2xs font-bold text-slate-500 uppercase">{isArabic ? "الطلبات الملغاة" : "Cancelled Orders"}</span>
                                            <span className="text-xl font-black text-rose-800 mt-1">{safeNum(analysis.totalCanceldOrders)}</span>
                                        </div>
                                    </div>

                                    {/* Dates & Timeline */}
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <Calendar size={18} className="text-[#1e3a8a] shrink-0" />
                                            <div>
                                                <span className="text-2xs font-bold text-slate-400 block">{isArabic ? "تاريخ أول طلب للعميل:" : "First Order Date:"}</span>
                                                <span className="font-extrabold text-slate-800">{analysis.firstOrderDate ? new Date(analysis.firstOrderDate).toLocaleDateString() : (isArabic ? "لا توجد طلبات بعد" : "No orders yet")}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <Clock size={18} className="text-[#1e3a8a] shrink-0" />
                                            <div>
                                                <span className="text-2xs font-bold text-slate-400 block">{isArabic ? "تاريخ آخر طلب للعميل:" : "Last Order Date:"}</span>
                                                <span className="font-extrabold text-slate-800">{analysis.lastOrderDate ? new Date(analysis.lastOrderDate).toLocaleDateString() : (isArabic ? "لا توجد طلبات بعد" : "No orders yet")}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Business Summary & Notes Box */}
                                    <div className="bg-gradient-to-r from-[#1e3a8a] to-blue-900 text-white p-5 rounded-2xl shadow-lg space-y-3">
                                        <div className="flex items-center gap-2 text-yellow-300 font-bold text-sm border-b border-white/15 pb-2">
                                            <Award size={18} />
                                            <span>{isArabic ? "ملخص وتوصيات النظام الذكي للعميل" : "Intelligent Customer Insights Summary"}</span>
                                        </div>
                                        <p className="text-xs md:text-sm text-blue-100 leading-relaxed m-0 font-medium">
                                            {safeNum(analysis.totalOrders) > 0 
                                                ? (isArabic
                                                    ? `هذا العميل أتم ${safeNum(analysis.totalOrders)} طلبات بنجاح بإجمالي إنفاق قدره ${currencyFormatter.format(safeNum(analysis.totalSpent))}. يُصنف ضمن العملاء المميزين بمتوسط إنفاق ${currencyFormatter.format(safeNum(analysis.averageOrderValue))} للطلب الواحد.`
                                                    : `This customer completed ${safeNum(analysis.totalOrders)} orders with a total spend of ${currencyFormatter.format(safeNum(analysis.totalSpent))}. Considered a valuable shopper with an AOV of ${currencyFormatter.format(safeNum(analysis.averageOrderValue))}.`)
                                                : (isArabic
                                                    ? "هذا العميل لم يقم بإتمام أي طلبات شراء مؤكدة داخل المتجر حتى الآن. يُنصح بإرسال كوبون خصم ترحيبي لتحفيزه على أول تجربة شراء."
                                                    : "This customer hasn't completed any purchase orders yet. Sending a welcome discount coupon is recommended to encourage their first order.")}
                                        </p>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}
            </Modal>

            {/* Delete Modal */}
            <Modal
                open={isDeleteModalOpen}
                title={
                    <div className="flex items-center gap-2 text-rose-700 font-black">
                        <Trash2 size={20} />
                        <span>{isArabic ? "تأكيد حذف حساب المستخدم" : "Confirm User Deletion"}</span>
                    </div>
                }
                onOk={handleDeleteOk}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteUserId(null);
                }}
                okText={isArabic ? "حذف نهائي" : "Delete Permanently"}
                okType="danger"
                cancelText={isArabic ? "إلغاء" : "Cancel"}
                confirmLoading={deleting}
                okButtonProps={{ className: "font-bold rounded-lg h-9 px-4" }}
                cancelButtonProps={{ className: "font-bold rounded-lg h-9 px-4" }}
            >
                <p className="text-slate-600 font-semibold text-sm leading-relaxed my-4">
                    {isArabic
                        ? "هل أنت متأكد تماماً من رغبتك في حذف هذا الحساب نهائياً من قاعدة بيانات المتجر؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه."
                        : "Are you absolutely sure you want to permanently delete this user account from the database? This action cannot be undone."}
                </p>
            </Modal>
        </div>
    );
}
