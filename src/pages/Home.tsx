import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicNavbar from "../components/features/PublicNavbar";
import PublicFooter from "../components/features/PublicFooter";
import Reveal from "../components/features/Reveal";
import { durationInDays, durationKey, formatDurationTitle, normalizeUnit } from "../lib/duration";
import { supabase } from "../lib/supabase";
import travelVideo from "../assets/12443216_3840_2160_60fps-compressed.mp4";

interface FeaturedPackage {
  id: string;
  title: string;
  destination: string;
  price: number;
  duration_days: number;
  duration_unit: string | null;
  description: string;
  image_url: string;
  tags: string[];
  is_active: boolean;
}

const strategicObjectives = [
  {
    icon: "ri-calendar-check-line",
    title: "Automated Client Intake",
    description:
      "Over 80% of consultation bookings flow directly through our web calendar with auto-generated video meeting links. No phone tag, no back-and-forth emails — just instant, confirmed appointments.",
    stat: "80%+",
    statLabel: "Automated Bookings",
  },
  {
    icon: "ri-eye-line",
    title: "Real-Time Visa Transparency",
    description:
      "Clients track every stage of their visa application through a live visual dashboard. See document status, processing milestones, and estimated completion dates — cutting check-in calls by over 40%.",
    stat: "40%",
    statLabel: "Fewer Check-in Calls",
  },
  {
    icon: "ri-team-line",
    title: "Empowered Staff Operations",
    description:
      "Non-technical agency staff publish holiday packages, manage client files, and update application statuses through an intuitive admin dashboard. No coding required, no IT bottleneck.",
    stat: "100%",
    statLabel: "Staff Autonomy",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedObjective, setSelectedObjective] = useState<number | null>(null);
  const [featuredPackages, setFeaturedPackages] = useState<FeaturedPackage[]>([]);
  const [filterDestinations, setFilterDestinations] = useState<string[]>([]);
  const [filterDurations, setFilterDurations] = useState<{ value: number; unit: string }[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchFeatured() {
      const { data, error } = await supabase
        .from("travel_offers")
        .select("id,title,destination,price,duration_days,duration_unit,description,image_url,tags,is_active")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error && data && isMounted) {
        setFeaturedPackages(data as FeaturedPackage[]);
      }
    }

    fetchFeatured();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchFilters() {
      const { data, error } = await supabase
        .from("travel_offers")
        .select("destination,duration_days,duration_unit")
        .eq("is_active", true);

      if (!error && data && isMounted) {
        const rows = data as { destination: string; duration_days: number; duration_unit: string | null }[];
        setFilterDestinations(Array.from(new Set(rows.map((r) => r.destination))).sort());
        const byKey = new Map<string, { value: number; unit: string }>();
        for (const r of rows) {
          byKey.set(durationKey(r.duration_days, r.duration_unit), {
            value: r.duration_days,
            unit: normalizeUnit(r.duration_unit),
          });
        }
        setFilterDurations(
          Array.from(byKey.values()).sort(
            (a, b) => durationInDays(a.value, a.unit) - durationInDays(b.value, b.unit)
          )
        );
      }
    }

    fetchFilters();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = () => {
    const service = (document.getElementById("hero-filter-service") as HTMLSelectElement)?.value || "";
    const destination = (document.getElementById("hero-filter-destination") as HTMLSelectElement)?.value || "";
    const duration = (document.getElementById("hero-filter-duration") as HTMLSelectElement)?.value || "";
    const budget = (document.getElementById("hero-filter-budget") as HTMLSelectElement)?.value || "";
    
    const params = new URLSearchParams();
    if (service) params.set("service", service);
    if (destination) params.set("destination", destination);
    if (duration) params.set("duration", duration);
    if (budget) params.set("budget", budget);
    
    const qs = params.toString();
    navigate(`/packages${qs ? `?${qs}` : ""}`);
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PublicNavbar transparent />

      {/* Hero Section */}
      <section className="relative min-h-[680px] md:min-h-[780px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="https://readdy.ai/api/search-image?query=Stunning%20aerial%20view%20of%20a%20tropical%20archipelago%20with%20crystal%20clear%20turquoise%20lagoon%20water%20and%20white%20sand%20islands%20from%20above%2C%20scattered%20luxury%20boats%20sailing%20through%20the%20calm%20ocean%2C%20dramatic%20golden%20hour%20sky%20with%20warm%20orange%20and%20deep%20navy%20blue%20tones%20blending%20together%2C%20travel%20and%20adventure%20photography%20style%2C%20immersive%20and%20aspirational%20atmosphere%2C%20high-end%20editorial%20quality&width=1600&height=900&seq=hero-eduvic-v2-01&orientation=landscape"
            className="w-full h-full object-cover"
          >
            <source src={travelVideo} type="video/mp4" />
          </video>
          {/* Enhanced Overlay for higher visual match */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-brightness-95" />
        </div>

        <div className="relative z-15 text-left px-6 md:px-12 max-w-7xl mx-auto w-full pt-20 pb-12">

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-6 tracking-tight">
            Your Journey,
            <br />
            <span className="text-orange-500">Simplified</span>
          </h1>

          <p className="text-base md:text-lg text-white/90 max-w-2xl mb-10 leading-relaxed font-normal">
            From visa processing to curated holiday packages, we handle every detail. Book consultations instantly, track applications live, and let our experts guide you to unforgettable destinations.
          </p>

          {/* Hero Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-14">
            <Link
              to="/packages"
              className="px-8 py-3.5 bg-orange-500 text-white hover:bg-orange-600 rounded-lg font-semibold text-base transition-all shadow-lg shadow-orange-500/25 whitespace-nowrap"
            >
              Explore Packages
            </Link>
            <Link
              to="/booking"
              className="px-8 py-3.5 bg-slate-900/40 backdrop-blur-md text-white border border-white/25 rounded-lg hover:bg-slate-900/60 font-semibold text-base transition-all whitespace-nowrap"
            >
              Book Consultation
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6 w-full text-left border border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Looking For
                </label>
                <select
                  id="hero-filter-service"
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 text-slate-700 font-medium"
                >
                  <option value="">Service Type</option>
                  <option value="holiday">Holiday Package</option>
                  <option value="visa">Visa Processing</option>
                  <option value="consultation">Consultation</option>
                  <option value="group">Group Travel</option>
                  <option value="insurance">Travel Insurance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Location
                </label>
                <select
                  id="hero-filter-destination"
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 text-slate-700 font-medium"
                >
                  <option value="">Destination</option>
                  {filterDestinations.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Duration
                </label>
                <select
                  id="hero-filter-duration"
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 text-slate-700 font-medium"
                >
                  <option value="">Any duration</option>
                  {filterDurations.map((d) => (
                    <option
                      key={durationKey(d.value, d.unit)}
                      value={durationKey(d.value, d.unit)}
                    >
                      {formatDurationTitle(d.value, d.unit)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Your Budget
                </label>
                <select
                  id="hero-filter-budget"
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 text-slate-700 font-medium"
                >
                  <option value="">Max Price</option>
                  <option value="500000">Under ₦500K</option>
                  <option value="1000000">Under ₦1M</option>
                  <option value="2000000">Under ₦2M</option>
                  <option value="5000000">Under ₦5M</option>
                </select>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="w-full px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold text-sm transition-all whitespace-nowrap shadow-md shadow-orange-500/20"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-12 z-10 hidden md:block">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-orange-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Strategic Objectives */}
      <section className="py-14 md:py-20 px-4 md:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-12 md:mb-16">
            <p className="text-sm font-semibold text-orange-600 tracking-wide mb-2">Why Eduvic</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-3">Built for Speed &amp; Transparency</h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Three core pillars that define how we serve our clients and empower our team.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {strategicObjectives.map((obj, idx) => (
              <Reveal key={obj.title} delay={idx * 90} className="h-full">
              <div
                onClick={() => setSelectedObjective(selectedObjective === idx ? null : idx)}
                className={`group relative h-full bg-white border rounded-xl p-6 md:p-8 transition-all duration-300 cursor-pointer shadow-sm hover-lift hover:shadow-lg ${
                  selectedObjective === idx
                    ? "border-orange-500 ring-2 ring-orange-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="absolute top-4 right-4 md:top-6 md:right-6">
                  <div className="px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200">
                    <span className="text-lg md:text-xl font-bold text-orange-600">{obj.stat}</span>
                    <span className="text-xs text-orange-500 ml-1">{obj.statLabel}</span>
                  </div>
                </div>
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-slate-100 flex items-center justify-center mb-5 group-hover:bg-slate-200 transition-colors">
                  <i className={`${obj.icon} text-slate-700 text-xl md:text-2xl`} />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 pr-20">{obj.title}</h3>
                <p className={`text-sm text-slate-600 leading-relaxed transition-all duration-300 ${selectedObjective === idx ? "" : "line-clamp-3"}`}>
                  {obj.description}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <span>{selectedObjective === idx ? "Show less" : "Read more"}</span>
                  <i className={`${selectedObjective === idx ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-sm transition-transform`} />
                </div>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-14 md:py-20 px-4 md:px-6 bg-slate-100/70">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-10 md:mb-14">
            <p className="text-sm font-semibold text-orange-600 tracking-wide mb-2">Curated Experiences</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Featured Travel Packages</h2>
            <p className="text-base text-slate-600 mt-3 max-w-2xl mx-auto">
              Handpicked destinations with seamless visa support and full itinerary planning.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPackages.map((pkg, idx) => (
              <Reveal key={pkg.id} delay={idx * 90} className="h-full">
              <Link
                to={`/packages/${pkg.id}`}
                className="group flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all duration-300 hover-lift"
              >
                <div className="relative h-56 overflow-hidden">
                  <img src={pkg.image_url} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                    {(pkg.tags || []).slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-slate-900/70 backdrop-blur-sm text-white text-xs font-medium rounded-full">{tag}</span>
                    ))}
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-900/70 backdrop-blur-sm text-white text-sm font-semibold rounded-lg">{formatDurationTitle(pkg.duration_days, pkg.duration_unit)}</div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                    <i className="ri-map-pin-line text-orange-500" />
                    {pkg.destination}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">{pkg.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{pkg.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-slate-900">{formatPrice(pkg.price)}</span>
                      <span className="text-xs text-slate-400 ml-1">per person</span>
                    </div>
                    <span className="px-4 py-2 bg-orange-500 text-white rounded-lg group-hover:bg-orange-600 text-sm font-medium transition-colors whitespace-nowrap shadow-sm">View Details</span>
                  </div>
                </div>
              </Link>
              </Reveal>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/packages" className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 bg-white rounded-lg hover:bg-slate-50 font-semibold text-sm transition-colors whitespace-nowrap shadow-sm">
              View All Packages <i className="ri-arrow-right-line" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 md:py-20 px-4 md:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-10 md:mb-14">
            <p className="text-sm font-semibold text-orange-600 tracking-wide mb-2">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">How It Works</h2>
            <p className="text-base text-slate-600 mt-3 max-w-2xl mx-auto">Four easy steps from your first consultation to boarding the plane.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "ri-calendar-check-line", step: "01", title: "Book Consultation", desc: "Schedule a free video consultation with our travel experts — an auto-generated meeting link lands in your inbox instantly." },
              { icon: "ri-suitcase-line", step: "02", title: "Choose Your Package", desc: "Browse curated travel packages or get a custom itinerary tailored to your preferences and budget." },
              { icon: "ri-passport-line", step: "03", title: "Visa Processing", desc: "We handle all documentation and submission. You track every stage live on your personal dashboard." },
              { icon: "ri-plane-line", step: "04", title: "Travel With Confidence", desc: "Receive your approved visa and all travel documents. Your adventure begins — stress-free." },
            ].map((item, idx) => (
              <Reveal key={item.step} delay={idx * 80} className="h-full">
              <div className="relative h-full bg-white border border-slate-200 rounded-xl p-6 text-center group hover:border-orange-300 hover:shadow-lg transition-all duration-300 shadow-sm hover-lift">
                <div className="w-14 h-14 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-100 transition-colors">
                  <i className={`${item.icon} text-2xl`} />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step {item.step}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 px-4 md:px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=Modern%20minimalist%20airport%20departure%20lounge%20with%20floor%20to%20ceiling%20windows%20showing%20a%20dramatic%20sunset%20sky%20with%20orange%20and%20deep%20navy%20blue%20tones%2C%20comfortable%20leather%20seating%2C%20soft%20ambient%20lighting%2C%20clean%20elegant%20interior%20design%2C%20luxury%20travel%20atmosphere%2C%20editorial%20photography%20style%2C%20warm%20and%20inviting%20mood%2C%20high-end%20commercial%20interior&width=1600&height=600&seq=cta-eduvic-v2-01&orientation=landscape"
            alt="Travel experience"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-slate-950/80" />
        </div>
        <Reveal className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-base md:text-lg text-white/80 mb-8 leading-relaxed">
            Book a free consultation today. Our travel experts will help you plan the perfect trip — from visa to takeoff, we handle it all.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/booking" className="px-8 py-3.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 hover:-translate-y-0.5 font-semibold text-base transition-all duration-200 whitespace-nowrap shadow-lg shadow-orange-500/20">Book Consultation</Link>
            <Link to="/packages" className="px-8 py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-lg hover:bg-white/20 font-semibold text-base transition-all whitespace-nowrap">Browse Packages</Link>
          </div>
        </Reveal>
      </section>

      {/* Stats */}
      <section className="py-14 md:py-20 px-4 md:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: "2,400+", label: "Visas Processed", icon: "ri-passport-line" },
              { value: "98%", label: "Approval Rate", icon: "ri-shield-check-line" },
              { value: "150+", label: "Destinations", icon: "ri-earth-line" },
              { value: "4.9/5", label: "Client Rating", icon: "ri-star-line" },
            ].map((stat, idx) => (
              <Reveal key={stat.label} delay={idx * 80} className="h-full">
              <div className="text-center h-full p-6 bg-white border border-slate-200 rounded-xl hover:border-orange-300 transition-all duration-300 shadow-sm hover-lift hover:shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
                  <i className={`${stat.icon} text-xl`} />
                </div>
                <p className="text-3xl md:text-4xl font-serif font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}