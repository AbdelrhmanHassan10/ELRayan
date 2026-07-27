import React from "react";
import { Table, Button, Tag, Popconfirm, Switch, Space, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  AimOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";

export default function ZonesTable({
  zones,
  loading,
  onShowMap,
  onEdit,
  onDelete,
  onToggle,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const currency = isArabic ? "ج.م" : "EGP";

  const columns = [
    {
      title: t("zones.name") || (isArabic ? "اسم المنطقة" : "Zone Name"),
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#9f1239]/10 text-[#9f1239] shrink-0">
            <MapPin size={16} />
          </div>
          <b className="text-slate-800 text-sm md:text-base">{text}</b>
        </div>
      ),
    },
    {
      title: isArabic ? "رسوم الشحن والتوصيل" : "Shipping Cost",
      dataIndex: "shippingCost",
      key: "shippingCost",
      align: "center",
      render: (cost) => (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-50 border border-rose-200/70 font-black text-[#9f1239] text-sm shadow-2xs">
          <span>{cost || "0.00"}</span>
          <span className="text-xs font-bold text-[#9f1239]/70">{currency}</span>
        </span>
      ),
    },
    {
      title: t("zones.status") || (isArabic ? "حالة المنطقة" : "Status"),
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      render: (v) =>
        v ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {t("zones.active") || (isArabic ? "نشط ومتاح" : "Active")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {t("zones.inactive") || (isArabic ? "متوقف مؤقتاً" : "Inactive")}
          </span>
        ),
    },
    {
      title: t("common.actions") || (isArabic ? "الإجراءات" : "Actions"),
      key: "actions",
      align: "center",
      width: 220,
      render: (_, record) => (
        <Space size="small" className="flex items-center justify-center">
          <Tooltip title={t("zones.show_map") || (isArabic ? "عرض النطاق على الخريطة" : "Show on map")}>
            <Button
              icon={<AimOutlined />}
              onClick={() => onShowMap(record)}
              className="h-9 w-9 rounded-xl border border-slate-200 hover:border-[#9f1239] hover:text-[#9f1239] flex items-center justify-center transition-all shadow-2xs"
            />
          </Tooltip>

          <Tooltip title={t("zones.edit_zone") || (isArabic ? "تعديل المنطقة" : "Edit zone")}>
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              className="h-9 w-9 rounded-xl bg-[#9f1239] text-white hover:bg-[#881337] border-0 flex items-center justify-center shadow-md shadow-[#9f1239]/20 transition-all"
            />
          </Tooltip>

          <Popconfirm
            title={t("zones.delete_zone") || (isArabic ? "هل أنت متأكد من حذف هذه المنطقة؟" : "Delete zone?")}
            okText={t("zones.yes") || (isArabic ? "نعم، احذف" : "Yes")}
            cancelText={t("zones.no") || (isArabic ? "إلغاء" : "No")}
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(record.id)}
          >
            <Tooltip title={t("zones.delete_zone") || (isArabic ? "حذف المنطقة" : "Delete")}>
              <Button danger icon={<DeleteOutlined />} className="h-9 w-9 rounded-xl flex items-center justify-center shadow-2xs hover:bg-rose-50 transition-all" />
            </Tooltip>
          </Popconfirm>

          <Tooltip title={t("zones.toggle_active") || (isArabic ? "تفعيل / تعطيل المنطقة" : "Toggle status")}>
            <Switch
              style={{
                background: record.isActive ? "#9f1239" : "#cbd5e1",
              }}
              checked={record.isActive}
              onChange={(checked) => onToggle(record.id, checked)}
              className="ms-1"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      dataSource={zones}
      columns={columns}
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: false }}
      bordered={false}
      size="middle"
      className="overflow-x-auto modern-table"
      rowClassName="hover:bg-rose-50/30 transition-colors"
    />
  );
}

