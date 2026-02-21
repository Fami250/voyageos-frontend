import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Vendors() {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [serviceFilteredCities, setServiceFilteredCities] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const emptyServiceForm = {
    name: "",
    category: "",
    country_id: "",
    city_id: ""
  };

  const [vendorForm, setVendorForm] = useState(emptyVendorForm);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);

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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (vendorForm.country_id) {
      setFilteredCities(
        cities.filter(c => c.country_id === Number(vendorForm.country_id))
      );
    } else {
      setFilteredCities([]);
    }
  }, [vendorForm.country_id, cities]);

  useEffect(() => {
    if (serviceForm.country_id) {
      setServiceFilteredCities(
        cities.filter(c => c.country_id === Number(serviceForm.country_id))
      );
    } else {
      setServiceFilteredCities([]);
    }
  }, [serviceForm.country_id, cities]);

  const loadData = async () => {
    try {
      setLoading(true);
      const headers = authHeader();
      if (!headers) return;

      const [vRes, cRes, cityRes, sRes] = await Promise.all([
        fetch(`${API}/vendors/`, { headers }),
        fetch(`${API}/countries/`, { headers }),
        fetch(`${API}/cities/`, { headers }),
        fetch(`${API}/services/`, { headers }),
      ]);

      if ([vRes, cRes, cityRes, sRes].some(r => r.status === 401)) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!vRes.ok || !cRes.ok || !cityRes.ok || !sRes.ok)
        throw new Error("Backend error");

      setVendors(await vRes.json());
      setCountries(await cRes.json());
      setCities(await cityRes.json());
      setServices(await sRes.json());

    } catch (err) {
      console.error("Vendor Load Error:", err);
      alert("Backend connection error");
    } finally {
      setLoading(false);
    }
  };

  const saveVendor = async () => {
    if (!vendorForm.name || !vendorForm.country_id || !vendorForm.city_id)
      return alert("Name, Country and City required");

    const headers = authHeader();
    if (!headers) return;

    const res = await fetch(`${API}/vendors/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...vendorForm,
        country_id: Number(vendorForm.country_id),
        city_id: Number(vendorForm.city_id),
      }),
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    if (!res.ok) {
      const error = await res.json();
      return alert(error.detail || JSON.stringify(error));
    }

    setVendorForm(emptyVendorForm);
    loadData();
  };

  const handleDeleteVendor = async (id) => {
    if (!window.confirm("Delete this vendor?")) return;

    const headers = authHeader();
    if (!headers) return;

    await fetch(`${API}/vendors/${id}`, {
      method: "DELETE",
      headers,
    });

    loadData();
  };

  const saveService = async () => {
    if (!serviceForm.name || !serviceForm.category || !serviceForm.city_id)
      return alert("Service Name, Category and City required");

    const headers = authHeader();
    if (!headers) return;

    const res = await fetch(`${API}/services/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: serviceForm.name.trim(),
        category: serviceForm.category.trim().toUpperCase(),
        city_id: Number(serviceForm.city_id),
      }),
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    if (!res.ok) {
      const error = await res.json();
      return alert(error.detail || JSON.stringify(error));
    }

    setServiceForm(emptyServiceForm);
    loadData();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return <div>Vendors / Services Module Loaded Successfully</div>;
}
