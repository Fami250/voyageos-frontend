import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  createQuotationItem,
  getQuotationById,
} from "../api/quotationItems";

export default function QuotationView() {
  const { id } = useParams();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    service_id: "",
    quantity: 1,
    start_date: "",
    end_date: "",
    manual_fare: "",
    manual_margin_percentage: 0,
  });

  /* =========================================
     LOAD QUOTATION
  ========================================= */
  async function loadQuotation() {
    try {
      setLoading(true);
      const data = await getQuotationById(id);
      setQuotation(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load quotation");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuotation();
  }, [id]);

  /* =========================================
     HANDLE INPUT CHANGE
  ========================================= */
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  /* =========================================
     SUBMIT NEW ITEM
  ========================================= */
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await createQuotationItem({
        quotation_id: parseInt(id),
        service_id: parseInt(formData.service_id),
        quantity: parseInt(formData.quantity),
        start_date: formData.start_date,
        end_date: formData.end_date,
        manual_fare: parseFloat(formData.manual_fare),
        manual_margin_percentage: parseFloat(
          formData.manual_margin_percentage
        ),
      });

      alert("Service Added Successfully 🚀");

      setFormData({
        service_id: "",
        quantity: 1,
        start_date: "",
        end_date: "",
        manual_fare: "",
        manual_margin_percentage: 0,
      });

      loadQuotation(); // refresh items
    } catch (error) {
      console.error(error);
      alert("Error adding service");
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!quotation) return <p>No quotation found</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Quotation #{quotation.quotation_number}
      </h2>

      <p className="mb-2">
        <strong>Total Sell:</strong> PKR {quotation.total_sell}
      </p>

      {/* ===========================
          ITEMS TABLE
      =========================== */}
      <table className="w-full border mb-6">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-2">Service</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Unit</th>
            <th className="p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {quotation.items.map((item) => (
            <tr key={item.id} className="text-center border">
              <td className="p-2">{item.service_id}</td>
              <td className="p-2">{item.quantity}</td>
              <td className="p-2">PKR {item.sell_price}</td>
              <td className="p-2">PKR {item.total_sell}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===========================
          ADD SERVICE FORM
      =========================== */}
      <h3 className="text-xl font-semibold mb-3">Add Service</h3>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded"
      >
        <input
          type="number"
          name="service_id"
          placeholder="Service ID"
          value={formData.service_id}
          onChange={handleChange}
          required
          className="p-2 border"
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
          className="p-2 border"
        />

        <input
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          required
          className="p-2 border"
        />

        <input
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          required
          className="p-2 border"
        />

        <input
          type="number"
          name="manual_fare"
          placeholder="Manual Fare"
          value={formData.manual_fare}
          onChange={handleChange}
          required
          className="p-2 border"
        />

        <input
          type="number"
          name="manual_margin_percentage"
          placeholder="Margin %"
          value={formData.manual_margin_percentage}
          onChange={handleChange}
          className="p-2 border"
        />

        <button
          type="submit"
          className="col-span-2 bg-blue-600 text-white p-2 rounded"
        >
          Add Service
        </button>
      </form>
    </div>
  );
}
