import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import Reveal from "../../components/features/Reveal";
import { formatTime, formatDateLong, toDateKey } from "../../lib/booking";

interface BookingRow {
  id: string;
  reference: string | null;
  full_name: string;
  email: string;
  phone_whatsapp: string;
  service_type: string;
  destination: string | null;
  booking_date: string;
  booking_time: string;
  status: string;
  created_at: string;
}

const statusStyles: Record<string, string> = {
  pending: "bg-accent-100 text-accent-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-primary-100 text-primary-700",
  cancelled: "bg-background-200 text-foreground-500",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [packageCount, setPackageCount] = useState(0);
  const [activePackages, setActivePackages] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [bookingRes, pkgRes] = await Promise.all([
        supabase
          .from("bookings")
          .select(
            "id,reference,full_name,email,phone_whatsapp,service_type,destination,booking_date,booking_time,status,created_at"
          )
          .order("created_at", { ascending: false })
          .limit(50),
        supabase.from("travel_offers").select("id,is_active"),
      ]);

      if (!bookingRes.error && bookingRes.data) {
        setBookings(bookingRes.data as BookingRow[]);
      }
      if (!pkgRes.error && pkgRes.data) {
        const rows = pkgRes.data as { id: string; is_active: boolean }[];
        setPackageCount(rows.length);
        setActivePackages(rows.filter((r) => r.is_active).length);
      }
      setLoading(false);
    };
    load();
  }, []);

  const today = toDateKey(new Date());
  const pending = bookings.filter((b) => b.status === "pending").length;
  const upcoming = bookings.filter(
    (b) => b.booking_date >= today && b.status !== "cancelled"
  ).length;

  const stats = [
    { label: "New requests", value: pending, icon: "ri-inbox-line", tone: "accent" },
    { label: "Upcoming appointments", value: upcoming, icon: "ri-calendar-check-line", tone: "primary" },
    { label: "Packages published", value: activePackages, icon: "ri-suitcase-3-line", tone: "primary" },
    { label: "Packages total", value: packageCount, icon: "ri-archive-line", tone: "neutral" },
  ];

  const firstName = (user?.name || "there").split(" ")[0];

  return (
    <div className="max-w-6xl mx-auto page-enter">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">
          Good to see you, {firstName}
        </h1>
        <p className="text-sm text-foreground-500 mt-1">
          Here's what's come in through the site.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 70}>
            <div className="bg-background-50 border border-background-200 rounded-xl p-5 hover-lift hover:shadow-md h-full">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                  s.tone === "accent"
                    ? "bg-accent-100 text-accent-600"
                    : s.tone === "primary"
                      ? "bg-primary-100 text-primary-600"
                      : "bg-background-100 text-foreground-500"
                }`}
              >
                <i className={`${s.icon} text-lg`} />
              </div>
              <p className="text-3xl font-heading font-bold text-foreground-950">
                {loading ? "—" : s.value}
              </p>
              <p className="text-xs text-foreground-500 mt-1">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="bg-background-50 border border-background-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-background-200">
            <div>
              <h2 className="font-heading font-semibold text-foreground-950">
                Latest appointment requests
              </h2>
              <p className="text-xs text-foreground-500">Straight from the booking form</p>
            </div>
            <Link
              to="/admin/bookings"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              See all
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg skeleton" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-background-100 flex items-center justify-center mx-auto mb-4">
                <i className="ri-calendar-line text-2xl text-foreground-400" />
              </div>
              <p className="text-sm text-foreground-600 font-medium">No bookings yet</p>
              <p className="text-xs text-foreground-500 mt-1">
                Requests from the booking page will land here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-background-200">
              {bookings.slice(0, 6).map((b, i) => (
                <li
                  key={b.id}
                  style={{ animationDelay: `${i * 45}ms` }}
                  className="animate-fade-up flex flex-wrap items-center gap-3 px-5 py-4 hover:bg-background-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold shrink-0">
                    {b.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground-900 truncate">
                      {b.full_name}
                      {b.destination ? (
                        <span className="text-foreground-500 font-normal"> · {b.destination}</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-foreground-500 truncate">
                      {formatDateLong(b.booking_date)} at {formatTime(b.booking_time)}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                      statusStyles[b.status] || statusStyles.pending
                    }`}
                  >
                    {b.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>

      <Reveal delay={90}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <Link
            to="/admin/packages"
            className="flex items-center gap-4 p-5 bg-background-50 border border-background-200 rounded-xl hover-lift hover:shadow-md hover:border-accent-200"
          >
            <div className="w-11 h-11 rounded-lg bg-accent-100 text-accent-600 flex items-center justify-center shrink-0">
              <i className="ri-add-line text-xl" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground-950">Add a travel package</p>
              <p className="text-xs text-foreground-500">Publishes to the packages page</p>
            </div>
          </Link>
          <Link
            to="/admin/bookings"
            className="flex items-center gap-4 p-5 bg-background-50 border border-background-200 rounded-xl hover-lift hover:shadow-md hover:border-primary-200"
          >
            <div className="w-11 h-11 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
              <i className="ri-customer-service-2-line text-xl" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground-950">Work through requests</p>
              <p className="text-xs text-foreground-500">Confirm or reschedule appointments</p>
            </div>
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
