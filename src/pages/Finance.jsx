import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend,
  PieChart, Pie, Cell
} from "recharts";
import API from "../api/api";

export default function Finance() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const authHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return null;
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchFinance = async () => {
    try {
      setLoading(true);
      const headers = authHeader();
      if (!headers) return;

      const [summaryRes, invoiceRes, clientRes] = await Promise.all([
        fetch(`${API}/accounts/summary`, { headers }),
        fetch(`${API}/invoices/`, { headers }),
        fetch(`${API}/clients/`, { headers }),
      ]);

      if ([summaryRes, invoiceRes, clientRes].some(r => r.status === 401)) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!summaryRes.ok || !invoiceRes.ok || !clientRes.ok)
        throw new Error("Finance fetch failed");

      setSummary(await summaryRes.json());
      setInvoices(await invoiceRes.json());
      setClients(await clientRes.json());

    } catch (err) {
      console.error("Finance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  if (loading) return <div className="p-10">Loading Finance...</div>;
  if (!summary) return <div className="p-10 text-red-500">Finance load failed</div>;

  return <div>Finance Module Loaded Successfully</div>;
}
