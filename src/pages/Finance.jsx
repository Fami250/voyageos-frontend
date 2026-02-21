import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { authFetch } from "../api/api";

export default function Finance() {

  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH FINANCE DATA =================

  const fetchFinance = async () => {
    try {
      setLoading(true);

      const summaryRes = await authFetch("/accounts/summary");
      const invoiceRes = await authFetch("/invoices/");
      const clientRes = await authFetch("/clients/");

      const summaryData = await summaryRes.json();
      const invoiceData = await invoiceRes.json();
      const clientData = await clientRes.json();

      setSummary(summaryData || null);
      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
      setClients(Array.isArray(clientData) ? clientData : []);

    } catch (err) {
      console.error("Finance fetch error:", err);
      alert("Failed to load finance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  // ================= SAFE NUMBER HELPER =================

  const safe = (val) => {
    if (!val || isNaN(val)) return 0;
    return Number(val);
  };

  if (loading) {
    return <div className="p-10 text-lg font-semibold">Loading Finance...</div>;
  }

  if (!summary) {
    return <div className="p-10 text-red-500">Failed to load Finance data.</div>;
  }

  // ================= SUMMARY CALCULATIONS =================

  const revenue = safe(summary.total_revenue);
  const paid = safe(summary.total_paid);
  const outstanding = safe(summary.total_outstanding);

  const recoveryRate =
    revenue > 0 ? ((paid / revenue) * 100).toFixed(1) : 0;

  const comparisonData = [
    { name: "Revenue", value: revenue },
    { name: "Paid", value: paid }
  ];

  const pieData = [
    { name: "Paid", value: paid },
    { name: "Outstanding", value: outstanding }
  ];

  const COLORS = ["#16a34a", "#dc2626"];

  // ================= CLIENT BREAKDOWN =================

  const clientMap = {};

  invoices.forEach(inv => {
    const clientId = inv.client_id;

    if (!clientMap[clientId]) {
      clientMap[clientId] = {
        client_id: clientId,
        total: 0,
        paid: 0,
        due: 0
      };
    }

    clientMap[clientId].total += safe(inv.total_amount);
    clientMap[clientId].paid += safe(inv.paid_amount);
    clientMap[clientId].due += safe(inv.due_amount);
  });

  const clientBreakdown = Object.values(clientMap);

  const getClientName = (id) => {
    const client = clients.find(c => c.id === id);
    return client ? client.company_name : `Client ${id}`;
  };

  // ================= UI =================

  return (
    <div className="min-h-screen bg-gray-50 p-10 space-y-10">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Finance Overview</h1>
          <p className="text-gray-500 mt-2">
            Revenue, Payments & Outstanding Summary
          </p>
        </div>

        <button
          onClick={fetchFinance}
          className="bg-black text-white px-5 py-2 rounded-xl hover:bg-gray-800 transition"
        >
          Refresh
        </button>
      </div>

      {/* ================= SUMMARY CARDS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <h2 className="text-3xl font-bold text-blue-600 mt-3">
            PKR {revenue.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <p className="text-gray-500 text-sm">Total Paid</p>
          <h2 className="text-3xl font-bold text-green-600 mt-3">
            PKR {paid.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <p className="text-gray-500 text-sm">Outstanding</p>
          <h2 className="text-3xl font-bold text-red-600 mt-3">
            PKR {outstanding.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <p className="text-gray-500 text-sm">Recovery Rate</p>
          <h2 className="text-3xl font-bold mt-3">
            {recoveryRate}%
          </h2>
        </div>

      </div>

      {/* ================= CHARTS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-6">
            Monthly Cash Inflow
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary.monthly_cashflow || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cash_in" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-6">
            Revenue vs Paid
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ================= PIE CHART ================= */}

      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-6">
          Payment Distribution
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              outerRadius={110}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ================= CLIENT TABLE ================= */}

      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-6">
          Client-wise Receivables
        </h3>

        <table className="min-w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Client</th>
              <th className="p-3">Total</th>
              <th className="p-3">Paid</th>
              <th className="p-3">Due</th>
            </tr>
          </thead>

          <tbody>
            {clientBreakdown.map((c) => (
              <tr key={c.client_id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">
                  {getClientName(c.client_id)}
                </td>
                <td className="p-3">
                  PKR {c.total.toLocaleString()}
                </td>
                <td className="p-3 text-green-600">
                  PKR {c.paid.toLocaleString()}
                </td>
                <td className="p-3 text-red-600">
                  PKR {c.due.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}
