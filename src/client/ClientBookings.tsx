import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface BookingRow {
  id: string;
  full_name: string;
  service_type: string;
  destination: string | null;
  booking_date: string;
  booking_time: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const serviceLabels: Record<string, string> = {
  holiday_package: "Holiday Package",
  visa_processing: "Visa Processing",
  consultation: "Consultation",
  group_travel: "Group Travel",
  travel_insurance: "Travel Insurance",
  flight_booking: "Flight Booking",
};

const statusStyle: Record<string, string> = {
  confirmed: "bg-primary-100 text-primary-700",
  pending: "bg-accent-100 text-accent-700",
  cancelled: "bg-red-50 text-red-600",
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function ClientBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState<BookingRow | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: supaError } = await supabase
        .from("bookings")
        .select("id,full_name,service_type,destination,booking_date,booking_time,status,notes,created_at")
        .or(`client_id.eq.${user.id},email.eq.${user.email}`)
        .order("booking_date", { ascending: false })
        .order("booking_time", { ascending: true });

      if (supaError) throw supaError;
      setBookings((data || []) as BookingRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const cancelBooking = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    setNotice(null);
    try {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", cancelTarget.id);

      if (updateError) throw updateError;

      // Notify the client and staff via email (best-effort)
      try {
        await supabase.functions.invoke("send-booking-cancellation", {
          body: {
            email: user?.email || "",
            full_name: cancelTarget.full_name,
            booking_date: cancelTarget.booking_date,
            booking_time: cancelTarget.booking_time,
            service_type: cancelTarget.service_type,
            destination: cancelTarget.destination || "",
          },
        });
      } catch {
        // Email is best-effort; don't block the cancellation
      }

      setNotice({ type: "success", message: "Your booking has been cancelled." });
      setCancelTarget(null);
      await fetchData();
    } catch (err) {
      setNotice({ type: "error", message: err instanceof Error ? err.message : "Failed to cancel booking." });
    } finally {
      setCancelLoading(false);
    }
  };

  const upcoming = bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
          <p className="text-sm text-foreground-500 mt-3">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-2xl" />
          </div>
          <p className="text-sm text-foreground-700 mb-4">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-primary-500 text-background-50 rounded-lg hover:bg-primary-600 text-sm font-medium transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">My Bookings</h1>
        <p className="text-sm text-foreground-500 mt-1">View and track your scheduled appointments.</p>
      </div>

      {notice && (
        <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${notice.type === "success" ? "bg-primary-50 border border-primary-100" : "bg-red-50 border border-red-200"}`}>
          <i className={`${notice.type === "success" ? "ri-checkbox-circle-line text-primary-600" : "ri-error-warning-line text-red-500"} mt-0.5`} />
          <p className={`text-sm ${notice.type === "success" ? "text-primary-800" : "text-red-700"}`}>{notice.message}</p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-background-50 border border-background-200/70 rounded-lg p-5 mb-6 flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
          <i className="ri-calendar-check-line text-xl" />
        </div>
        <div>
          <p className="text-2xl font-heading font-bold text-foreground-950">{upcoming}</p>
          <p className="text-sm text-foreground-500">Upcoming booking{upcoming !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="px-4 py-16 text-center bg-background-50 border border-background-200/70 rounded-lg">
          <div className="w-16 h-16 rounded-2xl bg-background-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-calendar-line text-foreground-400 text-3xl" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-foreground-950 mb-1">No bookings yet</h3>
          <p className="text-sm text-foreground-500 mb-5">Schedule a consultation or service to get started.</p>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-background-50 rounded-lg hover:bg-primary-600 text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <i className="ri-add-line" />
            Make a Booking
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-background-50 border border-background-200/70 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-accent-100 text-accent-600 flex items-center justify-center shrink-0">
                <i className="ri-calendar-event-line text-xl" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-heading font-semibold text-foreground-950">
                    {serviceLabels[booking.service_type] || booking.service_type}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle[booking.status] || "bg-background-100 text-foreground-600"}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap text-sm text-foreground-500">
                  {booking.destination && (
                    <span className="flex items-center gap-1">
                      <i className="ri-map-pin-line text-accent-500" />
                      {booking.destination}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <i className="ri-calendar-line" />
                    {formatDate(booking.booking_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="ri-time-line" />
                    {formatTime(booking.booking_time)}
                  </span>
                </div>
                {booking.notes && (
                  <p className="text-xs text-foreground-400 mt-1.5 line-clamp-1 italic">&ldquo;{booking.notes}&rdquo;</p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-xs text-foreground-400 whitespace-nowrap">
                  Booked {new Date(booking.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                {(booking.status === "pending" || booking.status === "confirmed") && (
                  <button
                    onClick={() => setCancelTarget(booking)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors whitespace-nowrap"
                  >
                    <i className="ri-close-circle-line" />
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground-950/40" onClick={() => setCancelTarget(null)} />
          <div className="relative z-10 bg-background-50 rounded-lg border border-background-200/70 w-full max-w-sm p-6">
            <h3 className="text-lg font-heading font-semibold text-foreground-950 mb-2">Cancel this booking?</h3>
            <p className="text-sm text-foreground-600 mb-5">
              You&rsquo;re about to cancel your {serviceLabels[cancelTarget.service_type] || cancelTarget.service_type} on {formatDate(cancelTarget.booking_date)} at {formatTime(cancelTarget.booking_time)}. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelTarget(null)} className="flex-1 px-4 py-2.5 border border-background-300 text-foreground-700 rounded-lg hover:bg-background-100 text-sm font-medium transition-colors whitespace-nowrap">
                Keep Booking
              </button>
              <button onClick={cancelBooking} disabled={cancelLoading} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm font-medium transition-colors whitespace-nowrap">
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}