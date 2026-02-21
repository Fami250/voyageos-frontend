import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { authFetch } from "../api/api";
import API from "../api/api";

export default function QuotationView() {

  const { id } = useParams();

  const [quotation, setQuotation] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // ================= LOAD =================
  useEffect(() => {
    if (id) {
      fetchQuotation();
    }
  }, [id]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await authFetch(`/quotations/${id}`);

      if (res.status === 404) {
        setQuotation(null);
        setError("Quotation not found");
        return;
      }

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();
      setQuotation(data);

      // Load related invoice
      const invRes = await authFetch(`/invoices?quotation_id=${id}`);

      if (invRes.ok) {
        const invData = await invRes.json();
        if (Array.isArray(invData) && invData.length > 0) {
          setInvoice(invData[0]);
        } else {
          setInvoice(null);
        }
      } else {
        setInvoice(null);
      }

    } catch (err) {
      console.error("Load error:", err);
      setError("Server connection error");
      setQuotation(null);
    } finally {
      setLoading(false);
    }
  };

  // ================= STATUS UPDATE =================
  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);

      const res = await authFetch(`/quotations/${id}/status`, {
        method: "PUT",
        body: { status: newStatus }
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Status update failed");
        return;
      }

      await fetchQuotation();

    } catch (err) {
      console.error("Status update error:", err);
      alert("Server error");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB");
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!quotation) return null;

  const status = quotation.status;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-3xl font-bold">
            Quotation #{quotation.quotation_number}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Status: <span className="font-semibold">{status}</span>
          </p>
        </div>

        <div className="flex gap-3">

          {status === "DRAFT" && (
            <>
              <button
                onClick={() => updateStatus("CONFIRMED")}
                disabled={updating}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>

              <button
                onClick={() => updateStatus("CANCELLED")}
                disabled={updating}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </>
          )}

          {status === "CONFIRMED" && (
            <>
              <button
                onClick={() => updateStatus("BOOKED")}
                disabled={updating}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Mark as Booked
              </button>

              <button
                onClick={() => updateStatus("CANCELLED")}
                disabled={updating}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </>
          )}

          <a
            href={`${API}/quotations/${id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="bg-black text-white px-4 py-2 rounded"
          >
            View PDF
          </a>

        </div>
      </div>

      {/* SERVICES */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">

        <h2 className="text-xl font-semibold mb-4">
          Services Included
        </h2>

        <table className="w-full border text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Service</th>
              <th className="p-2 border">Dates</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Unit Price</th>
              <th className="p-2 border">Total</th>
            </tr>
          </thead>

          <tbody>
            {quotation.items.map((item) => (
              <tr key={item.id}>
                <td className="p-2 border">
                  {item.service_name}
                </td>
                <td className="p-2 border">
                  {formatDate(item.start_date)} → {formatDate(item.end_date)}
                </td>
                <td className="p-2 border">
                  {item.quantity}
                </td>
                <td className="p-2 border">
                  PKR {Number(item.sell_price).toLocaleString()}
                </td>
                <td className="p-2 border font-semibold">
                  PKR {Number(item.total_sell).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 text-right space-y-1">
          <p><strong>Total Cost:</strong> PKR {Number(quotation.total_cost).toLocaleString()}</p>
          <p><strong>Total Sell:</strong> PKR {Number(quotation.total_sell).toLocaleString()}</p>
          <p className="text-green-600 font-bold">
            Total Profit: PKR {Number(quotation.total_profit).toLocaleString()}
          </p>
        </div>

      </div>

    </div>
  );
}
