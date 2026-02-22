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
      if (!res.ok) throw new Error("Load failed");

      const data = await res.json();
      setQuotation(data);

      const invRes = await authFetch(`/invoices?quotation_id=${id}`);
      if (invRes.ok) {
        const invData = await invRes.json();
        setInvoice(invData?.length ? invData[0] : null);
      } else {
        setInvoice(null);
      }

    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const res = await authFetch(`/quotations/${id}/status`, {
        method: "PUT",
        body: { status: newStatus }
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Update failed");
        return;
      }

      await fetchQuotation();
    } catch {
      alert("Server error");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB") : "";

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!quotation) return null;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-3xl font-bold">
            Quotation #{quotation.quotation_number}
          </h1>
          <p className="text-sm text-gray-600">
            Client: <strong>{quotation.client?.company_name}</strong>
          </p>
          <p className="text-sm">
            Status: <strong>{quotation.status}</strong>
          </p>
        </div>

        <div className="flex gap-3">

          {quotation.status === "DRAFT" && (
            <>
              <button
                onClick={() => updateStatus("CONFIRMED")}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => updateStatus("CANCELLED")}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </>
          )}

          {quotation.status === "CONFIRMED" && (
            <>
              <button
                onClick={() => updateStatus("BOOKED")}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Mark as Booked
              </button>
              <button
                onClick={() => updateStatus("CANCELLED")}
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
                  {item.service?.name}
                </td>
                <td className="p-2 border">
                  {formatDate(item.start_date)} → {formatDate(item.end_date)}
                </td>
                <td className="p-2 border">{item.quantity}</td>
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

      {/* INVOICE / PAYMENT */}
      {invoice && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Invoice Details
          </h2>

          <p><strong>Invoice No:</strong> {invoice.invoice_number}</p>
          <p><strong>Total:</strong> PKR {Number(invoice.total_amount).toLocaleString()}</p>
          <p><strong>Paid:</strong> PKR {Number(invoice.paid_amount).toLocaleString()}</p>
          <p><strong>Due:</strong> PKR {Number(invoice.due_amount).toLocaleString()}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="font-semibold">
              {invoice.payment_status}
            </span>
          </p>
        </div>
      )}

    </div>
  );
}
