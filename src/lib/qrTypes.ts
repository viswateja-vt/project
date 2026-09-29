export type QRType =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'vcard'
  | 'location'
  | 'whatsapp'
  | 'social'
  | 'app'
  | 'multi-link'
  | 'dynamic'
  | 'event'
  | 'coupon'
  | 'upi'
  | 'business';

export interface QRTypeDefinition {
  id: QRType;
  type: QRType;
  name: string;
  label: string;
  description: string;
  category:
    | 'basic'
    | 'contact'
    | 'business'
    | 'marketing'
    | 'payment';
  icon: string;
  dynamic?: boolean;
}

const createTypeDefinition = (
  definition: Omit<QRTypeDefinition, 'type' | 'label'>,
): QRTypeDefinition => ({
  ...definition,
  type: definition.id,
  label: definition.name,
});

export const QR_TYPE_DEFINITIONS: QRTypeDefinition[] = [
  createTypeDefinition({
    id: 'url',
    name: 'Website',
    description: 'Send people to any website or landing page.',
    category: 'basic',
    icon: 'Globe',
  }),
  createTypeDefinition({
    id: 'text',
    name: 'Plain Text',
    description: 'Share notes, instructions, messages or any text.',
    category: 'basic',
    icon: 'Type',
  }),
  createTypeDefinition({
    id: 'email',
    name: 'Email',
    description: 'Open an email with a recipient, subject and message.',
    category: 'basic',
    icon: 'Mail',
  }),
  createTypeDefinition({
    id: 'phone',
    name: 'Phone',
    description: 'Let people call a phone number instantly.',
    category: 'basic',
    icon: 'Phone',
  }),
  createTypeDefinition({
    id: 'sms',
    name: 'SMS',
    description: 'Open a pre-filled text message.',
    category: 'basic',
    icon: 'MessageSquare',
  }),
  createTypeDefinition({
    id: 'wifi',
    name: 'Wi-Fi',
    description: 'Connect guests to a wireless network.',
    category: 'basic',
    icon: 'Wifi',
  }),
  createTypeDefinition({
    id: 'vcard',
    name: 'Contact',
    description: 'Share a complete digital contact card.',
    category: 'contact',
    icon: 'Contact',
  }),
  createTypeDefinition({
    id: 'location',
    name: 'Location',
    description: 'Open a location in a maps application.',
    category: 'basic',
    icon: 'MapPin',
  }),
  createTypeDefinition({
    id: 'whatsapp',
    name: 'WhatsApp',
    description:
      'Start a WhatsApp conversation with an optional message.',
    category: 'contact',
    icon: 'MessageCircle',
  }),
  createTypeDefinition({
    id: 'social',
    name: 'Social Media',
    description:
      'Create a QR code for social profiles and channels.',
    category: 'marketing',
    icon: 'Share2',
  }),
  createTypeDefinition({
    id: 'app',
    name: 'App Download',
    description:
      'Send visitors to your iOS or Android application.',
    category: 'marketing',
    icon: 'Smartphone',
  }),
  createTypeDefinition({
    id: 'multi-link',
    name: 'Multi-Link',
    description:
      'Create a mobile-friendly page containing multiple links.',
    category: 'marketing',
    icon: 'Link',
    dynamic: true,
  }),
  createTypeDefinition({
    id: 'dynamic',
    name: 'Dynamic URL',
    description:
      'Change the destination without replacing the QR code.',
    category: 'marketing',
    icon: 'RefreshCw',
    dynamic: true,
  }),
  createTypeDefinition({
    id: 'event',
    name: 'Event',
    description:
      'Share event details and add them to a calendar.',
    category: 'business',
    icon: 'Calendar',
  }),
  createTypeDefinition({
    id: 'coupon',
    name: 'Coupon',
    description:
      'Share promotional offers and redemption details.',
    category: 'marketing',
    icon: 'Ticket',
  }),
  createTypeDefinition({
    id: 'upi',
    name: 'UPI / Payment',
    description: 'Create a QR payment request.',
    category: 'payment',
    icon: 'CreditCard',
  }),
  createTypeDefinition({
    id: 'business',
    name: 'Business Profile',
    description:
      'Share business contact, website and location information.',
    category: 'business',
    icon: 'Building2',
  }),
];

export function getQRTypeDefinition(type: QRType) {
  return QR_TYPE_DEFINITIONS.find(
    (definition) => definition.id === type,
  );
}

export function getQRTypeName(type: QRType) {
  return getQRTypeDefinition(type)?.name ?? 'QR Code';
}

export interface URLContent {
  url: string;
}

export interface TextContent {
  text: string;
}

export interface EmailContent {
  email: string;
  subject?: string;
  body?: string;
}

export interface PhoneContent {
  phone: string;
  message?: string;
}

export interface SMSContent {
  phone: string;
  message?: string;
}

export interface WiFiContent {
  ssid: string;
  password?: string;

  // Preferred field used by the current form.
  encryption?: 'WPA' | 'WEP' | 'nopass';

  // Original field retained for compatibility.
  security?: 'WPA' | 'WEP' | 'nopass';

  hidden?: boolean;
}

export interface VCardContent {
  firstName: string;
  lastName?: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface LocationContent {
  latitude: string | number;
  longitude: string | number;
  label?: string;
}

export interface WhatsAppContent {
  phone: string;
  message?: string;
}

export interface SocialContent {
  platform:
    | 'instagram'
    | 'facebook'
    | 'youtube'
    | 'tiktok'
    | 'linkedin'
    | 'x'
    | 'telegram'
    | 'other';
  url: string;
}

export interface AppContent {
  iosUrl?: string;
  androidUrl?: string;
  fallbackUrl?: string;
}

export interface MultiLinkItem {
  id: string;

  // Current UI field.
  label: string;

  // Original field retained for compatibility.
  title?: string;

  url: string;
  description?: string;
}

export interface MultiLinkContent {
  title: string;
  description?: string;
  avatar?: string;
  links: MultiLinkItem[];
}

export interface DynamicContent {
  destination: string;
  slug?: string;
  expiresAt?: string;
  paused?: boolean;
}

export interface EventContent {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  timezone?: string;
  url?: string;
}

export interface CouponContent {
  title: string;
  description?: string;
  code?: string;
  discount?: string;
  expiresAt?: string;
  terms?: string;
  url?: string;
}

export interface UPIContent {
  upiId: string;

  // Current UI field.
  payeeName?: string;

  // Original field retained for compatibility.
  name?: string;

  amount?: string;
  currency?: string;
  note?: string;
}

export interface BusinessContent {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: string;
  longitude?: string;

  hours?: string;
  logoUrl?: string;
  socialUrl?: string;
}

export type QRContent =
  | URLContent
  | TextContent
  | EmailContent
  | PhoneContent
  | SMSContent
  | WiFiContent
  | VCardContent
  | LocationContent
  | WhatsAppContent
  | SocialContent
  | AppContent
  | MultiLinkContent
  | DynamicContent
  | EventContent
  | CouponContent
  | UPIContent
  | BusinessContent;

export interface QRDesign {
  size: number;
  foregroundColor: string;
  backgroundColor: string;

  // Current designer fields.
  gradient?: boolean;
  gradientColor?: string;

  // Original fields retained for compatibility.
  gradientEnabled?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;

  pattern:
    | 'square'
    | 'dots'
    | 'rounded'
    | 'classy'
    | 'classy-rounded'
    | 'extra-rounded';

  eyeStyle:
    | 'square'
    | 'rounded'
    | 'dot';

  logo?: string;
  logoUrl?: string;
  logoSize?: number;
  logoMargin?: number;

  margin: number;
  quietZone?: number;

  errorCorrection:
    | 'L'
    | 'M'
    | 'Q'
    | 'H';

  transparentBackground?: boolean;
}

export const DEFAULT_QR_DESIGN: QRDesign = {
  size: 512,
  foregroundColor: '#111827',
  backgroundColor: '#ffffff',

  gradient: false,
  gradientColor: '#4f46e5',

  gradientEnabled: false,
  gradientStart: '#111827',
  gradientEnd: '#4f46e5',
  gradientAngle: 45,

  pattern: 'square',
  eyeStyle: 'square',

  logo: undefined,
  logoUrl: undefined,
  logoSize: 22,
  logoMargin: 4,

  margin: 4,
  errorCorrection: 'M',
  quietZone: 4,
  transparentBackground: false,
};

export interface QRRecord {
  id: string;
  name: string;
  type: QRType;
  content: QRContent;
  userId: string;
  shortCode?: string;
  destination?: string;
  isDynamic?: boolean;

  status:
    | 'active'
    | 'paused'
    | 'expired'
    | 'archived';

  scans: number;

  // Current field.
  favorite: boolean;

  // Compatibility alias used by the library UI.
  isFavorite?: boolean;

  tags: string[];
  folderId?: string;
  design: QRDesign;

  createdAt: string;
  updatedAt: string;
  startsAt?: string;
  expiresAt?: string;

  // Compatibility state aliases used by some screens.
  isPaused?: boolean;
  isArchived?: boolean;
}

export function isDynamicQR(type: QRType) {
  return (
    type === 'dynamic' ||
    type === 'multi-link' ||
    type === 'app'
  );
}

export function getDefaultContent(type: QRType): QRContent {
  switch (type) {
    case 'url':
      return {
        url: 'https://example.com',
      };

    case 'text':
      return {
        text: '',
      };

    case 'email':
      return {
        email: '',
        subject: '',
        body: '',
      };

    case 'phone':
      return {
        phone: '',
        message: '',
      };

    case 'sms':
      return {
        phone: '',
        message: '',
      };

    case 'wifi':
      return {
        ssid: '',
        password: '',
        encryption: 'WPA',
        security: 'WPA',
        hidden: false,
      };

    case 'vcard':
      return {
        firstName: '',
        lastName: '',
        organization: '',
        title: '',
        phone: '',
        email: '',
        website: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      };

    case 'location':
      return {
        latitude: '',
        longitude: '',
        label: '',
      };

    case 'whatsapp':
      return {
        phone: '',
        message: '',
      };

    case 'social':
      return {
        platform: 'instagram',
        url: '',
      };

    case 'app':
      return {
        iosUrl: '',
        androidUrl: '',
        fallbackUrl: '',
      };

    case 'multi-link':
      return {
        title: '',
        description: '',
        avatar: '',
        links: [],
      };

    case 'dynamic':
      return {
        destination: 'https://example.com',
        slug: '',
        expiresAt: '',
        paused: false,
      };

    case 'event':
      return {
        title: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        timezone: '',
        url: '',
      };

    case 'coupon':
      return {
        title: '',
        description: '',
        code: '',
        discount: '',
        expiresAt: '',
        terms: '',
        url: '',
      };

    case 'upi':
      return {
        upiId: '',
        payeeName: '',
        name: '',
        amount: '',
        currency: 'INR',
        note: '',
      };

    case 'business':
      return {
        name: '',
        description: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        latitude: '',
        longitude: '',
        hours: '',
        logoUrl: '',
        socialUrl: '',
      };

    default:
      return {
        text: '',
      };
  }
}