import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
export default function ClientLogin() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Ensure demo client accounts are provisioned (best-effort)
  useEffect(() => {
    supabase.functions.invoke('sync-client-users').catch(() => {
      // Silently fail — provisioning is best-effort on page load
    });
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      if (result.role === 'client') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-background-50">
      {/* Left visual panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-950 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=Serene%20modern%20airport%20departure%20lounge%20with%20warm%20golden%20hour%20sunlight%20streaming%20through%20floor%20to%20ceiling%20windows%2C%20a%20lone%20traveler%20with%20a%20passport%20looking%20out%20at%20a%20plane%20on%20the%20tarmac%2C%20deep%20navy%20blue%20and%20soft%20orange%20color%20palette%2C%20minimal%20clean%20composition%2C%20luxury%20travel%20editorial%20photography%2C%20calm%20and%20aspirational%20mood%2C%20soft%20shadows%20and%20organic%20light&width=1000&height=1200&seq=client-login-eduvic&orientation=portrait"
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-950/80 via-primary-950/50 to-primary-950/80" />
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 bg-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="ri-plane-line text-3xl text-background-50" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-white mb-3">Your Journey Awaits</h2>
          <p className="text-primary-100 text-sm leading-relaxed max-w-sm mx-auto">
            Track your visa applications, browse opportunities, and manage your travel plans — all in one place.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-foreground-500 hover:text-foreground-800 transition-colors mb-8">
            <i className="ri-arrow-left-line" />
            Back to home
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-heading font-bold text-foreground-950 mb-2">Client Login</h1>
            <p className="text-sm text-foreground-600">Sign in to access your personal dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <i className="ri-error-warning-line text-red-500 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground-800 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-background-50 border border-background-300 rounded-lg text-sm text-foreground-950 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground-800 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-background-50 border border-background-300 rounded-lg text-sm text-foreground-950 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary-900 hover:bg-primary-800 text-background-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-background-50 border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-login-box-line" />
                    <span>Sign in</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-xs text-foreground-500">
            Need an account? Contact us at{' '}
            <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
              hello@eduvictravels.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}