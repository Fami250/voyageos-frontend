import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../api/api";

// =======================================================
// COUNTRIES PAGE - FINAL JWT STABLE VERSION
// =======================================================

export default function Countries() {
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCountries();
  }, []);

  // =======================================================
  // LOAD COUNTRIES (AUTH SAFE)
  // =======================================================

  const loadCountries = async () => {
    try {
      setLoading(true);

      const res = await authFetch("/countries/");
      const data = await res.json();

      setCountries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load Countries Error:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // CREATE COUNTRY (AUTH SAFE)
  // =======================================================

  const createCountry = async () => {
    if (!name.trim()) {
      alert("Country name required");
      return;
    }

    try {
      setCreating(true);

      await authFetch("/countries/", {
        method: "POST",
        body: { name: name.trim() },
      });

      setName("");
      await loadCountries();
    } catch (error) {
      console.error("Create Country Error:", error);
      alert("Error creating country");
    } finally {
      setCreating(false);
    }
  };

  // =======================================================
  // UI
  // =======================================================

  if (loading) return <div className="p-6">Loading Countries...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Countries</h1>

      <div className="bg-white p-6 rounded-xl shadow mb-8 flex gap-4">
        <input
          placeholder="Country Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={createCountry}
          disabled={creating}
          className={`px-6 rounded-lg text-white ${
            creating ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {creating ? "Adding..." : "Add Country"}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {countries.length === 0 ? (
              <tr>
                <td colSpan="2" className="py-4 text-center text-gray-500">
                  No countries found
                </td>
              </tr>
            ) : (
              countries.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="py-2">{c.id}</td>
                  <td>{c.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
