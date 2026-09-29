import QRCode from 'qrcode';

import type {
  QRContent,
  QRDesign,
  QRType,
} from './qrTypes';

function clean(value: unknown) {
  return String(value ?? '').trim();
}

function encodeURL(url: string) {
  const value = clean(url);

  if (!value) {
    return '';
  }

  return value;
}

function encodeEmail(
  content: Extract<QRContent, { email: string }>
) {
  const email = clean(content.email);

  if (!email) {
    return '';
  }

  const params = new URLSearchParams();

  if (content.subject) {
    params.set(
      'subject',
      clean(content.subject)
    );
  }

  if (content.body) {
    params.set(
      'body',
      clean(content.body)
    );
  }

  const query = params.toString();

  return `mailto:${email}${query ? `?${query}` : ''}`;
}

function encodePhone(
  content: Extract<QRContent, { phone: string }>
) {
  const phone = clean(content.phone);

  return phone ? `tel:${phone}` : '';
}

function encodeSMS(
  content: Extract<
    QRContent,
    { phone: string; message?: string }
  >
) {
  const phone = clean(content.phone);

  if (!phone) {
    return '';
  }

  const message = clean(content.message);

  return message
    ? `SMSTO:${phone}:${message}`
    : `SMSTO:${phone}:`;
}

function encodeWiFi(
  content: Extract<
    QRContent,
    {
      ssid: string;
      password?: string;
      security: string;
    }
  >
) {
  const ssid = clean(content.ssid);

  if (!ssid) {
    return '';
  }

  const security =
    content.security === 'nopass'
      ? 'nopass'
      : content.security;

  const password = clean(
    content.password
  );

  const hidden = content.hidden
    ? 'true'
    : 'false';

  return `WIFI:T:${security};S:${escapeWiFi(
    ssid
  )};P:${escapeWiFi(
    password
  )};H:${hidden};;`;
}

function escapeWiFi(value: string) {
  return value.replace(
    /([\\;,:"])/g,
    '\\$1'
  );
}

function encodeVCard(
  content: Extract<
    QRContent,
    { firstName: string }
  >
) {
  const firstName = clean(
    content.firstName
  );
  const lastName = clean(
    content.lastName
  );

  if (!firstName && !lastName) {
    return '';
  }

  const fullName =
    [firstName, lastName]
      .filter(Boolean)
      .join(' ');

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${fullName}`,
  ];

  if (content.organization) {
    lines.push(
      `ORG:${clean(content.organization)}`
    );
  }

  if (content.title) {
    lines.push(
      `TITLE:${clean(content.title)}`
    );
  }

  if (content.phone) {
    lines.push(
      `TEL:${clean(content.phone)}`
    );
  }

  if (content.email) {
    lines.push(
      `EMAIL:${clean(content.email)}`
    );
  }

  if (content.website) {
    lines.push(
      `URL:${clean(content.website)}`
    );
  }

  if (
    content.street ||
    content.city ||
    content.state ||
    content.postalCode ||
    content.country
  ) {
    lines.push(
      `ADR:;;${clean(
        content.street
      )};${clean(
        content.city
      )};${clean(
        content.state
      )};${clean(
        content.postalCode
      )};${clean(content.country)}`
    );
  }

  lines.push('END:VCARD');

  return lines.join('\n');
}

function encodeLocation(
  content: Extract<
    QRContent,
    { latitude: string; longitude: string }
  >
) {
  const latitude = clean(
    content.latitude
  );

  const longitude = clean(
    content.longitude
  );

  if (!latitude || !longitude) {
    return '';
  }

  const label = clean(
    content.label
  );

  return label
    ? `geo:${latitude},${longitude}?q=${encodeURIComponent(
        label
      )}`
    : `geo:${latitude},${longitude}`;
}

function encodeWhatsApp(
  content: Extract<
    QRContent,
    { phone: string; message?: string }
  >
) {
  const phone = clean(content.phone);

  if (!phone) {
    return '';
  }

  const message = clean(
    content.message
  );

  return `https://wa.me/${phone.replace(
    /[^\d+]/g,
    ''
  )}${
    message
      ? `?text=${encodeURIComponent(message)}`
      : ''
  }`;
}

function encodeSocial(
  content: Extract<
    QRContent,
    { platform: string; url: string }
  >
) {
  return encodeURL(content.url);
}

function encodeApp(
  content: Extract<
    QRContent,
    {
      iosUrl?: string;
      androidUrl?: string;
      fallbackUrl?: string;
    }
  >
) {
  return (
    clean(content.fallbackUrl) ||
    clean(content.iosUrl) ||
    clean(content.androidUrl)
  );
}

function encodeMultiLink(
  content: Extract<
    QRContent,
    {
      title: string;
      links: Array<{
        id: string;
        title: string;
        url: string;
      }>;
    }
  >
) {
  const firstValidLink =
    content.links?.find(
      (link) => clean(link.url)
    );

  return firstValidLink
    ? encodeURL(firstValidLink.url)
    : '';
}

function encodeEvent(
  content: Extract<
    QRContent,
    { title: string; startDate: string }
  >
) {
  if (
    !clean(content.title) ||
    !clean(content.startDate)
  ) {
    return '';
  }

  const start = toCalendarDate(
    content.startDate
  );

  const end = content.endDate
    ? toCalendarDate(content.endDate)
    : start;

  const lines = [
    'BEGIN:VEVENT',
    `SUMMARY:${escapeICal(
      content.title
    )}`,
  ];

  if (start) {
    lines.push(`DTSTART:${start}`);
  }

  if (end) {
    lines.push(`DTEND:${end}`);
  }

  if (content.description) {
    lines.push(
      `DESCRIPTION:${escapeICal(
        content.description
      )}`
    );
  }

  if (content.location) {
    lines.push(
      `LOCATION:${escapeICal(
        content.location
      )}`
    );
  }

  lines.push('END:VEVENT');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    ...lines,
    'END:VCALENDAR',
  ].join('\n');
}

function toCalendarDate(
  value: string
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

function escapeICal(
  value: string
) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function encodeCoupon(
  content: Extract<
    QRContent,
    { title: string }
  >
) {
  const parts = [
    content.title,
    content.description,
    content.code
      ? `Code: ${content.code}`
      : '',
    content.discount
      ? `Offer: ${content.discount}`
      : '',
  ].filter(Boolean);

  return parts.join('\n');
}

function encodeUPI(
  content: Extract<
    QRContent,
    { upiId: string }
  >
) {
  const upiId = clean(
    content.upiId
  );

  if (!upiId) {
    return '';
  }

  const params = new URLSearchParams();

  params.set('pa', upiId);

  if (content.name) {
    params.set(
      'pn',
      clean(content.name)
    );
  }

  if (content.amount) {
    params.set(
      'am',
      clean(content.amount)
    );
  }

  if (content.currency) {
    params.set(
      'cu',
      clean(content.currency)
    );
  }

  if (content.note) {
    params.set(
      'tn',
      clean(content.note)
    );
  }

  return `upi://pay?${params.toString()}`;
}

function encodeBusiness(
  content: Extract<
    QRContent,
    { name: string }
  >
) {
  const lines = [
    content.name,
    content.description,
    content.phone,
    content.email,
    content.website,
    content.address,
    [
      content.city,
      content.state,
      content.postalCode,
      content.country,
    ]
      .filter(Boolean)
      .join(', '),
  ].filter(Boolean);

  return lines.join('\n');
}

export function contentToString(
  type: QRType,
  content: QRContent
): string {
  switch (type) {
    case 'url':
      return encodeURL(
        (content as Extract<
          QRContent,
          { url: string }
        >).url
      );

    case 'text':
      return clean(
        (
          content as Extract<
            QRContent,
            { text: string }
          >
        ).text
      );

    case 'email':
      return encodeEmail(
        content as Extract<
          QRContent,
          { email: string }
        >
      );

    case 'phone':
      return encodePhone(
        content as Extract<
          QRContent,
          { phone: string }
        >
      );

    case 'sms':
      return encodeSMS(
        content as Extract<
          QRContent,
          { phone: string; message?: string }
        >
      );

    case 'wifi':
      return encodeWiFi(
        content as Extract<
          QRContent,
          {
            ssid: string;
            password?: string;
            security: string;
          }
        >
      );

    case 'vcard':
      return encodeVCard(
        content as Extract<
          QRContent,
          { firstName: string }
        >
      );

    case 'location':
      return encodeLocation(
        content as Extract<
          QRContent,
          {
            latitude: string;
            longitude: string;
          }
        >
      );

    case 'whatsapp':
      return encodeWhatsApp(
        content as Extract<
          QRContent,
          {
            phone: string;
            message?: string;
          }
        >
      );

    case 'social':
      return encodeSocial(
        content as Extract<
          QRContent,
          {
            platform: string;
            url: string;
          }
        >
      );

    case 'app':
      return encodeApp(
        content as Extract<
          QRContent,
          {
            iosUrl?: string;
            androidUrl?: string;
            fallbackUrl?: string;
          }
        >
      );

    case 'multi-link':
      return encodeMultiLink(
        content as Extract<
          QRContent,
          {
            title: string;
            links: Array<{
              id: string;
              title: string;
              url: string;
            }>;
          }
        >
      );

    case 'dynamic':
      return clean(
        (
          content as Extract<
            QRContent,
            { destination: string }
          >
        ).destination
      );

    case 'event':
      return encodeEvent(
        content as Extract<
          QRContent,
          {
            title: string;
            startDate: string;
          }
        >
      );

    case 'coupon':
      return encodeCoupon(
        content as Extract<
          QRContent,
          { title: string }
        >
      );

    case 'upi':
      return encodeUPI(
        content as Extract<
          QRContent,
          { upiId: string }
        >
      );

    case 'business':
      return encodeBusiness(
        content as Extract<
          QRContent,
          { name: string }
        >
      );

    default:
      return '';
  }
}

export interface QRGenerateOptions {
  type: QRType;
  content: QRContent;
  design?: Partial<QRDesign>;
}

export async function generateQRCodeDataURL(
  options: QRGenerateOptions
): Promise<string> {
  const value = contentToString(
    options.type,
    options.content
  );

  if (!value) {
    throw new Error(
      'Please provide content for this QR code.'
    );
  }

  const design = {
    size:
      options.design?.size ?? 512,

    foregroundColor:
      options.design
        ?.foregroundColor ?? '#111827',

    backgroundColor:
      options.design
        ?.backgroundColor ?? '#ffffff',

    margin:
      options.design?.margin ?? 4,

    errorCorrection:
      options.design
        ?.errorCorrection ?? 'M',

    transparentBackground:
      options.design
        ?.transparentBackground ?? false,
  };

  return QRCode.toDataURL(
    value,
    {
      width: design.size,
      margin: design.margin,
      errorCorrectionLevel:
        design.errorCorrection,

      color: {
        dark: design.foregroundColor,
        light:
          design.transparentBackground
            ? '#00000000'
            : design.backgroundColor,
      },
    }
  );
}

export async function generateQRCodeSVG(
  options: QRGenerateOptions
): Promise<string> {
  const value = contentToString(
    options.type,
    options.content
  );

  if (!value) {
    throw new Error(
      'Please provide content for this QR code.'
    );
  }

  const design = {
    size:
      options.design?.size ?? 512,

    foregroundColor:
      options.design
        ?.foregroundColor ?? '#111827',

    backgroundColor:
      options.design
        ?.backgroundColor ?? '#ffffff',

    margin:
      options.design?.margin ?? 4,

    errorCorrection:
      options.design
        ?.errorCorrection ?? 'M',
  };

  return QRCode.toString(
    value,
    {
      type: 'svg',

      width: design.size,

      margin: design.margin,

      errorCorrectionLevel:
        design.errorCorrection,

      color: {
        dark: design.foregroundColor,
        light: design.backgroundColor,
      },
    }
  );
}

export async function generateQRCodeBuffer(
  options: QRGenerateOptions,
  type:
    | 'png'
    | 'jpeg'
    | 'svg' = 'png'
) {
  const value = contentToString(
    options.type,
    options.content
  );

  if (!value) {
    throw new Error(
      'Please provide content for this QR code.'
    );
  }

  const design = {
    size:
      options.design?.size ?? 512,

    foregroundColor:
      options.design
        ?.foregroundColor ?? '#111827',

    backgroundColor:
      options.design
        ?.backgroundColor ?? '#ffffff',

    margin:
      options.design?.margin ?? 4,

    errorCorrection:
      options.design
        ?.errorCorrection ?? 'M',
  };

  return QRCode.toBuffer(
    value,
    {
      type,

      width: design.size,

      margin: design.margin,

      errorCorrectionLevel:
        design.errorCorrection,

      color: {
        dark: design.foregroundColor,
        light: design.backgroundColor,
      },
    } as Parameters<
      typeof QRCode.toBuffer
    >[1]
  );
}

export function validateQRContent(
  type: QRType,
  content: QRContent
): string[] {
  const errors: string[] = [];

  switch (type) {
    case 'url': {
      const value = clean(
        (content as { url: string }).url
      );

      if (!value) {
        errors.push(
          'Website URL is required.'
        );
      } else {
        try {
          new URL(value);
        } catch {
          errors.push(
            'Please enter a valid website URL.'
          );
        }
      }

      break;
    }

    case 'text':
      if (
        !clean(
          (content as { text: string }).text
        )
      ) {
        errors.push(
          'Text content is required.'
        );
      }

      break;

    case 'email': {
      const email = clean(
        (content as { email: string }).email
      );

      if (!email) {
        errors.push(
          'Email address is required.'
        );
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email
        )
      ) {
        errors.push(
          'Please enter a valid email address.'
        );
      }

      break;
    }

    case 'phone':
    case 'sms':
    case 'whatsapp': {
      const phone = clean(
        (
          content as {
            phone: string;
          }
        ).phone
      );

      if (!phone) {
        errors.push(
          'Phone number is required.'
        );
      }

      break;
    }

    case 'wifi':
      if (
        !clean(
          (
            content as {
              ssid: string;
            }
          ).ssid
        )
      ) {
        errors.push(
          'Wi-Fi network name is required.'
        );
      }

      break;

    case 'vcard':
      if (
        !clean(
          (
            content as {
              firstName: string;
            }
          ).firstName
        )
      ) {
        errors.push(
          'First name is required.'
        );
      }

      break;

    case 'location': {
      const location =
        content as {
          latitude: string;
          longitude: string;
        };

      if (!clean(location.latitude)) {
        errors.push(
          'Latitude is required.'
        );
      }

      if (!clean(location.longitude)) {
        errors.push(
          'Longitude is required.'
        );
      }

      break;
    }

    case 'social':
      if (
        !clean(
          (
            content as {
              url: string;
            }
          ).url
        )
      ) {
        errors.push(
          'Social profile URL is required.'
        );
      }

      break;

    case 'app':
      if (
        !clean(
          (
            content as {
              iosUrl?: string;
              androidUrl?: string;
              fallbackUrl?: string;
            }
          ).iosUrl
        ) &&
        !clean(
          (
            content as {
              iosUrl?: string;
              androidUrl?: string;
              fallbackUrl?: string;
            }
          ).androidUrl
        ) &&
        !clean(
          (
            content as {
              iosUrl?: string;
              androidUrl?: string;
              fallbackUrl?: string;
            }
          ).fallbackUrl
        )
      ) {
        errors.push(
          'At least one app destination is required.'
        );
      }

      break;

    case 'multi-link': {
      const multi =
        content as {
          title: string;
          links: Array<{
            url: string;
          }>;
        };

      if (!clean(multi.title)) {
        errors.push(
          'Page title is required.'
        );
      }

      if (
        !multi.links ||
        multi.links.length === 0
      ) {
        errors.push(
          'Add at least one link.'
        );
      }

      break;
    }

    case 'dynamic':
      if (
        !clean(
          (
            content as {
              destination: string;
            }
          ).destination
        )
      ) {
        errors.push(
          'Destination URL is required.'
        );
      }

      break;

    case 'event':
      if (
        !clean(
          (
            content as {
              title: string;
            }
          ).title
        )
      ) {
        errors.push(
          'Event title is required.'
        );
      }

      if (
        !clean(
          (
            content as {
              startDate: string;
            }
          ).startDate
        )
      ) {
        errors.push(
          'Event start date is required.'
        );
      }

      break;

    case 'coupon':
      if (
        !clean(
          (
            content as {
              title: string;
            }
          ).title
        )
      ) {
        errors.push(
          'Coupon title is required.'
        );
      }

      break;

    case 'upi':
      if (
        !clean(
          (
            content as {
              upiId: string;
            }
          ).upiId
        )
      ) {
        errors.push(
          'UPI ID is required.'
        );
      }

      break;

    case 'business':
      if (
        !clean(
          (
            content as {
              name: string;
            }
          ).name
        )
      ) {
        errors.push(
          'Business name is required.'
        );
      }

      break;

    default:
      break;
  }

  return errors;
}

export function getQRText(
  type: QRType,
  content: QRContent
) {
  return contentToString(
    type,
    content
  );
}