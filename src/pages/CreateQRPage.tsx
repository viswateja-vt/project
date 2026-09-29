import {
  ArrowLeft,
  Check,
  ChevronRight,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ContentForm } from '../components/ContentForm';
import { DashboardLayout } from '../components/DashboardLayout';
import { QRDesigner } from '../components/QRDesigner';
import { QRDisplay } from '../components/QRDisplay';
import {
  DEFAULT_QR_DESIGN,
  getDefaultContent,
  QR_TYPE_DEFINITIONS,
  type QRContent,
  type QRDesign,
  type QRRecord,
  type QRType,
} from '../lib/qrTypes';

function createQRId(): string {
  if (
    typeof crypto !== 'undefined' &&
    'randomUUID' in crypto
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function getValidQRType(value: string | null): QRType {
  const match = QR_TYPE_DEFINITIONS.find(
    (item) => item.type === value,
  );

  return match?.type ?? 'url';
}

export function CreateQRPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialType = getValidQRType(
    searchParams.get('type'),
  );

  const [step, setStep] = useState(1);
  const [qrType, setQrType] = useState<QRType>(initialType);
  const [content, setContent] = useState<QRContent>(
    getDefaultContent(initialType),
  );
  const [design, setDesign] =
    useState<QRDesign>(DEFAULT_QR_DESIGN);
  const [name, setName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const [qrId] = useState<string>(() => createQRId());

  const typeDefinition = useMemo(
    () =>
      QR_TYPE_DEFINITIONS.find(
        (item) => item.type === qrType,
      ),
    [qrType],
  );

  function handleTypeChange(type: QRType) {
    setQrType(type);
    setContent(getDefaultContent(type));
    setIsSaved(false);
  }

  function handleNext() {
    setStep((current) => Math.min(current + 1, 3));
  }

  function handleBack() {
    setStep((current) => Math.max(current - 1, 1));
  }

  function handleSave() {
    if (isSaved) {
      return;
    }

    const now = new Date().toISOString();

    const record: QRRecord = {
      id: qrId,
      name:
        name.trim() ||
        typeDefinition?.label ||
        'Untitled QR code',
      type: qrType,
      content,
      userId: 'local-user',
      status: 'active',
      scans: 0,
      favorite: false,
      isFavorite: false,
      tags: [],
      design,
      createdAt: now,
      updatedAt: now,
      isDynamic:
        qrType === 'dynamic' ||
        qrType === 'multi-link' ||
        qrType === 'app',
      isPaused: false,
      isArchived: false,
    };

    try {
      const existing = JSON.parse(
        localStorage.getItem('qr-studio-codes') || '[]',
      ) as QRRecord[];

      const withoutCurrent = existing.filter(
        (item) => item.id !== qrId,
      );

      localStorage.setItem(
        'qr-studio-codes',
        JSON.stringify([
          record,
          ...withoutCurrent,
        ]),
      );
    } catch {
      // Keep the UI usable if localStorage is unavailable.
    }

    setIsSaved(true);

    window.setTimeout(() => {
      navigate(`/qr/${qrId}`);
    }, 500);
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={17} />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              QR Studio
            </p>

            <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
              Create QR code
            </h1>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {[1, 2, 3].map((item) => {
            const completed = item < step;
            const active = item === step;

            return (
              <div
                key={item}
                className="flex items-center gap-2 sm:gap-3"
              >
                <div
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition',
                    completed
                      ? 'bg-indigo-600 text-white'
                      : active
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                  ].join(' ')}
                >
                  {completed ? (
                    <Check size={16} />
                  ) : (
                    item
                  )}
                </div>

                <span
                  className={[
                    'hidden text-sm font-semibold sm:block',
                    active || completed
                      ? 'text-slate-950 dark:text-white'
                      : 'text-slate-400',
                  ].join(' ')}
                >
                  {item === 1
                    ? 'Content'
                    : item === 2
                      ? 'Design'
                      : 'Finish'}
                </span>

                {item < 3 && (
                  <ChevronRight
                    size={16}
                    className="text-slate-300 dark:text-slate-700"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Main workspace */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            {/* Step 1 */}
            {step === 1 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
                <div className="mb-6">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    <QrCode size={22} />
                  </div>

                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                    Choose your QR type
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Select what you want people to access when they scan.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {QR_TYPE_DEFINITIONS.map((item) => {
                    const selected = item.type === qrType;

                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() =>
                          handleTypeChange(item.type)
                        }
                        className={[
                          'group rounded-2xl border p-4 text-left transition',
                          selected
                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-indigo-950/30'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800',
                        ].join(' ')}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-950 dark:text-white">
                              {item.label}
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                              {item.description}
                            </p>
                          </div>

                          {selected && (
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                              <Check size={14} />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Content */}
            {step === 1 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    {typeDefinition?.label || 'QR content'}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Enter the information your QR code should contain.
                  </p>
                </div>

                <ContentForm
                  type={qrType}
                  content={content}
                  onChange={setContent}
                />
              </section>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
                <div className="mb-6">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                    <Sparkles size={22} />
                  </div>

                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                    Customize your QR
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Adjust colors, patterns, eyes, logo and other visual settings.
                  </p>
                </div>

                <QRDesigner
                  design={design}
                  onChange={setDesign}
                />
              </section>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
                <div className="mb-6">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <Check size={22} />
                  </div>

                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                    Finish your QR code
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Give your QR code a name so you can find it later.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="qr-name"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    QR code name
                  </label>

                  <input
                    id="qr-name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder={
                      typeDefinition?.label ||
                      'My QR code'
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    You can change this name later.
                  </p>
                </div>

                <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                  <div className="flex gap-3">
                    <QrCode
                      size={20}
                      className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
                    />

                    <div>
                      <p className="text-sm font-semibold text-indigo-950 dark:text-indigo-200">
                        Scan tracking enabled
                      </p>

                      <p className="mt-1 text-xs leading-5 text-indigo-700 dark:text-indigo-300">
                        Your saved QR uses a QR Studio tracking URL so real redirects can be recorded in Analytics.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Back
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Continue
                  <ChevronRight size={17} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaved}
                  className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaved ? (
                    <>
                      <Check size={17} />
                      Saved
                    </>
                  ) : (
                    <>
                      <QrCode size={17} />
                      Save QR code
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Live preview */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-950 dark:text-white">
                      Live preview
                    </h2>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Your QR updates as you edit it.
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    Live
                  </div>
                </div>
              </div>

              <div className="p-6">
                <QRDisplay
                  qrId={qrId}
                  type={qrType}
                  content={content}
                  design={design}
                  size={280}
                  showActions={false}
                  showSafetyWarning
                />
              </div>

              <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Scan tracking is connected to this QR code. A scan is counted only when the tracking redirect is opened.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CreateQRPage;
