import type { RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Services from "../pages/Services";
import Packages from "../pages/packages/Packages";
import PackageDetail from "../pages/packages/PackageDetails";
import VisaServices from "../pages/VisaService";
import Contact from "../pages/Contact";
import Booking from "../pages/BookingPage";

import AuthGuard from "../components/features/AuthGuard";
import ClientGuard from "../components/features/ClientGuard";

import AdminLogin from "../pages/admin/login/page";
import AdminLayout from "../pages/admin/components/AdminLayout";
import AdminDashboard from "../pages/admin/page";
import AdminPackages from "../pages/admin/packages/page";
import AdminBookings from "../pages/admin/bookings/page";

import ClientLogin from "../client/ClientLogin";
import ClientLayout from "../client/ClientLayout";
import ClientDashboard from "../client/ClientDashboard";
import ClientApplications from "../client/ClientApplications";
import ClientBookings from "../client/ClientBookings";
import ClientEnquiries from "../client/ClientEnquires";
import ClientOpportunities from "../client/ClientOpportunities";
import ClientOrders from "../client/ClientOrders";

const routes: RouteObject[] = [
  // ─── Public pages ────────────────────────────────
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
  { path: "/services", element: <Services /> },
  { path: "/packages", element: <Packages /> },
  { path: "/packages/:id", element: <PackageDetail /> },
  { path: "/visa-services", element: <VisaServices /> },
  { path: "/contact", element: <Contact /> },
  { path: "/booking", element: <Booking /> },

  // ─── Sign in (public) ────────────────────────────
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/login", element: <ClientLogin /> },

  // ─── Admin (staff only) ──────────────────────────
  {
    path: "/admin",
    element: <AuthGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "", element: <AdminDashboard /> },
          { path: "packages", element: <AdminPackages /> },
          { path: "bookings", element: <AdminBookings /> },
        ],
      },
    ],
  },

  // ─── Client portal ───────────────────────────────
  {
    path: "/dashboard",
    element: <ClientGuard />,
    children: [
      {
        element: <ClientLayout />,
        children: [
          { path: "", element: <ClientDashboard /> },
          { path: "applications", element: <ClientApplications /> },
          { path: "bookings", element: <ClientBookings /> },
          { path: "enquiries", element: <ClientEnquiries /> },
          { path: "opportunities", element: <ClientOpportunities /> },
          { path: "orders", element: <ClientOrders /> },
        ],
      },
    ],
  },
];

export default routes;
