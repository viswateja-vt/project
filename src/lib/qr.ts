import QRCode from 'qrcode';

export interface QROptions {
  foreground: string;
  background: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  size: number;
  logoUrl?: string | null;
}

/**
 * Generate a QR code as a PNG data URL.
 */
export async function generateQRDataURL(
  text: string,
  opts: QROptions
): Promise<string> {
  if (!text || !text.trim()) {
    throw new Error('QR payload is empty');
  }

  return QRCode.toDataURL(text, {
    errorCorrectionLevel: opts.errorCorrection,
    margin: 2,
    width: opts.size,
    color: {
      dark: opts.foreground,
      light: opts.background,
    },
  });
}

/**
 * Generate a QR code as an SVG string.
 */
export async function generateQRSVGString(
  text: string,
  opts: QROptions
): Promise<string> {
  if (!text || !text.trim()) {
    throw new Error('QR payload is empty');
  }

  return QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: opts.errorCorrection,
    margin: 2,
    width: opts.size,
    color: {
      dark: opts.foreground,
      light: opts.background,
    },
  });
}

/**
 * Build the actual data that will be stored inside the QR code.
 */
export function buildQRPayload(
  type: string,
  destination: string | null,
  data: Record<string, unknown> | null
): string {
  switch (type) {
    case 'url': {
      return destination?.trim() ?? '';
    }

    case 'whatsapp': {
      const phone = String(data?.phone ?? '').trim();
      const message = String(data?.message ?? '');

      if (!phone) {
        return '';
      }

      return `https://wa.me/${phone}${
        message
          ? `?text=${encodeURIComponent(message)}`
          : ''
      }`;
    }

    case 'phone': {
      const phone = destination?.trim() ?? '';

      if (!phone) {
        return '';
      }

      return `tel:${phone}`;
    }

    case 'email': {
      const email = destination?.trim() ?? '';

      if (!email) {
        return '';
      }

      const subject = String(data?.subject ?? '');
      const body = String(data?.body ?? '');

      return `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
    }

    case 'sms': {
      const phone = destination?.trim() ?? '';

      if (!phone) {
        return '';
      }

      const message = String(data?.message ?? '');

      return `SMSTO:${phone}:${message}`;
    }

    case 'maps': {
      const lat = String(data?.lat ?? '').trim();
      const lng = String(data?.lng ?? '').trim();

      if (lat && lng) {
        return `https://www.google.com/maps?q=${lat},${lng}`;
      }

      return destination?.trim() ?? '';
    }

    case 'upi': {
      const payee = String(data?.payee ?? '').trim();

      if (!payee) {
        return '';
      }

      const name = String(data?.name ?? '');
      const amount = String(data?.amount ?? '').trim();

      return `upi://pay?pa=${payee}&pn=${encodeURIComponent(name)}${
        amount ? `&am=${amount}` : ''
      }`;
    }

    case 'pdf':
    case 'image':
    case 'video': {
      return destination?.trim() ?? '';
    }

    case 'text': {
      return destination?.trim() ?? '';
    }

    case 'multi_link': {
      return destination?.trim() ?? '';
    }

    case 'business_card': {
      return destination?.trim() ?? '';
    }

    default: {
      return destination?.trim() ?? '';
    }
  }
}

/**
 * Download a generated QR code.
 */
export function downloadFile(
  dataUrl: string,
  filename: string
): void {
  if (!dataUrl) {
    return;
  }

  const a = document.createElement('a');

  a.href = dataUrl;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Convert SVG text into a data URL.
 */
export function svgToDataURL(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}