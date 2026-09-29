import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  QrCode,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import {
  FormEvent,
  useState,
} from 'react';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthPageProps {
  mode: 'login' | 'signup';
}

export function AuthPage({
  mode,
}: AuthPageProps) {
  const isSignup = mode === 'signup';

  const { user, signIn, signUp } =
    useAuth();

  const { success, error } =
    useToast();

  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  if (user) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  const from =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/dashboard';

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSignup && password !== confirmPassword) {
      error(
        'Your passwords do not match.',
        'Check your password'
      );
      return;
    }

    setSubmitting(true);

    try {
      const result = isSignup
        ? await signUp(email, password)
        : await signIn(email, password);

      if (result.error) {
        error(
          result.error.message,
          isSignup
            ? 'Unable to create account'
            : 'Unable to sign in'
        );
        return;
      }

      success(
        isSignup
          ? 'Your account is ready.'
          : 'Welcome back.',
        isSignup
          ? 'Account created'
          : 'Signed in'
      );

      navigate(
        isSignup ? '/dashboard' : from,
        { replace: true }
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />

          <Link
            to="/"
            className="relative flex w-fit items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <QrCode size={21} />
            </div>

            <span className="text-xl font-bold tracking-tight">
              QR Studio
            </span>
          </Link>

          <div className="relative max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-indigo-200">
              <Sparkles size={13} />
              Your QR workspace
            </div>

            <h1 className="text-5xl font-black leading-[1.05] tracking-[-0.04em] xl:text-6xl">
              Build QR experiences that keep working.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
              Create, design, manage and analyze your QR codes
              from one focused workspace.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Advanced QR customization',
                'Dynamic destinations and analytics',
                'Organized QR library',
                'Export-ready designs',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300">
                    <Check size={14} />
                  </div>

                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-slate-500">
            Create smarter. Share faster. Measure everything.
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link
                to="/"
                className="inline-flex items-center gap-2.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <QrCode size={21} />
                </div>

                <span className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                  QR Studio
                </span>
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  {isSignup ? (
                    <UserPlus size={20} />
                  ) : (
                    <LockKeyhole size={20} />
                  )}
                </div>

                <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                  {isSignup
                    ? 'Create your workspace'
                    : 'Welcome back'}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {isSignup
                    ? 'Start building and managing your QR codes in minutes.'
                    : 'Sign in to continue to your QR Studio workspace.'}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-5"
              >
                {isSignup && (
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Your name
                    </label>

                    <div className="relative">
                      <UserPlus
                        size={17}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(event) =>
                          setName(event.target.value)
                        }
                        placeholder="Alex Morgan"
                        autoComplete="name"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="At least 6 characters"
                      autoComplete={
                        isSignup
                          ? 'new-password'
                          : 'current-password'
                      }
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                {isSignup && (
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Confirm password
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        size={17}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="confirmPassword"
                        type={
                          showConfirmPassword
                            ? 'text'
                            : 'password'
                        }
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value
                          )
                        }
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                        required
                        minLength={6}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (current) => !current
                          )
                        }
                        className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                        aria-label={
                          showConfirmPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {!isSignup && (
                  <div className="flex items-center justify-between gap-4">
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) =>
                          setRememberMe(
                            event.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
                      />

                      Remember me
                    </label>

                    <span className="text-xs text-slate-400">
                      Local workspace
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {isSignup
                        ? 'Creating workspace…'
                        : 'Signing in…'}
                    </>
                  ) : (
                    <>
                      {isSignup
                        ? 'Create account'
                        : 'Sign in'}
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />

                <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Your current workspace uses local browser
                  authentication. You can connect a production
                  backend later without changing the main UI.
                </p>
              </div>

              <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
                {isSignup
                  ? 'Already have an account?'
                  : "Don't have an account?"}{' '}
                <Link
                  to={
                    isSignup
                      ? '/login'
                      : '/signup'
                  }
                  className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  {isSignup
                    ? 'Sign in'
                    : 'Create one'}
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              By continuing, you agree to use QR Studio responsibly
              and verify destinations before publishing QR codes.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}