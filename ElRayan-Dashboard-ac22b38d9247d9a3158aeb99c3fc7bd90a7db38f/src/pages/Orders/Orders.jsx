import { useEffect, useState } from "react";
import api from "../../Api/Api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Card,
  Spin,
  Row,
  Col,
  Modal,
  Button,
  Table,
  Tag,
  Select,
  Pagination,
} from "antd";

import { useTranslation } from "react-i18next";

const { Option } = Select;

export default function Orders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const language = localStorage.getItem("i18nextLng") || "en";
  const token = localStorage.getItem("token");

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await api.get(
        `/orders?page=${page}&limit=${limit}`
      );
      setOrders(res.data.data.items);
      setStats(res.data.data.statistics);
      setTotalOrders(res.data.data.metadata.totalItems || res.data.data.items.length);
    } catch (err) {
      toast.error(t("orders.fetch_fail"));
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, limit]);

  // Update Order
  const updateOrder = async (orderId, newStatus) => {
    try {
      const body = {
        status: newStatus,
        notes: "status updated from dashboard",
      };
      await api.patch(
        `/orders/${orderId}`,
        body
      );
      toast.success(t("orders.update_success"));
      fetchOrders();
    } catch {
      toast.error(t("orders.update_fail"));
    }
  };

  // Get Order Details
  const fetchOrderDetails = async (orderId) => {
    try {
      setLoadingDetails(true);
      setSelectedOrder(null);
      const res = await api.get(
        `/orders/${orderId}`
      );
      setSelectedOrder(res.data.data);
    } catch {
      toast.error(t("orders.details_fail"));
    } finally {
      setLoadingDetails(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: t("orders.order_number"),
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: t("orders.subtotal"),
      dataIndex: "subtotal",
      key: "subtotal",
      render: (text) => `${text} ${language === "ar" ? "ج.م" : "EGP"}`,
    },
    {
      title: t("orders.discount"),
      dataIndex: "discountAmount",
      key: "discountAmount",
      render: (text) => `${text} ${language === "ar" ? "ج.م" : "EGP"}`,
    },
    {
      title: t("orders.shipping"),
      dataIndex: "shippingAmount",
      key: "shippingAmount",
      render: (text) => `${text} ${language === "ar" ? "ج.م" : "EGP"}`,
    },
    {
      title: t("orders.total"),
      dataIndex: "totalAmount",
      key: "total",
      render: (text) => `${text} ${language === "ar" ? "ج.م" : "EGP"}`,
    },
    {
      title: t("orders.status"),
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const color =
          status === "pending"
            ? "gold"
            : status === "confirmed"
              ? "blue"
              : status === "shipped"
                ? "purple"
                : status === "delivered"
                  ? "green"
                  : "red";
        return <Tag color={color}>
          {t(`orders.${status}`)}
        </Tag>;
      },
    },
    {
      title: t("orders.actions"),
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2 items-center">
          <Button size="small" onClick={() => fetchOrderDetails(record.id)}>
            {t("orders.view")}
          </Button>
          {record.availableTransitions?.length > 0 ? (
            <Select
              size="small"
              placeholder={t("orders.change_status")}
              onChange={(value) => updateOrder(record.id, value)}
              style={{ minWidth: 120 }}
            >
              {record.availableTransitions.map((status) => (
                <Option key={status} value={status}>
                  {t(`orders.${status}`)}
                </Option>
              ))}
            </Select>
          ) : (
            <Tag color="default">{t("orders.final_status") || "Final"}</Tag>
          )}
        </div>
      ),
    },
  ];
  return (
    <div className="p-6 ">
      <ToastContainer />

      {/* Statistics Cards */}
      {/* <Row gutter={16} className="mb-6">
        <Col span={12}>
          <Card>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-gray-500">Total Customers</h3>
                <p className="text-xl font-bold">{stats?.totalUniqueCustomers}</p>
              </div>
              <div className="text-3xl text-blue-500">👥</div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-gray-500">Total Sales</h3>
                <p className="text-xl font-bold">{stats?.totalSales} EGP</p>
              </div>
              <div className="text-3xl text-green-500">💰</div>
            </div>
          </Card>
        </Col>
      </Row> */}

      {/* Orders Table */}
      {loadingOrders ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            pagination={false}
          />
          <div className="flex justify-end mt-4">
            <Pagination
              current={page}
              pageSize={limit}
              total={totalOrders}
              onChange={(p, l) => {
                setPage(p);
                setLimit(l);
              }}
              showSizeChanger
              pageSizeOptions={["5", "10", "20", "50"]}
            />
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        open={!!selectedOrder}
        onCancel={() => setSelectedOrder(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedOrder(null)}>
            {t("orders.close")}
          </Button>,
        ]}
        width={800}
      >
        {loadingDetails || !selectedOrder ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">
              {t("orders.details_modal")} #{selectedOrder.orderNumber}
            </h2>

            {/* STATUS + PAYMENT */}
            <div className="mb-4 p-4 bg-gray-50 rounded border">
              <p>
                <b>{t("orders.status")}:</b> {selectedOrder.statusDescription || selectedOrder.status}
              </p>
              <p>
                <b>{t("orders.payment")}:</b> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
              </p>
            </div>

            {/* SHIPPING ADDRESS */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">{t("orders.shipping_address")}</h3>
              <p><b>{t("orders.phone")}:</b> {selectedOrder.shippingAddress?.phone1}</p>
              <p><b>{t("orders.address_title")}:</b> {selectedOrder.shippingAddress?.title}</p>
              <p><b>{t("orders.description")}:</b> {selectedOrder.shippingAddress?.description}</p>
            </div>

            {/* SUMMARY */}
            <div className="mb-4 p-4 bg-gray-50 rounded border">
              <p><b>{t("orders.subtotal")}:</b> {selectedOrder.subtotal}</p>
              <p><b>{t("orders.discount")}:</b> {selectedOrder.discountAmount}</p>
              <p><b>{t("orders.shipping")}:</b> {selectedOrder.shippingAmount}</p>
              <hr className="my-2" />
              <p className="font-bold text-lg">
                {t("orders.total")}: {selectedOrder.totalAmount}
              </p>
            </div>

            {/* PRODUCTS */}
            <div>
              <h3 className="font-semibold mb-2">{t("orders.products")}</h3>

              {selectedOrder.orderItems?.map((item) => (
                <div
                  key={item.id}
                  className="border p-3 mb-2 rounded flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.productImages?.[0]}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />

                    <div>
                      <p className="font-bold">{item.productName}</p>

                      <p className="text-sm text-gray-600">
                        {t("orders.qty")}: {item.quantity} × {item.unitPrice}
                      </p>

                      {item.discount > 0 && (
                        <p className="text-xs text-green-600">
                          {t("orders.discount")}: {item.discount}%
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="font-bold">{item.totalPrice}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>

    </div>
  );
}
