import {
  AlertTriangle,
  Download,
  ExternalLink,
  Loader2,
  Maximize2,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type {
  QRContent,
  QRDesign,
  QRType,
} from '../lib/qrTypes';
import {
  generateQRCodeDataURL,
  getQRText,
} from '../lib/qrEngine';

interface QRDisplayProps {
  qrId?: string;
  type: QRType;
  content: QRContent;
  design: QRDesign;
  size?: number;
  showActions?: boolean;
  showSafetyWarning?: boolean;
  className?: string;
}

function getTrackingUrl(qrId: string): string {
  if (typeof window === 'undefined') {
    return `/r/${encodeURIComponent(qrId)}`;
  }

  return `${window.location.origin}/r/${encodeURIComponent(qrId)}`;
}

export function QRDisplay({
  qrId,
  type,
  content,
  design,
  size = 280,
  showActions = false,
  showSafetyWarning = true,
  className = '',
}: QRDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const qrText = useMemo(() => {
    if (qrId) {
      return getTrackingUrl(qrId);
    }

    return getQRText(type, content);
  }, [qrId, type, content]);

  const safetyWarning = getSafetyWarning(type, content);

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      setLoading(true);
      setError(null);

      try {
        const result = await generateQRCodeDataURL({
          type: 'text',
          content: {
            text: qrText,
          },
          design,
        });

        if (!cancelled) {
          setDataUrl(result);
        }
      } catch (generationError) {
        if (!cancelled) {
          setDataUrl(null);
          setError(
            generationError instanceof Error
              ? generationError.message
              : 'Unable to generate QR code.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void generate();

    return () => {
      cancelled = true;
    };
  }, [qrText, design]);

  function handleDownload() {
    if (!dataUrl) {
      return;
    }

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function handleOpenTrackingLink() {
    if (!qrId) {
      return;
    }

    window.open(
      getTrackingUrl(qrId),
      '_blank',
      'noopener,noreferrer',
    );
  }

  return (
    <>
      <div
        className={[
          'flex flex-col items-center',
          className,
        ].join(' ')}
      >
        <div className="relative">
          <div
            className="relative flex items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5 dark:border-slate-700 dark:bg-white"
            style={{
              width: size + 40,
              minHeight: size + 40,
              maxWidth: '100%',
            }}
          >
            {loading && (
              <div
                className="flex items-center justify-center"
                style={{
                  width: size,
                  height: size,
                }}
              >
                <Loader2
                  size={32}
                  className="animate-spin text-indigo-600"
                />
              </div>
            )}

            {!loading && error && (
              <div
                className="flex max-w-[240px] flex-col items-center justify-center text-center"
                style={{
                  width: size,
                  height: size,
                }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <AlertTriangle size={22} />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-900">
                  QR generation failed
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {error}
                </p>
              </div>
            )}

            {!loading && !error && dataUrl && (
              <img
                src={dataUrl}
                alt="Generated QR code"
                width={size}
                height={size}
                className="block max-w-full object-contain"
                draggable={false}
              />
            )}
          </div>

          {dataUrl && (
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/95 text-slate-600 shadow-lg backdrop-blur transition hover:bg-white hover:text-slate-950 dark:border-slate-700"
              aria-label="View QR code larger"
            >
              <Maximize2 size={16} />
            </button>
          )}
        </div>

        {showSafetyWarning && safetyWarning && (
          <div className="mt-5 w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <AlertTriangle size={16} />
              </div>

              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Scan safety
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-800 dark:text-amber-300">
                  {safetyWarning}
                </p>
              </div>
            </div>
          </div>
        )}

        {showActions && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!dataUrl}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Download size={15} />
              Download
            </button>

            {qrId && (
              <button
                type="button"
                onClick={handleOpenTrackingLink}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ExternalLink size={15} />
                Test scan
              </button>
            )}
          </div>
        )}

        {qrId && (
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck size={13} />
            <span>Scan tracking enabled</span>
          </div>
        )}
      </div>

      {fullscreen && dataUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="QR code preview"
          onClick={() => setFullscreen(false)}
        >
          <div
            className="relative rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg"
              aria-label="Close QR preview"
            >
              ×
            </button>

            <img
              src={dataUrl}
              alt="Generated QR code enlarged"
              width={Math.min(640, size * 2)}
              height={Math.min(640, size * 2)}
              className="max-h-[80vh] max-w-[80vw] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}

function getSafetyWarning(
  type: QRType,
  content: QRContent,
): string | null {
  if (type === 'url' && 'url' in content) {
    const url = content.url.trim();

    if (
      url &&
      !/^https?:\/\//i.test(url)
    ) {
      return 'This QR code contains a URL that does not use HTTPS. Verify the destination before sharing it.';
    }

    if (url) {
      return 'Always verify the destination before sharing your QR code publicly.';
    }
  }

  if (type === 'dynamic') {
    return 'This QR code uses a tracked redirect. Its destination can be managed without replacing the printed QR code.';
  }

  if (type === 'payment' || type === 'upi') {
    return 'Verify the payment recipient and amount before completing a transaction.';
  }

  return null;
}
