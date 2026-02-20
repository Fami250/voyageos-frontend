import { useEffect, useState } from "react";
import API from "../api/api";

export default function Invoices() {

  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payments, setPayments] = useState([]);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [reference, setReference] = useState("");

  useEffect(() => {
    loadInvoices();
  }, []);

  // ================= LOAD INVOICES =================
  const loadInvoices = async () => {
    try {
      const res = await fetch(`${API}/invoices/`);
      if (!res.ok) throw new Error("Failed to load invoices");
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= LOAD PAYMENTS =================
  const loadPayments = async (invoiceId) => {
    try {
      const res = await fetch(`${API}/invoices/${invoiceId}/payments`);
      if (!res.ok) return;
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= SELECT INVOICE =================
  const selectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    loadPayments(invoice.id);
  };

  // ================= HANDLE PAYMENT =================
  const handlePayment = async () => {

    if (!selectedInvoice) return;

    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    try {
      const res = await fetch(`${API}/invoices/${selectedInvoice.id}/payment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paid_amount: Number(amount),
          payment_method: method,
          reference_number: reference,
          notes: ""
        })
      });

      if (!res.ok) {
        alert("Payment failed");
        return;
      }

      const updatedInvoice = await res.json();

      setSelectedInvoice(updatedInvoice);
      setAmount("");
      setReference("");

      await loadPayments(updatedInvoice.id);
      await loadInvoices();

    } catch (err) {
      console.error(err);
      alert("Error processing payment");
    }
  };

  // ================= CANCEL INVOICE =================
  const cancelInvoice = async (invoiceId) => {

    if (!window.confirm("Cancel this invoice?")) return;

    try {
      const res = await fetch(`${API}/invoices/${invoiceId}/cancel`, {
        method: "PUT"
      });

      if (!res.ok) {
        alert("Cancel failed");
        return;
      }

      const updated = await res.json();

      setSelectedInvoice(updated);
      await loadInvoices();

    } catch (err) {
      console.error(err);
      alert("Error cancelling invoice");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">Invoices</h1>

      {/* ================= INVOICE LIST ================= */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">

        <table className="w-full border text-left">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Invoice #</th>
              <th className="p-2 border">Client</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Due</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-gray-100">

                <td
                  className="p-2 border font-semibold cursor-pointer"
                  onClick={() => selectInvoice(inv)}
                >
                  {inv.invoice_number}
                </td>

                <td className="p-2 border">
                  {inv.client?.company_name || inv.client_id}
                </td>

                <td className="p-2 border">
                  PKR {Number(inv.total_amount).toLocaleString()}
                </td>

                <td className="p-2 border">
                  PKR {Number(inv.due_amount).toLocaleString()}
                </td>

                <td className="p-2 border font-semibold">
                  {inv.payment_status}
                </td>

                <td className="p-2 border space-x-2">

                  <a
                    href={`${API}/invoices/${inv.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-black text-white px-3 py-1 rounded"
                  >
                    Print
                  </a>

                  {inv.payment_status !== "PAID" &&
                   inv.payment_status !== "CANCELLED" && (
                    <button
                      onClick={() => cancelInvoice(inv.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  )}

                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

      {selectedInvoice && (
        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-semibold mb-4">
            Invoice #{selectedInvoice.invoice_number}
          </h2>

          <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
            <div><b>Total:</b> PKR {Number(selectedInvoice.total_amount).toLocaleString()}</div>
            <div><b>Paid:</b> PKR {Number(selectedInvoice.paid_amount).toLocaleString()}</div>
            <div><b>Due:</b> PKR {Number(selectedInvoice.due_amount).toLocaleString()}</div>
            <div><b>Status:</b> {selectedInvoice.payment_status}</div>
          </div>

          {selectedInvoice.due_amount > 0 &&
           selectedInvoice.payment_status !== "CANCELLED" && (

            <div className="mt-6 border-t pt-6">

              <h3 className="font-semibold mb-3">Add Payment</h3>

              <div className="flex gap-4 mb-4">

                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border p-2 rounded w-40"
                />

                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CARD">Card</option>
                  <option value="ONLINE">Online</option>
                  <option value="OTHER">Other</option>
                </select>

                <input
                  type="text"
                  placeholder="Reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="border p-2 rounded w-48"
                />

                <button
                  onClick={handlePayment}
                  className="bg-black text-white px-4 py-2 rounded"
                >
                  Save Payment
                </button>

              </div>
            </div>
          )}

          {payments.length > 0 && (

            <div className="mt-6">

              <h3 className="font-semibold mb-3">Payment Ledger</h3>

              <table className="w-full border text-left">

                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Receipt #</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Method</th>
                    <th className="p-2 border">Reference</th>
                    <th className="p-2 border">Amount</th>
                    <th className="p-2 border">Voucher</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td className="p-2 border font-semibold">{p.receipt_number}</td>
                      <td className="p-2 border">{p.payment_date}</td>
                      <td className="p-2 border">{p.payment_method}</td>
                      <td className="p-2 border">{p.reference_no}</td>
                      <td className="p-2 border">
                        PKR {Number(p.amount).toLocaleString()}
                      </td>
                      <td className="p-2 border">
                        <a
                          href={`${API}/invoices/payments/${p.id}/voucher`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
