import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { recordScanEvent } from '../lib/scanTracking';

export function QRRedirectPage() {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      setError(true);
      return;
    }

    let cancelled = false;

    async function trackAndContinue() {
      const scan = await recordScanEvent(id);

      if (cancelled) return;

      if (!scan) {
        setError(true);
        return;
      }

      /*
       * The destination lookup will be connected to the
       * Supabase QR record in the next step.
       *
       * We intentionally do not redirect yet because
       * redirecting without a server-side QR destination
       * could produce an incorrect scan flow.
       */
    }

    trackAndContinue();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            QR code unavailable
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            This QR code could not be processed.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Processing QR code…</span>
      </div>
    </main>
  );
}
