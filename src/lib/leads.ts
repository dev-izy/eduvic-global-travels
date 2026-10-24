import { supabase } from "./supabase";

export interface LeadRow {
  email: string;
  full_name: string | null;
  phone: string | null;
  bookings_count: number;
  first_seen: string;
  last_seen: string;
  last_destination: string | null;
  last_service: string | null;
  last_budget: string | null;
  last_package: string | null;
  has_confirmed: boolean;
}

/** Wraps a value for CSV: quotes it, doubles inner quotes, and defuses
 *  anything Excel would run as a formula. */
function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);

  // A cell starting with = + - @ is executed by Excel and Sheets.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;

  return `"${text.replace(/"/g, '""')}"`;
}

const prettyLabel = (v: string | null) =>
  v ? v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

const isoDay = (v: string) => (v ? v.slice(0, 10) : "");

/** One row per person who has ever booked, newest enquiry first. */
export async function fetchLeads(): Promise<{ rows: LeadRow[]; error?: string }> {
  const { data, error } = await supabase
    .from("booking_leads")
    .select("*")
    .order("last_seen", { ascending: false });

  if (error) return { rows: [], error: error.message };
  return { rows: (data || []) as LeadRow[] };
}

export function leadsToCsv(rows: LeadRow[]): string {
  const headers = [
    "Email",
    "Full name",
    "Phone",
    "Bookings",
    "First enquiry",
    "Last enquiry",
    "Last destination",
    "Last service",
    "Budget range",
    "Last package viewed",
    "Became a customer",
  ];

  const lines = [headers.map(csvCell).join(",")];

  for (const r of rows) {
    lines.push(
      [
        r.email,
        r.full_name,
        r.phone,
        r.bookings_count,
        isoDay(r.first_seen),
        isoDay(r.last_seen),
        r.last_destination,
        prettyLabel(r.last_service),
        prettyLabel(r.last_budget),
        r.last_package,
        r.has_confirmed ? "Yes" : "No",
      ]
        .map(csvCell)
        .join(",")
    );
  }

  // CRLF plus a BOM, so Excel opens it with the right encoding and the
  // ₦ sign and accented names survive.
  return `﻿${lines.join("\r\n")}`;
}

/** Triggers a browser download of the given CSV text. */
export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Give the download a tick to start before releasing the blob.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Fetch, convert and download in one call. Returns how many rows went out. */
export async function exportLeads(): Promise<{ count: number; error?: string }> {
  const { rows, error } = await fetchLeads();
  if (error) return { count: 0, error };
  if (rows.length === 0) return { count: 0, error: "There are no leads to export yet." };

  const stamp = new Date().toISOString().slice(0, 10);
  downloadCsv(leadsToCsv(rows), `eduvic-leads-${stamp}.csv`);
  return { count: rows.length };
}