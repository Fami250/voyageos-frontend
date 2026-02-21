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
        city => city.country_id === Number(vendorForm.country_id)
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [vendorForm.country_id, cities]);

  useEffect(() => {
    if (serviceForm.country_id) {
      const filtered = cities.filter(
        city => city.country_id === Number(serviceForm.country_id)
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

      const vendorsData = await vRes.json();
      const countriesData = await cRes.json();
      const citiesData = await cityRes.json();
      const servicesData = await sRes.json();

      setVendors(Array.isArray(vendorsData) ? vendorsData : []);
      setCountries(Array.isArray(countriesData) ? countriesData : []);
      setCities(Array.isArray(citiesData) ? citiesData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);

    } catch (error) {
      console.error("Load Vendors Error:", error);
      alert("Failed to load vendors data");
    } finally {
      setLoading(false);
    }
  };

  // ================= VENDOR ACTIONS =================

  const handleVendorChange = (field, value) => {
    setVendorForm(prev => ({ ...prev, [field]: value }));
    if (field === "country_id") {
      setVendorForm(prev => ({ ...prev, city_id: "" }));
    }
  };

  const saveVendor = async () => {

    if (!vendorForm.name || !vendorForm.country_id || !vendorForm.city_id) {
      return alert("Name, Country and City required");
    }

    try {
      const res = await authFetch("/vendors/", {
        method: "POST",
        body: JSON.stringify({
          ...vendorForm,
          country_id: Number(vendorForm.country_id),
          city_id: Number(vendorForm.city_id)
        })
      });

      if (!res.ok) throw new Error("Vendor creation failed");

      setVendorForm(emptyVendorForm);
      loadData();

    } catch (error) {
      console.error("Save Vendor Error:", error);
      alert("Error creating vendor");
    }
  };

  const handleDeleteVendor = async (id) => {
    if (!window.confirm("Delete this vendor?")) return;

    try {
      await authFetch(`/vendors/${id}`, { method: "DELETE" });
      loadData();
    } catch (error) {
      console.error("Delete Vendor Error:", error);
    }
  };

  // ================= SERVICE ACTIONS =================

  const handleServiceChange = (field, value) => {
    setServiceForm(prev => ({ ...prev, [field]: value }));
    if (field === "country_id") {
      setServiceForm(prev => ({ ...prev, city_id: "" }));
    }
  };

  const saveService = async () => {

    if (!serviceForm.name || !serviceForm.category || !serviceForm.city_id) {
      return alert("Service Name, Category and City required");
    }

    try {
      const res = await authFetch("/services/", {
        method: "POST",
        body: JSON.stringify({
          name: serviceForm.name.trim(),
          category: serviceForm.category.trim().toUpperCase(),
          city_id: Number(serviceForm.city_id)
        })
      });

      if (!res.ok) throw new Error("Service creation failed");

      setServiceForm(emptyServiceForm);
      loadData();

    } catch (error) {
      console.error("Save Service Error:", error);
      alert("Error creating service");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>

      <h1 className="text-3xl font-bold mb-6">Vendors / Services</h1>

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

    </div>
  );
}
