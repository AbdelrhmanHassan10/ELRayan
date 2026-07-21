import { useState, useEffect } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { Card, DatePicker, Button, Row, Col, Table, Spin } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const { RangePicker } = DatePicker;

export default function VendorsPerformanceTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://api.maghni.acwad.tech/api/v1/dashboard/vendors/performance",
        {
          params: {
            startDate: startDate ? startDate.format("YYYY-MM-DD") : undefined,
            endDate: endDate ? endDate.format("YYYY-MM-DD") : undefined,
          },
        }
      );
      setData(res.data);
    } catch (err) {
      console.error("Error fetching vendor performance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );

  if (!data)
    return (
      <p className="text-center text-gray-600">No vendor performance data.</p>
    );

  const performanceColumns = [
    {
      title: "Vendor Name",
      dataIndex: "vendorName",
      key: "vendorName",
    },
    {
      title: "Orders",
      dataIndex: "orderCount",
      key: "orderCount",
    },
    {
      title: "Total Revenue (EGP)",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (value) => <CountUp end={value || 0} duration={1.5} separator="," />,
    },
    {
      title: "Avg Order Value (EGP)",
      dataIndex: "averageOrderValue",
      key: "averageOrderValue",
      render: (value) => Number(value).toFixed(2),
    },
  ];

  const ratingsColumns = [
    {
      title: "Vendor Name",
      dataIndex: "vendorName",
      key: "vendorName",
    },
    {
      title: "Average Rating",
      dataIndex: "averageRating",
      key: "averageRating",
    },
    {
      title: "Review Count",
      dataIndex: "reviewCount",
      key: "reviewCount",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Date Filters */}
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <h2 className="text-2xl font-bold">Vendors Performance</h2>
        </Col>
        <Col>
          <Row gutter={8} align="middle">
            <Col>
              <RangePicker
                value={
                  startDate && endDate
                    ? [startDate, endDate]
                    : null
                }
                onChange={(values) => {
                  if (values) {
                    setStartDate(values[0]);
                    setEndDate(values[1]);
                  } else {
                    setStartDate(null);
                    setEndDate(null);
                  }
                }}
                placeholder={["Start Date", "End Date"]}
              />
            </Col>
            <Col>
              <Button type="primary" onClick={fetchData} loading={loading}>
                Load Data
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <SummaryCard title="Total Vendors" value={data.totalVendors} color="#2563eb" />
        </Col>
        <Col xs={24} sm={12}>
          <SummaryCard title="Active Vendors" value={data.activeVendors} color="#10b981" />
        </Col>
      </Row>

      {/* Vendor Performance Chart */}
      <Card title="Revenue by Vendor" className="mt-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.vendorPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="vendorName" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} EGP`, "Revenue"]} />
            <Bar dataKey="totalRevenue" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Vendor Performance Table */}
      <Card title="Vendor Performance" className="mt-6">
        <Table
          dataSource={data.vendorPerformance}
          columns={performanceColumns}
          rowKey="vendorId"
          pagination={false}
          loading={loading}
          className="overflow-x-auto"
        />
      </Card>

      {/* Vendor Ratings Table */}
      {data.vendorRatings?.length > 0 && (
        <Card title="Vendor Ratings" className="mt-6">
          <Table
            dataSource={data.vendorRatings}
            columns={ratingsColumns}
            rowKey="vendorId"
            pagination={false}
            loading={loading}
            className="overflow-x-auto"
          />
        </Card>
      )}
    </div>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <Card style={{ backgroundColor: color, color: "#fff" }}>
      <h4 className="text-sm uppercase opacity-80">{title}</h4>
      <p className="text-2xl font-bold mt-1">
        <CountUp end={value || 0} duration={2.5} separator="," />
      </p>
    </Card>
  );
}
