import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API || "http://localhost:8000";

  const [data, setData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/dashboard/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("API error");
        }
        return res.json();
      })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dashboard:", err);
        setLoading(false);
      });

    setMonthlyData([
      { month: "Jan", revenue: 1200000, profit: 250000 },
      { month: "Feb", revenue: 1500000, profit: 320000 },
      { month: "Mar", revenue: 900000, profit: 180000 },
      { month: "Apr", revenue: 1700000, profit: 400000 },
      { month: "May", revenue: 1300000, profit: 270000 },
      { month: "Jun", revenue: 2000000, profit: 520000 },
    ]);
  }, []);

  const safe = (val) => {
    if (!val || isNaN(val)) return 0;
    return Number(val);
  };

  if (loading) {
    return (
      <div className="p-10 text-lg font-semibold">
        Loading dashboard...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10 text-red-500 font-semibold">
        Failed to load dashboard data.
      </div>
    );
  }

  const quotations = safe(data.quotation_metrics?.total_quotations);
  const revenue = safe(data.invoice_metrics?.total_revenue);
  const profit = safe(data.quotation_metrics?.total_profit);
  const totalInvoices = safe(data.invoice_metrics?.total_invoices);

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold">VoyageOS Dashboard</h1>
          <p className="text-gray-500 mt-2">
            Real-time travel business performance
          </p>
        </div>

        <button
          onClick={() => navigate("/create-quotation")}
          className="bg-black text-white px-5 py-2 rounded-xl hover:bg-gray-800 transition"
        >
          + New Quotation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <p className="text-gray-500 text-sm">Total Quotations</p>
          <h2 className="text-3xl font-bold mt-3">{quotations}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <h2 className="text-3xl font-bold text-blue-600 mt-3">
            PKR {revenue.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <p className="text-gray-500 text-sm">Total Profit</p>
          <h2 className="text-3xl font-bold text-green-600 mt-3">
            PKR {profit.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <p className="text-gray-500 text-sm">Total Invoices</p>
          <h2 className="text-3xl font-bold mt-3">
            {totalInvoices}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-6">
            Monthly Revenue Trend
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-6">
            Monthly Profit
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="profit" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
