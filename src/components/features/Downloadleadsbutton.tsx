import { useState } from "react";
import { exportLeads } from "../../lib/Leads";

/**
 * Downloads every person who has submitted a booking as a CSV file
 * (opens directly in Excel or Google Sheets). Data comes from the
 * `booking_leads` view, so it always reflects the latest submissions.
 */
export default function DownloadLeadsButton({ className = "" }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const handleClick = async () => {
    setBusy(true);
    setMessage(null);
    const { count, error } = await exportLeads();
    setBusy(false);

    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }
    setMessage({ type: "ok", text: `Downloaded ${count} ${count === 1 ? "lead" : "leads"}.` });
  };

  return (
    <div className={`inline-flex flex-col items-end gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-background-50 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-colors whitespace-nowrap"
      >
        <i className={busy ? "ri-loader-4-line animate-spin" : "ri-file-excel-2-line"} />
        {busy ? "Preparing..." : "Download leads (CSV)"}
      </button>
      {message && (
        <p className={`text-xs ${message.type === "ok" ? "text-primary-700" : "text-accent-700"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}