import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

// =======================================================
// CLIENTS PAGE - JWT SECURE VERSION (PRODUCTION SAFE)
// =======================================================

export default function Clients() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const emptyForm = {
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // =======================================================
  // AUTH HEADER HELPER
  // =======================================================

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return {};
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // =======================================================
  // FETCH CLIENTS
  // =======================================================

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API}/clients/`, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch clients");

      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // =======================================================
  // HANDLE INPUT CHANGE
  // =======================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =======================================================
  // HANDLE SUBMIT (ADD / EDIT)
  // =======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        editId
          ? `${API}/clients/${editId}`
          : `${API}/clients/`,
        {
          method: editId ? "PUT" : "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        }
      );

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      resetForm();
      fetchClients();
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  // =======================================================
  // DELETE
  // =======================================================

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this client?")) return;

    try {
      const res = await fetch(`${API}/clients/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      fetchClients();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  // =======================================================
  // EDIT
  // =======================================================

  const handleEdit = (client) => {
    setFormData(client);
    setEditId(client.id);
    setShowForm(true);
  };

  // =======================================================
  // RESET FORM
  // =======================================================

  const resetForm = () => {
    setFormData(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  // =======================================================
  // UI
  // =======================================================

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          + Add Client
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow mb-6 grid grid-cols-2 gap-4"
        >
          <input
            name="company_name"
            placeholder="Company Name"
            value={formData.company_name}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            name="contact_person"
            placeholder="Contact Person"
            value={formData.contact_person}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="address"
            placeholder="City"
            value={formData.address}
            onChange={handleChange}
            className="border p-2 rounded col-span-2"
          />

          <button
            type="submit"
            className="bg-green-600 text-white py-2 rounded col-span-2 hover:bg-green-700"
          >
            {editId ? "Update Client" : "Save Client"}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3">Company</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">City</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{client.company_name}</td>
                  <td className="p-3">{client.contact_person}</td>
                  <td className="p-3">{client.email}</td>
                  <td className="p-3">{client.phone}</td>
                  <td className="p-3">{client.address}</td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
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
