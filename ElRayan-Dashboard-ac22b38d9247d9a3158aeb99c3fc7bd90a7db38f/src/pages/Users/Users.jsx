import { useEffect, useState } from "react";
import axios from "axios";
import {
    Table,
    Input,
    Button,
    Modal,
    Tag,
    Pagination,
    Spin,
    Card,
    Space,
    Avatar,
    message,
} from "antd";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import {
    EyeOutlined,
    DeleteOutlined,
    BarChartOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default function UsersPage() {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const token = localStorage.getItem("token");
    const baseHeaders = { Authorization: `Bearer ${token}` };

    const fetchUsers = async (opts = {}) => {
        setLoading(true);
        try {
            const p = opts.page ?? page;
            const l = opts.limit ?? limit;
            const kw = opts.keyword ?? keyword;

            const res = await axios.get(
                `https://api.elrayan.acwad.tech/api/v1/user`,
                {
                    headers: baseHeaders,
                    params: {
                        keyword: kw || undefined,
                        page: p,
                        limit: l,
                        sortOrder: "ASC",
                    },
                }
            );

            const items = res.data?.data?.items || [];
            const totalPages = res.data?.data?.metadata?.totalPages || 1;

            setUsers(items);
            setTotalPages(totalPages);
        } catch (err) {
            console.error("fetchUsers error:", err);
            toast.error(t("users.fetch_fail"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit]);

    const fetchUserDetails = async (id) => {
        try {
            const res = await axios.get(`https://api.elrayan.acwad.tech/api/v1/user/${id}`, {
                headers: baseHeaders,
            });
            setSelectedUser(res.data.data);
            setModalOpen(true);
        } catch (err) {
            console.error("fetchUserDetails error:", err);
            toast.error(t("users.fetch_fail"));
        }
    };

    const toggleBlock = async (id) => {
        try {
            const hide = message.loading("Processing...", 0);
            const res = await axios.patch(
                `https://api.elrayan.acwad.tech/api/v1/user/${id}/toggle-block`,
                {},
                { headers: baseHeaders }
            );
            hide();

            // If response indicates success, update local users state immediately
            if (res.status === 200) {
                toast.success(t("users.status_updated"));
                setUsers((prev) =>
                    prev.map((u) => {
                        if (u.id === id) {
                            // API toggles block — detect from response if provided, otherwise toggle based on current status
                            const newStatus =
                                res.data?.data?.status ?? (u.status === "blocked" ? "active" : "blocked");
                            return { ...u, status: newStatus };
                        }
                        return u;
                    })
                );
                // also refresh just in case to sync with server
                fetchUsers();
            } else {
                toast.error("Failed to toggle block");
            }
        } catch (err) {
            console.error("toggleBlock error:", err);
            toast.error(t("users.block_fail"));
        }
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState(null);

    const showDeleteModal = (id) => {
        setDeleteUserId(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteOk = async () => {
        try {
            const res = await axios.delete(
                `https://api.elrayan.acwad.tech/api/v1/user/${deleteUserId}`,
                { headers: baseHeaders }
            );
            if (res.status === 200) {
                setUsers(prev => prev.filter(u => u.id !== deleteUserId));
                toast.success(t("users.delete_success"));
                fetchUsers();
            }
        } catch (err) {
            console.error(err);
            toast.error(t("users.delete_fail"));
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteUserId(null);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setDeleteUserId(null);
    };

    const [analysis, setAnalysis] = useState(null);
    const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
    const handleAnalysis = async (id) => {
        try {
            const res = await axios.get(
                `https://api.elrayan.acwad.tech/api/v1/orders/customer-lifetime-value/${id}`,
                { headers: baseHeaders }
            );
            if (res.status === 200) {
                const data = res.data;
                setAnalysis(data);
                setAnalysisModalOpen(true);
            }

            console.log(analysis);

        } catch (err) {
            console.error(err);
            toast.error(t("users.analysis_fail"));
        }
    };


    const columns = [
        {
            title: "#",
            key: "index",
            render: (_, __, idx) => (page - 1) * limit + idx + 1,
            width: 60,
        },
        {
            title: t("users.full_name"),
            dataIndex: "fullName",
            key: "fullName",
            render: (text, record) => (
                <Space>
                    <Avatar
                        src={record.profileImage || null}
                        alt={text}
                        size="small"
                        style={{ background: !record.profileImage ? "#87d068" : undefined }}
                    >
                        {!record.profileImage && (text ? text[0] : "?")}
                    </Avatar>
                    <span>{text}</span>
                </Space>
            ),
        },
        {
            title: t("users.email"),
            dataIndex: "email",
            key: "email",
        },
        {
            title: t("users.role"),
            dataIndex: "role",
            key: "role",
            render: (role) => <Tag color="blue">{role}</Tag>,
        },
        {
            title: t("users.gender"),
            dataIndex: "gender",
            key: "gender",
            render: (gender) =>
                gender === null ? <Tag color="gray">{t("users.unknown")}</Tag> : gender === "male" ? <Tag color="blue">{t("users.male")}</Tag> : <Tag color="pink">{t("users.female")}</Tag>,
        },
        {
            title: t("users.actions"),
            key: "actions",
            render: (_, user) => (
                <Space wrap>
                    <Button icon={<EyeOutlined />} type="primary" onClick={() => fetchUserDetails(user.id)}>
                        {t("users.view")}
                    </Button>

                    <Button
                        icon={<BarChartOutlined />}
                        type={"dashed"}
                        onClick={() => handleAnalysis(user.id)}


                    >
                        {t("users.analysis")}
                    </Button>

                    <Button danger icon={<DeleteOutlined />} onClick={() => showDeleteModal(user.id)}>
                        {t("common.delete")}
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <ToastContainer position="top-right" autoClose={2000} />
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{t("users.title")}</h2>

            <Card className="mb-6">
                <Space wrap>
                    <Input
                        placeholder={t("users.search_placeholder")}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{ width: 260 }}
                        onPressEnter={() => {
                            setPage(1);
                            fetchUsers({ page: 1, limit, keyword });
                        }}
                    />

                    <Button
                        type="primary"
                        onClick={() => {
                            setPage(1);
                            fetchUsers({ page: 1, limit, keyword });
                        }}
                    >
                        {t("users.search")}
                    </Button>

                    <Input
                        type="number"
                        min={1}
                        value={limit}
                        onChange={(e) => {
                            const val = Number(e.target.value) || 1;
                            setLimit(val);
                            setPage(1);
                        }}
                        style={{ width: 110 }}
                        addonBefore={t("users.limit")}
                    />

                    {/* <Link to="/users/growth-trend">
                        <Button type="primary" style={{ background: "green" }}>
                            View Growth Trend
                        </Button>
                    </Link> */}
                </Space>
            </Card>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    pagination={false}
                    bordered
                    className="overflow-x-auto"
                />
            )}

            <div className="mt-6 flex justify-center">
                <Pagination
                    current={page}
                    total={totalPages * limit}
                    pageSize={limit}
                    onChange={(p) => setPage(p)}
                    showSizeChanger={false}
                />
            </div>

            <Modal
                open={isDeleteModalOpen}
                title={t("users.delete_confirm")}
                onOk={handleDeleteOk}
                onCancel={handleDeleteCancel}
                okText={t("common.delete")}
                okType="danger"
                cancelText={t("common.cancel")}
            />

            <Modal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                title={t("users.details_modal")}
                width={700}
            >
                {!selectedUser ? (
                    <Spin />
                ) : (
                    <div className="space-y-4">
                        {/* HEADER: IMAGE + NAME */}
                        <div className="flex items-center gap-4">
                            <Avatar
                                src={selectedUser.profileImage || null}
                                size={80}
                                alt={selectedUser.fullName}
                            >
                                {!selectedUser.profileImage &&
                                    (selectedUser.fullName ? selectedUser.fullName[0] : "?")}
                            </Avatar>

                            <div>
                                <h3 style={{ fontSize: 18, margin: 0 }}>{selectedUser.fullName}</h3>
                                <div style={{ color: "#666" }}>{selectedUser.email}</div>
                                <div style={{ color: "#999", fontSize: 12 }}>
                                    {t("users.role")}: {selectedUser.role}
                                </div>
                            </div>
                        </div>

                        {/* BASIC DETAILS */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 8,
                            }}

                        >
                            <div><b>{t("users.phone")}:</b> {selectedUser.phoneNumber || "—"}</div>
                            <div><b>{t("users.gender")}:</b> {selectedUser.gender || "—"}</div>
                            <div><b>{t("users.email_verified")}:</b> {selectedUser.isEmailVerified ? t("users.yes") : t("users.no")}</div>
                            <div><b>{t("users.last_login")}:</b> {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : "N/A"}</div>
                            <div><b>{t("users.created_at")}:</b> {new Date(selectedUser.createdAt).toLocaleString()}</div>
                            <div><b>{t("users.updated_at")}:</b> {new Date(selectedUser.updatedAt).toLocaleString()}</div>
                        </div>

                        {/* DEFAULT ADDRESS */}
                        {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                            <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
                                <h4 style={{ marginBottom: 8 }}>{t("users.default_address")}</h4>

                                {(() => {
                                    const addr = selectedUser.addresses.find(a => a.isDefault) || selectedUser.addresses[0];
                                    return (
                                        <div className="space-y-1">
                                            <div><b>{t("orders.address_title")}:</b> {addr.title}</div>
                                            <div><b>{t("orders.description")}:</b> {addr.description}</div>
                                            <div><b>{t("users.role")}:</b> {addr.type}</div>
                                            <div><b>{t("users.phone")}:</b> {selectedUser.phoneNumber}</div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* CART INFO */}
                        {selectedUser.cart && selectedUser.cart.length > 0 && (
                            <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
                                <h4 style={{ marginBottom: 8 }}>{t("users.cart")}</h4>
                                <div className="space-y-2">
                                    {selectedUser.cart.map((c) => (
                                        <div
                                            key={c.id}
                                            className="p-3 rounded border bg-gray-50"
                                        >
                                            <div><b>{t("users.cart_id")}:</b> {c.id}</div>
                                            {c.defaultAddress && (
                                                <div className="mt-2 text-sm">
                                                    <b>{t("users.default_cart_address")}:</b> {c.defaultAddress.title}
                                                    <br />
                                                    <span style={{ color: "#666" }}>{c.defaultAddress.description}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )
                }
            </Modal >



            <Modal
                open={analysisModalOpen}
                onCancel={() => setAnalysisModalOpen(false)}
                footer={null}
                title={t("users.analysis_modal")}
                width={700}
            >
                {!analysis ? (
                    <Spin />
                ) : (
                    <>
                        {(() => {
                            // لو بتحب تحتفظ بالـ helpers محلياً ممكن تحطهم هنا أو برا الـ render
                            const currencyFormatter = new Intl.NumberFormat("en-EG", {
                                style: "currency",
                                currency: "EGP",
                                maximumFractionDigits: 2,
                            });
                            const safeNumber = (v) => (v === null || v === undefined ? 0 : v);
                            const safeDate = (d) => (d ? new Date(d).toLocaleString() : "N/A");

                            return (
                                <div className="space-y-4">
                                    <Card>
                                        <Space wrap size="large" align="center">
                                            <div>
                                                <div style={{ fontSize: 12, color: "#666" }}>{t("users.total_orders")}</div>
                                                <div style={{ fontSize: 18, fontWeight: 600 }}>{analysis.totalOrders}</div>
                                            </div>

                                            <div>
                                                <div style={{ fontSize: 12, color: "#666" }}>{t("users.total_spent")}</div>
                                                <div style={{ fontSize: 18, fontWeight: 600 }}>
                                                    {currencyFormatter.format(safeNumber(analysis.totalSpent))}
                                                </div>
                                            </div>

                                            <div>
                                                <div style={{ fontSize: 12, color: "#666" }}>{t("users.avg_order_value")}</div>
                                                <div style={{ fontSize: 18, fontWeight: 600 }}>
                                                    {currencyFormatter.format(safeNumber(analysis.averageOrderValue))}
                                                </div>
                                            </div>

                                            <div>
                                                <div style={{ fontSize: 12, color: "#666" }}>{t("users.used_coupons")}</div>
                                                <div style={{ fontSize: 18, fontWeight: 600 }}>
                                                    {analysis.totalUsedCoupons ?? 0}
                                                </div>
                                            </div>

                                            <div>
                                                <div style={{ fontSize: 12, color: "#666" }}>{t("users.canceled_orders")}</div>
                                                <div style={{ fontSize: 18, fontWeight: 600 }}>
                                                    {analysis.totalCanceldOrders ?? 0}
                                                </div>
                                            </div>
                                        </Space>
                                    </Card>

                                    <Card>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                            <div>
                                                <b>{t("users.first_order_date")}:</b>
                                                <div style={{ color: "#666" }}>{safeDate(analysis.firstOrderDate)}</div>
                                            </div>

                                            <div>
                                                <b>{t("users.last_order_date")}:</b>
                                                <div style={{ color: "#666" }}>{safeDate(analysis.lastOrderDate)}</div>
                                            </div>

                                            <div>
                                                <b>{t("users.summary")}</b>
                                                <div style={{ color: "#666", marginTop: 6 }}>
                                                    {t("users.summary_text", { orders: safeNumber(analysis.totalOrders), spent: currencyFormatter.format(safeNumber(analysis.totalSpent)) })}
                                                </div>
                                            </div>

                                            <div>
                                                <b>{t("users.notes")}</b>
                                                <div style={{ color: "#666", marginTop: 6 }}>
                                                    {t("users.notes_text", { value: currencyFormatter.format(safeNumber(analysis.averageOrderValue)) })}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            );
                        })()}
                    </>
                )}
            </Modal>

        </div >
    );
}
