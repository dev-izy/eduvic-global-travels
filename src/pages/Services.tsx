import { Link } from "react-router-dom";
import PublicNavbar from "../components/features/PublicNavbar";
import PublicFooter from "../components/features/PublicFooter";

const services = [
  {
    icon: "ri-passport-line",
    title: "Visa Processing & Tracking",
    subtitle: "Live Transparency Dashboard",
    description:
      "Full-service visa application processing with real-time stage tracking. Submit your documents, then watch every milestone update live on your personal dashboard. We handle embassy liaison, document verification, interview preparation, and biometrics scheduling — cutting your check-in calls by over 40%.",
    features: [
      "Real-time stage tracking dashboard",
      "Document verification & embassy liaison",
      "Interview preparation & biometrics scheduling",
      "SMS & email notifications on status changes",
    ],
    link: "/visa-services",
    linkLabel: "Learn About Visa Services",
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    icon: "ri-suitcase-line",
    title: "Curated Holiday Packages",
    subtitle: "150+ Destinations Worldwide",
    description:
      "Browse our handpicked travel packages across Africa, Europe, Asia, the Americas, and the Middle East. Each package includes flights, accommodation, guided tours, and full itinerary planning. Our team personally vets every hotel, tour operator, and experience before listing.",
    features: [
      "Pre-vetted hotels & tour operators",
      "Full itinerary with day-by-day planning",
      "Group & solo travel options available",
      "Flexible payment plans",
    ],
    link: "/packages",
    linkLabel: "Browse Packages",
    iconBg: "bg-orange-50 text-orange-600",
  },
  {
    icon: "ri-calendar-check-line",
    title: "Consultation & Booking",
    subtitle: "Instant Auto-Confirmed Appointments",
    description:
      "Book a free 30-minute video consultation with a dedicated travel expert. Our system auto-generates a Google Meet link and confirms your appointment instantly. Over 80% of our consultations are now booked directly through our web calendar — no phone calls, no waiting.",
    features: [
      "Auto-generated video meeting links",
      "Instant confirmation & calendar sync",
      "Dedicated travel expert assigned to you",
      "Free 30-minute initial consultation",
    ],
    link: "/contact",
    linkLabel: "Book a Consultation",
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    icon: "ri-file-text-line",
    title: "Document Assistance",
    subtitle: "Application Support",
    description:
      "From international passports to travel insurance and invitation letters, our document assistance service ensures every piece of paper is in order before your application reaches the embassy. We reduce rejection rates by catching issues before submission.",
    features: [
      "Passport application guidance",
      "Travel insurance procurement",
      "Invitation letter drafting",
      "Pre-submission document audit",
    ],
    link: "/contact",
    linkLabel: "Get Document Help",
    iconBg: "bg-orange-50 text-orange-600",
  },
  {
    icon: "ri-group-line",
    title: "Group & Corporate Travel",
    subtitle: "Bulk Booking Management",
    description:
      "Planning a family reunion, corporate retreat, or group tour? Our group travel service handles bulk bookings, coordinated visa processing, and synchronized itineraries for groups of any size — with dedicated account management throughout.",
    features: [
      "Dedicated group account manager",
      "Coordinated visa processing for all members",
      "Synchronized flight & hotel bookings",
      "Corporate travel policy integration",
    ],
    link: "/contact",
    linkLabel: "Inquire About Group Travel",
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    icon: "ri-shield-star-line",
    title: "Travel Insurance",
    subtitle: "Comprehensive Coverage",
    description:
      "Protect your trip with comprehensive travel insurance covering medical emergencies, trip cancellations, lost luggage, and flight delays. We partner with leading international insurers to provide coverage that meets embassy requirements.",
    features: [
      "Medical emergency coverage",
      "Trip cancellation & delay protection",
      "Lost luggage & personal belongings",
      "Embassy-compliant coverage certificates",
    ],
    link: "/contact",
    linkLabel: "Get Insurance Quote",
    iconBg: "bg-orange-50 text-orange-600",
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 page-enter">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 px-4 md:px-6 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://readdy.ai/api/search-image?query=Abstract%20geometric%20pattern%20of%20interconnected%20circles%20and%20lines%20forming%20a%20travel%20network%20visualization%2C%20deep%20navy%20blue%20background%20with%20glowing%20orange%20nodes%20and%20pathways%2C%20modern%20data%20infrastructure%20concept%20art%2C%20clean%20minimalist%20design%2C%20sophisticated%20dark%20technology%20aesthetic%2C%20elegant%20network%20topology%20visualization&width=1600&height=800&seq=services-hero-eduvic&orientation=landscape"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">What We Offer</p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 tracking-tight">
            Our Services
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            End-to-end travel services designed around three core principles: automation, transparency, and accessibility. Everything you need for a seamless international journey — all in one place.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-14 md:py-20 px-4 md:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 hover:border-orange-300 transition-all duration-300 shadow-sm"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${service.iconBg} flex items-center justify-center shrink-0`}>
                    <i className={`${service.icon} text-xl`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-slate-900">{service.title}</h3>
                    <p className="text-xs font-semibold text-orange-600 mt-0.5">{service.subtitle}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-5">{service.description}</p>

                <ul className="space-y-2 mb-6">
                  {service.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <i className="ri-check-line text-orange-500 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={service.link}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  {service.linkLabel}
                  <i className="ri-arrow-right-line" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Pillars */}
      <section className="py-14 md:py-20 px-4 md:px-6 bg-slate-100/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-2">Our Approach</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
              Three Pillars of Service Delivery
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-7 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-5">
                <i className="ri-robot-line text-2xl" />
              </div>
              <h3 className="text-lg font-serif font-bold text-slate-900 mb-3">Automation First</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We automate every routine task — from consultation scheduling with auto-generated video links to instant booking confirmations. Our systems handle the busywork so our people can focus on personalized service.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-7 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-5">
                <i className="ri-eye-line text-2xl" />
              </div>
              <h3 className="text-lg font-serif font-bold text-slate-900 mb-3">Radical Transparency</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every client sees exactly where their visa application stands — in real time. No hidden stages, no vague updates, no need to call and ask. We publish what we know, when we know it.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-7 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-5">
                <i className="ri-user-heart-line text-2xl" />
              </div>
              <h3 className="text-lg font-serif font-bold text-slate-900 mb-3">Human Expertise</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Technology handles the process; our people handle the nuance. Every client gets a dedicated travel expert who understands their unique needs, preferences, and concerns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-slate-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Not Sure Where to Start?
          </h2>
          <p className="text-base text-slate-300 mb-8 leading-relaxed">
            Book a free consultation and let our travel experts guide you through the options. We will help you find the right service mix for your travel goals.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold text-base transition-all whitespace-nowrap shadow-lg shadow-orange-500/20"
          >
            Book Free Consultation
            <i className="ri-arrow-right-line" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}