import PublicNavbar from "../components/features/PublicNavbar";
import PublicFooter from "../components/features/PublicFooter";

// const teamMembers = [
//   {
//     name: "Victor Edu",
//     role: "Founder & CEO",
//     bio: "With over 15 years in travel consultancy, Victor founded Eduvic with a mission to simplify international travel for Nigerians.",
//     image: "https://readdy.ai/api/search-image?query=Professional%20African%20Nigerian%20man%20in%20his%20early%2040s%20wearing%20a%20navy%20blue%20blazer%20and%20white%20shirt%2C%20warm%20confident%20smile%2C%20clean%20studio%20portrait%20with%20soft%20natural%20lighting%2C%20modern%20corporate%20headshot%20style%2C%20simple%20neutral%20light%20gray%20background%2C%20approachable%20and%20trustworthy%20expression%2C%20high-end%20business%20photography&width=400&height=400&seq=team-victor-edu&orientation=squarish",
//   },
//   {
//     name: "Amara Okafor",
//     role: "Head of Operations",
//     bio: "Amara oversees all visa processing pipelines and ensures every application moves efficiently through each stage.",
//     image: "https://readdy.ai/api/search-image?query=Professional%20African%20Nigerian%20woman%20in%20her%20mid%2030s%20wearing%20an%20orange%20blouse%20and%20navy%20blazer%2C%20confident%20genuine%20smile%2C%20clean%20studio%20portrait%20with%20soft%20natural%20lighting%2C%20modern%20corporate%20headshot%20style%2C%20simple%20neutral%20light%20gray%20background%2C%20warm%20approachable%20expression%2C%20high-end%20business%20photography&width=400&height=400&seq=team-amara-okafor&orientation=squarish",
//   },
//   {
//     name: "David Bello",
//     role: "Lead Travel Consultant",
//     bio: "David curates every travel package on our platform, personally vetting hotels, tours, and experiences across 150+ destinations.",
//     image: "https://readdy.ai/api/search-image?query=Professional%20African%20Nigerian%20man%20in%20his%20late%2030s%20wearing%20a%20casual%20navy%20polo%20shirt%2C%20warm%20friendly%20smile%2C%20clean%20studio%20portrait%20with%20soft%20natural%20lighting%2C%20modern%20corporate%20headshot%20style%2C%20simple%20neutral%20light%20gray%20background%2C%20enthusiastic%20and%20approachable%20expression%2C%20high-end%20business%20photography&width=400&height=400&seq=team-david-bello&orientation=squarish",
//   },
//   {
//     name: "Chioma Nwosu",
//     role: "Client Relations Manager",
//     bio: "Chioma ensures every client receives personalized attention from consultation through to boarding the plane.",
//     image: "https://readdy.ai/api/search-image?query=Professional%20African%20Nigerian%20woman%20in%20her%20early%2030s%20wearing%20a%20cream%20blouse%2C%20bright%20genuine%20smile%2C%20clean%20studio%20portrait%20with%20soft%20natural%20lighting%2C%20modern%20corporate%20headshot%20style%2C%20simple%20neutral%20light%20gray%20background%2C%20warm%20and%20caring%20expression%2C%20high-end%20business%20photography&width=400&height=400&seq=team-chioma-nwosu&orientation=squarish",
//   },
// ];

const values = [
  {
    icon: "ri-shield-check-line",
    title: "Trust & Transparency",
    desc: "Every visa application is tracked in real-time. Every price is published upfront. No hidden fees, no surprises.",
  },
  {
    icon: "ri-rocket-line",
    title: "Speed & Efficiency",
    desc: "We leverage technology to cut processing times and automate routine tasks, so our team focuses on what matters — your journey.",
  },
  {
    icon: "ri-heart-line",
    title: "Client-First Service",
    desc: "From your first consultation to your return flight, you have a dedicated team member who knows your file inside out.",
  },
  {
    icon: "ri-global-line",
    title: "Global Reach, Local Touch",
    desc: "We understand Nigerian travellers because we are Nigerian travellers. Global connections paired with deep local expertise.",
  },
];

const milestones = [
  // { year: "2018", event: "Eduvic Travels founded in Lagos with a team of 3 travel consultants." },
  // { year: "2019", event: "Processed our first 500 visas with a 97% approval rate." },
  // { year: "2020", event: "Launched digital consultation platform to serve clients remotely during the pandemic." },
  { year: "2022", event: "Eduvic Travels founded in Lagos with a team of 3 travel consultants." },
  { year: "2024", event: "Processed our first 500 visas with a 97% approval rate." },
  { year: "2025", event: "Launched digital consultation platform to serve clients remotely during the pandemic." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 page-enter">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 px-4 md:px-6 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://readdy.ai/api/search-image?query=Abstract%20world%20map%20made%20of%20interconnected%20glowing%20dots%20and%20lines%20in%20deep%20navy%20blue%20tones%20with%20subtle%20orange%20accent%20highlights%2C%20modern%20digital%20network%20visualization%2C%20clean%20minimalist%20tech%20aesthetic%2C%20dark%20sophisticated%20background%2C%20global%20connectivity%20concept%20art%2C%20elegant%20data%20visualization%20style&width=1600&height=800&seq=about-hero-eduvic&orientation=landscape"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Our Story</p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 tracking-tight">
            About Eduvic Travels
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            We are a Lagos-based travel agency on a mission to make international travel seamless, transparent, and accessible for every Nigerian. From visa processing to curated holiday packages, we handle the complexity so you can focus on the adventure.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-14 md:py-20 px-4 md:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 md:p-10 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <i className="ri-focus-3-line text-2xl" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3">Our Mission</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                To democratize international travel for Nigerians by building the most transparent, efficient, and user-friendly travel platform in Africa. We eliminate bureaucratic friction so our clients can explore the world with confidence and peace of mind.
              </p>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 md:p-10 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
                <i className="ri-eye-line text-2xl" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3">Our Vision</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                To become Africa's most trusted travel partner — where every Nigerian can plan, book, and track their entire journey from a single dashboard. We envision a future where visa anxiety and travel uncertainty are things of the past.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-14 md:py-20 px-4 md:px-6 bg-slate-100/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-2">What We Stand For</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Our Core Values</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white border border-slate-200 rounded-xl p-6 text-center hover:border-orange-300 transition-all duration-300 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4">
                  <i className={`${v.icon} text-xl`} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-14 md:py-20 px-4 md:px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-2">The Journey</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Our Milestones</h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 md:-translate-x-px" />

            <div className="space-y-10 md:space-y-0">
              {milestones.map((m, idx) => (
                <div
                  key={m.year}
                  className={`relative flex flex-col md:flex-row gap-6 md:gap-0 ${
                    idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 top-1 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white -translate-x-1/2 z-10 shadow-sm" />

                  {/* Content */}
                  <div className={`pl-12 md:pl-0 md:w-1/2 ${idx % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <div className="inline-block bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                      <span className="text-sm font-bold text-orange-600">{m.year}</span>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{m.event}</p>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="hidden md:block md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      {/* <section className="py-14 md:py-20 px-4 md:px-6 bg-slate-100/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-2">Meet The Team</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">The People Behind Eduvic</h2>
            <p className="text-base text-slate-600 mt-3 max-w-2xl mx-auto">
              A dedicated team of travel experts, visa specialists, and client advocates committed to your journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-white border border-slate-200 rounded-xl overflow-hidden group hover:border-orange-300 transition-all duration-300 shadow-sm">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                  <p className="text-xs font-semibold text-orange-600 mt-0.5 mb-3">{member.role}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <PublicFooter />
    </div>
  );
}