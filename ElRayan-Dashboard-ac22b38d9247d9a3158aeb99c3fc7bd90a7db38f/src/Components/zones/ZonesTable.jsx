import React from "react";
import { Table, Button, Tag, Popconfirm, Switch, Space, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  AimOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default function ZonesTable({
  zones,
  loading,
  onShowMap,
  onEdit,
  onDelete,
  onToggle,
}) {
  const { t } = useTranslation();

  const columns = [
    {
      title: t("zones.name"),
      dataIndex: "name",
      key: "name",
      render: (text) => <b style={{ fontSize: 15 }}>{text}</b>,
    },

    {
      title: t("zones.status"),
      dataIndex: "isActive",
      key: "isActive",
      render: (v) =>
        v ? (
          <Tag color="green">{t("zones.active")}</Tag>
        ) : (
          <Tag color="red">{t("zones.inactive")}</Tag>
        ),
    },
    {
      title: t("common.actions"),
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t("zones.show_map")}>
            <Button
              icon={<AimOutlined />}
              onClick={() => onShowMap(record)}
              type="default"
            />
          </Tooltip>

          <Tooltip title={t("zones.edit_zone")}>
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              // type="primary"
              className="bg-blue-600 text-white hover:bg-blue-700"
            />
          </Tooltip>

          <Popconfirm
            title={t("zones.delete_zone")}
            okText={t("zones.yes")}
            cancelText={t("zones.no")}
            onConfirm={() => onDelete(record.id)}
          >
            <Tooltip title={t("zones.delete_zone")}>
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>

          <Tooltip title={t("zones.toggle_active")}>
            <Switch
              style={{
                background: record.isActive ? "#52c41a" : "#e4e4e4",
              }}
              checked={record.isActive}
              onChange={(checked) => onToggle(record.id, checked)}
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
      pagination={{ pageSize: 10 }}
      bordered
      size="middle"
      style={{
        background: "white",
        borderRadius: 12,
        padding: 8,
      }}
      tableLayout="fixed"
      className="overflow-x-auto"
    />
  );
}
