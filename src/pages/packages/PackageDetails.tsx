import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PublicNavbar from "../../components/features/PublicNavbar";
import PublicFooter from "../../components/features/PublicFooter";
import { supabase } from "../../lib/supabase";
import { formatDurationTitle } from "../../lib/duration";

interface PackageRow {
  id: string;
  title: string;
  destination: string;
  price: number;
  duration_days: number;
  duration_unit: string | null;
  description: string;
  inclusions: string[];
  image_url: string;
  tags: string[];
}

export default function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const [pkg, setPkg] = useState<PackageRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Invalid package ID.");
      setLoading(false);
      return;
    }

    supabase
      .from("travel_offers")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data, error: supaError }) => {
        if (supaError) {
          setError(supaError.message);
        } else if (!data) {
          setError("Package not found.");
        } else {
          setPkg(data as PackageRow);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-50">
        <PublicNavbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
            <p className="text-sm text-foreground-500 mt-3">Loading package...</p>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-background-50">
        <PublicNavbar />
        <div className="pt-28 md:pt-36 pb-20 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-background-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-2xl text-foreground-400" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground-950 mb-2">Package Not Found</h1>
          <p className="text-sm text-foreground-500 mb-6">{error || "This package may have been removed or is no longer available."}</p>
          <Link to="/packages" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-background-50 rounded-lg hover:bg-primary-600 font-semibold text-sm transition-colors whitespace-nowrap">
            <i className="ri-arrow-left-line" /> Back to Packages
          </Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-background-50">
      <PublicNavbar />

      {/* Hero Image */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img src={pkg.image_url} alt={pkg.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/70 via-primary-950/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <Link to="/packages" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-3 transition-colors">
              <i className="ri-arrow-left-line" /> Back to Packages
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white">{pkg.title}</h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 md:py-14 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-background-100 rounded-lg">
                  <i className="ri-map-pin-line text-accent-500" />
                  <span className="text-sm font-medium text-foreground-700">{pkg.destination}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-background-100 rounded-lg">
                  <i className="ri-calendar-line text-accent-500" />
                  <span className="text-sm font-medium text-foreground-700">{formatDurationTitle(pkg.duration_days, pkg.duration_unit)}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-accent-100 rounded-lg">
                  <i className="ri-price-tag-3-line text-accent-600" />
                  <span className="text-sm font-bold text-accent-700">{formatPrice(pkg.price)} per person</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(pkg.tags || []).map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">{tag}</span>
                ))}
              </div>

              <div>
                <h2 className="text-xl font-heading font-semibold text-foreground-950 mb-3">About This Package</h2>
                <p className="text-sm text-foreground-500 leading-relaxed">{pkg.description}</p>
              </div>

              {/* Inclusions */}
              <div>
                <h2 className="text-xl font-heading font-semibold text-foreground-950 mb-4">What's Included</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(pkg.inclusions || []).length > 0
                    ? (pkg.inclusions || []).map((item) => (
                        <div key={item} className="flex items-center gap-2.5 text-sm text-foreground-600">
                          <i className="ri-checkbox-circle-fill text-accent-500" />
                          <span>{item}</span>
                        </div>
                      ))
                    : [
                        "Round-trip flight tickets",
                        "Hotel accommodation (4-star minimum)",
                        "Daily breakfast",
                        "Airport transfers",
                        "Guided tours & excursions",
                        "Travel insurance",
                        "Visa processing assistance",
                        "24/7 local support",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2.5 text-sm text-foreground-600">
                          <i className="ri-checkbox-circle-fill text-accent-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-background-50 border border-background-200/70 rounded-lg p-6">
                  <div className="mb-4">
                    <p className="text-xs text-foreground-400 uppercase tracking-wider mb-1">Price per person</p>
                    <p className="text-3xl font-heading font-bold text-foreground-950">{formatPrice(pkg.price)}</p>
                  </div>
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground-500">Duration</span>
                      <span className="font-medium text-foreground-700">{formatDurationTitle(pkg.duration_days, pkg.duration_unit)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground-500">Destination</span>
                      <span className="font-medium text-foreground-700">{pkg.destination}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground-500">Visa Support</span>
                      <span className="font-medium text-accent-600">Included</span>
                    </div>
                  </div>
                  <Link to={`/booking?package=${pkg.id}`} className="block w-full text-center px-6 py-3 bg-accent-500 text-background-50 rounded-lg hover:bg-accent-600 font-semibold text-sm transition-all whitespace-nowrap mb-3">Book This Package</Link>
                  <Link to="/contact" className="block w-full text-center px-6 py-3 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 font-semibold text-sm transition-all whitespace-nowrap">Ask a Question</Link>
                </div>
                <div className="bg-primary-50 border border-primary-100 rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                      <i className="ri-customer-service-line text-lg" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground-950">Need Help?</p>
                      <p className="text-xs text-foreground-500">Our travel experts are here</p>
                    </div>
                  </div>
                  <p className="text-xs text-foreground-500 mb-3">
                    Call us at <strong className="text-foreground-700">+234 801 234 5678</strong> or book a free consultation.
                  </p>
                  <Link to="/booking" className="block w-full text-center px-4 py-2 bg-primary-500 text-background-50 rounded-lg hover:bg-primary-600 text-xs font-semibold transition-colors whitespace-nowrap">Book Free Consultation</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}