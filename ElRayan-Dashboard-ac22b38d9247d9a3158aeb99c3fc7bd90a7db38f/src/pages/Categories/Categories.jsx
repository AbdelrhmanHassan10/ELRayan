import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Upload, Popconfirm, Spin, Tag, message } from "antd";
import { Plus, Edit3, Trash2, Upload as UploadIcon, Eye } from "lucide-react";
import api from "../../Api/Api";
import { toast, ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function Categories() {
    const { t } = useTranslation();
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

    const token = localStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`,
        "lang": "en",
    };

    // ============================
    // Fetch categories
    // ============================
    const fetchCategories = async () => {
        try {
            const res = await api.get("/category");
            setCategories(res.data.data);
        } catch (e) {
            console.log(e);
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
                name_en: c.name.en,
                name_ar: c.name.ar,
            });

            setModalOpen(true);

        } catch (e) {
            console.log(e);
        }
    };

    // ============================
    // Show Subcategories
    // ============================
    const showSub = async (catId) => {
        try {
            const res = await api.get(
                `/sub-categories?main_category=${catId}`
            );

            const list = res.data.data || [];
            setSubList(list);
            setSelectedCat(catId); // مهم
            setSubOpen(true);
        } catch (e) {
            console.log(e);
        }
    };


    // ============================
    // delete
    // ============================
    const deleteCat = async (id) => {
        try {
            await api.delete(`/category/${id}`);
            fetchCategories();
        } catch (e) {
            console.log(e);
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

            // icon can be undefined, an Upload file object, or a raw File.
            let file;
            if (values && values.icon) {
                // Antd Upload file object usually has originFileObj
                if (values.icon.originFileObj) {
                    file = values.icon.originFileObj;
                } else if (values.icon.file && values.icon.file.originFileObj) {
                    file = values.icon.file.originFileObj;
                } else if (values.icon instanceof File) {
                    file = values.icon;
                } else {
                    // fallback: sometimes the value is already the file-like object
                    file = values.icon;
                }
            }

            if (file) {
                fd.append("icon", file);
            }

            if (editMode) {
                await api.patch(`/category/${selectedCat.id}`, fd);
            } else {
                await api.post("/category", fd);
            }

            setModalOpen(false);
            fetchCategories();

        } catch (e) {
            console.log(e);
        } finally {
            setSubmitLoading(false);
        }
    };
    // ============================
    // TABLE COLUMNS
    // ============================
    const columns = [
        {
            title: t("categories.icon"),
            dataIndex: "icon",
            render: (icon) => <img src={icon} width={45} height={45} style={{ borderRadius: 8 }} />
        },
        {
            title: t("categories.name_en"),
            dataIndex: "name",
            render: (n) => n.en
        },
        {
            title: t("categories.name_ar"),
            dataIndex: "name",
            render: (n) => n.ar
        },
        {
            title: t("categories.subcategories"),
            dataIndex: "id",
            render: (catId) =>
                <Button size="small" icon={<Eye size={14} />} onClick={() => showSub(catId)}>
                    {t("categories.manage")}
                </Button>
        }
        ,
        {
            title: t("common.actions"),
            render: (_, row) => (
                <div style={{ display: "flex", gap: 10 }}>
                    <Button type="primary" icon={<Edit3 size={14} />} onClick={() => openEdit(row.id)}>
                        {t("common.edit")}
                    </Button>
                    <Popconfirm title={t("categories.delete_confirm")} onConfirm={() => deleteCat(row.id)}>
                        <Button danger icon={<Trash2 size={14} />}>{t("common.delete")}</Button>
                    </Popconfirm>
                </div>
            )
        }
    ];




    const [subForm] = Form.useForm();
    const [subEditMode, setSubEditMode] = useState(false);
    const [subModal, setSubModal] = useState(false);
    const [selectedSub, setSelectedSub] = useState(null);
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
            name_en: sub.name.en,
            name_ar: sub.name.ar,
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
                // Antd Upload file object usually has originFileObj
                if (values.icon.originFileObj) {
                    file = values.icon.originFileObj;
                } else if (values.icon.file && values.icon.file.originFileObj) {
                    file = values.icon.file.originFileObj;
                } else if (values.icon instanceof File) {
                    file = values.icon;
                } else {
                    // fallback: sometimes the value is already the file-like object
                    file = values.icon;
                }
            }

            if (file) {
                fd.append("icon", file);
            }

            if (subEditMode) {
                await api.patch(
                    `/sub-categories/${selectedSub.id}`,
                    fd
                );
            } else {
                await api.post(
                    `/sub-categories`,
                    fd
                );
            }

            setSubModal(false);
            showSub(selectedCat);

        } catch (e) {
            console.log(e);
        } finally {
            setSubmitLoading(false);
        }
    };

    const deleteSub = async (id) => {
        try {
            await api.delete(
                `/sub-categories/${id}`
            );
            showSub(selectedCat);
        } catch (e) {
            console.log(e);
        }
    };
    if (loading) return <div className="w-full h-[500px] flex justify-center items-center">
        <Spin size="large" />
    </div>

    return (
        <div style={{ padding: 20 }}>
            <ToastContainer theme="colored" />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontWeight: "bold", fontSize: "24px" }}>
                    {t("categories.title")}
                </h2>
                <Button type="primary" icon={<Plus size={16} />} onClick={openAdd}>
                    {t("categories.add_category")}
                </Button>
            </div>

            <Table columns={columns} dataSource={categories} rowKey="id" />

            {/* ======================
          ADD / EDIT MODAL
       ====================== */}
            <Modal
                title={editMode ? t("categories.edit_category") : t("categories.add_category")}
                open={modalOpen}
                onOk={() => form.submit()}
                onCancel={() => setModalOpen(false)}
                confirmLoading={submitLoading}
            >
                <Form form={form} layout="vertical" onFinish={onSubmit}>
                    <Form.Item name="name_en" label={t("categories.name_en")} rules={[{ required: true }]}>
                        <Input placeholder="name in English" />
                    </Form.Item>

                    <Form.Item name="name_ar" label={t("categories.name_ar")} rules={[{ required: true }]}>
                        <Input placeholder="name in Arabic" />
                    </Form.Item>

                    <Form.Item name="icon" label={t("categories.icon")}>
                        <Upload beforeUpload={() => false} maxCount={1} listType="picture"
                            onChange={({ fileList }) => {
                                if (fileList.length > 1) {
                                    fileList = fileList.slice(-1);
                                }
                                form.setFieldsValue({ icon: fileList[0] });
                            }}
                        >
                            <Button icon={<UploadIcon size={16} />}>{t("banners.upload")}</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>

            {/* ======================
          SUBCATEGORIES MODAL
       ====================== */}
            <Modal
                title={t("categories.subcategories")}
                open={subOpen}
                onCancel={() => setSubOpen(false)}
                footer={false}
                width={650}
            >
                <Button
                    type="primary"
                    icon={<Plus size={14} />}
                    onClick={openAddSub}
                    style={{ marginBottom: 15 }}
                >
                    {t("categories.add_subcategory")}
                </Button>

                <Table
                    dataSource={subList}
                    rowKey="id"
                    columns={[
                        {
                            title: t("categories.icon"),
                            dataIndex: "icon",
                            render: (i) => <img src={i} width={40} style={{ borderRadius: 6 }} />
                        },
                        {
                            title: t("categories.name_en"),
                            dataIndex: "name",
                            render: n => n.en
                        },
                        {
                            title: t("categories.name_ar"),
                            dataIndex: "name",
                            render: n => n.ar
                        },
                        {
                            title: t("common.actions"),
                            render: (_, row) => (
                                <div style={{ display: "flex", gap: 8 }}>
                                    <Button size="small" onClick={() => openEditSub(row)} icon={<Edit3 size={13} />}>
                                        {t("common.edit")}
                                    </Button>
                                    <Popconfirm
                                        title={t("categories.delete_confirm")}
                                        onConfirm={() => deleteSub(row.id)}
                                    >
                                        <Button danger size="small" icon={<Trash2 size={13} />}>{t("common.delete")}</Button>
                                    </Popconfirm>
                                </div>
                            )
                        }
                    ]}
                />
            </Modal>
            {/* ======================
          ADD / EDIT SUBCATEGORY MODAL
       ====================== */}
            <Modal
                title={subEditMode ? t("categories.edit_subcategory") : t("categories.add_subcategory")}
                open={subModal}
                onCancel={() => setSubModal(false)}
                onOk={() => subForm.submit()}
                confirmLoading={submitLoading}
            >
                <Form layout="vertical" form={subForm} onFinish={submitSub}>
                    <Form.Item name="name_en" label={t("categories.name_en")} rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="name_ar" label={t("categories.name_ar")} rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="icon" label={t("categories.icon")}>
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            listType="picture"
                            onChange={({ fileList }) => {
                                subForm.setFieldsValue({ icon: fileList[0] });
                            }}
                        >
                            <Button icon={<UploadIcon size={16} />}>{t("banners.upload")}</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    );
}
