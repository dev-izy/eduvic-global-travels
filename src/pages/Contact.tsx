import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/features/PublicNavbar";
import PublicFooter from "../components/features/PublicFooter";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const honeypot = (formData.get("website_alt") as string || "").trim();
    if (honeypot) {
      setSubmitted(true);
      return;
    }

    const name = (formData.get("name") as string || "").trim();
    const email = (formData.get("email") as string || "").trim();
    const service = (formData.get("service") as string || "").trim();
    const message = (formData.get("message") as string || "").trim();

    if (!name || !email || !message) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (message.length > 500) {
      setFormError("Message must be 500 characters or less.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://readdy.ai/api/form/d9jmt66c26n1c7c5q7rg", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          name,
          email,
          service,
          message,
        }).toString(),
      });

      const responseText = await response.text();
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(responseText);
      } catch {
        // keep parsed empty
      }

      if (response.ok && parsed?.code === "OK") {
        setSubmitted(true);
        form.reset();
      } else {
        const serverMsg =
          (parsed?.meta as Record<string, unknown>)?.message as string ||
          (parsed?.message as string) ||
          (parsed?.meta as Record<string, unknown>)?.detail as string ||
          responseText ||
          "Something went wrong. Please try again.";
        setFormError(String(serverMsg));
      }
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans page-enter">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 px-4 md:px-6 bg-[#090D16] overflow-hidden">
        {/* Dark Background Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=Modern%20minimalist%20customer%20service%20desk%20with%20a%20globe%2C%20a%20passport%2C%20and%20travel%20brochures%20neatly%20arranged%20on%20a%20warm%20wooden%20surface%2C%20soft%20natural%20lighting%20from%20large%20windows%2C%20navy%20blue%20and%20orange%20accent%20tones%20in%20the%20decor%2C%20clean%20professional%20travel%20agency%20aesthetic%2C%20welcoming%20and%20sophisticated%20atmosphere%2C%20editorial%20photography%20style&width=1600&height=800&seq=contact-hero-eduvic&orientation=landscape"
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#090D16]/60 via-[#090D16]/80 to-[#090D16]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-xs md:text-sm font-semibold text-orange-500 uppercase tracking-widest mb-3">
            Get In Touch
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 tracking-tight leading-tight">
            Contact Us
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Have a question about our services, need a custom travel package, or ready to start your visa application? We are here to help — reach out and a travel expert will respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-2">
                Send Us a Message
              </h2>
              <p className="text-sm text-slate-500 mb-8">
                Fill out the form and we will get back to you within 24 hours.
              </p>

              {submitted ? (
                <div className="bg-slate-50 border border-emerald-200 rounded-xl p-8 text-center shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <i className="ri-check-line text-3xl font-bold" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. One of our travel experts will respond to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} data-readdy-form className="space-y-5">
                  {/* Honeypot */}
                  <input
                    type="text"
                    name="website_alt"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    readOnly
                    className="hp-field hidden"
                  />

                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Full Name <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="Name"
                      className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900 placeholder:text-slate-400 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Email Address <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="Email"
                      className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900 placeholder:text-slate-400 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="service" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Service Interested In
                    </label>
                    <select
                      id="service"
                      name="service"
                      className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900 transition-all"
                    >
                      <option value="">Select a service...</option>
                      <option value="visa">Visa Processing</option>
                      <option value="package">Holiday Package</option>
                      <option value="consultation">Consultation</option>
                      <option value="group">Group Travel</option>
                      <option value="insurance">Travel Insurance</option>
                      <option value="other">Other / General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Message <span className="text-orange-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      maxLength={500}
                      placeholder="Tell us about your travel plans or questions..."
                      className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900 placeholder:text-slate-400 resize-none transition-all"
                    />
                    <p className="text-xs text-slate-400 mt-1">Maximum 500 characters</p>
                  </div>

                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 flex items-center gap-2 font-medium">
                        <i className="ri-error-warning-line" />
                        {formError}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-all shadow-md hover:shadow-orange-500/20 whitespace-nowrap"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <i className="ri-loader-4-line animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-2">
                  Contact Information
                </h2>
                <p className="text-sm text-slate-500 mb-8">
                  Reach us directly through any of these channels.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <i className="ri-map-pin-line text-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Office Address</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Landmark House, Isaac John Street, Ikeja,<br /> Lagos, Nigeria
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <i className="ri-phone-line text-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Phone</h3>
                    <p className="text-sm text-slate-600">+234 808 058 7601</p>
                    <p className="text-sm text-slate-600">+234 812 666 9153</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <i className="ri-mail-line text-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Email</h3>
                    <p className="text-sm text-slate-600">eduvicgloballtravels@gmail.com</p>
                    <p className="text-sm text-slate-600">eduvicglobalinternational@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <i className="ri-time-line text-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Business Hours</h3>
                    <p className="text-sm text-slate-600">Monday - Friday: 9:00 AM - 5:00 PM</p>
                    <p className="text-sm text-slate-600">Saturday: 9:00 AM - 1:00 PM</p>
                    <p className="text-sm text-slate-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>

              {/* Quick CTA */}
              <div className="bg-[#090D16] rounded-xl p-6 text-center shadow-lg">
                <h3 className="text-lg font-serif font-bold text-white mb-2">Ready to Start?</h3>
                <p className="text-sm text-slate-300 mb-5 leading-relaxed">
                  Book a free 30-minute video consultation with a dedicated travel expert. Instant confirmation with auto-generated meeting link.
                </p>
                <Link
                  to="/packages"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-orange-500/20 whitespace-nowrap"
                >
                  Browse Packages
                  <i className="ri-arrow-right-line" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}