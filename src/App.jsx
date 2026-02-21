import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";
import ProtectedRoute from "./ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Countries from "./pages/Countries";
import Cities from "./pages/Cities";
import Vendors from "./pages/Vendors";
import Quotations from "./pages/Quotations";
import QuotationSummary from "./pages/QuotationSummary";
import QuotationView from "./pages/QuotationView";
import Invoices from "./pages/Invoices";
import Finance from "./pages/Finance";

function App() {
  return (
    <Routes>

      {/* ================= PUBLIC ROUTE ================= */}
      <Route path="/login" element={<Login />} />

      {/* ================= PROTECTED ROUTES ================= */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="countries" element={<Countries />} />
        <Route path="cities" element={<Cities />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="create-quotation" element={<Quotations />} />
        <Route path="quotation-summary" element={<QuotationSummary />} />
        <Route path="quotation/:id" element={<QuotationView />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="finance" element={<Finance />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;
