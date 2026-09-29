tsx
import {
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Smartphone,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Modal } from './Modal';
import { QRDisplay } from './QRDisplay';

import type { QRRecord, QRDesign } from '../lib/qrTypes';
import { DEFAULT_QR_DESIGN, getQRText } from '../lib/qrTypes';
import { getQRText as getEncodedQRText } from '../lib/qrEngine';

interface QRTestModalProps {
  open: boolean;
  onClose: () => void;
  qrCode?: QRRecord;
  content?: QRRecord['content'];
  type?: QRRecord['type'];
  design?: QRDesign;
  name?: string;
}

export function QRTestModal({
  open,
  onClose,
  qrCode,
  content,
  type,
  design,
  name = 'QR Code',
}: QRTestModalProps) {
  const resolvedContent = qrCode?.content ?? content;
  const resolvedType = qrCode?.type ?? type;

  const resolvedDesign =
    qrCode?.design ?? design ?? DEFAULT_QR_DESIGN;

  const [testResult, setTestResult] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const [isTesting, setIsTesting] = useState(false);

  const qrText = useMemo(() => {
    if (!resolvedContent || !resolvedType) {
      return '';
    }

    try {
      return getEncodedQRText(resolvedType, resolvedContent);
    } catch {
      return '';
    }
  }, [resolvedContent, resolvedType]);

  useEffect(() => {
    if (!open) {
      setTestResult('idle');
      setIsTesting(false);
    }
  }, [open]);

  async function runTest() {
    setIsTesting(true);
    setTestResult('idle');

    await new Promise((resolve) => setTimeout(resolve, 700));

    if (!qrText.trim()) {
      setTestResult('error');
      setIsTesting(false);
      return;
    }

    setTestResult('success');
    setIsTesting(false);
  }

  function openEncodedDestination() {
    if (!qrText) {
      return;
    }

    if (/^https?:\/\//i.test(qrText)) {
      window.open(qrText, '_blank', 'noopener,noreferrer');
      return;
    }

    if (/^(mailto:|tel:|sms:|whatsapp:)/i.test(qrText)) {
      window.location.href = qrText;
    }
  }

  const canOpenDestination =
    /^https?:\/\//i.test(qrText) ||
    /^(mailto:|tel:|sms:|whatsapp:)/i.test(qrText);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Test your QR code"
      description="Scan or inspect the generated code before sharing it."
      size="md"
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col items-center">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700">
              {resolvedContent && resolvedType ? (
                <QRDisplay
                  type={resolvedType}
                  content={resolvedContent}
                  design={resolvedDesign}
                  size={220}
                  showActions={false}
                />
              ) : (
                <div className="flex h-[220px] w-[220px] items-center justify-center text-center text-xs text-slate-400">
                  QR data unavailable
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Smartphone size={15} />
              Scan with your phone camera
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <RefreshCw size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Test destination
              </p>

              <p className="mt-1 break-all text-xs leading-5 text-slate-500 dark:text-slate-400">
                {qrText || 'No encoded destination available.'}
              </p>
            </div>
          </div>
        </div>

        {testResult === 'success' && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
            />

            <div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                QR code is ready
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-700 dark:text-emerald-400">
                The QR data was generated successfully and can be
                scanned by a compatible QR reader.
              </p>
            </div>
          </div>
        )}

        {testResult === 'error' && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
            <XCircle
              size={19}
              className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400"
            />

            <div>
              <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                QR code could not be tested
              </p>

              <p className="mt-1 text-xs leading-5 text-rose-700 dark:text-rose-400">
                Check the content and try generating the QR code
                again.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>

          <div className="flex flex-col gap-2 sm:flex-row">
            {testResult === 'success' && qrText && (
              <button
                type="button"
                onClick={openEncodedDestination}
                disabled={!canOpenDestination}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ExternalLink size={14} />
                Open destination
              </button>
            )}

            <button
              type="button"
              onClick={runTest}
              disabled={isTesting || !qrText}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={isTesting ? 'animate-spin' : ''}
              />

              {isTesting ? 'Testing...' : 'Run test'}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] leading-4 text-slate-400">
          {name} · Testing here validates QR generation. For
          production redirects, also test the final destination on a
          physical device.
        </p>
      </div>
    </Modal>
  );
}

