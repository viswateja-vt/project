import QRCode from 'qrcode';

export interface QROptions {
  foreground: string;
  background: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  size: number;
  logoUrl?: string | null;
}

export async function generateQRDataURL(text: string, opts: QROptions): Promise<string> {
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

export async function generateQRSVGString(text: string, opts: QROptions): Promise<string> {
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

export function buildQRPayload(
  type: string,
  destination: string | null,
  data: Record<string, unknown> | null
): string {
  if (!destination && !data) return '';
  switch (type) {
    case 'url':
      return destination ?? '';
    case 'whatsapp': {
      const phone = (data?.phone as string) ?? '';
      const msg = (data?.message as string) ?? '';
      return `https://wa.me/${phone}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
    }
    case 'phone':
      return `tel:${destination ?? ''}`;
    case 'email': {
      const subject = (data?.subject as string) ?? '';
      const body = (data?.body as string) ?? '';
      return `mailto:${destination ?? ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    case 'sms': {
      const msg = (data?.message as string) ?? '';
      return `SMSTO:${destination ?? ''}:${msg}`;
    }
    case 'maps': {
      const lat = (data?.lat as string) ?? '';
      const lng = (data?.lng as string) ?? '';
      if (lat && lng) return `https://www.google.com/maps?q=${lat},${lng}`;
      return destination ?? '';
    }
    case 'upi': {
      const payee = (data?.payee as string) ?? '';
      const amount = (data?.amount as string) ?? '';
      return `upi://pay?pa=${payee}&pn=${encodeURIComponent((data?.name as string) ?? '')}${amount ? `&am=${amount}` : ''}`;
    }
    case 'pdf':
    case 'image':
    case 'video':
      return destination ?? '';
    case 'text':
      return destination ?? '';
    case 'multi_link':
      return destination ?? '';
    case 'business_card':
      return destination ?? '';
    default:
      return destination ?? '';
  }
}

export function downloadFile(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function svgToDataURL(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
