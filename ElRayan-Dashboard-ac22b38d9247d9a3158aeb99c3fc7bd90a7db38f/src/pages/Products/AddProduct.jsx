import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Input, InputNumber, Select, Switch, Button, Spin, Upload } from "antd";
import { Plus, Save } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Title from "antd/es/skeleton/Title";

import { useTranslation } from "react-i18next";

const { Option } = Select;

const AddProduct = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const token = localStorage.getItem("token");
    const nav = useNavigate();

    const headers = {
        Authorization: `Bearer ${token}`,
        "Accept-Language": "en",
    };

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get("https://api.elrayan.acwad.tech/api/v1/category", { headers });
                setCategories(res.data.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load categories"); // Leaving this as is for now or translate if common error
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleMainCategoryChange = async (value) => {
        form.setFieldsValue({ sub_category_id: null });
        try {
            const res = await axios.get(`https://api.elrayan.acwad.tech/api/v1/sub-categories?main_category=${value}`, { headers });
            setSubCategories(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load subcategories");
        }
    };

    const onFinish = async (values) => {
        setSubmitLoading(true);
        try {
            const formData = new FormData();
            formData.append("name[ar]", values.name_ar);
            formData.append("name[en]", values.name_en);
            formData.append("description[ar]", values.description_ar);
            formData.append("description[en]", values.description_en);
            formData.append("price", values.price);
            formData.append("supplier_price", values.supplier_price);
            formData.append("discount", values.discount || 0);
            formData.append("discount_type", values.discount_type);
            formData.append("main_category_id", values.main_category_id);
            formData.append("sub_category_id", values.sub_category_id);
            formData.append("stock", values.stock);
            formData.append("unit", values.unit);
            // formData.append("isFeatured", values.isFeatured);
            // formData.append("isHidden", values.isHidden);

            // Append images
            fileList.forEach(file => {
                if (file.originFileObj) formData.append("images", file.originFileObj);
            });

            // POST for new product
            await axios.post(`https://api.elrayan.acwad.tech/api/v1/product`, formData, {
                headers: { ...headers, "Content-Type": "multipart/form-data" },
            });

            toast.success(t("products.add_success"));
            setTimeout(() => nav("/products"), 1500);
        } catch (error) {
            console.error(error);
            toast.error(t("products.add_fail"));
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 800, margin: "auto" }}>
            <ToastContainer />
            <h1 style={{ textAlign: "center", marginBottom: 20, fontSize: 24 }}>{t("products.add_product")}</h1>
            <Form.Item label={t("products.name_ar")} name="name_ar" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label={t("products.name_en")} name="name_en" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label={t("products.desc_ar")} name="description_ar"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item label={t("products.desc_en")} name="description_en"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item label={t("products.price")} name="price" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
            <Form.Item label={t("products.supplier_price")} name="supplier_price" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
            <Form.Item label={t("products.unit")} name="unit"><Input placeholder={t("products.unit_placeholder")} /></Form.Item>
            <Form.Item label={t("products.discount")} name="discount"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
            <Form.Item label={t("products.discount_type")} name="discount_type">
                <Select><Option value="fixed">{t("products.fixed")}</Option><Option value="percent">{t("products.percent")}</Option></Select>
            </Form.Item>
            <Form.Item label={t("products.select_main")} name="main_category_id" rules={[{ required: true }]}>
                <Select onChange={handleMainCategoryChange}>
                    {categories.map(cat => <Option key={cat.id} value={cat.id}>{cat.name.en}</Option>)}
                </Select>
            </Form.Item>
            <Form.Item label={t("products.select_sub")} name="sub_category_id" rules={[{ required: true }]}>
                <Select>{subCategories.map(sub => <Option key={sub.id} value={sub.id}>{sub.name.en}</Option>)}</Select>
            </Form.Item>
            <Form.Item label={t("products.stock")} name="stock"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
            {/* <Form.Item label="Featured" name="isFeatured" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item label="Hidden" name="isHidden" valuePropName="checked"><Switch /></Form.Item> */}
            <Form.Item label={t("products.images")}>
                <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={({ fileList }) => setFileList(fileList)}
                    beforeUpload={() => false} // prevent auto upload
                    multiple
                >
                    {fileList.length >= 5 ? null : <div><Plus /><div style={{ marginTop: 8 }}>{t("banners.upload")}</div></div>}
                </Upload>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" icon={<Save />} loading={submitLoading}>{t("common.save")}</Button>
            </Form.Item>
        </Form>
    );
};

export default AddProduct;
