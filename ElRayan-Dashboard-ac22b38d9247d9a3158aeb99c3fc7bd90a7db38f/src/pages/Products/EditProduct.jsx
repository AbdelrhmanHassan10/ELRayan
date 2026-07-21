import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Spin,
  Upload,
} from "antd";
import { Plus, Save } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Title from "antd/es/skeleton/Title";
import { useTranslation } from "react-i18next";

const { Option } = Select;

const EditProduct = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState([]);
  const token = localStorage.getItem("token");
  const nav = useNavigate();
  const headers = {
    Authorization: `Bearer ${token}`,
    "Accept-Language": "en",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch product
        const productRes = await axios.get(
          `https://api.elrayan.acwad.tech/api/v1/product/${id}`,
          { headers },
        );
        const data = productRes.data.data;
        setProduct(data);

        // Prepare existing images for Upload component
        const images = data.images.map((img) => ({
          uid: img.id,
          name: `image_${img.id}.png`,
          status: "done",
          url: img.attach,
        }));
        setFileList(images);

        // Fetch categories
        const catRes = await axios.get(
          "https://api.elrayan.acwad.tech/api/v1/category",
          { headers },
        );
        setCategories(catRes.data.data);

        // Fetch subcategories of the product's main category
        const mainCatId = data.main_category_id;
        const subCatRes = await axios.get(
          `https://api.elrayan.acwad.tech/api/v1/sub-categories?main_category=${mainCatId}`,
          { headers },
        );
        setSubCategories(subCatRes.data.data);

        // Set initial form values
        form.setFieldsValue({
          name_ar: data.name.ar,
          name_en: data.name.en,
          description_ar: data.description.ar,
          description_en: data.description.en,
          price: data.price,
          supplier_price: data.supplier_price,
          discount: data.discount,
          discount_type: data.discount_type,
          main_category_id: mainCatId,
          sub_category_id: data.sub_category_id,
          stock: data.stock,
          isFeatured: data.isFeatured,
          isHidden: data.isHidden,
          unit: data.unit,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleMainCategoryChange = async (value) => {
    form.setFieldsValue({ sub_category_id: null });
    const res = await axios.get(
      `https://api.elrayan.acwad.tech/api/v1/sub-categories?main_category=${value}`,
      { headers },
    );
    setSubCategories(res.data.data);
  };

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append("name[ar]", values.name_ar);
      formData.append("name[en]", values.name_en);
      formData.append("description[ar]", values.description_ar);
      formData.append("description[en]", values.description_en);
      formData.append("price", values.price);
      formData.append("supplier_price", values.supplier_price);
      formData.append("discount", values.discount);
      formData.append("discount_type", values.discount_type);
      formData.append("main_category_id", values.main_category_id);
      formData.append("sub_category_id", values.sub_category_id);
      formData.append("stock", values.stock);
      formData.append("isFeatured", values.isFeatured);
    //   formData.append("isHidden", false);
      formData.append("unit", values.unit);

      // Append new files only
      fileList.forEach((file) => {
        if (file.originFileObj) formData.append("images", file.originFileObj);
      });

      await axios.patch(
        `https://api.elrayan.acwad.tech/api/v1/product/${id}`,
        formData,
        {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
        },
      );
      toast.success(t("product_details.update_success"));
      setTimeout(() => {
        nav("/products");
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error(t("product_details.update_fail"));
    }
  };

  if (loading)
    return (
      <Spin size="large" style={{ display: "block", margin: "100px auto" }} />
    );

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      style={{ maxWidth: 800, margin: "auto" }}
    >
      <ToastContainer />
      <h1 style={{ textAlign: "center", marginBottom: 20, fontSize: 24 }}>
        {t("product_details.edit_title")}
      </h1>
      <Form.Item
        label={t("product_details.name_ar")}
        name="name_ar"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={t("product_details.name_en")}
        name="name_en"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label={t("product_details.desc_ar")} name="description_ar">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item label={t("product_details.desc_en")} name="description_en">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item
        label={t("product_details.price")}
        name="price"
        rules={[{ required: true }]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        label={t("product_details.supplier_price")}
        name="supplier_price"
        rules={[{ required: true }]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item label={t("products.unit")} name="unit">
        <Input placeholder={t("products.unit_placeholder")} />
      </Form.Item>
      <Form.Item label={t("product_details.discount")} name="discount">
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        label={t("product_details.discount_type")}
        name="discount_type"
      >
        <Select>
          <Option value="fixed">{t("product_details.fixed")}</Option>
          <Option value="percent">{t("product_details.percent")}</Option>
        </Select>
      </Form.Item>
      <Form.Item
        label={t("product_details.main_category")}
        name="main_category_id"
        rules={[{ required: true }]}
      >
        <Select onChange={handleMainCategoryChange}>
          {categories.map((cat) => (
            <Option key={cat.id} value={cat.id}>
              {cat.name.en}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={t("product_details.sub_category")}
        name="sub_category_id"
        rules={[{ required: true }]}
      >
        <Select>
          {subCategories.map((sub) => (
            <Option key={sub.id} value={sub.id}>
              {sub.name.en}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label={t("product_details.stock")} name="stock">
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        label={t("product_details.featured")}
        name="isFeatured"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      {/* <Form.Item
        label={t("product_details.hidden")}
        name="isHidden"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item> */}
      <Form.Item label={t("product_details.images")}>
        <Upload
          listType="picture-card"
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false} // prevent auto upload
          multiple
        >
          {fileList.length >= 5 ? null : (
            <div>
              <Plus />
              <div style={{ marginTop: 8 }}>{t("product_details.upload")}</div>
            </div>
          )}
        </Upload>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" icon={<Save />}>
          {t("product_details.save")}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditProduct;
