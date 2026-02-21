import { useEffect, useState } from "react";
import { authFetch } from "../api/api";

export default function Vendors() {

  const [vendors, setVendors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [services, setServices] = useState([]);

  const [filteredCities, setFilteredCities] = useState([]);
  const [serviceFilteredCities, setServiceFilteredCities] = useState([]);

  const [loading, setLoading] = useState(true);

  // ================= VENDOR FORM =================

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

  // ================= SERVICE FORM =================

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
        authFetch("/vendors/"),
        authFetch("/countries/"),
        authFetch("/cities/"),
        authFetch("/services/")
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

  // ================= SAVE VENDOR =================

  const saveVendor = async () => {
    if (!vendorForm.name || !vendorForm.country_id || !vendorForm.city_id) {
      return alert("Name, Country and City required");
    }

    const res = await authFetch("/vendors/", {
      method: "POST",
      body: JSON.stringify({
        ...vendorForm,
        country_id: Number(vendorForm.country_id),
        city_id: Number(vendorForm.city_id)
      })
    });

    if (!res.ok) {
      const err = await res.json();
      return alert(err.detail || "Error saving vendor");
    }

    setVendorForm(emptyVendorForm);
    loadData();
  };

  // ================= SAVE SERVICE =================

  const saveService = async () => {
    if (!serviceForm.name || !serviceForm.category || !serviceForm.city_id) {
      return alert("Service Name, Category and City required");
    }

    const res = await authFetch("/services/", {
      method: "POST",
      body: JSON.stringify({
        name: serviceForm.name,
        category: serviceForm.category.toUpperCase(),
        city_id: Number(serviceForm.city_id)
      })
    });

    if (!res.ok) {
      const err = await res.json();
      return alert(err.detail || "Error saving service");
    }

    setServiceForm(emptyServiceForm);
    loadData();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>

      <h1 className="text-3xl font-bold mb-6">Vendors / Services</h1>

      {/* ================= ADD VENDOR ================= */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Vendor</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Vendor Name"
            value={vendorForm.name}
            onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
            className="border p-2 rounded"
          />

          <input
            placeholder="Vendor Type"
            value={vendorForm.vendor_type}
            onChange={(e) => setVendorForm({ ...vendorForm, vendor_type: e.target.value })}
            className="border p-2 rounded"
          />

          <select
            value={vendorForm.country_id}
            onChange={(e) => setVendorForm({ ...vendorForm, country_id: e.target.value, city_id: "" })}
            className="border p-2 rounded"
          >
            <option value="">Select Country</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={vendorForm.city_id}
            onChange={(e) => setVendorForm({ ...vendorForm, city_id: e.target.value })}
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

      {/* ================= ADD SERVICE ================= */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Service</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Service Name"
            value={serviceForm.name}
            onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
            className="border p-2 rounded"
          />

          <input
            placeholder="Category (HOTEL / TOUR / TRANSFER / VISA / TICKET)"
            value={serviceForm.category}
            onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
            className="border p-2 rounded"
          />

          <select
            value={serviceForm.country_id}
            onChange={(e) => setServiceForm({ ...serviceForm, country_id: e.target.value, city_id: "" })}
            className="border p-2 rounded"
          >
            <option value="">Select Country</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={serviceForm.city_id}
            onChange={(e) => setServiceForm({ ...serviceForm, city_id: e.target.value })}
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

    </div>
  );
}
