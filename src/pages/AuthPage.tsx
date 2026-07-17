import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { QrCode, Loader2, Eye, EyeOff, ArrowLeft, MailCheck } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) setError(error);
      else setMessage('Account created! You can now sign in.');
    } else if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else if (mode === 'forgot') {
      const { error } = await resetPassword(email);
      if (error) setError(error);
      else setMessage('Password reset link sent to your email.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30 mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">QR Nexus</h1>
          <p className="text-slate-500 mt-1 text-sm">Unified QR Management Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          {mode === 'forgot' ? (
            <div>
              <button
                onClick={() => { setMode('signin'); setError(null); setMessage(null); }}
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </button>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Reset Password</h2>
              <p className="text-sm text-slate-500 mb-6">Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <div className="text-sm rounded-xl px-4 py-3 bg-red-50 text-red-600 border border-red-200">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="text-sm rounded-xl px-4 py-3 bg-green-50 text-green-700 border border-green-200 flex items-center gap-2">
                    <MailCheck className="w-4 h-4 flex-shrink-0" /> {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send Reset Link
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => { setMode('signin'); setError(null); setMessage(null); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setError(null); setMessage(null); }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-sm rounded-xl px-4 py-3 bg-red-50 text-red-600 border border-red-200">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="text-sm rounded-xl px-4 py-3 bg-green-50 text-green-700 border border-green-200 flex items-center gap-2">
                    <MailCheck className="w-4 h-4 flex-shrink-0" /> {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
