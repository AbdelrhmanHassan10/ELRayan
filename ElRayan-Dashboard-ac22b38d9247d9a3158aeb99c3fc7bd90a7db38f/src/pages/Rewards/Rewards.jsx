import React, { useEffect, useState } from "react";
import { Table, Modal, Form, Input, InputNumber, Switch, Button, Popconfirm, Space, message, Tag } from "antd";
import { Edit2, Trash2, PlusCircle, } from "lucide-react";
import { useTranslation } from "react-i18next";


const BASE_URL = "https://api.elrayan.acwad.tech/api/v1";

function fmtDateForInput(iso) { if (!iso) return ""; const d = new Date(iso); const pad = (n) => String(n).padStart(2, '0'); const yyyy = d.getFullYear(); const mm = pad(d.getMonth() + 1); const dd = pad(d.getDate()); const hh = pad(d.getHours()); const min = pad(d.getMinutes()); return `${yyyy}-${mm}-${dd}T${hh}:${min}` }

export default function Rewards() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [rewards, setRewards] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();
    const token = localStorage.getItem("token");

    async function load() {
        try { setLoading(true); const res = await fetch(`${BASE_URL}/rewards`, { headers: { Authorization: `Bearer ${token}` } }); const json = await res.json(); if (json && json.data) { setIsActive(Boolean(json.data.isActive)); setRewards(json.data.rewards || []) } else if (Array.isArray(json)) setRewards(json); else message.error(t("rewards.error_loading")); } catch (e) { message.error(t("rewards.error_loading")) } finally { setLoading(false) }
    }

    useEffect(() => { load() }, []);

    function openCreate() { setEditing(null); form.resetFields(); setModalOpen(true) }
    function openEdit(rec) { setEditing(rec); form.setFieldsValue({ type: rec.type, discountType: rec.discountType, discountValue: Number(rec.discountValue), productId: rec.productId, displayText: rec.displayText, couponCode: rec.couponCode, probability: rec.probability, isActive: rec.isActive, description: rec.description, expiresAt: fmtDateForInput(rec.expiresAt), minOrderAmount: Number(rec.minOrderAmount) }); setModalOpen(true) }

    async function handleDelete(id) { try { setLoading(true); const res = await fetch(`${BASE_URL}/rewards/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (res.ok) { message.success(t("rewards.deleted")); setRewards(s => s.filter(r => r.id !== id)) } else { message.error(t("rewards.delete_failed")) } } catch (e) { message.error(t("rewards.error_saving")) } finally { setLoading(false) } }

    async function onFinish(vals) {
        setSubmitLoading(true);
        const payload = { type: vals.type, discountType: vals.discountType, discountValue: Number(vals.discountValue || 0), productId: Number(vals.productId || 0), displayText: vals.displayText || '', couponCode: vals.couponCode || '', probability: Number(vals.probability || 1), isActive: Boolean(vals.isActive), description: vals.description || '', expiresAt: vals.expiresAt ? new Date(vals.expiresAt).toISOString() : null, minOrderAmount: Number(vals.minOrderAmount || 0) };
        try {
            setLoading(true); let res; if (editing) { res = await fetch(`${BASE_URL}/rewards/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }) } else { res = await fetch(`${BASE_URL}/rewards`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }) }
            if (res.ok) { message.success(editing ? t("rewards.updated") : t("rewards.created")); setModalOpen(false); load() } else { const txt = await res.text(); message.error(t("rewards.save_failed") + ': ' + txt) }
        } catch (e) { message.error(t("rewards.error_saving")) } finally { setLoading(false); setSubmitLoading(false); }
    }

    const cols = [
        { title: t("banners.id"), dataIndex: 'id', key: 'id', width: 70 },
        { title: t("rewards.type"), dataIndex: 'type', key: 'type' },
        { title: t("rewards.display_text"), dataIndex: 'displayText', key: 'displayText' },
        { title: t("rewards.coupon_code"), dataIndex: 'couponCode', key: 'couponCode' },
        { title: t("rewards.discount_value"), key: 'discount', render: (val, r) => `${r.discountValue}${r.discountType === 'percentage' ? '%' : ''}` },
        { title: t("rewards.product_id"), dataIndex: 'productId', key: 'productId' },
        { title: t("rewards.expires_at"), dataIndex: 'expiresAt', key: 'expiresAt', render: (val) => val ? new Date(val).toLocaleString() : '-' },
        { title: t("rewards.active"), dataIndex: 'isActive', key: 'isActive', render: (val) => (val ? <Tag color="green">{t("common.active")}</Tag> : <Tag color="red">{t("common.inactive")}</Tag>) },
        {
            title: t("common.actions"), key: 'actions', width: 140, render: (_, rec) => (<Space>
                <Button size="small" onClick={() => openEdit(rec)} icon={<Edit2 size={14} />}>{t("common.edit")}</Button>
                <Popconfirm title={t("rewards.delete_confirm")} onConfirm={() => handleDelete(rec.id)} okText={t("common.yes")} cancelText={t("common.no")}><Button danger size="small" icon={<Trash2 size={14} />}>{t("common.delete")}</Button></Popconfirm>
            </Space>)
        }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">{t("rewards.title")}</h1>
                <div className="flex items-center gap-3">
                    <Button type="primary" icon={<PlusCircle size={16} />} onClick={openCreate}>{t("rewards.new_reward")}</Button>
                </div>
            </div>

            <Table rowKey="id" columns={cols} dataSource={rewards} loading={loading} pagination={{ pageSize: 10, showSizeChanger: true }} />

            <Modal title={editing ? t("rewards.edit_reward") : t("rewards.create_reward")} open={modalOpen} onCancel={() => { setModalOpen(false); form.resetFields(); setEditing(null) }} footer={null} destroyOnClose>
                <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: 'discount_coupon', discountType: 'percentage', probability: 1, isActive: true, minOrderAmount: 0 }}>
                    <Form.Item name="type" label={t("rewards.type")} rules={[{ required: true, message: 'Select type' }]}>
                        <select className="border rounded w-full p-2">
                            <option value="discount_coupon">discount_coupon</option>
                            <option value="free_item">free_item</option>
                            <option value="cashback">cashback</option>
                        </select>
                    </Form.Item>
                    <Form.Item name="discountType" label={t("rewards.discount_type")} rules={[{ required: true, message: 'Select discount type' }]}>
                        <select className="border rounded w-full p-2">
                            <option value="percentage">percentage</option>
                            <option value="fixed">fixed</option>
                        </select>
                    </Form.Item>
                    <Form.Item name="discountValue" label={t("rewards.discount_value")} rules={[{ required: true, message: 'Required' }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="productId" label={t("rewards.product_id")}><InputNumber style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="displayText" label={t("rewards.display_text")}><Input /></Form.Item>
                    <Form.Item name="couponCode" label={t("rewards.coupon_code")}><Input /></Form.Item>
                    <Form.Item name="probability" label={t("rewards.probability")}><InputNumber min={0} max={1} step={0.01} style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="isActive" label={t("rewards.active")} valuePropName="checked"><Switch /></Form.Item>
                    <Form.Item name="description" label={t("rewards.description")}><Input.TextArea rows={3} /></Form.Item>
                    <Form.Item name="expiresAt" label={t("rewards.expires_at")}><Input type="datetime-local" /></Form.Item>
                    <Form.Item name="minOrderAmount" label={t("rewards.min_order")}><InputNumber style={{ width: '100%' }} /></Form.Item>

                    <Form.Item>
                        <Space className="w-full justify-end">
                            <Button onClick={() => setModalOpen(false)}>{t("common.cancel")}</Button>
                            <Button type="primary" htmlType="submit" loading={submitLoading}>{t("common.save")}</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
