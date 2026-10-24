import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const VISA_STAGES = [
  "Document Review",
  "Application Prepared",
  "Embassy Submitted",
  "Under Review",
  "Biometrics Scheduled",
  "Approved",
  "Rejected",
];

interface Stage {
  name: string;
  date: string;
  completed: boolean;
}

interface VisaRow {
  id: string;
  country: string;
  visa_type: string;
  current_stage: string;
  stages: Stage[];
  documents: string[];
  notes: string;
  updated_at: string;
}

const stageColor: Record<string, string> = {
  "Document Review": "bg-secondary-100 text-secondary-700",
  "Application Prepared": "bg-accent-100 text-accent-700",
  "Embassy Submitted": "bg-primary-100 text-primary-700",
  "Under Review": "bg-accent-100 text-accent-700",
  "Biometrics Scheduled": "bg-primary-100 text-primary-700",
  Approved: "bg-primary-500 text-background-50",
  Rejected: "bg-red-50 text-red-600",
};

export default function ClientApplications() {
  const { user } = useAuth();
  const [visas, setVisas] = useState<VisaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: supaError } = await supabase
        .from("visa_applications")
        .select("*")
        .eq("client_id", user.id)
        .order("updated_at", { ascending: false });

      if (supaError) throw supaError;
      setVisas((data || []) as VisaRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
          <p className="text-sm text-foreground-500 mt-3">Loading applications...</p>
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
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">My Applications</h1>
        <p className="text-sm text-foreground-500 mt-1">Track the progress of your visa applications.</p>
      </div>

      {visas.length === 0 ? (
        <div className="px-4 py-16 text-center bg-background-50 border border-background-200/70 rounded-lg">
          <div className="w-16 h-16 rounded-2xl bg-background-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-passport-line text-foreground-400 text-3xl" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-foreground-950 mb-1">No applications yet</h3>
          <p className="text-sm text-foreground-500">Once you start a visa application, you'll see its progress here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {visas.map((visa) => {
            const currentIdx = VISA_STAGES.indexOf(visa.current_stage);
            return (
              <div key={visa.id} className="bg-background-50 border border-background-200/70 rounded-lg overflow-hidden">
                {/* Header */}
                <div className="px-5 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-background-200/70">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-heading font-semibold text-foreground-950">{visa.visa_type}</h2>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColor[visa.current_stage] || "bg-background-100 text-foreground-600"}`}>
                        {visa.current_stage}
                      </span>
                    </div>
                    <p className="text-sm text-foreground-500 mt-1 flex items-center gap-1.5">
                      <i className="ri-map-pin-line" />
                      {visa.country}
                    </p>
                  </div>
                  <p className="text-xs text-foreground-400">
                    Last updated {new Date(visa.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>

                {/* Timeline */}
                <div className="px-5 md:px-6 py-5">
                  <div className="space-y-0">
                    {VISA_STAGES.filter((s) => s !== "Rejected").map((stage, idx) => {
                      const isDone = idx < currentIdx || visa.current_stage === "Approved";
                      const isCurrent = stage === visa.current_stage;
                      return (
                        <div key={stage} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${
                              isDone ? "bg-primary-500 border-primary-500 text-background-50" : isCurrent ? "bg-accent-100 border-accent-400 text-accent-700" : "bg-background-50 border-background-300 text-foreground-300"
                            }`}>
                              {isDone ? <i className="ri-check-line text-sm" /> : <span className="text-xs font-medium">{idx + 1}</span>}
                            </div>
                            {idx < VISA_STAGES.filter((s) => s !== "Rejected").length - 1 && (
                              <div className={`w-0.5 flex-1 min-h-[24px] ${isDone ? "bg-primary-500" : "bg-background-200"}`} />
                            )}
                          </div>
                          <div className="pb-6">
                            <p className={`text-sm font-medium ${isCurrent ? "text-foreground-950" : isDone ? "text-foreground-700" : "text-foreground-400"}`}>
                              {stage}
                            </p>
                            <p className="text-xs text-foreground-400 mt-0.5">
                              {isDone ? "Completed" : isCurrent ? "In progress" : "Pending"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Documents & notes */}
                {(visa.documents?.length > 0 || visa.notes) && (
                  <div className="px-5 md:px-6 py-4 border-t border-background-200/50 bg-background-100/40">
                    {visa.documents?.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-foreground-500 uppercase tracking-wider mb-2">Documents</h4>
                        <div className="flex flex-wrap gap-2">
                          {visa.documents.map((doc) => (
                            <span key={doc} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-background-50 border border-background-200/70 rounded-md text-xs text-foreground-700">
                              <i className="ri-file-pdf-line text-foreground-400" />
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {visa.notes && (
                      <p className="text-sm text-foreground-600 italic">&ldquo;{visa.notes}&rdquo;</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}