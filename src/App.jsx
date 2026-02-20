import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";

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
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/countries" element={<Countries />} />
        <Route path="/cities" element={<Cities />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/create-quotation" element={<Quotations />} />
        <Route path="/quotation-summary" element={<QuotationSummary />} />
        <Route path="/quotation/:id" element={<QuotationView />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/finance" element={<Finance />} />
      </Route>
    </Routes>
  );
}

export default App;
