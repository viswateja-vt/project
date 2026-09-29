import {
  Check,
  Copy,
  Mail,
  MessageCircle,
  Share2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface QRShareModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  url: string;
}

export function QRShareModal({
  open,
  onClose,
  title = 'Share QR code',
  url,
}: QRShareModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      document.execCommand('copy');
      textarea.remove();

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }

  function shareWhatsApp() {
    const message = encodeURIComponent(
      `${title}\n${url}`
    );

    window.open(
      `https://wa.me/?text=${message}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  function shareEmail() {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(
      `Here is the QR code link:\n\n${url}`
    );

    window.location.href =
      `mailto:?subject=${subject}&body=${body}`;
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({
        title,
        text: `Scan or open this QR code destination: ${url}`,
        url,
      });
    } catch {
      // User cancelled the native share sheet.
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Share2 size={19} />
            </div>

            <div>
              <h2
                id="share-modal-title"
                className="font-bold text-slate-950 dark:text-white"
              >
                {title}
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share this QR destination
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close share dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
            <p className="break-all text-sm leading-6 text-slate-600 dark:text-slate-300">
              {url}
            </p>
          </div>

          <button
            type="button"
            onClick={copyLink}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            {copied ? (
              <>
                <Check size={17} />
                Copied
              </>
            ) : (
              <>
                <Copy size={17} />
                Copy link
              </>
            )}
          </button>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={nativeShare}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Share2 size={19} />
              Share
            </button>

            <button
              type="button"
              onClick={shareWhatsApp}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <MessageCircle size={19} />
              WhatsApp
            </button>

            <button
              type="button"
              onClick={shareEmail}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Mail size={19} />
              Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}