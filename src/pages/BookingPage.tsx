import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/features/PublicNavbar";
import PublicFooter from "../components/features/PublicFooter";
import Reveal from "../components/features/Reveal";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  loadAvailability,
  submitBooking,
  formatTime,
  formatDateLong,
  toDateKey,
} from "../lib/booking";

interface DestinationOption {
  value: string;
  label: string;
}

const serviceTypes = [
  { value: "", label: "Select service type" },
  { value: "holiday_package", label: "Holiday Package" },
  { value: "visa_processing", label: "Visa Processing" },
  { value: "consultation", label: "Consultation" },
  { value: "group_travel", label: "Group Travel" },
  { value: "travel_insurance", label: "Travel Insurance" },
  { value: "flight_booking", label: "Flight Booking" },
];

const budgetOptions = [
  { value: "", label: "Select budget range" },
  { value: "under_500k", label: "Under ₦500,000" },
  { value: "500k_1m", label: "₦500,000 - ₦1,000,000" },
  { value: "1m_2m", label: "₦1,000,000 - ₦2,000,000" },
  { value: "2m_5m", label: "₦2,000,000 - ₦5,000,000" },
  { value: "above_5m", label: "Above ₦5,000,000" },
];

export default function BookingPage() {
  const { user } = useAuth();
  const [calendar, setCalendar] = useState<Map<string, string[]>>(new Map());
  const [destinations, setDestinations] = useState<DestinationOption[]>([
    { value: "", label: "Select destination" },
  ]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Confirmation state
  const [confirmation, setConfirmation] = useState<{
    name: string;
    date: string;
    time: string;
    reference: string;
    notified: boolean;
  } | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [budget, setBudget] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [acceptedTnc, setAcceptedTnc] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const refreshAvailability = async () => {
    const cal = await loadAvailability();
    setCalendar(cal);
    return cal;
  };

  useEffect(() => {
    const fetchData = async () => {
      const [cal, destRes] = await Promise.all([
        loadAvailability(),
        supabase.from("travel_offers").select("destination").eq("is_active", true),
      ]);

      setCalendar(cal);

      if (!destRes.error && destRes.data) {
        const unique = Array.from(
          new Set((destRes.data as { destination: string }[]).map((d) => d.destination))
        ).sort();
        setDestinations([
          { value: "", label: "Select destination" },
          ...unique.map((d) => ({ value: d, label: d })),
          { value: "Other", label: "Somewhere else" },
        ]);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  // Pre-fill contact details for a signed-in client.
  useEffect(() => {
    if (!user) return;
    setFullName((prev) => prev || user.name || "");
    setEmail((prev) => prev || user.email || "");
  }, [user]);

  const timesForSelectedDate = useMemo(
    () => (selectedDate ? calendar.get(selectedDate) || [] : []),
    [selectedDate, calendar]
  );

  // Calendar helpers
  const calYear = currentMonth.getFullYear();
  const calMonth = currentMonth.getMonth();
  const totalDays = new Date(calYear, calMonth + 1, 0).getDate();
  const startDay = new Date(calYear, calMonth, 1).getDay();
  const monthName = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const todayKey = toDateKey(new Date());
  const atFirstMonth =
    calYear === new Date().getFullYear() && calMonth === new Date().getMonth();

  const prevMonth = () => setCurrentMonth(new Date(calYear, calMonth - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(calYear, calMonth + 1, 1));

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime(null);
    setFormError("");
  };

  const resetForm = () => {
    setConfirmation(null);
    setFullName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setBudget("");
    setServiceType("");
    setDestination("");
    setNotes("");
    setSelectedDate(null);
    setSelectedTime(null);
    setAcceptedTnc(false);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    const formData = new FormData(e.currentTarget);
    if (((formData.get("website_alt") as string) || "").trim()) {
      // Honeypot filled — silently drop.
      return;
    }

    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setFormError("Add your name, phone number and email so we can reach you.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError("That email address doesn't look right. Check it and try again.");
      return;
    }
    if (!serviceType) {
      setFormError("Choose the service you'd like to talk about.");
      return;
    }
    if (!selectedDate || !selectedTime) {
      setFormError("Pick a date and a time for your appointment.");
      return;
    }
    if (!acceptedTnc) {
      setFormError("Accept the terms and conditions to confirm your appointment.");
      return;
    }

    setSubmitting(true);

    const result = await submitBooking({
      full_name: fullName.trim(),
      phone_whatsapp: phone.trim(),
      email: email.trim(),
      address: address.trim() || null,
      budget: budget || null,
      service_type: serviceType,
      destination: destination || null,
      booking_date: selectedDate,
      booking_time: selectedTime,
      notes: notes.trim() || null,
      accepted_tnc: true,
      client_id: user && user.role === "client" ? user.id : null,
    });

    if (!result.ok) {
      setFormError(result.error || "We couldn't save your booking. Please try again.");
      await refreshAvailability();
      setSelectedTime(null);
      setSubmitting(false);
      return;
    }

    // Keep the signed-in client's contact details current.
    if (user && user.role === "client") {
      await supabase
        .from("users")
        .update({
          phone: phone.trim(),
          whatsapp: phone.trim(),
          address: address.trim() || null,
        })
        .eq("id", user.id);
    }

    setConfirmation({
      name: fullName.trim(),
      date: selectedDate,
      time: selectedTime,
      reference: result.reference || "",
      notified: Boolean(result.notified),
    });
    await refreshAvailability();
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const label = "block text-sm font-medium text-foreground-700 mb-1.5";
  const field =
    "w-full px-4 py-3 text-sm bg-background-50 border border-background-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/15 text-foreground-950 placeholder:text-foreground-400 transition-all duration-200";

  return (
    <div className="min-h-screen bg-background-50 page-enter">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-14 md:pb-20 px-4 md:px-6 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 overflow-hidden">
        <div className="absolute inset-0 opacity-35">
          <img
            src="https://readdy.ai/api/search-image?query=Aerial%20view%20of%20world%20famous%20landmarks%20collage%20including%20Eiffel%20Tower%20Taj%20Mahal%20Sydney%20Opera%20House%20Dubai%20skyline%20Santorini%20and%20African%20savanna%2C%20golden%20hour%20lighting%2C%20inspiring%20travel%20photography%2C%20warm%20orange%20and%20deep%20navy%20tones%2C%20editorial%20quality%20composition&width=1600&height=800&seq=booking-hero-eduvic&orientation=landscape&nocache=true"
            alt=""
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto text-center animate-fade-up">
          <p className="text-sm font-semibold text-accent-400 tracking-wide mb-3">
            Book your experience
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-5">
            Make a booking
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
            Choose a service, pick a time that suits you, and one of our travel
            consultants will take it from there.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          {confirmation ? (
            <div className="bg-background-50 border border-accent-200 rounded-xl p-10 text-center max-w-2xl mx-auto animate-scale-in shadow-sm">
              <div className="w-20 h-20 rounded-2xl bg-accent-100 text-accent-600 flex items-center justify-center mx-auto mb-6">
                <i className="ri-check-line text-3xl" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-foreground-950 mb-3">
                Appointment booked
              </h2>
              <p className="text-base text-foreground-500 mb-2">
                Thank you,{" "}
                <strong className="text-foreground-700">{confirmation.name}</strong>. Your
                slot is held.
              </p>
              <div className="my-6 py-5 border-y border-background-200 space-y-1">
                <p className="text-lg font-semibold text-foreground-900">
                  {formatDateLong(confirmation.date)}
                </p>
                <p className="text-lg font-semibold text-accent-600">
                  {formatTime(confirmation.time)}
                </p>
                <p className="text-xs text-foreground-500 pt-2">
                  Reference{" "}
                  <strong className="text-foreground-800 tracking-wide">
                    {confirmation.reference}
                  </strong>
                </p>
              </div>
              <p className="text-sm text-foreground-500 mb-6">
                {confirmation.notified
                  ? "Our team has been notified and will call or email you to confirm."
                  : "Your booking is saved. If you don't hear from us within one working day, call +234 801 234 5678 and quote your reference."}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-primary-500 text-background-50 rounded-lg hover:bg-primary-600 font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Book another appointment
                </button>
                <Link
                  to="/packages"
                  className="px-6 py-3 border border-primary-200 text-primary-700 rounded-lg hover:bg-primary-50 font-semibold text-sm transition-colors whitespace-nowrap"
                >
                  Browse packages
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <input
                type="text"
                name="website_alt"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hp-field"
              />

              {/* Personal information */}
              <Reveal>
                <div className="bg-background-50 border border-background-200 rounded-xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                      <i className="ri-user-line text-lg" />
                    </div>
                    <div>
                      <h2 className="text-lg font-heading font-semibold text-foreground-950">
                        Your details
                      </h2>
                      <p className="text-xs text-foreground-500">So we know who to contact</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="full_name" className={label}>
                        Full name <span className="text-accent-500">*</span>
                      </label>
                      <input
                        id="full_name"
                        type="text"
                        name="full_name"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Adaeze Okonkwo"
                        className={field}
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className={label}>
                        Phone / WhatsApp <span className="text-accent-500">*</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 801 234 5678"
                        className={field}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className={label}>
                        Email <span className="text-accent-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={field}
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className={label}>
                        Address
                      </label>
                      <input
                        id="address"
                        type="text"
                        name="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="12 Admiralty Way, Lekki Phase 1, Lagos"
                        className={field}
                      />
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Service details */}
              <Reveal delay={80}>
                <div className="bg-background-50 border border-background-200 rounded-xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-accent-100 text-accent-600 flex items-center justify-center">
                      <i className="ri-suitcase-line text-lg" />
                    </div>
                    <div>
                      <h2 className="text-lg font-heading font-semibold text-foreground-950">
                        What you're booking
                      </h2>
                      <p className="text-xs text-foreground-500">
                        Helps us put the right consultant on your appointment
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="service_type" className={label}>
                        Service <span className="text-accent-500">*</span>
                      </label>
                      <select
                        id="service_type"
                        name="service_type"
                        required
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className={field}
                      >
                        {serviceTypes.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="destination" className={label}>
                        Destination
                      </label>
                      <select
                        id="destination"
                        name="destination"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className={field}
                      >
                        {destinations.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="budget" className={label}>
                        Budget range
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className={field}
                      >
                        {budgetOptions.map((b) => (
                          <option key={b.value} value={b.value}>
                            {b.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="notes" className={label}>
                        Anything else we should know
                      </label>
                      <input
                        id="notes"
                        type="text"
                        name="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Travelling with two children, prefer morning flights…"
                        className={field}
                      />
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Date & time */}
              <Reveal delay={160}>
                <div className="bg-background-50 border border-background-200 rounded-xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                      <i className="ri-calendar-line text-lg" />
                    </div>
                    <div>
                      <h2 className="text-lg font-heading font-semibold text-foreground-950">
                        Pick a time
                      </h2>
                      <p className="text-xs text-foreground-500">
                        Appointments run Monday to Saturday
                      </p>
                    </div>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div key={i} className="aspect-square rounded-lg skeleton" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Calendar */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <button
                            type="button"
                            onClick={prevMonth}
                            disabled={atFirstMonth}
                            className="w-9 h-9 rounded-lg border border-background-200 flex items-center justify-center text-foreground-500 hover:bg-background-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            aria-label="Previous month"
                          >
                            <i className="ri-arrow-left-s-line" />
                          </button>
                          <span
                            key={monthName}
                            className="text-sm font-semibold text-foreground-900 animate-fade-in"
                          >
                            {monthName}
                          </span>
                          <button
                            type="button"
                            onClick={nextMonth}
                            className="w-9 h-9 rounded-lg border border-background-200 flex items-center justify-center text-foreground-500 hover:bg-background-100 transition-colors"
                            aria-label="Next month"
                          >
                            <i className="ri-arrow-right-s-line" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                            <div
                              key={d}
                              className="text-center text-xs font-medium text-foreground-400 py-2"
                            >
                              {d}
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: startDay }).map((_, i) => (
                            <div key={`empty-${i}`} />
                          ))}
                          {Array.from({ length: totalDays }, (_, i) => {
                            const day = i + 1;
                            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            const available = calendar.has(dateStr);
                            const selected = selectedDate === dateStr;
                            const isToday = dateStr === todayKey;

                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => handleDateClick(dateStr)}
                                disabled={!available}
                                className={`relative aspect-square rounded-lg text-sm font-medium flex items-center justify-center transition-all duration-200 ${
                                  !available
                                    ? "text-foreground-300 cursor-not-allowed"
                                    : selected
                                      ? "bg-primary-500 text-background-50 scale-105 shadow-md shadow-primary-500/25"
                                      : "text-foreground-700 bg-background-100 hover:bg-primary-50 hover:text-primary-700 hover:-translate-y-0.5"
                                } ${isToday && !selected ? "ring-1 ring-accent-300" : ""}`}
                              >
                                {day}
                                {available && !selected && (
                                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-accent-500" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-4 mt-4 text-xs text-foreground-500">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-accent-500" />
                            Open
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-primary-500" />
                            Selected
                          </span>
                        </div>
                      </div>

                      {/* Times */}
                      <div>
                        <h3 className="text-sm font-medium text-foreground-700 mb-4">
                          {selectedDate
                            ? `Times on ${formatDateLong(selectedDate)}`
                            : "Choose a day first"}
                        </h3>

                        {!selectedDate ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-background-300 rounded-lg">
                            <i className="ri-calendar-event-line text-3xl text-foreground-300 mb-2" />
                            <p className="text-sm text-foreground-400">
                              Tap any day with an orange dot
                            </p>
                          </div>
                        ) : timesForSelectedDate.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-background-300 rounded-lg">
                            <i className="ri-time-line text-3xl text-foreground-300 mb-2" />
                            <p className="text-sm text-foreground-400">
                              Fully booked. Try another day.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {timesForSelectedDate.map((time, idx) => (
                              <button
                                key={time}
                                type="button"
                                onClick={() =>
                                  setSelectedTime(selectedTime === time ? null : time)
                                }
                                style={{ animationDelay: `${idx * 35}ms` }}
                                className={`animate-fade-up px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                  selectedTime === time
                                    ? "bg-primary-500 text-background-50 shadow-md shadow-primary-500/25"
                                    : "bg-background-100 text-foreground-700 border border-background-200 hover:bg-primary-50 hover:border-primary-200 hover:-translate-y-0.5"
                                }`}
                              >
                                {formatTime(time)}
                              </button>
                            ))}
                          </div>
                        )}

                        {selectedDate && selectedTime && (
                          <div className="mt-6 p-4 bg-primary-50 border border-primary-100 rounded-lg animate-scale-in">
                            <p className="text-sm font-medium text-primary-800">
                              <i className="ri-check-line mr-1.5" />
                              {formatDateLong(selectedDate)} at {formatTime(selectedTime)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>

              {formError && (
                <div className="p-4 bg-accent-50 border border-accent-200 rounded-lg animate-scale-in">
                  <p className="text-sm text-accent-700 flex items-center gap-2">
                    <i className="ri-error-warning-line" />
                    {formError}
                  </p>
                </div>
              )}

              {/* Terms & submit */}
              <Reveal delay={80}>
                <div className="bg-background-50 border border-background-200 rounded-xl p-6 md:p-8 shadow-sm">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTnc}
                      onChange={(e) => setAcceptedTnc(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-background-300 text-primary-500 focus:ring-primary-400 shrink-0"
                    />
                    <span className="text-sm text-foreground-600 leading-relaxed">
                      I accept the{" "}
                      <strong className="text-foreground-800">terms and conditions</strong>{" "}
                      and confirm my details are correct. I understand the appointment is
                      held pending confirmation by Eduvic Travels.
                    </span>
                  </label>

                  <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto px-8 py-3.5 bg-accent-500 text-background-50 rounded-lg hover:bg-accent-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 font-semibold text-base transition-all duration-200 whitespace-nowrap"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <i className="ri-loader-4-line animate-spin" />
                          Booking your slot…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <i className="ri-calendar-check-line" />
                          Confirm appointment
                        </span>
                      )}
                    </button>
                    <Link
                      to="/contact"
                      className="text-sm text-foreground-500 hover:text-primary-600 transition-colors"
                    >
                      Need help? Talk to us
                    </Link>
                  </div>
                </div>
              </Reveal>
            </form>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
