import {
  Check,
  Download,
  FileImage,
  FileText,
  Image as ImageIcon,
  Loader2,
  X,
} from 'lucide-react';
import { useState } from 'react';

import type {
  QRContent,
  QRDesign,
  QRType,
} from '../lib/qrTypes';

import {
  generateQRCodeDataURL,
  generateQRCodeSVG,
} from '../lib/qrEngine';

interface QRDownloadModalProps {
  open: boolean;
  onClose: () => void;
  type: QRType;
  content: QRContent;
  design: QRDesign;
  filename?: string;
}

type DownloadFormat = 'png' | 'jpg' | 'svg';

export function QRDownloadModal({
  open,
  onClose,
  type,
  content,
  design,
  filename = 'qr-code',
}: QRDownloadModalProps) {
  const [format, setFormat] =
    useState<DownloadFormat>('png');

  const [loading, setLoading] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  if (!open) {
    return null;
  }

  async function downloadQRCode() {
    setLoading(true);
    setCompleted(false);

    try {
      if (format === 'svg') {
        const svg = await generateQRCodeSVG({
          type,
          content,
          design,
        });

        const blob = new Blob(
          [svg],
          {
            type: 'image/svg+xml;charset=utf-8',
          },
        );

        downloadBlob(
          blob,
          `${safeFilename(filename)}.svg`,
        );
      } else {
        const dataUrl =
          await generateQRCodeDataURL({
            type,
            content,
            design,
          });

        if (format === 'png') {
          const response =
            await fetch(dataUrl);

          const blob =
            await response.blob();

          downloadBlob(
            blob,
            `${safeFilename(filename)}.png`,
          );
        } else {
          const jpgDataUrl =
            await convertToJpeg(dataUrl);

          const response =
            await fetch(jpgDataUrl);

          const blob =
            await response.blob();

          downloadBlob(
            blob,
            `${safeFilename(filename)}.jpg`,
          );
        }
      }

      setCompleted(true);

      window.setTimeout(() => {
        setCompleted(false);
      }, 1800);
    } catch (error) {
      console.error(
        'QR download failed:',
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
    >
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2
              id="download-modal-title"
              className="text-lg font-bold text-slate-950 dark:text-white"
            >
              Download QR code
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Choose the format you need.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close download dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <FormatCard
              active={format === 'png'}
              icon={FileImage}
              title="PNG"
              description="Best for web"
              onClick={() => setFormat('png')}
            />

            <FormatCard
              active={format === 'jpg'}
              icon={ImageIcon}
              title="JPG"
              description="Easy to share"
              onClick={() => setFormat('jpg')}
            />

            <FormatCard
              active={format === 'svg'}
              icon={FileText}
              title="SVG"
              description="Print & scale"
              onClick={() => setFormat('svg')}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Download size={17} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {format.toUpperCase()} export
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Your current QR design, colors,
                  logo, pattern, and error-correction
                  settings will be preserved.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={downloadQRCode}
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Preparing download…
              </>
            ) : completed ? (
              <>
                <Check size={17} />
                Downloaded
              </>
            ) : (
              <>
                <Download size={17} />
                Download {format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormatCard({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: typeof FileImage;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-2xl border p-4 text-left transition',
        active
          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/40'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-9 w-9 items-center justify-center rounded-xl',
          active
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
        ].join(' ')}
      >
        <Icon size={17} />
      </div>

      <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </button>
  );
}

function safeFilename(value: string) {
  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return cleaned || 'qr-code';
}

function downloadBlob(
  blob: Blob,
  filename: string,
) {
  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement('a');

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

async function convertToJpeg(
  dataUrl: string,
) {
  const image = new Image();
  image.decoding = 'async';

  await new Promise<void>(
    (resolve, reject) => {
      image.onload = () => resolve();

      image.onerror = () =>
        reject(
          new Error(
            'Unable to prepare JPG export.',
          ),
        );

      image.src = dataUrl;
    },
  );

  const canvas =
    document.createElement('canvas');

  canvas.width =
    image.naturalWidth;

  canvas.height =
    image.naturalHeight;

  const context =
    canvas.getContext('2d');

  if (!context) {
    throw new Error(
      'Canvas is not supported.',
    );
  }

  context.fillStyle = '#ffffff';

  context.fillRect(
    0,
    0,
    canvas.width,
    canvas.height,
  );

  context.drawImage(
    image,
    0,
    0,
  );

  return canvas.toDataURL(
    'image/jpeg',
    0.95,
  );
}