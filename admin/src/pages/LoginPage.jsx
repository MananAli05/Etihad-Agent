import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && session) {
      navigate(from, { replace: true });
    }
  }, [session, loading, navigate, from]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      // User-friendly error message without exposing technical details
      setError('Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin" />
          <span className="text-xs font-semibold text-charcoal">Checking session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4 sm:p-6 font-sans text-charcoal">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl border border-gray-200/80 shadow-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <img
            src="/images/logo.png"
            alt="Etihad Garden Logo"
            className="h-12 w-auto mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Sign in to your admin dashboard
          </p>
        </div>

        {/* Inline Error Message */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full pl-10 pr-4 py-2.5 bg-ivory/60 border border-gray-200 rounded-xl text-sm text-charcoal placeholder-gray-400 focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-11 py-2.5 bg-ivory/60 border border-gray-200 rounded-xl text-sm text-charcoal placeholder-gray-400 focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal transition-colors p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 bg-burgundy hover:bg-burgundy/90 text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
