import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function Auth() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, isDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (tab === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      if (tab === 'login') {
        const { error } = await signIn(email, password);
        if (error) { setError(error.message); return; }
        navigate('/dashboard');
      } else {
        const { error } = await signUp(email, password, name);
        if (error) { setError(error.message); return; }
        if (isDemo) { navigate('/dashboard'); return; }
        setSuccess('Account created! Check your email to confirm, then log in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // If demo mode, redirect immediately
      if (isDemo) navigate('/dashboard');
      // Otherwise Supabase redirects the page automatically
    } catch {
      setError('Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <MapPin size={20} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold text-gray-900">CityResolve</span>
          </Link>
          <p className="text-sm text-gray-500">Smart Civic Issue Management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {(['login', 'signup'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors ${
                  tab === t
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="p-8">

            {/* Demo mode notice */}
            {isDemo && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Demo mode — Supabase not configured. Any credentials will work.
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-5 flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-700">{success}</p>
              </div>
            )}

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 mb-5"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              {googleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or continue with email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input
                    required value={name} onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input
                  required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    required type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={tab === 'signup' ? 'At least 6 characters' : 'Your password'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {tab === 'login' && (
                <div className="text-right">
                  <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Protected by Supabase Auth · GDPR compliant
        </p>
      </div>
    </div>
  );
}