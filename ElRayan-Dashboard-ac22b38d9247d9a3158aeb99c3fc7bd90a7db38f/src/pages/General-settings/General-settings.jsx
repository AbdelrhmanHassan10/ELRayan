import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, Button, Spin, Form, Input, Modal, Row, Col, Switch, Typography } from "antd";
import { useTranslation } from "react-i18next";
const { Text } = Typography;


export default function AppVersionSettings() {
  const { t } = useTranslation();
  const token = localStorage.getItem("token");

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [versionData, setVersionData] = useState(null);
  const [htmlModalOpen, setHtmlModalOpen] = useState(false);
  const [modalHtml, setModalHtml] = useState("");
  const [form] = Form.useForm();

  // Check version
  const checkVersion = async () => {
    try {
      setChecking(true);
      const res = await axios.get(
        "https://api.elrayan.acwad.tech/api/v1/app-version/check",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVersionData(res.data);
      toast.success(t("general_settings.version_loaded"));
    } catch (err) {
      console.error(err);
      toast.error(t("general_settings.fetch_fail"));
    } finally {
      setChecking(false);
    }
  };

  // Toggle app status
  const toggleAppStatus = async (checked) => {
    try {
      setUpdating(true);
      const res = await axios.patch(
        "https://api.elrayan.acwad.tech/api/v1/app-version/toggle-app-status",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVersionData(prev => ({ ...prev, isOpen: res.data.isOpen }));
      toast.success(t("general_settings.app_status_updated", { status: res.data.isOpen ? t("general_settings.open") : t("general_settings.closed") }));
    } catch (err) {
      console.error(err);
      toast.error(t("general_settings.status_fail"));
    } finally {
      setUpdating(false);
    }
  };

  // Update version
  const updateVersion = async (values) => {
    try {
      setUpdating(true);
      await axios.put(
        "https://api.elrayan.acwad.tech/api/v1/app-version/update",
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t("general_settings.update_success"));
      setShowUpdateModal(false);
      checkVersion();
    } catch (err) {
      console.error(err);
      toast.error(t("general_settings.update_fail"));
    } finally {
      setUpdating(false);
    }
  };

  // Fetch HTML page
  const fetchHtml = async (url) => {
    try {
      setLoading(true);
      const res = await axios.get(url);
      setModalHtml(res.data);
      setHtmlModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch page");
    } finally {
      setLoading(false);
    }
  };

  return (<div className="p-6"> <ToastContainer />

    {/* CHECK VERSION CARD */}
    <Card title={t("general_settings.app_version_info")} className="mb-4">
      <Button type="primary" onClick={checkVersion} loading={checking}>
        {t("general_settings.load_version")}
      </Button>
      {versionData && (
        <Spin spinning={checking || updating} className="mt-4">
          <Row gutter={16} className="mt-2">
            <Col span={12}>
              <Text strong>{t("general_settings.android_version")}:</Text> {versionData.androidVersion}
            </Col>
            <Col span={12}>
              <Text strong>{t("general_settings.android_end_date")}:</Text> {versionData.androidEndDate}
            </Col>
          </Row>
          <Row gutter={16} className="mt-2">
            <Col span={12}>
              <Text strong>{t("general_settings.ios_version")}:</Text> {versionData.iosVersion}
            </Col>
            <Col span={12}>
              <Text strong>{t("general_settings.ios_end_date")}:</Text> {versionData.iosEndDate}
            </Col>
          </Row>
          <Row gutter={16} className="mt-2" align="middle">
            <Col span={12}>
              <Text strong>{t("general_settings.status")}:</Text>
            </Col>
            <Col span={12}>
              <Switch
                checked={versionData.isOpen}
                onChange={toggleAppStatus}
                loading={updating}
                checkedChildren={t("general_settings.open")}
                unCheckedChildren={t("general_settings.closed")}
              />
            </Col>
          </Row>
        </Spin>
      )}
    </Card>

    {/* UPDATE VERSION CARD */}
    <Card title={t("general_settings.update_app_version")} className="mb-4">
      <Button type="primary" onClick={() => setShowUpdateModal(true)}>
        {t("general_settings.open_update_form")}
      </Button>
    </Card>

    {/* MODAL FORM */}
    <Modal
      title={t("general_settings.update_app_version")}
      open={showUpdateModal}
      onCancel={() => setShowUpdateModal(false)}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={updateVersion}
        initialValues={{
          androidVersion: versionData?.androidVersion || "",
          androidEndDate: versionData?.androidEndDate || "",
          androidUrl: versionData?.androidUrl || "",
          iosVersion: versionData?.iosVersion || "",
          iosEndDate: versionData?.iosEndDate || "",
          iosUrl: versionData?.iosUrl || "",
        }}
      >
        <Row gutter={16}>
          {[
            { name: "androidVersion", label: t("general_settings.android_version") },
            { name: "androidEndDate", label: t("general_settings.android_end_date") },
            { name: "androidUrl", label: t("general_settings.android_url") },
            { name: "iosVersion", label: t("general_settings.ios_version") },
            { name: "iosEndDate", label: t("general_settings.ios_end_date") },
            { name: "iosUrl", label: t("general_settings.ios_url") },
          ].map((field) => (
            <Col span={24} md={12} key={field.name}>
              <Form.Item label={field.label} name={field.name}>
                <Input />
              </Form.Item>
            </Col>
          ))}
        </Row>
        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={() => setShowUpdateModal(false)}>{t("settings.cancel")}</Button>
          <Button type="primary" htmlType="submit" loading={updating}>
            {t("general_settings.save_changes")}
          </Button>
        </div>
      </Form>
    </Modal>

    {/* HTML PAGES CARD */}
    <Card title={t("general_settings.policy_pages")}>
      <div className="flex gap-3">
        <Button onClick={() => fetchHtml("https://api.elrayan.acwad.tech/api/v1/app-version/privacy-policy-link")}>
          {t("general_settings.privacy_policy")}
        </Button>
        <Button onClick={() => fetchHtml("https://api.elrayan.acwad.tech/api/v1/app-version/deletion-link")}>
          {t("general_settings.deletion_policy")}
        </Button>
      </div>
    </Card>

    {/* HTML MODAL */}
    <Modal
      title={t("general_settings.html_page")}
      open={htmlModalOpen}
      onCancel={() => setHtmlModalOpen(false)}
      footer={null}
      width={900}
    >
      {loading ? <Spin tip="Loading..." /> : <div dangerouslySetInnerHTML={{ __html: modalHtml }} />}
    </Modal>
  </div>

  );
}
