import { useEffect, useState } from "react";
import { authFetch } from "../api/api";

export default function Services() {

  // ================= STATES =================
  const [cities, setCities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);

  const [selectedCity, setSelectedCity] = useState("");
  const [cityServices, setCityServices] = useState([]);
  const [loadingRates, setLoadingRates] = useState(false);

  const emptyForm = {
    name: "",
    category: "",
    city_id: ""
  };

  const [formData, setFormData] = useState(emptyForm);

  // ================= FETCH CITIES =================
  const fetchCities = async () => {
    try {
      const res = await authFetch("/cities/");
      const data = await res.json();
      setCities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  // ================= LOAD CITY SERVICES =================
  const fetchCityServices = async () => {

    if (!selectedCity) {
      alert("Please select a city");
      return;
    }

    setLoadingRates(true);

    try {
      const res = await authFetch(`/services/?city=${selectedCity}`);
      const data = await res.json();
      setCityServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading city services:", err);
    }

    setLoadingRates(false);
  };

  // ================= INPUT =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ================= CREATE SERVICE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await authFetch("/services/", {
        method: "POST",
        body: {
          name: formData.name,
          category: formData.category,
          city_id: Number(formData.city_id)
        }
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail);
        return;
      }

      alert("Service Created Successfully");
      setFormData(emptyForm);
      setShowForm(false);

    } catch (err) {
      console.error("Error creating service:", err);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;

    try {
      await authFetch(`/services/${id}`, {
        method: "DELETE"
      });

      fetchCityServices();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ================= EXCEL UPLOAD =================
  const handleExcelUpload = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("file", file);

    setExcelLoading(true);

    try {
      // IMPORTANT: Don't manually set Content-Type for FormData
      const res = await authFetch("/services/upload-excel/", {
        method: "POST",
        body: uploadData
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail);
      } else {
        alert(
`Upload Complete ✅

Services Created: ${data.services_created}
Services Updated: ${data.services_updated}
Rates Created: ${data.rates_created}
Rates Updated: ${data.rates_updated}`
        );
      }

    } catch (err) {
      console.error("Upload error:", err);
    }

    setExcelLoading(false);
  };

  // ================= UI =================
  return (
    <div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Services</h1>

        <div className="space-x-3">

          <label className="bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-indigo-700">
            {excelLoading ? "Uploading..." : "Upload Excel"}
            <input
              type="file"
              accept=".xlsx"
              hidden
              onChange={handleExcelUpload}
            />
          </label>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            + Add Service
          </button>

        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow mb-6 grid grid-cols-3 gap-4"
        >

          <input
            name="name"
            placeholder="Service Name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          >
            <option value="">Select Category</option>
            <option value="HOTEL">Hotel</option>
            <option value="TOUR">Tour</option>
            <option value="TRANSFER">Transfer</option>
            <option value="VISA">Visa</option>
            <option value="TICKET">Ticket</option>
          </select>

          <select
            name="city_id"
            value={formData.city_id}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          >
            <option value="">Select City</option>
            {cities.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-green-600 text-white py-2 rounded col-span-3 hover:bg-green-700"
          >
            Save Service
          </button>

        </form>
      )}

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">View City Services</h2>

        <div className="flex gap-4">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select City</option>
            {cities.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={fetchCityServices}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Load Services
          </button>
        </div>
      </div>

      {loadingRates ? (
        <p>Loading Services...</p>
      ) : cityServices.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">City</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cityServices.map((service) => (
                <tr key={service.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{service.name}</td>
                  <td className="p-3">{service.category}</td>
                  <td className="p-3">{selectedCity}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
