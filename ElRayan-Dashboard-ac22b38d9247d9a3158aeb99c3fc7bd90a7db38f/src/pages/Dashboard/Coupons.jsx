import { useEffect, useState } from "react";
import { Table, Tag, DatePicker } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function CouponsUsage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUsage = async (start, end) => {
        setLoading(true);

        try {
            const res = await axios.get(
                "https://api.maghni.acwad.tech/api/v1/dashboard/coupons/usage",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    params: {
                        startDate: start,
                        endDate: end,
                    },
                }
            );

            setData(res.data.data);
        } catch (err) {
            console.error(err);

            // ---- Mock Data fallback ----
            setData([
                {
                    couponId: 12,
                    couponCode: "NEWYEAR20",
                    usageCount: 45,
                    totalDiscountGiven: 1250.5,
                    totalRevenue: 18200.0,
                },
                {
                    couponId: 7,
                    couponCode: "WELCOME10",
                    usageCount: 30,
                    totalDiscountGiven: 300.0,
                    totalRevenue: 5400.0,
                },
                {
                    couponId: 3,
                    couponCode: "FREESHIP",
                    usageCount: 18,
                    totalDiscountGiven: 0,
                    totalRevenue: 2700.0,
                },
            ]);
        }

        setLoading(false);
    };

    const columns = [
        {
            title: "Coupon ID",
            dataIndex: "couponId",
            key: "couponId",
        },
        {
            title: "Code",
            dataIndex: "couponCode",
            key: "couponCode",
            render: (code) => <Tag color="blue">{code}</Tag>,
        },
        {
            title: "Usage Count",
            dataIndex: "usageCount",
            key: "usageCount",
        },
        {
            title: "Total Discount Given",
            dataIndex: "totalDiscountGiven",
            key: "totalDiscountGiven",
            render: (v) => `${v.toLocaleString()} EGP`,
        },
        {
            title: "Total Revenue",
            dataIndex: "totalRevenue",
            key: "totalRevenue",
            render: (v) => `${v.toLocaleString()} EGP`,
        },
    ];

    useEffect(() => {
        // default load: last 30 days
        fetchUsage(
            dayjs().subtract(30, "day").format("YYYY-MM-DD"),
            dayjs().format("YYYY-MM-DD")
        );
    }, []);

    return (
        <div className="p-5 bg-white rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Coupons Usage Statistics</h2>

            <RangePicker
                format="YYYY-MM-DD"
                className="mb-4"
                onChange={(dates) => {
                    if (!dates) return;
                    fetchUsage(dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD"));
                }}
            />

            <Table
                rowKey="couponId"
                dataSource={data}
                columns={columns}
                loading={loading}
                bordered
                className="overflow-x-auto"
            />
        </div>
    );
}
