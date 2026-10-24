import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";

interface PublicNavbarProps {
  transparent?: boolean;
}

export default function PublicNavbar({ transparent = false }: PublicNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = transparent && !scrolled;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About Us" },
    { path: "/services", label: "Services" },
    { path: "/packages", label: "Packages" },
    { path: "/booking", label: "Book Now" },
    { path: "/visa-services", label: "Visa Services" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent
          ? "bg-transparent border-b border-transparent"
          : "bg-white border-b border-white shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-16 md:h-20">
          <Logo variant={isTransparent ? "light" : "dark"} height={36} showWordmark={false} />

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                data-active={isActive}
                className={`link-underline px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isTransparent
                    ? isActive
                      ? "text-white bg-white/15"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                    : isActive
                      ? "text-orange-600 bg-orange-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/booking"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap bg-orange-500 text-white hover:bg-orange-600 shadow-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/25"
          >
            Book Consultation
          </Link>
          <Link
            to="/admin/login"
            className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              isTransparent
                ? "text-white/70 hover:text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Login
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
            isTransparent ? "text-white" : "text-slate-800"
          }`}
        >
          <i className={`${mobileOpen ? "ri-close-line" : "ri-menu-line"} text-xl`} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-white px-4 py-4 space-y-1 shadow-lg animate-fade-up">
          {navLinks.map((link, i) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                style={{ animationDelay: `${i * 35}ms` }}
                className={`animate-fade-up block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/booking"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold"
            >
              Book Consultation
            </Link>
            <Link
              to="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="block text-center px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}