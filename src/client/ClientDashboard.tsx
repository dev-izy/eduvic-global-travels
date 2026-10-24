import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

interface VisaRow {
  id: string;
  country: string;
  visa_type: string;
  current_stage: string;
  updated_at: string;
}

interface AppointmentRow {
  id: string;
  scheduled_time: string;
  status: string;
  agent_name: string;
}

interface EnquiryRow {
  id: string;
  subject: string;
  status: string;
  created_at: string;
}

interface OpportunityRow {
  id: string;
  stage: string;
}

function getProgress(stage: string) {
  const idx = VISA_STAGES.indexOf(stage);
  if (idx === -1) return 0;
  if (stage === "Rejected") return 100;
  return Math.round(((idx + 1) / VISA_STAGES.length) * 100);
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visas, setVisas] = useState<VisaRow[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityRow[]>([]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [visaRes, apptRes, enqRes, oppRes] = await Promise.all([
        supabase.from("visa_applications").select("id,country,visa_type,current_stage,updated_at").eq("client_id", user.id).order("updated_at", { ascending: false }),
        supabase.from("appointments").select("id,scheduled_time,status,agent_name").eq("client_id", user.id).order("scheduled_time", { ascending: true }),
        supabase.from("enquiries").select("id,subject,status,created_at").eq("client_id", user.id).order("created_at", { ascending: false }),
        supabase.from("opportunities").select("id,stage").eq("client_id", user.id),
      ]);

      if (visaRes.error) throw visaRes.error;
      if (apptRes.error) throw apptRes.error;
      if (enqRes.error) throw enqRes.error;
      if (oppRes.error) throw oppRes.error;

      setVisas((visaRes.data || []) as VisaRow[]);
      setAppointments((apptRes.data || []) as AppointmentRow[]);
      setEnquiries((enqRes.data || []) as EnquiryRow[]);
      setOpportunities((oppRes.data || []) as OpportunityRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const activeVisas = visas.filter((v) => v.current_stage !== "Approved" && v.current_stage !== "Rejected").length;
  const upcomingAppts = appointments.filter((a) => a.status === "CONFIRMED" || a.status === "PENDING").length;
  const openEnquiries = enquiries.filter((e) => e.status !== "Resolved").length;
  const openOpps = opportunities.filter((o) => !["Won", "Lost"].includes(o.stage)).length;

  const nextAppointment = appointments.find((a) => a.status === "CONFIRMED" || a.status === "PENDING");

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
          <p className="text-sm text-foreground-500 mt-3">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-foreground-500 mt-1">Here's the latest on your travel plans.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: "ri-passport-line", label: "Active Applications", value: activeVisas.toString(), color: "bg-primary-100 text-primary-600" },
          { icon: "ri-calendar-check-line", label: "Upcoming Meetings", value: upcomingAppts.toString(), color: "bg-accent-100 text-accent-600" },
          { icon: "ri-question-answer-line", label: "Open Enquiries", value: openEnquiries.toString(), color: "bg-secondary-100 text-secondary-700" },
          { icon: "ri-compass-3-line", label: "Open Opportunities", value: openOpps.toString(), color: "bg-primary-100 text-primary-600" },
        ].map((s) => (
          <div key={s.label} className="bg-background-50 border border-background-200/70 rounded-lg p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground-500 font-medium">{s.label}</p>
                <p className="text-2xl md:text-3xl font-heading font-bold text-foreground-950 mt-1">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <i className={`${s.icon} text-lg`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background-50 border border-background-200/70 rounded-lg">
            <div className="px-5 py-4 border-b border-background-200/70 flex items-center justify-between">
              <h2 className="text-base font-heading font-semibold text-foreground-950">My Applications</h2>
              <Link to="/dashboard/applications" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All
              </Link>
            </div>
            {visas.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-background-100 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-passport-line text-foreground-400 text-xl" />
                </div>
                <p className="text-sm text-foreground-500">No applications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-background-200/50">
                {visas.slice(0, 4).map((visa) => (
                  <div key={visa.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-foreground-900">{visa.visa_type}</p>
                        <p className="text-xs text-foreground-500">{visa.country}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        visa.current_stage === "Approved"
                          ? "bg-primary-100 text-primary-700"
                          : visa.current_stage === "Rejected"
                          ? "bg-red-50 text-red-600"
                          : "bg-accent-100 text-accent-700"
                      }`}>
                        {visa.current_stage}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-background-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${getProgress(visa.current_stage)}%` }} />
                      </div>
                      <span className="text-xs text-foreground-400 whitespace-nowrap">{getProgress(visa.current_stage)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Next appointment */}
          <div className="bg-background-50 border border-background-200/70 rounded-lg">
            <div className="px-5 py-4 border-b border-background-200/70">
              <h2 className="text-base font-heading font-semibold text-foreground-950">Next Appointment</h2>
            </div>
            {nextAppointment ? (
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-lg bg-accent-100 text-accent-600 flex items-center justify-center">
                    <i className="ri-calendar-check-line text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground-900">{formatTime(nextAppointment.scheduled_time)}</p>
                    <p className="text-xs text-foreground-500">with {nextAppointment.agent_name}</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-700">
                  {nextAppointment.status}
                </span>
              </div>
            ) : (
              <div className="px-5 py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-background-100 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-calendar-line text-foreground-400 text-xl" />
                </div>
                <p className="text-sm text-foreground-500">No upcoming appointments</p>
              </div>
            )}
          </div>

          {/* Recent enquiries */}
          <div className="bg-background-50 border border-background-200/70 rounded-lg">
            <div className="px-5 py-4 border-b border-background-200/70 flex items-center justify-between">
              <h2 className="text-base font-heading font-semibold text-foreground-950">Recent Enquiries</h2>
              <Link to="/dashboard/enquiries" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All
              </Link>
            </div>
            {enquiries.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-background-100 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-question-answer-line text-foreground-400 text-xl" />
                </div>
                <p className="text-sm text-foreground-500">No enquiries yet</p>
              </div>
            ) : (
              <div className="divide-y divide-background-200/50">
                {enquiries.slice(0, 3).map((enq) => (
                  <div key={enq.id} className="px-5 py-3.5">
                    <p className="text-sm font-medium text-foreground-900 line-clamp-1">{enq.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        enq.status === "Resolved" ? "bg-primary-100 text-primary-700" : "bg-accent-100 text-accent-700"
                      }`}>
                        {enq.status}
                      </span>
                      <span className="text-xs text-foreground-400">{formatDate(enq.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}