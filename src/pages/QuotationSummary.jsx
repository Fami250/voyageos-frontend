import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function QuotationSummary() {

  const navigate = useNavigate();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFilter = async () => {

    if (!startDate || !endDate) {
      alert("Please select both dates");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch(
        `${API}/quotations/filter/by-date?start_date=${startDate}&end_date=${endDate}`
      );

      if (!response.ok) throw new Error("Failed to fetch quotations");

      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Filter Error:", err);
      setError("Unable to load quotations.");
      setResults([]);
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this quotation?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API}/quotations/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Delete failed");

      setResults((prev) => prev.filter((q) => q.id !== id));

    } catch (err) {
      console.error("Delete Error:", err);
      alert("Delete failed");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1100px" }}>

      <h1
        style={{
          fontSize: "34px",
          fontWeight: "800",
          marginBottom: "30px"
        }}
      >
        Quotation Summary
      </h1>

      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginBottom: "30px"
        }}
      >

        <div style={{ fontWeight: "600", fontSize: "16px" }}>
          Select Date Range:
        </div>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            padding: "8px 10px",
            fontSize: "14px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />

        <span style={{ fontWeight: "600" }}>to</span>

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{
            padding: "8px 10px",
            fontSize: "14px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />

        <button
          onClick={handleFilter}
          style={{
            padding: "10px 18px",
            backgroundColor: "#163E82",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Filter
        </button>

      </div>

      {loading && <p style={{ fontSize: "16px" }}>Loading quotations...</p>}
      {error && <p style={{ color: "red", fontSize: "16px" }}>{error}</p>}
      {!loading && results.length === 0 && !error && (
        <p style={{ fontSize: "16px" }}>No quotations found</p>
      )}

      {Array.isArray(results) && results.length > 0 && (
        <table
          border="1"
          cellPadding="10"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px"
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Quotation No</th>
              <th>Client ID</th>
              <th>Total Sell</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {results.map((q) => (
              <tr key={q.id}>
                <td>{q.id}</td>
                <td>{q.quotation_number}</td>
                <td>{q.client_id}</td>
                <td>{q.total_sell}</td>
                <td>{q.status}</td>
                <td>
                  <button onClick={() => navigate(`/quotation/${q.id}`)}>
                    View
                  </button>

                  <button
                    onClick={() => navigate(`/create-quotation?id=${q.id}`)}
                    style={{ marginLeft: "5px" }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(q.id)}
                    style={{
                      marginLeft: "5px",
                      color: "white",
                      backgroundColor: "red",
                      border: "none",
                      padding: "5px 8px",
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}

export default QuotationSummary;
