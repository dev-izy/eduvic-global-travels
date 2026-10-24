import { supabase } from "./supabase";

export interface BookingPayload {
  full_name: string;
  phone_whatsapp: string;
  email: string;
  address: string | null;
  budget: string | null;
  service_type: string;
  destination: string | null;
  booking_date: string; // YYYY-MM-DD
  booking_time: string; // HH:MM:SS
  notes: string | null;
  accepted_tnc: boolean;
  client_id?: string | null;
}

export interface SubmitResult {
  ok: boolean;
  reference?: string;
  /** True when the company notification email went out. */
  notified?: boolean;
  error?: string;
}

/** Business hours offered when no slots have been set up in the database. */
const DEFAULT_TIMES = [
  "09:00:00",
  "10:00:00",
  "11:00:00",
  "12:00:00",
  "14:00:00",
  "15:00:00",
  "16:00:00",
];

const DAYS_AHEAD = 45;
/** 0 = Sunday. The office takes appointments Monday to Saturday. */
const CLOSED_WEEKDAYS = [0];

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function formatDateLong(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildDefaultCalendar(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const now = new Date();
  const todayKey = toDateKey(now);

  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    if (CLOSED_WEEKDAYS.includes(d.getDay())) continue;

    const key = toDateKey(d);
    let times = [...DEFAULT_TIMES];

    // Don't offer a slot that has already passed today, and give the team
    // at least two hours' notice.
    if (key === todayKey) {
      const cutoff = now.getHours() + 2;
      times = times.filter((t) => Number(t.split(":")[0]) > cutoff);
    }

    if (times.length) map.set(key, times);
  }

  return map;
}

/**
 * Returns the bookable date -> times map.
 *
 * If the team has published rows in `availability_slots`, those win, so the
 * office can open and close specific days. When that table is empty the
 * standard business-hours calendar is used instead, which means the booking
 * page always has something selectable. Slots already taken by a live
 * booking are removed either way.
 */
export async function loadAvailability(): Promise<Map<string, string[]>> {
  const todayKey = toDateKey(new Date());

  const [slotsRes, bookedRes] = await Promise.all([
    supabase
      .from("availability_slots")
      .select("slot_date,slot_time,is_available")
      .eq("is_available", true)
      .gte("slot_date", todayKey)
      .order("slot_date", { ascending: true }),
    supabase
      .from("bookings")
      .select("booking_date,booking_time,status")
      .gte("booking_date", todayKey)
      .neq("status", "cancelled"),
  ]);

  let calendar: Map<string, string[]>;

  const published = slotsRes.error ? [] : slotsRes.data || [];
  if (published.length > 0) {
    calendar = new Map();
    for (const s of published as { slot_date: string; slot_time: string }[]) {
      const time = s.slot_time.length === 5 ? `${s.slot_time}:00` : s.slot_time;
      if (!calendar.has(s.slot_date)) calendar.set(s.slot_date, []);
      calendar.get(s.slot_date)!.push(time);
    }
  } else {
    calendar = buildDefaultCalendar();
  }

  // Remove anything already booked.
  const taken = new Set(
    (bookedRes.error ? [] : bookedRes.data || []).map(
      (b: { booking_date: string; booking_time: string }) =>
        `${b.booking_date}|${b.booking_time.length === 5 ? `${b.booking_time}:00` : b.booking_time}`
    )
  );

  for (const [date, times] of calendar) {
    const free = times.filter((t) => !taken.has(`${date}|${t}`)).sort();
    if (free.length) calendar.set(date, free);
    else calendar.delete(date);
  }

  return calendar;
}

/**
 * Sends the booking details to the company inbox.
 *
 * Primary path is the `notify-booking` Supabase edge function, which holds
 * the mail provider key server-side. `VITE_BOOKING_WEBHOOK_URL` is an
 * optional second path (a form-to-email endpoint, Zapier hook, etc.) so the
 * team still gets notified if the function is down or not yet deployed.
 */
async function notifyCompany(payload: BookingPayload, reference: string): Promise<boolean> {
  const body = { ...payload, reference };
  let delivered = false;

  try {
    const { data, error } = await supabase.functions.invoke("notify-booking", { body });
    if (!error && (data as { sent?: boolean } | null)?.sent !== false) delivered = true;
  } catch {
    // Fall through to the webhook.
  }

  const webhook = import.meta.env.VITE_BOOKING_WEBHOOK_URL as string | undefined;
  if (!delivered && webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `New booking — ${payload.full_name} (${reference})`,
          ...body,
        }),
      });
      delivered = res.ok;
    } catch {
      delivered = false;
    }
  }

  return delivered;
}

function makeReference(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `EDV-${stamp}${rand}`;
}

/**
 * Writes the booking, holds the slot, and emails the office. The booking is
 * kept even if the email fails — the row is the source of truth and the
 * admin dashboard shows which ones were not delivered.
 */
export async function submitBooking(payload: BookingPayload): Promise<SubmitResult> {
  const reference = makeReference();

  // Re-check the slot at submit time so two people filling the form at once
  // can't take the same appointment.
  const { data: clash } = await supabase
    .from("bookings")
    .select("id")
    .eq("booking_date", payload.booking_date)
    .eq("booking_time", payload.booking_time)
    .neq("status", "cancelled")
    .limit(1);

  if (clash && clash.length > 0) {
    return {
      ok: false,
      error: "That time was just taken. Please pick another slot.",
    };
  }

  const { error } = await supabase.from("bookings").insert({
    ...payload,
    reference,
    status: "pending",
  });

  if (error) {
    return {
      ok: false,
      error: error.message || "We couldn't save your booking. Please try again.",
    };
  }

  // Close the published slot if the team manages availability manually.
  await supabase
    .from("availability_slots")
    .update({ is_available: false })
    .eq("slot_date", payload.booking_date)
    .eq("slot_time", payload.booking_time);

  const notified = await notifyCompany(payload, reference);

  return { ok: true, reference, notified };
}
