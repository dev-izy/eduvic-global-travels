import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicNavbar from "../../components/features/PublicNavbar";
import PublicFooter from "../../components/features/PublicFooter";
import Reveal from "../../components/features/Reveal";
import { supabase } from "../../lib/supabase";
import {
  durationInDays,
  durationKey,
  formatDurationTitle,
  normalizeUnit,
} from "../../lib/duration";

interface PackageRow {
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

export default function Packages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(searchParams.get("destination"));
  const [selectedDuration, setSelectedDuration] = useState<string | null>(searchParams.get("duration"));
  const [selectedBudget, setSelectedBudget] = useState<string | null>(searchParams.get("budget"));
  const [selectedService, setSelectedService] = useState<string | null>(searchParams.get("service"));
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "duration-asc" | "duration-desc">("price-asc");

  useEffect(() => {
    supabase
      .from("travel_offers")
      .select("id,title,destination,price,duration_days,duration_unit,description,image_url,tags,is_active")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setPackages(data as PackageRow[]);
        }
        setLoading(false);
      });
  }, []);

  const allTags = useMemo(
    () => Array.from(new Set(packages.flatMap((p) => p.tags || []))).sort(),
    [packages]
  );

  const destinations = useMemo(
    () => Array.from(new Set(packages.map((p) => p.destination))).sort(),
    [packages]
  );

  const durations = useMemo(() => {
    // One option per value + unit pair, ordered by real length so a 7-day
    // trip sorts before a 6-month programme.
    const seen = new Map<string, { value: number; unit: string }>();
    for (const p of packages) {
      seen.set(durationKey(p.duration_days, p.duration_unit), {
        value: p.duration_days,
        unit: normalizeUnit(p.duration_unit),
      });
    }
    return Array.from(seen.values()).sort(
      (a, b) => durationInDays(a.value, a.unit) - durationInDays(b.value, b.unit)
    );
  }, [packages]);

  const filtered = useMemo(() => {
    let result = [...packages];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.destination.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (selectedTag) {
      result = result.filter((p) => (p.tags || []).includes(selectedTag));
    }

    if (selectedDestination) {
      result = result.filter((p) => p.destination === selectedDestination);
    }

    if (selectedDuration) {
      result = result.filter(
        (p) => durationKey(p.duration_days, p.duration_unit) === selectedDuration
      );
    }

    if (selectedBudget) {
      const budgetVal = Number(selectedBudget);
      result = result.filter((p) => p.price <= budgetVal);
    }

    if (selectedService) {
      const svc = selectedService.toLowerCase();
      result = result.filter((p) =>
        (p.tags || []).some((tag) => tag.toLowerCase().includes(svc)) ||
        p.title.toLowerCase().includes(svc) ||
        p.description.toLowerCase().includes(svc)
      );
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "duration-asc":
        result.sort(
          (a, b) =>
            durationInDays(a.duration_days, a.duration_unit) -
            durationInDays(b.duration_days, b.duration_unit)
        );
        break;
      case "duration-desc":
        result.sort(
          (a, b) =>
            durationInDays(b.duration_days, b.duration_unit) -
            durationInDays(a.duration_days, a.duration_unit)
        );
        break;
    }

    return result;
  }, [packages, search, selectedTag, selectedDestination, selectedDuration, selectedBudget, selectedService, sortBy]);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const clearFilters = () => {
    setSearch("");
    setSelectedTag(null);
    setSelectedDestination(null);
    setSelectedDuration(null);
    setSelectedBudget(null);
    setSelectedService(null);
    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-xl skeleton" />
            ))}
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 page-enter">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-20 md:pb-28 px-4 md:px-6 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://readdy.ai/api/search-image?query=A%20stunning%20collage%20of%20world%20famous%20landmarks%20including%20Eiffel%20Tower%2C%20Taj%20Mahal%2C%20Dubai%20skyline%2C%20Santorini%20blue%20domes%2C%20and%20African%20safari%20landscape%2C%20artistic%20travel%20photography%20montage%20style%2C%20warm%20golden%20hour%20lighting%2C%20deep%20navy%20blue%20and%20orange%20accent%20tones%2C%20inspiring%20wanderlust%20atmosphere%2C%20luxury%20travel%20aesthetic&width=1600&height=800&seq=packages-hero-eduvic&orientation=landscape"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center animate-fade-up">
          <p className="text-xs font-bold text-orange-500 tracking-wide mb-3">Curated Journeys</p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 tracking-tight">
            Travel Packages
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Handpicked destinations across five continents. Each package includes flights, accommodation, guided tours, and full itinerary planning — all backed by our visa processing expertise.
          </p>
        </div>
      </section>

      {/* Card-Style Filter Bar */}
      <section className="px-4 md:px-6 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 md:p-6 animate-fade-up">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 items-end">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Looking For
                </label>
                <select
                  value={selectedService || ""}
                  onChange={(e) => setSelectedService(e.target.value || null)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 text-slate-700"
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
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Location
                </label>
                <select
                  value={selectedDestination || ""}
                  onChange={(e) => setSelectedDestination(e.target.value || null)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 text-slate-700"
                >
                  <option value="">All Destinations</option>
                  {destinations.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Duration
                </label>
                <select
                  value={selectedDuration || ""}
                  onChange={(e) => setSelectedDuration(e.target.value || null)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 text-slate-700"
                >
                  <option value="">Any Duration</option>
                  {durations.map((d) => (
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
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Your Budget
                </label>
                <select
                  value={selectedBudget || ""}
                  onChange={(e) => setSelectedBudget(e.target.value || null)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 text-slate-700"
                >
                  <option value="">Any Budget</option>
                  <option value="500000">Under ₦500K</option>
                  <option value="1000000">Under ₦1M</option>
                  <option value="2000000">Under ₦2M</option>
                  <option value="5000000">Under ₦5M</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 text-slate-700"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="duration-asc">Duration: Shortest</option>
                  <option value="duration-desc">Duration: Longest</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-3 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap"
                  title="Clear all filters"
                >
                  <i className="ri-refresh-line mr-1" />
                  Reset
                </button>
                <Link
                  to="/booking"
                  className="flex-1 px-3 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-semibold text-center transition-colors shadow-md shadow-orange-500/20 whitespace-nowrap"
                >
                  Book Now
                </Link>
              </div>
            </div>

            {/* Tag filters */}
            <div className="flex items-center gap-2 flex-wrap mt-5 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium mr-1">Tags:</span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${!selectedTag ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${selectedTag === tag ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <i className="ri-search-line text-2xl text-slate-400" />
              </div>
              <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">No Packages Found</h3>
              <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-5 py-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-6">
                Showing <strong className="text-slate-900">{filtered.length}</strong> package{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((pkg, idx) => (
                  <Reveal key={pkg.id} delay={Math.min(idx * 70, 350)} className="h-full">
                  <Link
                    to={`/packages/${pkg.id}`}
                    className="group h-full bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-lg hover-lift flex flex-col"
                  >
                    <div className="relative h-56 overflow-hidden bg-slate-900">
                      <img src={pkg.image_url} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        {(pkg.tags || []).slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2.5 py-1 bg-slate-950/70 backdrop-blur-md text-white text-[11px] font-medium rounded-full">{tag}</span>
                        ))}
                      </div>
                      <div className="absolute bottom-3 right-3 px-3 py-1 bg-slate-950/70 backdrop-blur-md text-white text-xs font-semibold rounded-lg">{formatDurationTitle(pkg.duration_days, pkg.duration_unit)}</div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 mb-2">
                          <i className="ri-map-pin-line text-orange-500" />
                          {pkg.destination}
                        </div>
                        <h3 className="text-xl font-serif font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">{pkg.title}</h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-6">{pkg.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                        <div>
                          <span className="text-xl font-bold text-slate-900">{formatPrice(pkg.price)}</span>
                          <span className="text-xs text-slate-400 ml-1">/ person</span>
                        </div>
                        <span className="px-4 py-2 bg-blue-600 text-white rounded-lg group-hover:bg-blue-700 text-xs font-semibold transition-colors whitespace-nowrap">View Details</span>
                      </div>
                    </div>
                  </Link>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}