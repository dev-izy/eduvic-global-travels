import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
interface OpportunityRow {
  id: string;
  title: string;
  destination: string;
  stage: string;
  value: number;
  notes: string;
  updated_at: string;
}

const stageColor: Record<string, string> = {
  "New Lead": "bg-background-100 text-foreground-600",
  Contacted: "bg-secondary-100 text-secondary-700",
  Qualified: "bg-accent-100 text-accent-700",
  Proposal: "bg-primary-100 text-primary-700",
  Won: "bg-primary-500 text-background-50",
  Lost: "bg-background-200 text-foreground-500",
};

function formatCurrency(value: number) {
  return `₦${value.toLocaleString()}`;
}

export default function ClientOpportunities() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<OpportunityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: supaError } = await supabase
        .from("opportunities")
        .select("*")
        .eq("client_id", user.id)
        .order("updated_at", { ascending: false });

      if (supaError) throw supaError;
      setOpportunities((data || []) as OpportunityRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load opportunities");
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
          <p className="text-sm text-foreground-500 mt-3">Loading opportunities...</p>
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
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">Opportunities</h1>
        <p className="text-sm text-foreground-500 mt-1">Travel packages and plans we're working on for you.</p>
      </div>

      {opportunities.length === 0 ? (
        <div className="px-4 py-16 text-center bg-background-50 border border-background-200/70 rounded-lg">
          <div className="w-16 h-16 rounded-2xl bg-background-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-compass-3-line text-foreground-400 text-3xl" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-foreground-950 mb-1">No opportunities yet</h3>
          <p className="text-sm text-foreground-500">Reach out to our team and we'll help you explore travel options.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {opportunities.map((opp) => (
            <div key={opp.id} className="bg-background-50 border border-background-200/70 rounded-lg p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-lg bg-accent-100 text-accent-600 flex items-center justify-center">
                  <i className="ri-suitcase-line text-xl" />
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColor[opp.stage] || "bg-background-100 text-foreground-600"}`}>
                  {opp.stage}
                </span>
              </div>
              <h3 className="text-base font-heading font-semibold text-foreground-950">{opp.title}</h3>
              <p className="text-sm text-foreground-500 mt-1 flex items-center gap-1.5">
                <i className="ri-map-pin-line" />
                {opp.destination}
              </p>
              {opp.notes && <p className="text-sm text-foreground-600 mt-2 line-clamp-2">{opp.notes}</p>}
              <div className="mt-4 pt-4 border-t border-background-200/50 flex items-center justify-between">
                <span className="text-lg font-bold text-foreground-950">{formatCurrency(Number(opp.value))}</span>
                <span className="text-xs text-foreground-400">
                  Updated {new Date(opp.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}