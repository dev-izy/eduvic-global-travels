import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import Logo from "../../../components/features/Logo";

const navItems = [
  { path: "/admin", label: "Overview", icon: "ri-dashboard-3-line", end: true },
  { path: "/admin/packages", label: "Travel packages", icon: "ri-suitcase-3-line" },
  { path: "/admin/bookings", label: "Appointments", icon: "ri-calendar-check-line" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const close = () => setMobileOpen(false);

  return (
    <div className="flex h-screen bg-background-100 overflow-hidden">
      <aside
        className={`fixed md:static top-0 left-0 z-50 h-full w-64 bg-primary-950 flex flex-col transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Logo variant="light" height={36} showWordmark={false} />

        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-1">
          {navItems.map((item, i) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={close}
              style={{ animationDelay: `${i * 60}ms` }}
              className={({ isActive }) =>
                `animate-fade-up flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-accent-500 text-white shadow-lg shadow-accent-500/20"
                    : "text-white/60 hover:bg-white/10 hover:text-white hover:translate-x-0.5"
                }`
              }
            >
              <i className={`${item.icon} text-base w-5 text-center`} />
              <span className="whitespace-nowrap">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            <i className="ri-external-link-line text-base w-5 text-center" />
            <span>View live site</span>
          </NavLink>

          <div className="mt-3 flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <i className="ri-shield-user-line text-white/70" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/15 transition-all"
          >
            <i className="ri-logout-box-r-line text-base w-5 text-center" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground-950/50 z-40 md:hidden animate-fade-in"
          onClick={close}
        />
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-background-50 border-b border-background-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center">
              <i className="ri-earth-line text-white text-sm" />
            </div>
            <span className="font-heading font-bold text-foreground-950">Admin</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-background-100 text-foreground-600"
            aria-label="Open menu"
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
