import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../api/api";

// =======================================================
// CITIES PAGE - FINAL JWT STABLE VERSION
// =======================================================

export default function Cities() {
  const navigate = useNavigate();

  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // =======================================================
  // LOAD CITIES + COUNTRIES (AUTH SAFE)
  // =======================================================

  const loadData = async () => {
    try {
      setLoading(true);

      const [cityRes, countryRes] = await Promise.all([
        authFetch("/cities/"),
        authFetch("/countries/"),
      ]);

      const cityData = await cityRes.json();
      const countryData = await countryRes.json();

      setCities(Array.isArray(cityData) ? cityData : []);
      setCountries(Array.isArray(countryData) ? countryData : []);
    } catch (err) {
      console.error("Load Cities Error:", err);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // CREATE CITY (AUTH SAFE)
  // =======================================================

  const createCity = async () => {
    if (!name.trim() || !countryId) {
      alert("City name and country required");
      return;
    }

    try {
      await authFetch("/cities/", {
        method: "POST",
        body: {
          name: name.trim(),
          country_id: Number(countryId),
        },
      });

      setName("");
      setCountryId("");
      await loadData();
    } catch (err) {
      console.error("Create City Error:", err);
      alert("Error creating city");
    }
  };

  // =======================================================
  // UI
  // =======================================================

  if (loading) return <div className="p-6">Loading Cities...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Cities</h1>

      <div className="bg-white p-6 rounded-xl shadow mb-8 flex gap-4">
        <input
          placeholder="City Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded flex-1"
        />

        <select
          value={countryId}
          onChange={(e) => setCountryId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Country</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          onClick={createCity}
          className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700"
        >
          Add City
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">ID</th>
              <th>Name</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            {cities.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-4 text-center text-gray-500">
                  No cities found
                </td>
              </tr>
            ) : (
              cities.map((city) => (
                <tr key={city.id} className="border-b">
                  <td className="py-2">{city.id}</td>
                  <td>{city.name}</td>
                  <td>{city.country_name || city.country?.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
