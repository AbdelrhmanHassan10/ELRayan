import { useEffect, useState } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Spin, Card, Row, Col, Table } from "antd";

export default function UsersStatistics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"];
  const cardColors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"];

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://api.maghni.acwad.tech/api/v1/user/dashboard/statistics",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data.data);
      toast.success("User statistics loaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-red-500 mt-10">No data found.</div>;
  }

  const { statistics, roleDistribution, genderDistribution, growthTrend, recentActivities } = data;
  const statsEntries = Object.entries(statistics);

  // Columns for Antd Table
  const columns = [
    { title: "Activity", dataIndex: "activity", key: "activity" },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
      render: (value) => <span className="text-blue-600 font-semibold">{value}</span>,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={2000} />
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Users Statistics</h2>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        {statsEntries.map(([key, value], index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={key}>
            <Card
              style={{ backgroundColor: cardColors[index % cardColors.length], color: "white" }}
              className="text-center transform transition hover:scale-105"
            >
              <p className="text-sm font-medium mb-2 capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </p>
              <p className="text-3xl font-extrabold">
                <CountUp start={0} end={value} duration={1.5} separator="," />
              </p>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Role & Gender Distribution */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} lg={12}>
          <Card title="Role Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  dataKey="percentage"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.role}`}
                >
                  {roleDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Gender Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderDistribution}
                  dataKey="percentage"
                  nameKey="gender"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.gender}`}
                >
                  {genderDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Growth Trend */}
      <Card title="Growth Trend" className="mb-8">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={growthTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(d) =>
                new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
              }
            />
            <YAxis />
            <Tooltip
              labelFormatter={(d) =>
                new Date(d).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              }
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Activities Table */}
      <Card title="Recent Activities">
        <Table
          dataSource={recentActivities}
          columns={columns}
          rowKey={(record, idx) => idx}
          pagination={false}
        />
      </Card>
    </div>
  );
}
