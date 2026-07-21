import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, X, Pencil, Trash } from "lucide-react";
import { Spin, Button, Modal, Input, Select, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const API_URL = "https://api.elrayan.acwad.tech/api/v1/banners";

export default function Banners() {
  const { t } = useTranslation();
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

  // ------------------ FETCH ------------------
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (response.ok) setBanners(result.data);
      else toast.error(result.message);
    } catch (err) {
      toast.error(t("banners.fetch_fail"));
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
    formData.append("imagePath", imageFile);
    formData.append("title", title);
    formData.append("link", link);
    formData.append("productId", productId);
    formData.append("type", type);

    // console.log(imageFile)

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const res = await response.json();

      if (response.ok) {
        toast.success(t("banners.add_success"));
        fetchBanners();
        setIsAddModalOpen(false);
        resetForm();
      } else toast.error(res.message);
    } catch {
      toast.error(t("banners.add_fail"));
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
    formData.append("productId", productId);
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
        toast.success(t("banners.update_success"));
        fetchBanners();
        setIsEditModalOpen(false);
        resetForm();
      } else toast.error(res.message);
    } catch {
      toast.error(t("banners.update_fail"));
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
        toast.success(t("banners.delete_success"));
        setBanners(banners.filter((b) => b.id !== id));
        setIsModalOpen(false);
      } else toast.error(t("banners.delete_fail"));
    } catch {
      toast.error(t("banners.delete_fail"));
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
          { headers: { lang: "en" } },
        );
        const data = await res.json();
        if (data.success) setMainCategories(data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedMain) return;

    const fetchSubs = async () => {
      try {
        const res = await fetch(
          `https://api.elrayan.acwad.tech/api/v1/sub-categories?main_category=${selectedMain}`,
          { headers: { lang: "en" } },
        );
        const data = await res.json();
        if (data.success) setSubCategories(data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchSubs();
  }, [selectedMain]);

  useEffect(() => {
    if (!selectedMain || !selectedSub) return;

    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `https://api.elrayan.acwad.tech/api/v1/product?categoryId=${selectedMain}&subCategoryId=${selectedSub}`,
          { headers: { lang: "en" } },
        );
        const data = await res.json();
        if (data.success) setProducts(data.data.items);
      } catch (err) {
        console.log(err);
      }
    };

    fetchProducts();
  }, [selectedSub]);

  // ------------------ RESET FORM ------------------

  const resetForm = () => {
    setTitle("");
    setLink("");
    setProductId(0);
    setType("discount");
    setImageFile(null);
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("banners.title")}</h1>

        <Button
          type="primary"
          icon={<Plus size={18} />}
          style={{ background: "#e3010f" }}
          onClick={() => setIsAddModalOpen(true)}
        >
          {t("banners.add_banner")}
        </Button>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="flex justify-center items-center">
          <Spin size="large" />
        </div>
      ) : banners.length === 0 ? (
        <p className="text-gray-500">{t("banners.no_banners")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white shadow rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition"
              onClick={() => {
                setSelectedBanner(banner);
                setIsModalOpen(true);
              }}
            >
              <img
                src={banner.imagePath}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 space-y-1 text-sm">
                <p className="font-semibold">
                   {banner.title}
                </p>

                {banner.product ? (
                  <>
                    <p className="font-medium truncate">
                      {banner.product.name}
                    </p>

                  <div className="flex items-center gap-2">
                      <p className="line-through text-red-500">{banner.product.price} ج.م</p>
                      <p className="text-green-600">
                        {banner.product.price_after_discount} ج.م
                      </p>
                  </div>
                    {
                      banner.link && (
                        <p className="text-blue-600 underline break-all">
                          {banner.link}
                        </p>
                      )
                    }
                  </>
                ) : (
                  <p className="text-gray-400 italic">
                    {t("banners.no_product")}
                  </p>
                )}
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
        width={600}
      >
        {selectedBanner && (
          <div>
            <img
              src={selectedBanner.imagePath}
              className="w-full h-60 rounded mb-4"
            />

            <div className="flex justify-end gap-2">
              <Button
                danger
                icon={<Trash size={16} />}
                onClick={() => deleteBanner(selectedBanner.id)}
                loading={submitLoading}
              >
                {t("common.delete")}
              </Button>

              <Button
                type="primary"
                icon={<Pencil size={16} />}
                style={{ background: "#e3010f" }}
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditModalOpen(true);
                  setTitle(selectedBanner.title || "");
                  setLink(selectedBanner.link || "");
                  setProductId(selectedBanner.productId || 0);
                  setType(selectedBanner.type || "discount");
                }}
                loading={submitLoading}
              >
                {t("common.edit")}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ------------------ ADD MODAL ------------------ */}
      <Modal
        open={isAddModalOpen}
        title={t("banners.add_banner")}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
      >
        <form onSubmit={addBanner} className="space-y-4">
          <Upload
            beforeUpload={() => false}
            maxCount={1}
            onChange={({ fileList }) =>
              setImageFile(fileList[0]?.originFileObj || null)
            }
          >
            <Button icon={<UploadOutlined />}>{t("banners.upload")}</Button>
          </Upload>

          <Input
            placeholder={t("banners.banner_title")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            placeholder={t("banners.link")}
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <Select
            placeholder={t("banners.select_main_category")}
            className="w-full"
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
          />

          <Select
            placeholder="Select Sub Category"
            className="w-full"
            value={selectedSub}
            onChange={(value) => setSelectedSub(value)}
            disabled={!selectedMain}
            options={subCategories.map((sub) => ({
              value: sub.id,
              label: sub.name,
            }))}
          />

          <Select
            placeholder="Select Product"
            className="w-full"
            value={productId}
            onChange={(value) => setProductId(value)}
            disabled={!selectedSub}
            options={products.map((p) => ({
              value: p.id,
              label: p.name,
            }))}
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
          />

          <Select
            value={type}
            onChange={setType}
            options={[
              { value: "discount", label: "discount" },
              { value: "new", label: "new" },
            ]}
            className="w-full"
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsAddModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              htmlType="submit"
              type="primary"
              style={{ background: "#e3010f" }}
              loading={submitLoading}
            >
              {t("common.save")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------ EDIT MODAL ------------------ */}

      <Modal
        open={isEditModalOpen}
        title={t("banners.edit_banner")}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <form onSubmit={editBanner} className="space-y-4">
          <Upload
            beforeUpload={() => false}
            maxCount={1}
            onChange={({ fileList }) =>
              setImageFile(fileList[0]?.originFileObj || null)
            }
          >
            <Button icon={<UploadOutlined />}>{t("banners.upload_new")}</Button>
          </Upload>

          <Input
            placeholder={t("banners.banner_title")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            placeholder={t("banners.link")}
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />

          {/* MAIN CATEGORY */}
          <Select
            placeholder={t("banners.select_main_category")}
            className="w-full"
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
          />

          {/* SUB CATEGORY */}
          <Select
            placeholder={t("banners.select_sub_category")}
            className="w-full"
            value={selectedSub}
            onChange={(value) => setSelectedSub(value)}
            disabled={!selectedMain}
            options={subCategories.map((sub) => ({
              value: sub.id,
              label: sub.name,
            }))}
          />

          {/* PRODUCT WITH SEARCH */}
          <Select
            placeholder={t("banners.select_product")}
            className="w-full"
            value={productId}
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            onChange={(value) => setProductId(value)}
            disabled={!selectedSub}
            options={products.map((p) => ({
              value: p.id,
              label: p.name,
            }))}
          />

          <Select
            value={type}
            onChange={setType}
            options={[
              { value: "discount", label: t("banners.discount") },
              { value: "new", label: t("banners.new") },
            ]}
            className="w-full"
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsEditModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              htmlType="submit"
              type="primary"
              style={{ background: "#e3010f" }}
              loading={submitLoading}
            >
              {t("common.update")}
            </Button>
          </div>
        </form>
      </Modal>

      <ToastContainer />
    </div>
  );
}
