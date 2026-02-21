import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 🧹 Clear any old token
      localStorage.removeItem("token");

      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await res.json();

      // 🔐 Ensure token exists
      if (!data.access_token) {
        throw new Error("Token not received");
      }

      // 🔐 SAVE TOKEN
      localStorage.setItem("token", data.access_token);

      // 🚀 Redirect after login
      navigate("/");
    } catch (err) {
      setError("Invalid username or password");
      console.error("Login Error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          VoyageOS Login
        </h2>

        {error && (
          <p className="text-red-500 mb-4 text-center">{error}</p>
        )}

        <input
          type="text"
          placeholder="Username"
          className="w-full border p-2 mb-4 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-6 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Login
        </button>
      </form>
    </div>
  );
}
