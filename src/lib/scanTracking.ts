
export const SCAN_EVENTS_STORAGE_KEY = 'qr-studio-scan-events';

export interface QRScanEvent {
  id: string;
  qrId: string;
  scannedAt: string;
  device?: string;
  browser?: string;
  country?: string;
  city?: string;
  referrer?: string;
}

function createEventId(): string {
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

function detectDevice(): string {
  if (typeof navigator === 'undefined') {
    return 'Unknown';
  }

  const userAgent = navigator.userAgent.toLowerCase();

  if (/ipad|tablet/.test(userAgent)) {
    return 'Tablet';
  }

  if (/mobile|iphone|android/.test(userAgent)) {
    return 'Mobile';
  }

  return 'Desktop';
}

function detectBrowser(): string {
  if (typeof navigator === 'undefined') {
    return 'Unknown';
  }

  const userAgent = navigator.userAgent;

  if (/edg\//i.test(userAgent)) {
    return 'Edge';
  }

  if (/chrome|crios/i.test(userAgent) && !/edg\//i.test(userAgent)) {
    return 'Chrome';
  }

  if (/firefox|fxios/i.test(userAgent)) {
    return 'Firefox';
  }

  if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) {
    return 'Safari';
  }

  if (/opr\//i.test(userAgent)) {
    return 'Opera';
  }

  return 'Other';
}

export function getStoredScanEvents(): QRScanEvent[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(
      SCAN_EVENTS_STORAGE_KEY,
    );

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (event): event is QRScanEvent =>
        Boolean(
          event &&
            typeof event === 'object' &&
            typeof event.id === 'string' &&
            typeof event.qrId === 'string' &&
            typeof event.scannedAt === 'string',
        ),
    );
  } catch {
    return [];
  }
}

export function recordScanEvent(
  qrId: string,
): QRScanEvent | null {
  if (typeof window === 'undefined' || !qrId) {
    return null;
  }

  const event: QRScanEvent = {
    id: createEventId(),
    qrId,
    scannedAt: new Date().toISOString(),
    device: detectDevice(),
    browser: detectBrowser(),
    referrer:
      typeof document !== 'undefined'
        ? document.referrer || undefined
        : undefined,
  };

  try {
    const existing = getStoredScanEvents();

    localStorage.setItem(
      SCAN_EVENTS_STORAGE_KEY,
      JSON.stringify([event, ...existing]),
    );

    return event;
  } catch {
    return null;
  }
}

export function getScanCount(qrId: string): number {
  return getStoredScanEvents().filter(
    (event) => event.qrId === qrId,
  ).length;
}

export function getScanEventsForQR(
  qrId: string,
): QRScanEvent[] {
  return getStoredScanEvents().filter(
    (event) => event.qrId === qrId,
  );
}
