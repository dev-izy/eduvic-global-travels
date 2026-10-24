// Supabase Edge Function — notify-booking
//
// Emails the company inbox whenever someone books an appointment on the site,
// optionally sends the client a copy, and stamps the booking row as notified.
//
// Deploy:
//   supabase functions deploy notify-booking --no-verify-jwt
//   supabase secrets set RESEND_API_KEY=re_xxx \
//     COMPANY_EMAIL=bookings@eduvictravels.com \
//     FROM_EMAIL="Eduvic Travels <bookings@yourdomain.com>"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface BookingBody {
  reference?: string;
  full_name?: string;
  email?: string;
  phone_whatsapp?: string;
  address?: string | null;
  budget?: string | null;
  service_type?: string;
  destination?: string | null;
  booking_date?: string;
  booking_time?: string;
  notes?: string | null;
  accepted_tnc?: boolean;
}

const pretty = (v?: string | null) =>
  v ? v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

const escapeHtml = (v: unknown) =>
  String(v ?? "—").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );

function formatWhen(date?: string, time?: string) {
  if (!date) return "—";
  const [y, m, d] = date.split("-").map(Number);
  const long = new Date(y, (m || 1) - 1, d || 1).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (!time) return long;
  const [hh, mm] = time.split(":").map(Number);
  const ampm = hh >= 12 ? "PM" : "AM";
  const hour = hh % 12 || 12;
  return `${long} at ${hour}:${String(mm).padStart(2, "0")} ${ampm}`;
}

function buildInternalEmail(b: BookingBody) {
  const rows: [string, string][] = [
    ["Name", escapeHtml(b.full_name)],
    ["Email", escapeHtml(b.email)],
    ["Phone / WhatsApp", escapeHtml(b.phone_whatsapp)],
    ["Address", escapeHtml(b.address)],
    ["Service", escapeHtml(pretty(b.service_type))],
    ["Destination", escapeHtml(b.destination)],
    ["Budget", escapeHtml(pretty(b.budget))],
    ["Appointment", escapeHtml(formatWhen(b.booking_date, b.booking_time))],
    ["Notes", escapeHtml(b.notes)],
    ["Terms accepted", b.accepted_tnc ? "Yes" : "No"],
    ["Reference", escapeHtml(b.reference)],
  ];

  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f4f6f8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1e293b">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e6eaef;border-radius:12px;overflow:hidden">
    <div style="background:#0b1533;padding:24px">
      <p style="margin:0;color:#fb923c;font-size:12px;font-weight:600">New appointment booked</p>
      <h1 style="margin:6px 0 0;color:#ffffff;font-size:22px">${escapeHtml(b.full_name)}</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,.65);font-size:14px">${escapeHtml(
        formatWhen(b.booking_date, b.booking_time)
      )}</p>
    </div>
    <table style="width:100%;border-collapse:collapse">
      ${rows
        .map(
          ([k, v], i) => `<tr style="background:${i % 2 ? "#fafbfc" : "#ffffff"}">
        <td style="padding:12px 24px;font-size:13px;color:#64748b;width:38%">${k}</td>
        <td style="padding:12px 24px;font-size:14px;color:#0f172a">${v}</td>
      </tr>`
        )
        .join("")}
    </table>
    <div style="padding:18px 24px;border-top:1px solid #e6eaef">
      <a href="mailto:${escapeHtml(b.email)}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600">Reply to ${escapeHtml(
        b.full_name
      )}</a>
    </div>
  </div>
</body></html>`;
}

function buildClientEmail(b: BookingBody) {
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f4f6f8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1e293b">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e6eaef;border-radius:12px;padding:32px">
    <h1 style="margin:0 0 12px;font-size:22px;color:#0f172a">Your appointment is booked</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569">
      Thanks ${escapeHtml(b.full_name)} — we have you down for
      <strong>${escapeHtml(formatWhen(b.booking_date, b.booking_time))}</strong>.
      A consultant will be in touch to confirm.
    </p>
    <p style="margin:0 0 4px;font-size:13px;color:#64748b">Reference</p>
    <p style="margin:0 0 24px;font-size:16px;font-weight:600;color:#0f172a">${escapeHtml(
      b.reference
    )}</p>
    <p style="margin:0;font-size:13px;color:#64748b">
      Need to change something? Reply to this email or call +234 801 234 5678.
    </p>
  </div>
</body></html>`;
}

async function sendEmail(payload: Record<string, unknown>, apiKey: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const booking = (await req.json()) as BookingBody;

    const apiKey = Deno.env.get("RESEND_API_KEY");
    const companyEmail = Deno.env.get("COMPANY_EMAIL");
    const fromEmail =
      Deno.env.get("FROM_EMAIL") || "Eduvic Travels <onboarding@resend.dev>";

    if (!apiKey || !companyEmail) {
      return new Response(
        JSON.stringify({
          sent: false,
          error: "Mail is not configured. Set RESEND_API_KEY and COMPANY_EMAIL.",
        }),
        { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const sent = await sendEmail(
      {
        from: fromEmail,
        to: companyEmail.split(",").map((e) => e.trim()),
        reply_to: booking.email,
        subject: `New booking — ${booking.full_name} · ${formatWhen(
          booking.booking_date,
          booking.booking_time
        )}`,
        html: buildInternalEmail(booking),
      },
      apiKey
    );

    // Copy for the client. Best effort — never blocks the internal alert.
    if (booking.email) {
      await sendEmail(
        {
          from: fromEmail,
          to: [booking.email],
          subject: `Your Eduvic Travels appointment (${booking.reference ?? ""})`,
          html: buildClientEmail(booking),
        },
        apiKey
      ).catch(() => false);
    }

    // Stamp the row so the admin dashboard can show delivery status.
    if (sent && booking.reference) {
      const url = Deno.env.get("SUPABASE_URL");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (url && serviceKey) {
        const admin = createClient(url, serviceKey);
        await admin
          .from("bookings")
          .update({ notified_at: new Date().toISOString() })
          .eq("reference", booking.reference);
      }
    }

    return new Response(JSON.stringify({ sent }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ sent: false, error: String(err) }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
