import {
  ArrowLeft,
  BarChart3,
  Check,
  Copy,
  Download,
  ExternalLink,
  Heart,
  MoreHorizontal,
  Pause,
  Play,
  QrCode,
  Share2,
  Trash2,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import { DashboardLayout } from '../components/DashboardLayout';
import { QRDisplay } from '../components/QRDisplay';
import { QRDownloadModal } from '../components/QRDownloadModal';
import { QRShareModal } from '../components/QRShareModal';
import { Modal } from '../components/Modal';
import {
  DEFAULT_QR_DESIGN,
  QR_TYPE_DEFINITIONS,
  type QRContent,
  type QRDesign,
  type QRType,
} from '../lib/qrTypes';

interface StoredQR {
  id: string;
  name: string;
  type: QRType;
  content: QRContent;
  design: QRDesign;
  createdAt: string;
  updatedAt: string;
}

interface DemoQR {
  id: string;
  name: string;
  type: QRType;
  content: QRContent;
  design: QRDesign;
  createdAt: string;
  updatedAt: string;
}

const demoQRs: DemoQR[] = [
  {
    id: 'demo-summer',
    name: 'Summer Campaign',
    type: 'dynamic',
    content: {
      type: 'dynamic',
      url: 'https://qrstudio.app/c/summer',
    },
    design: DEFAULT_QR_DESIGN,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-menu',
    name: 'Restaurant Menu',
    type: 'url',
    content: {
      type: 'url',
      url: 'https://example.com/menu',
    },
    design: DEFAULT_QR_DESIGN,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'demo-event',
    name: 'Product Launch',
    type: 'event',
    content: {
      type: 'event',
      title: 'Product Launch',
      description: 'Join us for the launch.',
      location: 'Hyderabad',
      startDate: '2026-10-15',
      startTime: '18:00',
    },
    design: DEFAULT_QR_DESIGN,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export function QRDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [qr, setQr] = useState<StoredQR | DemoQR | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'analytics' | 'settings'
  >('overview');

  const [showDownload, setShowDownload] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [paused, setPaused] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    try {
      const stored = JSON.parse(
        localStorage.getItem('qr-studio-codes') || '[]'
      ) as StoredQR[];

      const localQR = stored.find((item) => item.id === id);
      const demoQR = demoQRs.find((item) => item.id === id);

      if (mounted) {
        setQr(localQR || demoQR || null);
        setLoading(false);
      }
    } catch {
      if (mounted) {
        setQr(demoQRs.find((item) => item.id === id) || null);
        setLoading(false);
      }
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  const destination = useMemo(() => {
    if (!qr) return '';

    const content = qr.content as Record<string, unknown>;

    if (typeof content.url === 'string') {
      return content.url;
    }

    if (typeof content.text === 'string') {
      return content.text;
    }

    if (typeof content.phone === 'string') {
      return content.phone;
    }

    if (typeof content.email === 'string') {
      return content.email;
    }

    return '';
  }, [qr]);

  function handleDelete() {
    if (!qr) return;

    try {
      const stored = JSON.parse(
        localStorage.getItem('qr-studio-codes') || '[]'
      ) as StoredQR[];

      const filtered = stored.filter((item) => item.id !== qr.id);

      localStorage.setItem(
        'qr-studio-codes',
        JSON.stringify(filtered)
      );
    } catch {
      // Ignore local storage failures.
    }

    navigate('/my-qr-codes');
  }

  async function handleCopy() {
    if (!destination) return;

    try {
      await navigator.clipboard.writeText(destination);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      // Clipboard may be unavailable.
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (!qr) {
    return (
      <DashboardLayout>
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <QrCode size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
            QR code not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            This QR code may have been deleted or the link may be
            incorrect.
          </p>

          <Link
            to="/my-qr-codes"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            <ArrowLeft size={16} />
            Back to QR codes
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const definition = QR_TYPE_DEFINITIONS.find(
    (item) => item.type === qr.type
  );

  const scans = qr.id === 'demo-summer'
    ? 12840
    : qr.id === 'demo-menu'
      ? 8421
      : qr.id === 'demo-event'
        ? 5248
        : 0;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/my-qr-codes"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Back to QR codes"
            >
              <ArrowLeft size={17} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                  {qr.name}
                </h1>

                <span
                  className={[
                    'hidden rounded-full px-2.5 py-1 text-[10px] font-bold sm:inline-flex',
                    paused
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
                  ].join(' ')}
                >
                  {paused ? 'Paused' : 'Active'}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {definition?.label || qr.type} · Updated{' '}
                {formatDate(qr.updatedAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFavorite((value) => !value)}
              className={[
                'inline-flex h-10 w-10 items-center justify-center rounded-xl border transition',
                favorite
                  ? 'border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-900 dark:bg-rose-950/30'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
              ].join(' ')}
              aria-label={
                favorite ? 'Remove favorite' : 'Add favorite'
              }
            >
              <Heart
                size={17}
                fill={favorite ? 'currentColor' : 'none'}
              />
            </button>

            <button
              type="button"
              onClick={() => setShowShare(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Share2 size={15} />
              Share
            </button>

            <button
              type="button"
              onClick={() => setShowDownload(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
            >
              <Download size={15} />
              Download
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((value) => !value)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="More actions"
              >
                <MoreHorizontal size={18} />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-12 z-20 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => {
                      setPaused((value) => !value);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {paused ? (
                      <Play size={15} />
                    ) : (
                      <Pause size={15} />
                    )}
                    {paused ? 'Resume QR code' : 'Pause QR code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDelete(true);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <Trash2 size={15} />
                    Delete QR code
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'settings', label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(
                  tab.id as 'overview' | 'analytics' | 'settings'
                )
              }
              className={[
                'border-b-2 px-4 py-3 text-xs font-bold transition',
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    QR preview
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {definition?.label || 'QR code'}
                  </p>
                </div>

                <QrCode size={18} className="text-indigo-500" />
              </div>

              <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
                <QRDisplay
                  type={qr.type}
                  content={qr.content}
                  design={qr.design || DEFAULT_QR_DESIGN}
                />
              </div>

              {destination && (
                <div className="mt-4 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Destination
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {destination}
                    </p>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      aria-label="Copy destination"
                    >
                      {copied ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {destination.startsWith('http') && (
                <a
                  href={destination}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Open destination
                  <ExternalLink size={14} />
                </a>
              )}
            </section>

            <div className="space-y-6">
              <section className="grid gap-4 sm:grid-cols-3">
                <MetricCard
                  label="Total scans"
                  value={scans.toLocaleString()}
                  icon={BarChart3}
                />

                <MetricCard
                  label="Unique visitors"
                  value={Math.round(scans * 0.73).toLocaleString()}
                  icon={ExternalLink}
                />

                <MetricCard
                  label="Engagement"
                  value={scans ? '68.4%' : '—'}
                  icon={Check}
                />
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-950 dark:text-white">
                      Scan activity
                    </h2>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Performance over the last 30 days
                    </p>
                  </div>

                  <Link
                    to={`/analytics?qr=${qr.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400"
                  >
                    Full analytics
                    <ExternalLink size={13} />
                  </Link>
                </div>

                <div className="mt-7 flex h-52 items-end gap-1.5">
                  {[
                    30, 42, 35, 48, 45, 62, 54, 67, 58, 76, 70, 82,
                    78, 91, 86, 100,
                  ].map((height, index) => (
                    <div
                      key={index}
                      className="flex h-full flex-1 items-end"
                    >
                      <div
                        className="w-full rounded-t-md bg-indigo-500/80 transition hover:bg-indigo-600"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-between text-[10px] text-slate-400">
                  <span>Sep 1</span>
                  <span>Sep 8</span>
                  <span>Sep 15</span>
                  <span>Sep 22</span>
                  <span>Sep 29</span>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <h2 className="text-base font-bold text-slate-950 dark:text-white">
                  QR information
                </h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="QR type"
                    value={definition?.label || qr.type}
                  />

                  <InfoItem
                    label="Created"
                    value={formatDate(qr.createdAt)}
                  />

                  <InfoItem
                    label="Last updated"
                    value={formatDate(qr.updatedAt)}
                  />

                  <InfoItem
                    label="Status"
                    value={paused ? 'Paused' : 'Active'}
                  />
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <BarChart3 size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-950 dark:text-white">
                  Detailed analytics
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track scans, devices, locations and time patterns.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Scans"
                value={scans.toLocaleString()}
                icon={BarChart3}
              />

              <MetricCard
                label="Unique"
                value={Math.round(scans * 0.73).toLocaleString()}
                icon={ExternalLink}
              />

              <MetricCard
                label="Mobile"
                value="82%"
                icon={QrCode}
              />

              <MetricCard
                label="Returning"
                value="24%"
                icon={Check}
              />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <BreakdownCard
                title="Top devices"
                items={[
                  ['iPhone', 42],
                  ['Android', 38],
                  ['Desktop', 13],
                  ['Tablet', 7],
                ]}
              />

              <BreakdownCard
                title="Top locations"
                items={[
                  ['Hyderabad', 34],
                  ['Bengaluru', 21],
                  ['Mumbai', 16],
                  ['Delhi', 11],
                ]}
              />
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              QR settings
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Manage the behavior and status of this QR code.
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {paused ? (
                      <Play size={16} />
                    ) : (
                      <Pause size={16} />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {paused ? 'Resume QR code' : 'Pause QR code'}
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {paused
                        ? 'Allow this QR code to become active again.'
                        : 'Temporarily stop this QR code from being used.'}
                    </p>
                  </div>
                </div>

                <span
                  className={[
                    'rounded-full px-2.5 py-1 text-[10px] font-bold',
                    paused
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
                  ].join(' ')}
                >
                  {paused ? 'Paused' : 'Active'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowDelete(true)}
                className="flex w-full items-center gap-3 rounded-2xl border border-red-100 p-4 text-left transition hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/20"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  <Trash2 size={16} />
                </div>

                <div>
                  <p className="text-sm font-bold text-red-700 dark:text-red-400">
                    Delete QR code
                  </p>

                  <p className="mt-1 text-xs text-red-600/70 dark:text-red-400/70">
                    Permanently remove this QR code from your library.
                  </p>
                </div>
              </button>
            </div>
          </section>
        )}
      </div>

      <QRDownloadModal
        open={showDownload}
        onClose={() => setShowDownload(false)}
        type={qr.type}
        content={qr.content}
        design={qr.design || DEFAULT_QR_DESIGN}
        name={qr.name}
      />

      <QRShareModal
        open={showShare}
        onClose={() => setShowShare(false)}
        title={qr.name}
        url={destination || window.location.href}
      />

      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete QR code?"
        description="This action cannot be undone."
        size="sm"
      >
        <div className="space-y-5">
          <div className="rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700 dark:bg-red-950/30 dark:text-red-300">
            You are about to permanently delete{' '}
            <strong>{qr.name}</strong>.
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setShowDelete(false)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700"
            >
              Delete permanently
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
        <Icon size={16} />
      </div>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

function BreakdownCard({
  title,
  items,
}: {
  title: string;
  items: [string, number][];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      <div className="mt-4 space-y-4">
        {items.map(([label, percentage]) => (
          <div key={label}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {label}
              </span>

              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {percentage}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}