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

export function MyQRCodePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialType = getValidQRType(searchParams.get('type'));

  const [step, setStep] = useState(1);
  const [qrType, setQrType] = useState<QRType>(initialType);
  const [content, setContent] = useState<QRContent>(
    getDefaultContent(initialType),
  );
  const [design, setDesign] = useState<QRDesign>(DEFAULT_QR_DESIGN);
  const [name, setName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const typeDefinition = useMemo(
    () => QR_TYPE_DEFINITIONS.find((item) => item.type === qrType),
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
    const now = new Date().toISOString();

    const qrId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`;

    const record: QRRecord = {
      id: qrId,
      name: name.trim() || typeDefinition?.label || 'Untitled QR code',
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

      localStorage.setItem(
        'qr-studio-codes',
        JSON.stringify([record, ...existing]),
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
            <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
              Create QR code
            </h1>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <StepIndicator
              number={1}
              label="Content"
              active={step === 1}
              complete={step > 1}
            />

            <StepLine active={step > 1} />

            <StepIndicator
              number={2}
              label="Design"
              active={step === 2}
              complete={step > 2}
            />

            <StepLine active={step > 2} />

            <StepIndicator
              number={3}
              label="Save"
              active={step === 3}
              complete={isSaved}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <QrCode size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-950 dark:text-white">
                      Choose your QR type
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Select what you want people to see after scanning.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {QR_TYPE_DEFINITIONS.map((definition) => {
                  const selected = definition.type === qrType;

                  return (
                    <button
                      key={definition.type}
                      type="button"
                      onClick={() => handleTypeChange(definition.type)}
                      className={[
                        'group rounded-2xl border p-3 text-left transition',
                        selected
                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/10 dark:border-indigo-400 dark:bg-indigo-950/30'
                          : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900 dark:hover:bg-slate-800',
                      ].join(' ')}
                    >
                      <div
                        className={[
                          'mb-3 flex h-9 w-9 items-center justify-center rounded-xl transition',
                          selected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-indigo-950/40 dark:group-hover:text-indigo-400',
                        ].join(' ')}
                      >
                        <QrCode size={17} />
                      </div>

                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {definition.label}
                      </p>

                      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500 dark:text-slate-400">
                        {definition.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-7 border-t border-slate-100 pt-7 dark:border-slate-800">
                <ContentForm
                  type={qrType}
                  content={content}
                  onChange={setContent}
                />
              </div>

              <div className="mt-7 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  Continue to design
                  <ChevronRight size={17} />
                </button>
              </div>
            </section>

            <PreviewCard
              qrType={qrType}
              content={content}
              design={design}
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <Sparkles size={18} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">
                    Customize your QR code
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Match your QR code to your brand and campaign.
                  </p>
                </div>
              </div>

              <QRDesigner
                design={design}
                onChange={setDesign}
              />

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  Continue to save
                  <ChevronRight size={17} />
                </button>
              </div>
            </section>

            <PreviewCard
              qrType={qrType}
              content={content}
              design={design}
            />
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Almost done
                </p>

                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">
                  Name and save your QR code
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Give this QR code a recognizable name so you can find and
                  manage it later.
                </p>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  QR code name
                </span>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={typeDefinition?.label || 'My QR code'}
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400">
                    <QrCode size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {typeDefinition?.label || 'QR code'}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Your design and content will be stored with this QR
                      code.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSaved}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaved}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaved ? (
                    <>
                      <Check size={17} />
                      Saved
                    </>
                  ) : (
                    <>
                      <Check size={17} />
                      Save QR code
                    </>
                  )}
                </button>
              </div>
            </section>

            <PreviewCard
              qrType={qrType}
              content={content}
              design={design}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function PreviewCard({
  qrType,
  content,
  design,
}: {
  qrType: QRType;
  content: QRContent;
  design: QRDesign;
}) {
  const definition = QR_TYPE_DEFINITIONS.find(
    (item) => item.type === qrType,
  );

  return (
    <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Live preview
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
            {definition?.label || 'QR code'}
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          Live
        </span>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
        <QRDisplay
          type={qrType}
          content={content}
          design={design}
        />
      </div>
    </aside>
  );
}

function StepIndicator({
  number,
  label,
  active,
  complete,
}: {
  number: number;
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={[
          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition',
          active
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
            : complete
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-100 text-slate-400 dark:bg-slate-800',
        ].join(' ')}
      >
        {complete ? <Check size={14} /> : number}
      </div>

      <span
        className={[
          'hidden text-xs font-bold sm:block',
          active ? 'text-slate-900 dark:text-white' : 'text-slate-400',
        ].join(' ')}
      >
        {label}
      </span>
    </div>
  );
}

function StepLine({ active }: { active: boolean }) {
  return (
    <div
      className={[
        'mx-2 h-px flex-1 transition',
        active ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800',
      ].join(' ')}
    />
  );
}

function getValidQRType(value: string | null): QRType {
  const match = QR_TYPE_DEFINITIONS.find(
    (definition) => definition.type === value,
  );

  return match?.type || 'url';
}

