import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface EnquiryRow {
  id: string;
  subject: string;
  message: string;
  status: string;
  reply: string;
  created_at: string;
}

const statusColor: Record<string, string> = {
  Open: "bg-accent-100 text-accent-700",
  "In Progress": "bg-secondary-100 text-secondary-700",
  Resolved: "bg-primary-100 text-primary-700",
};

export default function ClientEnquiries() {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: supaError } = await supabase
        .from("enquiries")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (supaError) throw supaError;
      setEnquiries((data || []) as EnquiryRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    if (!subject.trim() || !message.trim()) {
      setFormError("Please fill in both subject and message.");
      return;
    }

    if (message.length > 500) {
      setFormError("Message must be 500 characters or less.");
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from("enquiries").insert({
      client_id: user?.id,
      client_name: user?.name,
      subject: subject.trim(),
      message: message.trim(),
      status: "Open",
    });

    setSubmitting(false);

    if (insertError) {
      setFormError(insertError.message);
      return;
    }

    setSubject("");
    setMessage("");
    setShowForm(false);
    setSuccess("Your enquiry has been submitted. Our team will respond shortly.");
    fetchData();
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
          <p className="text-sm text-foreground-500 mt-3">Loading enquiries...</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">Enquiries</h1>
          <p className="text-sm text-foreground-500 mt-1">Ask questions and track responses from our team.</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setFormError("");
            setSuccess("");
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-background-50 rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm whitespace-nowrap"
        >
          <i className="ri-add-line" />
          New Enquiry
        </button>
      </div>

      {/* Success banner */}
      {success && (
        <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg flex items-start gap-3">
          <i className="ri-checkbox-circle-line text-primary-600 mt-0.5" />
          <p className="text-sm text-primary-700">{success}</p>
        </div>
      )}

      {/* New enquiry form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-background-50 border border-background-200/70 rounded-lg p-5">
          <h2 className="text-base font-heading font-semibold text-foreground-950 mb-4">New Enquiry</h2>
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{formError}</div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-foreground-700 mb-1.5">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Visa document question"
                className="w-full px-3 py-2.5 bg-background-50 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground-700 mb-1.5">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                maxLength={500}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or request..."
                className="w-full px-3 py-2.5 bg-background-50 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
              />
              <p className="text-xs text-foreground-400 mt-1">{message.length}/500 characters</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 border border-background-300 text-foreground-700 rounded-lg hover:bg-background-100 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2.5 bg-primary-500 text-background-50 rounded-lg hover:bg-primary-600 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                {submitting ? "Submitting..." : "Submit Enquiry"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Enquiry list */}
      {enquiries.length === 0 ? (
        <div className="px-4 py-16 text-center bg-background-50 border border-background-200/70 rounded-lg">
          <div className="w-16 h-16 rounded-2xl bg-background-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-question-answer-line text-foreground-400 text-3xl" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-foreground-950 mb-1">No enquiries yet</h3>
          <p className="text-sm text-foreground-500">Submit your first enquiry and our team will get back to you.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div key={enq.id} className="bg-background-50 border border-background-200/70 rounded-lg p-5">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h3 className="text-sm font-semibold text-foreground-900">{enq.subject}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[enq.status] || "bg-background-100 text-foreground-600"}`}>
                  {enq.status}
                </span>
                <span className="text-xs text-foreground-400 ml-auto">{formatDate(enq.created_at)}</span>
              </div>
              <p className="text-sm text-foreground-700">{enq.message}</p>
              {enq.reply && (
                <div className="mt-3 p-3 bg-primary-50 rounded-md">
                  <p className="text-xs font-medium text-primary-700 mb-1">Response from Eduvic Travels</p>
                  <p className="text-sm text-foreground-700">{enq.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}