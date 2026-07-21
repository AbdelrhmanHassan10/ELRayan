import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Select, Input, Pagination, Modal, Form, message } from "antd";

export default function WalletAdminPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortOrder, setSortOrder] = useState("ASC");
    const [status, setStatus] = useState("");

    const [totalItems, setTotalItems] = useState(0);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const token = localStorage.getItem("token");

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                "https://api.maghni.acwad.tech/api/v1/wallet/withdrawal-requests/all",
                {
                    params: {
                        page,
                        limit,
                        sortOrder,
                        status: status || undefined,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setData(res.data.data.items);
            setTotalItems(res.data.data.metadata.totalItems);
        } catch (err) {
            console.error(err);
            message.error("حدث خطأ أثناء تحميل البيانات");
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (record) => {
        setSelectedRow(record);
        setModalOpen(true);
    };

    const processRequest = async (values) => {
        try {
            await axios.patch(
                `https://api.maghni.acwad.tech/api/v1/wallet/withdrawal-requests/${selectedRow.id}/process`,
                values,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            message.success("تم تحديث حالة السحب بنجاح");
            setModalOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
            message.error("خطأ أثناء تحديث الحالة");
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, limit, sortOrder, status]);

    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        {
            title: "Vendor",
            render: (row) => row.vendor?.name || "-",
        },
        {
            title: "Wallet Balance",
            render: (row) => row.wallet?.balance,
        },
        {
            title: "Amount",
            dataIndex: "amount",
        },
        {
            title: "Status",
            dataIndex: "status",
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
        },
        {
            title: "Bank Name",
            dataIndex: "bankName",
        },
        {
            title: "Account Holder",
            dataIndex: "accountHolderName",
        },
        {
            title: "Actions",
            render: (row) => (
                <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={() => openEditModal(row)}
                >
                    Edit
                </button>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold mb-4">Wallet Withdrawal Requests</h2>

            {/* Filters */}
            <div className="flex gap-4 items-end flex-wrap">
                <div>
                    <label>Status</label>
                    <Select
                        className="w-40"
                        allowClear
                        value={status}
                        onChange={(v) => setStatus(v || "")}
                        options={[
                            { value: "PENDING", label: "PENDING" },
                            { value: "APPROVED", label: "APPROVED" },
                            { value: "COMPLETED", label: "COMPLETED" },
                            { value: "REJECTED", label: "REJECTED" },
                        ]}
                    />
                </div>

                <div>
                    <label>Sort</label>
                    <Select
                        className="w-40"
                        value={sortOrder}
                        onChange={setSortOrder}
                        options={[
                            { value: "ASC", label: "ASC" },
                            { value: "DESC", label: "DESC" },
                        ]}
                    />
                </div>

                <div>
                    <label>Limit</label>
                    <Input
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="w-24"
                    />
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="id"
                pagination={false}
                className="overflow-x-auto"
            />

            {/* Pagination */}
            <Pagination
                className="mt-4"
                current={page}
                total={totalItems}
                pageSize={limit}
                onChange={(p) => setPage(p)}
            />

            {/* Edit Modal */}
            <Modal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                title="Update Withdrawal Status"
            >
                <Form layout="vertical" onFinish={processRequest}>
                    <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                        <Select
                            options={[
                                { value: "PENDING", label: "PENDING" },
                                { value: "APPROVED", label: "APPROVED" },
                                { value: "COMPLETED", label: "COMPLETED" },
                                { value: "REJECTED", label: "REJECTED" },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item name="adminNote" label="Admin Note" rules={[{ required: true }]}>
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 text-white rounded mt-2"
                    >
                        Save
                    </button>
                </Form>
            </Modal>
        </div>
    );
}