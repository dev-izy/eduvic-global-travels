import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Reveal from "../../../components/features/Reveal";
import DownloadLeadsButton from "../../../components/features/Downloadleadsbutton";
import { formatTime, formatDateLong, toDateKey } from "../../../lib/booking";

interface BookingRow {
  id: string;
  reference: string | null;
  full_name: string;
  email: string;
  phone_whatsapp: string;
  address: string | null;
  budget: string | null;
  service_type: string;
  destination: string | null;
  booking_date: string;
  booking_time: string;
  notes: string | null;
  accepted_tnc: boolean;
  status: string;
  notified_at: string | null;
  created_at: string;
}

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

const statusStyles: Record<string, string> = {
  pending: "bg-accent-100 text-accent-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-primary-100 text-primary-700",
  cancelled: "bg-background-200 text-foreground-500",
};

const prettyLabel = (value: string | null) =>
  value ? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "all" | (typeof STATUSES)[number]>(
    "upcoming"
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  const load = async () => {
    const { data, error: err } = await supabase
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true });

    if (err) setError(err.message);
    else setBookings((data || []) as BookingRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const today = toDateKey(new Date());

  const visible = useMemo(() => {
    if (filter === "all") return bookings;
    if (filter === "upcoming")
      return bookings.filter((b) => b.booking_date >= today && b.status !== "cancelled");
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter, today]);

  const updateStatus = async (booking: BookingRow, status: string) => {
    const previous = booking.status;
    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, status } : b))
    );

    const { error: err } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", booking.id);

    if (err) {
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: previous } : b))
      );
      showToast("That didn't save. Try again.");
      return;
    }
    showToast(`Marked ${status}`);
  };

  const filters: { key: typeof filter; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "pending", label: "New" },
    { key: "confirmed", label: "Confirmed" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="max-w-5xl mx-auto page-enter">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">
            Appointments
          </h1>
          <p className="text-sm text-foreground-500 mt-1">
            Every booking made through the site, with the details the client submitted.
          </p>
        </div>
        <DownloadLeadsButton />
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              filter === f.key
                ? "bg-primary-500 text-white shadow-sm"
                : "bg-background-50 border border-background-200 text-foreground-600 hover:bg-background-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl skeleton" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-background-50 border border-dashed border-background-300 rounded-xl px-6 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-background-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-calendar-line text-2xl text-foreground-400" />
          </div>
          <p className="text-sm font-medium text-foreground-700">Nothing here</p>
          <p className="text-xs text-foreground-500 mt-1">
            Try another filter, or wait for the next booking to come in.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((b, i) => {
            const open = expanded === b.id;
            return (
              <Reveal key={b.id} delay={Math.min(i * 40, 240)}>
                <div className="bg-background-50 border border-background-200 rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-md">
                  <button
                    onClick={() => setExpanded(open ? null : b.id)}
                    className="w-full flex flex-wrap items-center gap-3 px-5 py-4 text-left hover:bg-background-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold shrink-0">
                      {b.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground-900 truncate">
                        {b.full_name}
                      </p>
                      <p className="text-xs text-foreground-500 truncate">
                        {formatDateLong(b.booking_date)} at {formatTime(b.booking_time)} ·{" "}
                        {prettyLabel(b.service_type)}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                        statusStyles[b.status] || statusStyles.pending
                      }`}
                    >
                      {b.status}
                    </span>
                    <i
                      className={`ri-arrow-down-s-line text-foreground-400 transition-transform duration-300 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {open && (
                    <div className="px-5 pb-5 pt-1 border-t border-background-200 animate-fade-up">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 py-4 text-sm">
                        <div>
                          <dt className="text-xs text-foreground-500">Email</dt>
                          <dd className="text-foreground-900">
                            <a
                              href={`mailto:${b.email}`}
                              className="hover:text-primary-600 transition-colors"
                            >
                              {b.email}
                            </a>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-foreground-500">Phone / WhatsApp</dt>
                          <dd className="text-foreground-900">
                            <a
                              href={`tel:${b.phone_whatsapp}`}
                              className="hover:text-primary-600 transition-colors"
                            >
                              {b.phone_whatsapp}
                            </a>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-foreground-500">Destination</dt>
                          <dd className="text-foreground-900">{b.destination || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-foreground-500">Budget</dt>
                          <dd className="text-foreground-900">{prettyLabel(b.budget)}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs text-foreground-500">Address</dt>
                          <dd className="text-foreground-900">{b.address || "—"}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs text-foreground-500">Notes</dt>
                          <dd className="text-foreground-900">{b.notes || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-foreground-500">Reference</dt>
                          <dd className="text-foreground-900">{b.reference || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-foreground-500">Terms accepted</dt>
                          <dd className="text-foreground-900">
                            {b.accepted_tnc ? "Yes" : "No"}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs text-foreground-500">Email notification</dt>
                          <dd
                            className={
                              b.notified_at ? "text-emerald-600" : "text-accent-600"
                            }
                          >
                            {b.notified_at
                              ? `Sent ${new Date(b.notified_at).toLocaleString("en-GB")}`
                              : "Not delivered — follow up manually"}
                          </dd>
                        </div>
                      </dl>

                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-background-200">
                        <span className="text-xs text-foreground-500 mr-1">Set status</span>
                        {STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(b, s)}
                            disabled={b.status === s}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                              b.status === s
                                ? "bg-primary-500 text-white cursor-default"
                                : "border border-background-200 text-foreground-600 hover:bg-background-100 hover:-translate-y-0.5"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                        <a
                          href={`mailto:${b.email}?subject=Your Eduvic Travels appointment (${b.reference || ""})`}
                          className="ml-auto px-3 py-1.5 rounded-lg bg-accent-500 text-white text-xs font-semibold hover:bg-accent-600 transition-colors"
                        >
                          Reply by email
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-foreground-950 text-white text-sm rounded-lg shadow-xl animate-fade-up">
          {toast}
        </div>
      )}
    </div>
  );
}