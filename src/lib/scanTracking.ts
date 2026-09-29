import { supabase } from './supabase';

export interface QRScanEvent {
  id: string;
  qrId: string;
  scannedAt: string;
  device?: string;
  browser?: string;
  country?: string;
  city?: string;
  referrer?: string;
  userAgent?: string;
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

  if (/opr\//i.test(userAgent)) {
    return 'Opera';
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

  return 'Other';
}

export async function recordScanEvent(
  qrId: string,
): Promise<QRScanEvent | null> {
  if (!qrId) {
    return null;
  }

  const event = {
    qr_id: qrId,
    scanned_at: new Date().toISOString(),
    device: detectDevice(),
    browser: detectBrowser(),
    referrer:
      typeof document !== 'undefined'
        ? document.referrer || null
        : null,
    user_agent:
      typeof navigator !== 'undefined'
        ? navigator.userAgent
        : null,
  };

  const { data, error } = await supabase
    .from('qr_scans')
    .insert(event)
    .select(
      'id, qr_id, scanned_at, device, browser, country, city, referrer, user_agent',
    )
    .single();

  if (error || !data) {
    console.error('Failed to record QR scan:', error);
    return null;
  }

  return {
    id: data.id,
    qrId: data.qr_id,
    scannedAt: data.scanned_at,
    device: data.device ?? undefined,
    browser: data.browser ?? undefined,
    country: data.country ?? undefined,
    city: data.city ?? undefined,
    referrer: data.referrer ?? undefined,
    userAgent: data.user_agent ?? undefined,
  };
}

export async function getScanEventsForQR(
  qrId: string,
): Promise<QRScanEvent[]> {
  if (!qrId) {
    return [];
  }

  const { data, error } = await supabase
    .from('qr_scans')
    .select(
      'id, qr_id, scanned_at, device, browser, country, city, referrer, user_agent',
    )
    .eq('qr_id', qrId)
    .order('scanned_at', { ascending: false });

  if (error || !data) {
    console.error('Failed to load QR scan events:', error);
    return [];
  }

  return data.map((event) => ({
    id: event.id,
    qrId: event.qr_id,
    scannedAt: event.scanned_at,
    device: event.device ?? undefined,
    browser: event.browser ?? undefined,
    country: event.country ?? undefined,
    city: event.city ?? undefined,
    referrer: event.referrer ?? undefined,
    userAgent: event.user_agent ?? undefined,
  }));
}
