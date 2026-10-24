import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: "/dashboard", label: "Overview", icon: "ri-dashboard-3-line" },
  { path: "/dashboard/applications", label: "My Applications", icon: "ri-passport-line" },
  { path: "/dashboard/bookings", label: "My Bookings", icon: "ri-calendar-check-line" },
  { path: "/dashboard/enquiries", label: "Enquiries", icon: "ri-question-answer-line" },
  { path: "/dashboard/opportunities", label: "Opportunities", icon: "ri-compass-3-line" },
  { path: "/dashboard/orders", label: "Orders & Expenses", icon: "ri-receipt-line" },
];

export default function ClientLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
    setMobileOpen(false);
  };

  const close = () => setMobileOpen(false);

  return (
    <div className="flex h-screen bg-background-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-50 h-full w-64
          bg-background-50 border-r border-background-200/70
          flex flex-col transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-background-200/70">
          <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center shrink-0">
            <i className="ri-earth-line text-background-50 text-lg" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-heading font-bold text-lg text-foreground-950 whitespace-nowrap">Eduvic</h1>
            <p className="text-xs text-foreground-500 whitespace-nowrap">Client Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={close}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary-500 text-background-50"
                    : "text-foreground-600 hover:bg-background-100 hover:text-foreground-900"
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <i className={`${item.icon} text-base`} />
                </div>
                <span className="whitespace-nowrap">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-background-200/70">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground-600 hover:bg-background-100 hover:text-foreground-900 transition-all"
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <i className="ri-home-line text-base" />
            </div>
            <span>Back to Site</span>
          </NavLink>

          <div className="mt-3 flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <i className="ri-user-line text-primary-600" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-foreground-950 truncate">{user?.name || 'Client'}</p>
              <p className="text-xs text-foreground-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <i className="ri-logout-box-r-line text-base" />
            </div>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-foreground-950/40 z-40 md:hidden" onClick={close} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-background-50 border-b border-background-200/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <i className="ri-earth-line text-background-50 text-sm" />
            </div>
            <span className="font-heading font-bold text-foreground-950">Client Portal</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-background-100 text-foreground-600"
          >
            <i className="ri-menu-line text-lg" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}