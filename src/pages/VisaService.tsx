import { useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/features/PublicNavbar";
import PublicFooter from "../components/features/PublicFooter";

const visaStages = [
  {
    icon: "ri-file-list-3-line",
    title: "Document Collection",
    desc: "We review your travel purpose and compile the complete document checklist required by the destination embassy.",
  },
  {
    icon: "ri-file-search-line",
    title: "Document Verification",
    desc: "Every document is audited for accuracy and completeness. We catch errors before the embassy does — reducing rejection risk.",
  },
  {
    icon: "ri-send-plane-line",
    title: "Embassy Submission",
    desc: "Your application package is submitted to the embassy with all supporting documents, fees, and biometrics arranged.",
  },
  {
    icon: "ri-time-line",
    title: "Processing & Tracking",
    desc: "Track your application in real-time through your personal dashboard. See exactly which stage you are at, 24/7.",
  },
  {
    icon: "ri-passport-line",
    title: "Passport Collection",
    desc: "Once approved, we collect your passport with the visa stamp and notify you immediately for pickup or courier delivery.",
  },
  {
    icon: "ri-plane-line",
    title: "Travel Ready",
    desc: "Visa in hand, travel documents complete — you are ready to board. We remain available for any last-minute support.",
  },
];

const countries = [
  {
    name: "United Kingdom",
    flag: "🇬🇧",
    types: ["Tourist", "Business", "Student", "Family Visit"],
    processingTime: "15-20 working days",
    startingPrice: "₦180,000",
  },
  {
    name: "United States",
    flag: "🇺🇸",
    types: ["Tourist (B1/B2)", "Business", "Student (F1)", "Transit"],
    processingTime: "5-10 working days after interview",
    startingPrice: "₦250,000",
  },
  {
    name: "Canada",
    flag: "🇨🇦",
    types: ["Tourist", "Business", "Student", "Family Sponsorship"],
    processingTime: "20-30 working days",
    startingPrice: "₦200,000",
  },
  {
    name: "Schengen Area",
    flag: "🇪🇺",
    types: ["Tourist (Schengen)", "Business", "Student", "Medical"],
    processingTime: "15-20 working days",
    startingPrice: "₦150,000",
  },
  {
    name: "United Arab Emirates",
    flag: "🇦🇪",
    types: ["Tourist", "Business", "Transit", "Family Visit"],
    processingTime: "5-7 working days",
    startingPrice: "₦120,000",
  },
  {
    name: "South Africa",
    flag: "🇿🇦",
    types: ["Tourist", "Business", "Student", "Medical"],
    processingTime: "10-15 working days",
    startingPrice: "₦100,000",
  },
  {
    name: "China",
    flag: "🇨🇳",
    types: ["Tourist (L)", "Business (M)", "Student (X1/X2)", "Work (Z)"],
    processingTime: "7-10 working days",
    startingPrice: "₦130,000",
  },
  {
    name: "Australia",
    flag: "🇦🇺",
    types: ["Tourist", "Business", "Student", "Family Visit"],
    processingTime: "20-30 working days",
    startingPrice: "₦220,000",
  },
];

export default function VisaServices() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans page-enter">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 px-4 md:px-6 bg-[#090D16] overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=Close%20up%20macro%20photography%20of%20a%20Nigerian%20international%20passport%20with%20multiple%20colorful%20visa%20stamps%20from%20different%20countries%2C%20shallow%20depth%20of%20field%2C%20elegant%20composition%20on%20a%20dark%20navy%20blue%20desk%20surface%2C%20warm%20accent%20lighting%20from%20the%20side%2C%20premium%20travel%20document%20aesthetic%2C%20sophisticated%20and%20aspirational%20mood&width=1600&height=800&seq=visa-hero-eduvic&orientation=landscape"
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#090D16]/60 via-[#090D16]/80 to-[#090D16]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-xs md:text-sm font-semibold text-orange-500 uppercase tracking-widest mb-3">
            Visa Services
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 tracking-tight leading-tight">
            Visa Processing &amp; Tracking
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Complete visa application management with live stage tracking. Know exactly where your application stands — anytime, anywhere. We have processed over 2,400 visas with a 98% approval rate.
          </p>
        </div>
      </section>

      {/* The Process */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-xs md:text-sm font-semibold text-orange-600 uppercase tracking-widest mb-2">
              Our Process
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
              How We Process Your Visa
            </h2>
            <p className="text-base text-slate-600 mt-3 max-w-2xl mx-auto">
              Six transparent stages from document collection to travel-ready. You see every update in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visaStages.map((stage, idx) => (
              <div
                key={stage.title}
                className="relative bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-orange-200 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <i className={`${stage.icon} text-lg`} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{stage.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Tracker Highlight */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-slate-50 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs md:text-sm font-semibold text-orange-600 uppercase tracking-widest mb-2">
                Key Differentiator
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-5 leading-tight">
                Live Visa Tracker — See Every Stage in Real Time
              </h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-6">
                Most agencies leave you in the dark — waiting, wondering, calling. At Eduvic, every client gets a personal dashboard with a visual stage tracker. See which documents have been submitted, which stage your application is in, and when to expect the next update. No guesswork, no anxiety.
              </p>

              <div className="space-y-3.5">
                {[
                  "Real-time stage updates — no need to call and ask",
                  "Document upload vault for secure file sharing",
                  "Automated SMS & email notifications on status changes",
                  "Estimated completion date for each stage",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <i className="ri-check-line text-xs font-bold" />
                    </div>
                    <span className="text-sm text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-orange-500/20 whitespace-nowrap"
              >
                Start Your Visa Application
                <i className="ri-arrow-right-line" />
              </Link>
            </div>

            {/* Tracker Card */}
            <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-medium">Sample Tracker</p>
                  <p className="text-base font-bold text-slate-900">UK Tourist Visa — John Doe</p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full whitespace-nowrap">
                  In Progress
                </span>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Document Collection", status: "completed", date: "Jul 10" },
                  { label: "Document Verification", status: "completed", date: "Jul 14" },
                  { label: "Embassy Submission", status: "active", date: "Jul 20" },
                  { label: "Processing & Tracking", status: "pending", date: "ETA Jul 30" },
                  { label: "Passport Collection", status: "pending", date: "TBD" },
                  { label: "Travel Ready", status: "pending", date: "TBD" },
                ].map((step) => (
                  <div key={step.label} className="flex items-center gap-4">
                    <div
                      className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                        step.status === "completed"
                          ? "bg-emerald-500"
                          : step.status === "active"
                            ? "bg-orange-500 ring-4 ring-orange-100 animate-pulse"
                            : "bg-slate-200"
                      }`}
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span
                        className={`text-sm ${
                          step.status === "pending" ? "text-slate-400" : "text-slate-800 font-semibold"
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{step.date}</span>
                    </div>
                    {step.status === "completed" && (
                      <i className="ri-checkbox-circle-fill text-emerald-500 text-base" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-xs md:text-sm font-semibold text-orange-600 uppercase tracking-widest mb-2">
              Destinations
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
              Countries We Process Visas For
            </h2>
            <p className="text-base text-slate-600 mt-3 max-w-2xl mx-auto">
              Click any country to see available visa types, processing times, and starting prices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {countries.map((c) => (
              <div
                key={c.name}
                onClick={() => setSelectedCountry(selectedCountry === c.name ? null : c.name)}
                className={`bg-white border rounded-xl p-5 cursor-pointer transition-all duration-300 ${
                  selectedCountry === c.name
                    ? "border-orange-500 ring-2 ring-orange-500/10 shadow-md"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{c.flag}</span>
                  <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
                </div>

                <div className="space-y-2 text-sm border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Processing</span>
                    <span className="text-slate-800 font-medium text-xs">{c.processingTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Starting at</span>
                    <span className="text-orange-600 font-bold">{c.startingPrice}</span>
                  </div>
                </div>

                {selectedCountry === c.name && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                      Visa Types
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.types.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-[#090D16]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Ready to Apply for Your Visa?
          </h2>
          <p className="text-base text-slate-300 mb-8 leading-relaxed">
            Book a free consultation and let our visa specialists guide you through the entire process — from document checklist to passport collection.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-base transition-all whitespace-nowrap shadow-lg shadow-orange-500/20"
            >
              Start Application
            </Link>
            <Link
              to="/services"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-lg font-semibold text-base transition-all whitespace-nowrap backdrop-blur-sm"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}