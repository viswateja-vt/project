import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  Globe2,
  MonitorSmartphone,
  QrCode,
  ScanLine,
  Smartphone,
  Tablet,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

import { DashboardLayout } from '../components/DashboardLayout';
import {
  QR_TYPE_DEFINITIONS,
  type QRRecord,
  type QRType,
} from '../lib/qrTypes';

type Period = '7d' | '30d' | '90d' | '12m';

interface ScanEvent {
  id: string;
  qrId: string;
  scannedAt: string;
  device?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  country?: string;
  city?: string;
  referrer?: string;
}

interface ChartPoint {
  label: string;
  scans: number;
}

interface BreakdownItem {
  label: string;
  value: number;
  icon?: typeof Smartphone;
}

const QR_STORAGE_KEY = 'qr-studio-codes';

export function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  const qrCodes = useMemo(() => getStoredQRCodes(), []);
  const [scanEvents, setScanEvents] = useState<ScanEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadScanEvents() {
      const { data, error } = await supabase
        .from('qr_scans')
        .select(
          'id, qr_id, scanned_at, device, browser, country, city, referrer',
        )
        .order('scanned_at', { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error('Failed to load analytics scan events:', error);
        setScanEvents([]);
      } else {
        setScanEvents(
          (data ?? []).map((event) => ({
            id: event.id,
            qrId: event.qr_id,
            scannedAt: event.scanned_at,
            device: normalizeDevice(event.device),
            browser: event.browser ?? undefined,
            country: event.country ?? undefined,
            city: event.city ?? undefined,
            referrer: event.referrer ?? undefined,
          })),
        );
      }

      setLoading(false);
    }

    loadScanEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  const now = Date.now();

  const periodStart = useMemo(
    () => getPeriodStart(period, now),
    [period, now],
  );

  const selectedEvents = useMemo(
    () =>
      scanEvents.filter((event) => {
        const timestamp = new Date(event.scannedAt).getTime();

        return (
          Number.isFinite(timestamp) &&
          timestamp >= periodStart &&
          timestamp <= now
        );
      }),
    [scanEvents, periodStart, now],
  );

  const totalScans = selectedEvents.length;

  const activeQRCodes = qrCodes.filter(
    (qr) => qr.status !== 'archived' && !qr.isArchived,
  ).length;

  const countriesReached = new Set(
    selectedEvents
      .map((event) => event.country?.trim())
      .filter(Boolean),
  ).size;

  const chartData = useMemo(
    () => buildChartData(selectedEvents, period, now),
    [selectedEvents, period, now],
  );

  const previousPeriodStart = getPreviousPeriodStart(period, periodStart);
  const previousPeriodEvents = scanEvents.filter((event) => {
    const timestamp = new Date(event.scannedAt).getTime();

    return (
      Number.isFinite(timestamp) &&
      timestamp >= previousPeriodStart &&
      timestamp < periodStart
    );
  });

  const scanChange = calculatePercentageChange(
    previousPeriodEvents.length,
    selectedEvents.length,
  );

  const deviceBreakdown = useMemo(
    () => buildDeviceBreakdown(selectedEvents),
    [selectedEvents],
  );

  const countryBreakdown = useMemo(
    () => buildCountryBreakdown(selectedEvents),
    [selectedEvents],
  );

  const qrPerformance = useMemo(
    () => buildQRPerformance(qrCodes, scanEvents, selectedEvents),
    [qrCodes, selectedEvents],
  );

  const maxValue = Math.max(
    1,
    ...chartData.map((item) => item.scans),
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Performance
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Real scan activity from your QR codes. No estimated or
              fabricated analytics are displayed.
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPeriodMenu((value) => !value)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <CalendarDays size={15} />
              {getPeriodLabel(period)}
              <ChevronDown size={14} />
            </button>

            {showPeriodMenu && (
              <div className="absolute right-0 top-12 z-20 w-40 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                {(
                  [
                    ['7d', 'Last 7 days'],
                    ['30d', 'Last 30 days'],
                    ['90d', 'Last 90 days'],
                    ['12m', 'Last 12 months'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setPeriod(value);
                      setShowPeriodMenu(false);
                    }}
                    className={[
                      'w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition',
                      period === value
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AnalyticsStat
            icon={ScanLine}
            label={`Scans · ${getPeriodLabel(period)}`}
            value={loading ? '—' : totalScans.toLocaleString()}
            change={
              previousPeriodEvents.length === 0 && totalScans > 0
                ? 'No previous data'
                : formatPercentageChange(scanChange)
            }
            positive={scanChange >= 0}
          />

          <AnalyticsStat
            icon={QrCode}
            label="Active QR codes"
            value={activeQRCodes.toLocaleString()}
            change={`${qrCodes.length.toLocaleString()} total`}
            positive
          />

          <AnalyticsStat
            icon={Globe2}
            label="Countries reached"
            value={countriesReached.toLocaleString()}
            change={
              countriesReached === 0
                ? 'No location data'
                : 'From recorded scans'
            }
            positive={countriesReached > 0}
          />

          <AnalyticsStat
            icon={TrendingUp}
            label="Recorded scan events"
            value={loading ? '—' : scanEvents.length.toLocaleString()}
            change="Actual events only"
            positive
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-950 dark:text-white">
                  Scan volume
                </h2>

                {totalScans > 0 && (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {totalScans.toLocaleString()} real scans
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {getPeriodLabel(period)} across recorded scan events
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Scans
            </div>
          </div>

          {totalScans === 0 ? (
            <EmptyAnalyticsState
              title="No scan data yet"
              description="Once someone scans one of your QR codes, the real scan event will appear here."
            />
          ) : (
            <>
              <div className="mt-8 flex h-72 gap-3">
                <div className="flex flex-col justify-between pb-5 text-right text-[10px] text-slate-400">
                  <span>{formatCompact(maxValue)}</span>
                  <span>{formatCompact(maxValue * 0.75)}</span>
                  <span>{formatCompact(maxValue * 0.5)}</span>
                  <span>{formatCompact(maxValue * 0.25)}</span>
                  <span>0</span>
                </div>

                <div className="relative flex flex-1 items-end gap-2 overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map((line) => (
                      <div
                        key={line}
                        className="border-t border-dashed border-slate-100 dark:border-slate-800"
                      />
                    ))}
                  </div>

                  {chartData.map((point) => {
                    const height = Math.max(
                      4,
                      (point.scans / maxValue) * 100,
                    );

                    return (
                      <div
                        key={point.label}
                        className="group relative flex h-full flex-1 items-end"
                      >
                        <div
                          className="relative z-10 w-full rounded-t-lg bg-indigo-500 transition-all duration-300 group-hover:bg-indigo-600"
                          style={{ height: `${height}%` }}
                        >
                          <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2 py-1 text-[10px] font-bold text-white shadow-xl group-hover:block">
                            {point.scans.toLocaleString()} scans
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ml-10 mt-3 flex justify-between gap-2 text-[10px] text-slate-400">
                {chartData.map((point) => (
                  <span
                    key={point.label}
                    className="min-w-0 flex-1 truncate text-center"
                  >
                    {point.label}
                  </span>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <BreakdownSection
            title="Devices"
            icon={MonitorSmartphone}
            items={deviceBreakdown}
            emptyMessage="Device information will appear when real scan events include device data."
          />

          <BreakdownSection
            title="Top countries"
            icon={Globe2}
            items={countryBreakdown}
            emptyMessage="Country information will appear when real scan events include location data."
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
            <div>
              <h2 className="text-base font-bold text-slate-950 dark:text-white">
                QR performance
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Actual scan events grouped by QR code.
              </p>
            </div>

            <BarChart3 size={18} className="text-indigo-500" />
          </div>

          {qrPerformance.length === 0 ? (
            <EmptyAnalyticsState
              title="No QR codes yet"
              description="Create a QR code and its real scan activity will appear here."
              compact
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {qrPerformance.map((qr, index) => (
                <div
                  key={qr.id}
                  className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:px-6"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <span className="text-xs font-black">
                        {index + 1}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {qr.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {qr.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-8 sm:justify-end">
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {qr.scans.toLocaleString()}
                      </p>

                      <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">
                        scans
                      </p>
                    </div>

                    <div className="text-right text-[10px] text-slate-400">
                      {qr.periodScans.toLocaleString()} in period
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-950 dark:bg-indigo-950/20 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <TrendingUp size={19} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                {totalScans.toLocaleString()} real scans in the selected period
              </h2>

              <p className="mt-1 text-xs leading-5 text-indigo-800/70 dark:text-indigo-300/70">
                Analytics are calculated only from scan events actually
                recorded by QR Studio.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function AnalyticsStat({
  icon: Icon,
  label,
  value,
  change,
  positive,
}: {
  icon: typeof ScanLine;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
          <Icon size={18} />
        </div>

        {change && (
          <span
            className={[
              'max-w-[150px] rounded-full px-2 py-1 text-right text-[10px] font-bold',
              positive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
            ].join(' ')}
          >
            {change}
          </span>
        )}
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

function BreakdownSection({
  title,
  icon: Icon,
  items,
  emptyMessage,
}: {
  title: string;
  icon: typeof Globe2;
  items: BreakdownItem[];
  emptyMessage: string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Icon size={17} />
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-950 dark:text-white">
            {title}
          </h2>

          <p className="text-[10px] text-slate-400">
            Share of recorded scans
          </p>
        </div>
      </div>

      {items.length === 0 || total === 0 ? (
        <div className="mt-6 rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => {
            const ItemIcon = item.icon;
            const percentage = (item.value / total) * 100;

            return (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {ItemIcon && (
                      <ItemIcon
                        size={13}
                        className="shrink-0 text-slate-400"
                      />
                    )}

                    <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {percentage.toFixed(1)}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function EmptyAnalyticsState({
  title,
  description,
  compact = false,
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center',
        compact ? 'px-5 py-10' : 'min-h-72 px-6',
      ].join(' ')}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <ScanLine size={20} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function normalizeDevice(
  device?: string | null,
): ScanEvent['device'] {
  if (!device) return undefined;

  const value = device.toLowerCase();

  if (value === 'mobile') return 'mobile';
  if (value === 'tablet') return 'tablet';
  if (value === 'desktop') return 'desktop';

  return undefined;
}

function getStoredQRCodes(): QRRecord[] {
  try {
    const raw = localStorage.getItem(QR_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isQRRecord);
  } catch {
    return [];
  }
}

function buildChartData(
  events: ScanEvent[],
  period: Period,
  now: number,
): ChartPoint[] {
  const buckets = getChartBuckets(period, now);

  return buckets.map((bucket) => ({
    label: bucket.label,
    scans: events.filter((event) => {
      const timestamp = new Date(event.scannedAt).getTime();
      return timestamp >= bucket.start && timestamp < bucket.end;
    }).length,
  }));
}

function getChartBuckets(
  period: Period,
  now: number,
): Array<{ label: string; start: number; end: number }> {
  const date = new Date(now);

  if (period === '12m') {
    return Array.from({ length: 12 }, (_, index) => {
      const start = new Date(
        date.getFullYear(),
        date.getMonth() - (11 - index),
        1,
      );
      const end = new Date(
        start.getFullYear(),
        start.getMonth() + 1,
        1,
      );

      return {
        label: start.toLocaleDateString(undefined, {
          month: 'short',
        }),
        start: start.getTime(),
        end: end.getTime(),
      };
    });
  }

  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const bucketCount = period === '7d' ? 7 : period === '30d' ? 10 : 13;
  const bucketSize = Math.ceil(days / bucketCount);

  return Array.from({ length: bucketCount }, (_, index) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    end.setDate(end.getDate() - (bucketCount - 1 - index) * bucketSize);

    const start = new Date(end);
    start.setDate(start.getDate() - bucketSize + 1);
    start.setHours(0, 0, 0, 0);

    return {
      label:
        period === '7d'
          ? start.toLocaleDateString(undefined, {
              weekday: 'short',
            })
          : start.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            }),
      start: start.getTime(),
      end: end.getTime() + 1,
    };
  });
}

function buildDeviceBreakdown(
  events: ScanEvent[],
): BreakdownItem[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    if (!event.device) continue;
    counts.set(
      event.device,
      (counts.get(event.device) ?? 0) + 1,
    );
  }

  return Array.from(counts.entries())
    .map(([label, value]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value,
      icon:
        label === 'mobile'
          ? Smartphone
          : label === 'tablet'
            ? Tablet
            : MonitorSmartphone,
    }))
    .sort((a, b) => b.value - a.value);
}

function buildCountryBreakdown(
  events: ScanEvent[],
): BreakdownItem[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    const country = event.country?.trim();
    if (!country) continue;

    counts.set(country, (counts.get(country) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function buildQRPerformance(
  qrCodes: QRRecord[],
  allEvents: ScanEvent[],
  periodEvents: ScanEvent[],
) {
  return qrCodes.map((qr) => {
    const totalScans = allEvents.filter(
      (event) => event.qrId === qr.id,
    ).length;

    const periodScans = periodEvents.filter(
      (event) => event.qrId === qr.id,
    ).length;

    return {
      id: qr.id,
      name: qr.name,
      type: qr.type,
      scans: totalScans,
      periodScans,
    };
  });
}

function getPeriodStart(
  period: Period,
  now: number,
): number {
  const date = new Date(now);

  if (period === '7d') {
    date.setDate(date.getDate() - 7);
  } else if (period === '30d') {
    date.setDate(date.getDate() - 30);
  } else if (period === '90d') {
    date.setDate(date.getDate() - 90);
  } else {
    date.setFullYear(date.getFullYear() - 1);
  }

  return date.getTime();
}

function getPreviousPeriodStart(
  period: Period,
  periodStart: number,
): number {
  const start = new Date(periodStart);

  if (period === '7d') {
    start.setDate(start.getDate() - 7);
  } else if (period === '30d') {
    start.setDate(start.getDate() - 30);
  } else if (period === '90d') {
    start.setDate(start.getDate() - 90);
  } else {
    start.setFullYear(start.getFullYear() - 1);
  }

  return start.getTime();
}

function calculatePercentageChange(
  previous: number,
  current: number,
): number {
  if (previous === 0) {
    return 0;
  }

  return ((current - previous) / previous) * 100;
}

function formatPercentageChange(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }

  const rounded = Math.round(value * 10) / 10;

  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

function getPeriodLabel(period: Period): string {
  switch (period) {
    case '7d':
      return 'Last 7 days';
    case '30d':
      return 'Last 30 days';
    case '90d':
      return 'Last 90 days';
    case '12m':
      return 'Last 12 months';
  }
}

function formatCompact(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return Math.round(value).toString();
}

function isQRRecord(value: unknown): value is QRRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Partial<QRRecord>;

  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    typeof record.type === 'string'
  );
}
