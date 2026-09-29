import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Code2,
  Download,
  Layers3,
  Menu,
  Palette,
  QrCode,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: Palette,
    title: 'Design without limits',
    description:
      'Customize colors, gradients, patterns, eyes, logos, quiet zones, and error correction.',
  },
  {
    icon: BarChart3,
    title: 'Know what works',
    description:
      'Track scans, devices, locations, time patterns, and engagement from one dashboard.',
  },
  {
    icon: Layers3,
    title: 'One QR operating system',
    description:
      'Create, organize, share, update, test, and manage every QR code from one workspace.',
  },
  {
    icon: Zap,
    title: 'Dynamic by default',
    description:
      'Change destinations after printing, add redirect rules, pause codes, and set expiration.',
  },
];

const qrTypes = [
  'URL',
  'Wi-Fi',
  'vCard',
  'WhatsApp',
  'UPI',
  'Event',
  'Coupon',
  'Multi-link',
  'Business',
  'App',
  'Location',
  'SMS',
];

const plans = [
  {
    name: 'Free',
    description: 'For exploring QR Studio.',
    price: '$0',
    features: [
      'Unlimited static QR codes',
      'Core QR types',
      'Basic customization',
      'PNG downloads',
    ],
  },
  {
    name: 'Pro',
    description: 'For creators and growing brands.',
    price: '$19',
    features: [
      'Dynamic QR codes',
      'Advanced design controls',
      'Analytics',
      'SVG, JPG and PDF exports',
      'Folders, tags and favorites',
      'Custom landing pages',
    ],
    featured: true,
  },
  {
    name: 'Business',
    description: 'For teams and larger workflows.',
    price: '$49',
    features: [
      'Everything in Pro',
      'Bulk generation',
      'Smart redirect rules',
      'Brand Kit',
      'Advanced sharing',
      'Team-ready workflows',
    ],
  },
];

export function LandingPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const dashboardPath = user
    ? '/dashboard'
    : '/signup';

  return (
    <div className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <QrCode size={20} />
            </div>

            <span className="text-lg font-bold tracking-tight">
              QR Studio
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              Features
            </a>

            <a
              href="#qr-types"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              QR types
            </a>

            <a
              href="#pricing"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              Pricing
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Open dashboard
                <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  Sign in
                </Link>

                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Start free
                  <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                (current) => !current
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-900"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-950">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              <a
                href="#features"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Features
              </a>

              <a
                href="#qr-types"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                QR types
              </a>

              <a
                href="#pricing"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Pricing
              </a>

              <Link
                to={dashboardPath}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white"
              >
                {user
                  ? 'Open dashboard'
                  : 'Start free'}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_42%),radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_38%)]" />

          <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28 lg:pt-28">
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
                <Sparkles size={13} />
                The modern QR operating system
              </div>

              <h1 className="max-w-3xl text-5xl font-black tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
                Create QR codes that{' '}
                <span className="text-indigo-600 dark:text-indigo-400">
                  do more.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-400">
                Design beautiful QR codes, manage every destination,
                measure scans, and keep printed campaigns useful long
                after they go live.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={dashboardPath}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  {user
                    ? 'Open your workspace'
                    : 'Create your first QR'}
                  <ArrowRight size={17} />
                </Link>

                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Explore features
                  <ChevronRight size={17} />
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <Check
                    size={15}
                    className="text-emerald-500"
                  />
                  No credit card required
                </span>

                <span className="flex items-center gap-2">
                  <Check
                    size={15}
                    className="text-emerald-500"
                  />
                  Export-ready
                </span>

                <span className="flex items-center gap-2">
                  <Check
                    size={15}
                    className="text-emerald-500"
                  />
                  Mobile friendly
                </span>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

              <div className="relative w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Live preview
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                      Summer campaign
                    </p>
                  </div>

                  <div className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    Active
                  </div>
                </div>

                <div className="flex justify-center py-8">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700">
                    <FakeQRCode />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Metric
                    label="Scans"
                    value="12.8K"
                  />
                  <Metric
                    label="Reach"
                    value="8.4K"
                  />
                  <Metric
                    label="CTR"
                    value="67%"
                  />
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  <ShieldCheck
                    size={16}
                    className="text-emerald-500"
                  />

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Destination verified and protected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="border-y border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/50"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Everything in one place
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                From QR creation to campaign intelligence.
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                QR Studio combines the tools you normally need across
                several products into one focused workspace.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      <Icon size={21} />
                    </div>

                    <h3 className="mt-5 text-base font-bold">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="qr-types"
          className="py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <Code2 size={23} />
                </div>

                <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
                  One builder for every use case.
                </h2>

                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
                  From a simple website link to a complete business
                  profile, create structured QR experiences without
                  juggling separate generators.
                </p>

                <Link
                  to={dashboardPath}
                  className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  Start creating
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {qrTypes.map((type) => (
                  <div
                    key={type}
                    className="flex min-h-24 items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 text-center text-sm font-bold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {type}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-indigo-300">
                Built for real campaigns
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Print once. Stay in control.
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">
                Dynamic destinations, scan analytics, expiration controls,
                smart redirects, and version history give your QR codes
                a lifecycle instead of a one-time job.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  'Dynamic destinations',
                  'Scan analytics',
                  'Version history',
                  'Time-based rules',
                  'Custom landing pages',
                  'Bulk generation',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-slate-300"
                  >
                    <Check
                      size={16}
                      className="text-indigo-400"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Campaign analytics
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    Product launch
                  </p>
                </div>

                <BarChart3
                  size={21}
                  className="text-indigo-300"
                />
              </div>

              <div className="mt-6 flex h-48 items-end gap-2">
                {[28, 44, 36, 65, 52, 76, 91, 68, 84, 96, 78, 100].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-lg bg-indigo-400/80"
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  )
                )}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <DarkMetric
                  label="Total scans"
                  value="24,892"
                />
                <DarkMetric
                  label="Unique"
                  value="18,421"
                />
                <DarkMetric
                  label="Growth"
                  value="+32%"
                />
              </div>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Simple pricing
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Start free. Scale when you need to.
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                Choose the workspace that matches the complexity of your
                QR campaigns.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={[
                    'relative rounded-3xl border p-7',
                    plan.featured
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-xl shadow-indigo-500/10 dark:bg-indigo-950/20'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
                  ].join(' ')}
                >
                  {plan.featured && (
                    <div className="absolute right-6 top-6 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white">
                      Most flexible
                    </div>
                  )}

                  <p className="text-sm font-bold">
                    {plan.name}
                  </p>

                  <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">
                    {plan.description}
                  </p>

                  <div className="mt-6">
                    <span className="text-4xl font-black tracking-tight">
                      {plan.price}
                    </span>

                    {plan.price !== '$0' && (
                      <span className="ml-1 text-sm text-slate-500">
                        /month
                      </span>
                    )}
                  </div>

                  <Link
                    to={dashboardPath}
                    className={[
                      'mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition',
                      plan.featured
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
                    ].join(' ')}
                  >
                    Get started
                    <ArrowRight size={15} />
                  </Link>

                  <div className="mt-7 space-y-3">
                    {plan.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400"
                      >
                        <Check
                          size={16}
                          className="mt-0.5 shrink-0 text-emerald-500"
                        />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20">
              <QrCode size={27} />
            </div>

            <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
              Your next QR campaign starts here.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
              Build your first QR code, make it yours, and manage the
              entire lifecycle from one workspace.
            </p>

            <Link
              to={dashboardPath}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/20 transition hover:bg-indigo-700"
            >
              {user
                ? 'Open dashboard'
                : 'Create QR code'}
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <QrCode size={17} />
            </div>

            <span className="text-sm font-bold">
              QR Studio
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Build smarter QR experiences.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function DarkMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.05] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-white">
        {value}
      </p>
    </div>
  );
}

function FakeQRCode() {
  const cells = [
    '111111100101101111111',
    '100000101110101000001',
    '101110100010101011101',
    '101110101101101011101',
    '101110100111101011101',
    '100000101010101000001',
    '111111101010101111111',
    '000000001101100000000',
    '110111101011011011101',
    '001010010110100101010',
    '111001111001111010011',
    '010110001111001110100',
    '101101110010111001011',
    '000000001011101101100',
    '111111101110011010101',
    '100000100101101110011',
    '101110101111010001101',
    '101110100010111101010',
    '101110101101001011101',
    '100000101011110100011',
    '111111101101001111101',
  ];

  return (
    <div
      className="grid aspect-square w-52 bg-white"
      style={{
        gridTemplateColumns: `repeat(${cells[0].length}, minmax(0, 1fr))`,
      }}
      aria-label="QR code preview"
    >
      {cells.flatMap((row, rowIndex) =>
        row.split('').map((cell, columnIndex) => (
          <span
            key={`${rowIndex}-${columnIndex}`}
            className={
              cell === '1'
                ? 'bg-slate-950'
                : 'bg-white'
            }
          />
        ))
      )}
    </div>
  );
}