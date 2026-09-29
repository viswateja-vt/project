import {
  Activity,
  ArrowRight,
  BarChart3,
  Clock3,
  ExternalLink,
  Eye,
  FolderOpen,
  Plus,
  QrCode,
  ScanLine,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { DashboardLayout } from '../components/DashboardLayout';
import { EmptyState } from '../components/EmptyState';

interface RecentQR {
  id: string;
  name: string;
  type: string;
  scans: number;
  status: 'Active' | 'Paused';
  updated: string;
}

const recentQRs: RecentQR[] = [
  {
    id: 'demo-summer',
    name: 'Summer Campaign',
    type: 'Dynamic URL',
    scans: 12840,
    status: 'Active',
    updated: 'Today',
  },
  {
    id: 'demo-menu',
    name: 'Restaurant Menu',
    type: 'URL',
    scans: 8421,
    status: 'Active',
    updated: 'Yesterday',
  },
  {
    id: 'demo-event',
    name: 'Product Launch',
    type: 'Event',
    scans: 5248,
    status: 'Active',
    updated: '2 days ago',
  },
  {
    id: 'demo-contact',
    name: 'Business Card',
    type: 'vCard',
    scans: 1268,
    status: 'Paused',
    updated: '5 days ago',
  },
];

export function DashboardPage() {
  const hasDemoData = true;

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Overview
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Your QR workspace
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Create, manage and measure every QR campaign from one
              place.
            </p>
          </div>

          <Link
            to="/create"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            <Plus size={17} />
            Create QR code
          </Link>
        </section>

        {!hasDemoData ? (
          <EmptyState
            title="Create your first QR code"
            description="Build a beautiful QR code for a website, Wi-Fi network, contact card, event, payment, social profile and more."
            actionLabel="Create QR code"
            onAction={() => {
              window.location.href = '/create';
            }}
          />
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={QrCode}
                label="Total QR codes"
                value="24"
                change="+6 this month"
              />

              <StatCard
                icon={ScanLine}
                label="Total scans"
                value="27.8K"
                change="+18.4% this month"
              />

              <StatCard
                icon={Users}
                label="Unique scanners"
                value="19.2K"
                change="+12.7% this month"
              />

              <StatCard
                icon={TrendingUp}
                label="Avg. scan rate"
                value="68.4%"
                change="+4.2% this month"
              />
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-950 dark:text-white">
                        Scan activity
                      </h2>

                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Live
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      QR scans across your active codes
                    </p>
                  </div>

                  <Link
                    to="/analytics"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    View analytics
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="mt-8 flex h-64 items-end gap-2">
                  {[
                    28, 38, 31, 46, 42, 54, 48, 61, 58, 72, 65, 78, 74,
                    86, 79, 92, 88, 100,
                  ].map((height, index) => (
                    <div
                      key={index}
                      className="group relative flex h-full flex-1 items-end"
                    >
                      <div
                        className="w-full rounded-t-lg bg-indigo-500/80 transition group-hover:bg-indigo-600"
                        style={{
                          height: `${height}%`,
                        }}
                      />

                      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white shadow-xl group-hover:block">
                        {Math.round(height * 12.4)} scans
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-between text-[10px] font-medium text-slate-400">
                  <span>Sep 12</span>
                  <span>Sep 16</span>
                  <span>Sep 20</span>
                  <span>Sep 24</span>
                  <span>Sep 29</span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-950 dark:text-white">
                      Quick insights
                    </h2>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Last 30 days
                    </p>
                  </div>

                  <Activity
                    size={19}
                    className="text-indigo-500"
                  />
                </div>

                <div className="mt-6 space-y-5">
                  <InsightRow
                    icon={Eye}
                    label="Most scanned"
                    value="Summer Campaign"
                    detail="12,840 scans"
                  />

                  <InsightRow
                    icon={Clock3}
                    label="Peak time"
                    value="12:00 – 14:00"
                    detail="32% of scans"
                  />

                  <InsightRow
                    icon={ExternalLink}
                    label="Top destination"
                    value="qrstudio.app"
                    detail="67% engagement"
                  />

                  <InsightRow
                    icon={BarChart3}
                    label="Growth"
                    value="+18.4%"
                    detail="vs. previous period"
                  />
                </div>

                <Link
                  to="/analytics"
                  className="mt-7 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Explore full analytics
                  <ArrowRight size={14} />
                </Link>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center dark:border-slate-800 sm:px-6">
                <div>
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">
                    Recent QR codes
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Your latest created and updated QR codes
                  </p>
                </div>

                <Link
                  to="/my-qr-codes"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  View all
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentQRs.map((qr) => (
                  <Link
                    key={qr.id}
                    to={`/qr/${qr.id}`}
                    className="flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:px-6 dark:hover:bg-slate-950"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <QrCode size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {qr.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {qr.type} · Updated {qr.updated}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {qr.scans.toLocaleString()}
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">
                          scans
                        </p>
                      </div>

                      <span
                        className={[
                          'rounded-full px-2.5 py-1 text-[10px] font-bold',
                          qr.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
                        ].join(' ')}
                      >
                        {qr.status}
                      </span>

                      <ArrowRight
                        size={16}
                        className="text-slate-400"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-600/10 sm:p-8">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-200">
                    Build something new
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight">
                    Turn any destination into a polished QR experience.
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-indigo-100">
                    Choose from URLs, contact cards, Wi-Fi, payments,
                    social profiles, events, coupons, multi-links and
                    more.
                  </p>
                </div>

                <Link
                  to="/create"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
                >
                  <Plus size={17} />
                  Create QR code
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  change,
}: {
  icon: typeof QrCode;
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Icon size={19} />
        </div>

        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          {change}
        </span>
      </div>

      <p className="mt-5 text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function InsightRow({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">
          {value}
        </p>

        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {detail}
        </p>
      </div>
    </div>
  );
}