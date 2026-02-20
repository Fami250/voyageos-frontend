import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Quotations() {

  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [cities, setCities] = useState([]);
  const [services, setServices] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [selectedClient, setSelectedClient] = useState("");
  const [margin, setMargin] = useState(25);

  const emptyRow = {
    city_id: "",
    category: "",
    service_id: "",
    vendor_id: "",
    cost_price: "",
    manual_margin_percentage: "",
    start_date: "",
    end_date: "",
    quantity: 1
  };

  const [items, setItems] = useState([{ ...emptyRow }]);

  // ================= LOAD INITIAL =================
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [cRes, cityRes, sRes, vRes] = await Promise.all([
        fetch(`${API}/clients/`),
        fetch(`${API}/cities/`),
        fetch(`${API}/services/`),
        fetch(`${API}/vendors/`)
      ]);

      if (!cRes.ok || !cityRes.ok || !sRes.ok || !vRes.ok) {
        throw new Error("Failed to load initial data");
      }

      setClients(await cRes.json());
      setCities(await cityRes.json());
      setServices(await sRes.json());
      setVendors(await vRes.json());

    } catch (err) {
      console.error("Initial Load Error:", err);
    }
  };

  // ================= FILTER SERVICES =================
  const filteredServices = (cityId, category) => {
    return services.filter(
      s =>
        String(s.city_id) === String(cityId) &&
        s.category?.toUpperCase() === category?.toUpperCase()
    );
  };

  // ================= UPDATE FIELD =================
  const updateField = (index, field, value) => {

    const updated = [...items];
    updated[index][field] = value;

    if (field === "city_id") {
      updated[index] = {
        ...emptyRow,
        city_id: value
      };
    }

    if (field === "category") {
      updated[index].service_id = "";
    }

    if (field === "start_date" || field === "end_date") {
      const start = new Date(updated[index].start_date);
      const end = new Date(updated[index].end_date);

      if (!isNaN(start) && !isNaN(end) && end > start) {
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        updated[index].quantity = diff;
      }
    }

    setItems(updated);
  };

  const removeRow = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const addNewRow = () => {
    setItems([...items, { ...emptyRow }]);
  };

  // ================= CALCULATIONS =================
  const calculateRow = (item) => {

    const cost = Number(item.cost_price) || 0;
    const qty = Number(item.quantity) || 0;

    const rowMargin =
      item.manual_margin_percentage !== ""
        ? Number(item.manual_margin_percentage)
        : margin;

    const sellUnit = cost + (cost * rowMargin / 100);
    const totalCost = cost * qty;
    const totalSell = sellUnit * qty;
    const profit = totalSell - totalCost;

    return { totalCost, totalSell, profit };
  };

  const totals = items.reduce((acc, item) => {
    const row = calculateRow(item);
    acc.cost += row.totalCost;
    acc.sell += row.totalSell;
    acc.profit += row.profit;
    return acc;
  }, { cost: 0, sell: 0, profit: 0 });

  // ================= SAVE QUOTATION =================
  const saveQuotation = async () => {

    if (!selectedClient) {
      alert("Select Client");
      return;
    }

    const validItems = items.filter(i =>
      i.service_id &&
      i.cost_price &&
      i.start_date &&
      i.end_date &&
      Number(i.quantity) > 0
    );

    if (validItems.length === 0) {
      alert("Add at least one valid service row");
      return;
    }

    const payload = {
      client_id: Number(selectedClient),
      margin_percentage: margin,
      items: validItems.map(i => ({
        service_id: Number(i.service_id),
        vendor_id: i.vendor_id ? Number(i.vendor_id) : null,
        cost_price: Number(i.cost_price),
        quantity: Number(i.quantity),
        start_date: i.start_date,
        end_date: i.end_date,
        manual_margin_percentage:
          i.manual_margin_percentage !== ""
            ? Number(i.manual_margin_percentage)
            : null
      }))
    };

    try {
      const res = await fetch(`${API}/quotations/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Error saving quotation");
        return;
      }

      const data = await res.json();
      navigate(`/quotation/${data.id}`);

    } catch (err) {
      console.error("Save error:", err);
      alert("Server connection error");
    }
  };

  // ================= UI (UNCHANGED) =================
  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* UI unchanged from your version */}
    </div>
  );
}
