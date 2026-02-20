import { Outlet, Link, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  const linkClasses = (path) =>
    `block px-4 py-2 rounded-lg transition-all duration-200 text-base font-medium ${
      location.pathname === path
        ? "bg-blue-600 text-white shadow-md"
        : "text-blue-200 hover:bg-blue-700 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ================= SIDEBAR ================= */}
      <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white min-h-screen p-6 shadow-lg">

        {/* Logo / Title */}
        <h1 className="text-3xl font-bold mb-12 text-white tracking-wide">
          VoyageOS
        </h1>

        <nav className="space-y-8">

          {/* MAIN */}
          <div className="space-y-3">
            <Link to="/" className={linkClasses("/")}>
              Dashboard
            </Link>

            <Link to="/clients" className={linkClasses("/clients")}>
              Clients
            </Link>
          </div>

          {/* LOCATIONS */}
          <div>
            <p className="text-blue-300 text-xs uppercase mb-3 tracking-wider">
              Locations
            </p>

            <div className="space-y-3">
              <Link to="/countries" className={linkClasses("/countries")}>
                Countries
              </Link>

              <Link to="/cities" className={linkClasses("/cities")}>
                Cities
              </Link>
            </div>
          </div>

          {/* OPERATIONS */}
          <div className="space-y-3">
            <Link to="/vendors" className={linkClasses("/vendors")}>
              Vendors
            </Link>

            <Link to="/create-quotation" className={linkClasses("/create-quotation")}>
              Create Quotation
            </Link>

            <Link to="/quotation-summary" className={linkClasses("/quotation-summary")}>
              Quotation Summary
            </Link>

            <Link to="/invoices" className={linkClasses("/invoices")}>
              Invoices
            </Link>

            <Link to="/finance" className={linkClasses("/finance")}>
              Finance
            </Link>
          </div>

        </nav>
      </div>

      {/* ================= PAGE CONTENT ================= */}
      <div className="flex-1 p-10">

        <div className="bg-white rounded-xl shadow-md p-8 transition-all duration-200">
          <Outlet />
        </div>

      </div>

    </div>
  );
}
