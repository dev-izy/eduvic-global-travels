import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function PublicFooter() {
  return (
    <footer className="bg-primary-950 text-foreground-300 py-14 md:py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Logo variant="light" height={36} showWordmark={false} />
            <p className="text-sm text-foreground-400 leading-relaxed max-w-sm mb-5">
              Your trusted partner for visa processing, curated travel packages, and seamless journey planning across Africa and beyond.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: "ri-instagram-line", label: "Instagram" },
                { icon: "ri-facebook-line", label: "Facebook" },
                { icon: "ri-twitter-x-line", label: "Twitter" },
                { icon: "ri-linkedin-line", label: "LinkedIn" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="https://www.instagram.com/eduvictravels/"
                  aria-label={social.label}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary-800/50 hover:bg-accent-500 text-foreground-400 hover:text-background-50 transition-all"
                >
                  <i className={`${social.icon} text-sm`} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-background-50 uppercase tracking-wider mb-4">
              Services
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Visa Processing", path: "/visa-services" },
                { label: "Holiday Packages", path: "/packages" },
                { label: "Travel Insurance", path: "/services" },
                { label: "Consultation", path: "/contact" },
                { label: "Document Assistance", path: "/services" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-sm text-foreground-400 hover:text-accent-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-background-50 uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", path: "/about" },
                { label: "Our Services", path: "/services" },
                { label: "Contact", path: "/contact" },
                { label: "Client Portal", path: "/admin" },
                { label: "Privacy Policy", path: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-sm text-foreground-400 hover:text-accent-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-background-50 uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-foreground-400">
                <i className="ri-mail-line text-accent-400 mt-0.5" />
                <span>eduvicgloballtravels@gmail.com<br />eduvicglobalinternational@gmail.com</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-foreground-400">
                <i className="ri-phone-line text-accent-400 mt-0.5" />
                <span>+234 808 058 7601<br / >+234 812 666 9153</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-foreground-400">
                <i className="ri-map-pin-line text-accent-400 mt-0.5" />
                <span>Landmark House, Isaac John Street, Ikeja, Lagos, Nigeria</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-foreground-400">
                <i className="ri-time-line text-accent-400 mt-0.5" />
                <span>Mon - Fri: 8:00 AM - 5:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-primary-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground-500">
            &copy; {new Date().getFullYear()} Eduvic Travels. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-foreground-500 hover:text-foreground-300 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-xs text-foreground-500 hover:text-foreground-300 transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}