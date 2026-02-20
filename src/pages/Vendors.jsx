import { useEffect, useState } from "react";

export default function Vendors() {

  const API = "http://127.0.0.1:8000";

  const [vendors, setVendors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [services, setServices] = useState([]);

  const [filteredCities, setFilteredCities] = useState([]);
  const [serviceFilteredCities, setServiceFilteredCities] = useState([]);

  const [loading, setLoading] = useState(true);

  // =========================
  // VENDOR FORM
  // =========================

  const emptyVendorForm = {
    name: "",
    vendor_type: "",
    country_id: "",
    city_id: "",
    contact_person: "",
    phone: "",
    email: "",
    address: ""
  };

  const [vendorForm, setVendorForm] = useState(emptyVendorForm);

  // =========================
  // SERVICE FORM
  // =========================

  const emptyServiceForm = {
    name: "",
    category: "",
    country_id: "",
    city_id: ""
  };

  const [serviceForm, setServiceForm] = useState(emptyServiceForm);

  // ================= LOAD DATA =================

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (vendorForm.country_id) {
      const filtered = cities.filter(
        (city) => city.country_id === Number(vendorForm.country_id)
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [vendorForm.country_id, cities]);

  useEffect(() => {
    if (serviceForm.country_id) {
      const filtered = cities.filter(
        (city) => city.country_id === Number(serviceForm.country_id)
      );
      setServiceFilteredCities(filtered);
    } else {
      setServiceFilteredCities([]);
    }
  }, [serviceForm.country_id, cities]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [vRes, cRes, cityRes, sRes] = await Promise.all([
        fetch(`${API}/vendors/`),
        fetch(`${API}/countries/`),
        fetch(`${API}/cities/`),
        fetch(`${API}/services/`)
      ]);

      setVendors(await vRes.json());
      setCountries(await cRes.json());
      setCities(await cityRes.json());
      setServices(await sRes.json());

    } catch (error) {
      alert("Backend connection error");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VENDOR ACTIONS
  // =========================

  const handleVendorChange = (field, value) => {
    setVendorForm((prev) => ({ ...prev, [field]: value }));
    if (field === "country_id") {
      setVendorForm((prev) => ({ ...prev, city_id: "" }));
    }
  };

  const saveVendor = async () => {

    if (!vendorForm.name || !vendorForm.country_id || !vendorForm.city_id) {
      return alert("Name, Country and City required");
    }

    const res = await fetch(`${API}/vendors/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...vendorForm,
        country_id: Number(vendorForm.country_id),
        city_id: Number(vendorForm.city_id)
      })
    });

    if (!res.ok) {
      const error = await res.json();
      return alert(error.detail || JSON.stringify(error));
    }

    setVendorForm(emptyVendorForm);
    loadData();
  };

  const handleDeleteVendor = async (id) => {
    if (!window.confirm("Delete this vendor?")) return;

    await fetch(`${API}/vendors/${id}`, { method: "DELETE" });
    loadData();
  };

  // =========================
  // SERVICE ACTIONS
  // =========================

  const handleServiceChange = (field, value) => {
    setServiceForm((prev) => ({ ...prev, [field]: value }));
    if (field === "country_id") {
      setServiceForm((prev) => ({ ...prev, city_id: "" }));
    }
  };

  const saveService = async () => {

    if (!serviceForm.name || !serviceForm.category || !serviceForm.city_id) {
      return alert("Service Name, Category and City required");
    }

    const res = await fetch(`${API}/services/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: serviceForm.name.trim(),
        category: serviceForm.category.trim().toUpperCase(),   // 🔥 ENUM SAFE
        city_id: Number(serviceForm.city_id)
      })
    });

    if (!res.ok) {
      const error = await res.json();
      return alert(error.detail || JSON.stringify(error));   // 🔥 Real error show
    }

    setServiceForm(emptyServiceForm);
    loadData();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>

      <h1 className="text-3xl font-bold mb-6">Vendors / Services</h1>

      {/* ================= VENDOR FORM ================= */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">

        <h2 className="text-xl font-semibold mb-4">Add Vendor</h2>

        <div className="grid grid-cols-2 gap-4">

          <input
            placeholder="Vendor Name"
            value={vendorForm.name}
            onChange={(e) => handleVendorChange("name", e.target.value)}
            className="border p-2 rounded"
          />

          <input
            placeholder="Vendor Type"
            value={vendorForm.vendor_type}
            onChange={(e) => handleVendorChange("vendor_type", e.target.value)}
            className="border p-2 rounded"
          />

          <select
            value={vendorForm.country_id}
            onChange={(e) => handleVendorChange("country_id", e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Country</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={vendorForm.city_id}
            onChange={(e) => handleVendorChange("city_id", e.target.value)}
            className="border p-2 rounded"
            disabled={!vendorForm.country_id}
          >
            <option value="">Select City</option>
            {filteredCities.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

        </div>

        <button
          onClick={saveVendor}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg"
        >
          Add Vendor
        </button>
      </div>

      {/* ================= SERVICE FORM ================= */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">

        <h2 className="text-xl font-semibold mb-4">Add Service</h2>

        <div className="grid grid-cols-2 gap-4">

          <input
            placeholder="Service Name"
            value={serviceForm.name}
            onChange={(e) => handleServiceChange("name", e.target.value)}
            className="border p-2 rounded"
          />

          <input
            placeholder="Category (Hotel / Tour / Transfer / Visa / Ticket)"
            value={serviceForm.category}
            onChange={(e) => handleServiceChange("category", e.target.value)}
            className="border p-2 rounded"
          />

          <select
            value={serviceForm.country_id}
            onChange={(e) => handleServiceChange("country_id", e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Country</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={serviceForm.city_id}
            onChange={(e) => handleServiceChange("city_id", e.target.value)}
            className="border p-2 rounded"
            disabled={!serviceForm.country_id}
          >
            <option value="">Select City</option>
            {serviceFilteredCities.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

        </div>

        <button
          onClick={saveService}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Add Service
        </button>
      </div>

      {/* ================= VENDOR TABLE ================= */}
      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="text-xl font-semibold mb-4">Vendor List</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th>Name</th>
              <th>Type</th>
              <th>Country</th>
              <th>City</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v.id} className="border-b">
                <td>{v.name}</td>
                <td>{v.vendor_type}</td>
                <td>{countries.find(c => c.id === v.country_id)?.name}</td>
                <td>{cities.find(c => c.id === v.city_id)?.name}</td>
                <td>{v.phone}</td>
                <td>
                  <button
                    onClick={() => handleDeleteVendor(v.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </div>
  );
}
