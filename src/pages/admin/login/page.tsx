import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

export default function AdminLogin() {
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Already signed in as staff — go straight through.
  useEffect(() => {
    if (isAuthenticated && user && (user.role === "admin" || user.role === "agent")) {
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }

    setBusy(true);
    const result = await login(email.trim(), password);
    setBusy(false);

    if (!result.success) {
      setError(result.error || "We couldn't sign you in. Check your details and try again.");
      return;
    }

    if (result.role === "admin" || result.role === "agent") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  const field =
    "w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-950 px-6 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-primary-500/15 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-8"
        >
          <i className="ri-arrow-left-line" />
          Back to site
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-accent-500 flex items-center justify-center">
            <i className="ri-shield-user-line text-xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-white leading-tight">
              Staff sign in
            </h1>
            <p className="text-sm text-white/50">Manage packages, bookings and enquiries</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3 animate-scale-in">
              <i className="ri-error-warning-line text-red-400 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1.5">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
              placeholder="admin@eduvictravels.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={busy || isLoading}
            className="w-full py-3.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-500/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            {busy ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <i className="ri-login-box-line" />
                <span>Open dashboard</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-white/40">
          Booking a trip instead?{" "}
          <Link to="/login" className="text-accent-400 hover:text-accent-300 font-medium">
            Client sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
