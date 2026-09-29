import {
  CalendarDays,
  ChevronDown,
  Globe,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Trash2,
  UserRound,
  Wallet,
  Wifi,
} from 'lucide-react';
import type { ReactNode } from 'react';

import type {
  AppContent,
  BusinessContent,
  CouponContent,
  DynamicContent,
  EmailContent,
  EventContent,
  LocationContent,
  MultiLinkContent,
  PhoneContent,
  QRContent,
  QRType,
  SMSContent,
  SocialContent,
  TextContent,
  UPIContent,
  URLContent,
  VCardContent,
  WiFiContent,
  WhatsAppContent,
} from '../lib/qrTypes';

interface ContentFormProps {
  type: QRType;
  content: QRContent;
  onChange: (content: QRContent) => void;
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  helper?: string;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  helper,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
      />

      {helper && (
        <span className="mt-1.5 block text-xs text-slate-500 dark:text-slate-400">
          {helper}
        </span>
      )}
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  required,
  helper,
  rows = 5,
}: FieldProps & { rows?: number }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </span>

      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
      />

      {helper && (
        <span className="mt-1.5 block text-xs text-slate-500 dark:text-slate-400">
          {helper}
        </span>
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
    >
      <span>
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
          {label}
        </span>

        {description && (
          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
            {description}
          </span>
        )}
      </span>

      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? 'bg-indigo-600'
            : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </span>
    </button>
  );
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>

          {description && (
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

function InfoBox({
  children,
  tone = 'info',
}: {
  children: ReactNode;
  tone?: 'info' | 'warning';
}) {
  return (
    <div
      className={`rounded-xl border p-4 text-sm ${
        tone === 'warning'
          ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200'
          : 'border-indigo-100 bg-indigo-50 text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-200'
      }`}
    >
      {children}
    </div>
  );
}

export function ContentForm({
  type,
  content,
  onChange,
}: ContentFormProps) {
  switch (type) {
    case 'url':
      return (
        <Section
          icon={<Globe className="h-5 w-5" />}
          title="Website destination"
          description="Enter the URL people should open after scanning."
        >
          <Field
            label="Website URL"
            value={(content as URLContent).url}
            onChange={(url) =>
              onChange({ ...(content as URLContent), url })
            }
            placeholder="https://example.com"
            type="url"
            required
          />

          <InfoBox>
            Use the complete URL including <strong>https://</strong> for
            the most reliable scanning experience.
          </InfoBox>
        </Section>
      );

    case 'dynamic':
      return (
        <Section
          icon={<Link2 className="h-5 w-5" />}
          title="Dynamic destination"
          description="Change the destination later without reprinting the QR code."
        >
          <Field
            label="Destination URL"
            value={(content as DynamicContent).destination}
            onChange={(destination) =>
              onChange({
                ...(content as DynamicContent),
                destination,
              })
            }
            placeholder="https://example.com"
            type="url"
            required
          />

          <Field
            label="Custom slug"
            value={(content as DynamicContent).slug ?? ''}
            onChange={(slug) =>
              onChange({
                ...(content as DynamicContent),
                slug,
              })
            }
            placeholder="summer-campaign"
            helper="Optional. Use a short memorable identifier."
          />

          <Field
            label="Expiration date"
            value={(content as DynamicContent).expiresAt ?? ''}
            onChange={(expiresAt) =>
              onChange({
                ...(content as DynamicContent),
                expiresAt,
              })
            }
            type="datetime-local"
            helper="Leave blank if the QR code should remain active indefinitely."
          />

          <ToggleField
            label="Pause redirect"
            description="Temporarily stop the destination from being served."
            checked={Boolean(
              (content as DynamicContent).paused
            )}
            onChange={(paused) =>
              onChange({
                ...(content as DynamicContent),
                paused,
              })
            }
          />
        </Section>
      );

    case 'text':
      return (
        <Section
          icon={<MessageCircle className="h-5 w-5" />}
          title="Text content"
          description="Share a message, instructions, code, or any plain text."
        >
          <TextareaField
            label="Text"
            value={(content as TextContent).text}
            onChange={(text) =>
              onChange({ ...(content as TextContent), text })
            }
            placeholder="Enter the text you want to share..."
            required
            rows={8}
          />
        </Section>
      );

    case 'email':
      return (
        <Section
          icon={<Mail className="h-5 w-5" />}
          title="Email"
          description="Scanning opens the recipient's email composer."
        >
          <Field
            label="Email address"
            value={(content as EmailContent).email}
            onChange={(email) =>
              onChange({ ...(content as EmailContent), email })
            }
            placeholder="hello@example.com"
            type="email"
            required
          />

          <Field
            label="Subject"
            value={(content as EmailContent).subject ?? ''}
            onChange={(subject) =>
              onChange({
                ...(content as EmailContent),
                subject,
              })
            }
            placeholder="Subject of the email"
          />

          <TextareaField
            label="Message"
            value={(content as EmailContent).body ?? ''}
            onChange={(body) =>
              onChange({
                ...(content as EmailContent),
                body,
              })
            }
            placeholder="Write an optional pre-filled message..."
            rows={6}
          />
        </Section>
      );

    case 'phone':
      return (
        <Section
          icon={<Phone className="h-5 w-5" />}
          title="Phone number"
          description="Scanning opens the phone dialer."
        >
          <Field
            label="Phone number"
            value={(content as PhoneContent).phone}
            onChange={(phone) =>
              onChange({ ...(content as PhoneContent), phone })
            }
            placeholder="+91 98765 43210"
            type="tel"
            required
          />
        </Section>
      );

    case 'sms':
      return (
        <Section
          icon={<MessageCircle className="h-5 w-5" />}
          title="SMS message"
          description="Create a QR code that opens a pre-filled text message."
        >
          <Field
            label="Phone number"
            value={(content as SMSContent).phone}
            onChange={(phone) =>
              onChange({ ...(content as SMSContent), phone })
            }
            placeholder="+91 98765 43210"
            type="tel"
            required
          />

          <TextareaField
            label="Message"
            value={(content as SMSContent).message ?? ''}
            onChange={(message) =>
              onChange({
                ...(content as SMSContent),
                message,
              })
            }
            placeholder="Your pre-filled SMS message..."
            rows={5}
          />
        </Section>
      );

    case 'whatsapp':
      return (
        <Section
          icon={<MessageCircle className="h-5 w-5" />}
          title="WhatsApp"
          description="Start a WhatsApp conversation with a pre-filled message."
        >
          <Field
            label="Phone number"
            value={(content as WhatsAppContent).phone}
            onChange={(phone) =>
              onChange({
                ...(content as WhatsAppContent),
                phone,
              })
            }
            placeholder="919876543210"
            type="tel"
            required
            helper="Include your country code without + or spaces."
          />

          <TextareaField
            label="Pre-filled message"
            value={(content as WhatsAppContent).message ?? ''}
            onChange={(message) =>
              onChange({
                ...(content as WhatsAppContent),
                message,
              })
            }
            placeholder="Hello! I'd like to know more..."
            rows={5}
          />
        </Section>
      );

    case 'wifi':
      return (
        <Section
          icon={<Wifi className="h-5 w-5" />}
          title="Wi-Fi network"
          description="Let visitors connect without typing the password."
        >
          <Field
            label="Network name (SSID)"
            value={(content as WiFiContent).ssid}
            onChange={(ssid) =>
              onChange({ ...(content as WiFiContent), ssid })
            }
            placeholder="My Wi-Fi"
            required
          />

          <Field
            label="Password"
            value={(content as WiFiContent).password ?? ''}
            onChange={(password) =>
              onChange({
                ...(content as WiFiContent),
                password,
              })
            }
            placeholder="Wi-Fi password"
            type="password"
          />

          <SelectField
            label="Security"
            value={(content as WiFiContent).encryption ?? 'WPA'}
            onChange={(encryption) =>
              onChange({
                ...(content as WiFiContent),
                encryption: encryption as WiFiContent['encryption'],
              })
            }
            options={[
              { value: 'WPA', label: 'WPA / WPA2 / WPA3' },
              { value: 'WEP', label: 'WEP' },
              { value: 'nopass', label: 'No password' },
            ]}
          />

          <ToggleField
            label="Hidden network"
            description="Enable this if the network name is not broadcast."
            checked={Boolean(
              (content as WiFiContent).hidden
            )}
            onChange={(hidden) =>
              onChange({
                ...(content as WiFiContent),
                hidden,
              })
            }
          />
        </Section>
      );

    case 'vcard':
      return (
        <Section
          icon={<UserRound className="h-5 w-5" />}
          title="Contact card"
          description="Create a scannable digital contact card."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="First name"
              value={(content as VCardContent).firstName}
              onChange={(firstName) =>
                onChange({
                  ...(content as VCardContent),
                  firstName,
                })
              }
              placeholder="Viswateja"
              required
            />

            <Field
              label="Last name"
              value={(content as VCardContent).lastName ?? ''}
              onChange={(lastName) =>
                onChange({
                  ...(content as VCardContent),
                  lastName,
                })
              }
              placeholder="K"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Organization"
              value={(content as VCardContent).organization ?? ''}
              onChange={(organization) =>
                onChange({
                  ...(content as VCardContent),
                  organization,
                })
              }
              placeholder="Company name"
            />

            <Field
              label="Job title"
              value={(content as VCardContent).title ?? ''}
              onChange={(title) =>
                onChange({
                  ...(content as VCardContent),
                  title,
                })
              }
              placeholder="Founder"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Phone"
              value={(content as VCardContent).phone ?? ''}
              onChange={(phone) =>
                onChange({
                  ...(content as VCardContent),
                  phone,
                })
              }
              placeholder="+91 98765 43210"
              type="tel"
            />

            <Field
              label="Email"
              value={(content as VCardContent).email ?? ''}
              onChange={(email) =>
                onChange({
                  ...(content as VCardContent),
                  email,
                })
              }
              placeholder="hello@example.com"
              type="email"
            />
          </div>

          <Field
            label="Website"
            value={(content as VCardContent).website ?? ''}
            onChange={(website) =>
              onChange({
                ...(content as VCardContent),
                website,
              })
            }
            placeholder="https://example.com"
            type="url"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Street"
              value={(content as VCardContent).street ?? ''}
              onChange={(street) =>
                onChange({
                  ...(content as VCardContent),
                  street,
                })
              }
              placeholder="Street address"
            />

            <Field
              label="City"
              value={(content as VCardContent).city ?? ''}
              onChange={(city) =>
                onChange({
                  ...(content as VCardContent),
                  city,
                })
              }
              placeholder="City"
            />

            <Field
              label="State"
              value={(content as VCardContent).state ?? ''}
              onChange={(state) =>
                onChange({
                  ...(content as VCardContent),
                  state,
                })
              }
              placeholder="State"
            />

            <Field
              label="Postal code"
              value={(content as VCardContent).postalCode ?? ''}
              onChange={(postalCode) =>
                onChange({
                  ...(content as VCardContent),
                  postalCode,
                })
              }
              placeholder="Postal code"
            />
          </div>
        </Section>
      );

    case 'location':
      return (
        <Section
          icon={<MapPin className="h-5 w-5" />}
          title="Location"
          description="Open a precise location in a compatible maps app."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Latitude"
              value={String(
                (content as LocationContent).latitude
              )}
              onChange={(value) =>
                onChange({
                  ...(content as LocationContent),
                  latitude: Number(value),
                })
              }
              placeholder="17.3850"
              type="number"
              required
            />

            <Field
              label="Longitude"
              value={String(
                (content as LocationContent).longitude
              )}
              onChange={(value) =>
                onChange({
                  ...(content as LocationContent),
                  longitude: Number(value),
                })
              }
              placeholder="78.4867"
              type="number"
              required
            />
          </div>

          <Field
            label="Location label"
            value={(content as LocationContent).label ?? ''}
            onChange={(label) =>
              onChange({
                ...(content as LocationContent),
                label,
              })
            }
            placeholder="Office, store, event venue..."
          />
        </Section>
      );

    case 'social':
      return (
        <Section
          icon={<Globe className="h-5 w-5" />}
          title="Social profile"
          description="Send people directly to a social profile or channel."
        >
          <SelectField
            label="Platform"
            value={(content as SocialContent).platform}
            onChange={(platform) =>
              onChange({
                ...(content as SocialContent),
                platform:
                  platform as SocialContent['platform'],
              })
            }
            options={[
              { value: 'instagram', label: 'Instagram' },
              { value: 'facebook', label: 'Facebook' },
              { value: 'x', label: 'X / Twitter' },
              { value: 'linkedin', label: 'LinkedIn' },
              { value: 'youtube', label: 'YouTube' },
              { value: 'tiktok', label: 'TikTok' },
              { value: 'other', label: 'Other' },
            ]}
          />

          <Field
            label="Profile URL"
            value={(content as SocialContent).url}
            onChange={(url) =>
              onChange({
                ...(content as SocialContent),
                url,
              })
            }
            placeholder="https://instagram.com/yourprofile"
            type="url"
            required
          />
        </Section>
      );

    case 'app':
      return (
        <Section
          icon={<Globe className="h-5 w-5" />}
          title="App download"
          description="Send users to the right app store or your website."
        >
          <Field
            label="iOS App Store URL"
            value={(content as AppContent).iosUrl ?? ''}
            onChange={(iosUrl) =>
              onChange({
                ...(content as AppContent),
                iosUrl,
              })
            }
            placeholder="https://apps.apple.com/..."
            type="url"
          />

          <Field
            label="Android Play Store URL"
            value={(content as AppContent).androidUrl ?? ''}
            onChange={(androidUrl) =>
              onChange({
                ...(content as AppContent),
                androidUrl,
              })
            }
            placeholder="https://play.google.com/store/apps/..."
            type="url"
          />

          <Field
            label="Fallback URL"
            value={(content as AppContent).fallbackUrl ?? ''}
            onChange={(fallbackUrl) =>
              onChange({
                ...(content as AppContent),
                fallbackUrl,
              })
            }
            placeholder="https://example.com/app"
            type="url"
            helper="Used when an app-store destination is not available."
          />
        </Section>
      );

    case 'multi-link': {
      const value = content as MultiLinkContent;

      const addLink = () => {
        onChange({
          ...value,
          links: [
            ...value.links,
            {
              id: crypto.randomUUID(),
              label: '',
              url: '',
            },
          ],
        });
      };

      const updateLink = (
        id: string,
        updates: Partial<MultiLinkContent['links'][number]>
      ) => {
        onChange({
          ...value,
          links: value.links.map((link) =>
            link.id === id
              ? { ...link, ...updates }
              : link
          ),
        });
      };

      const removeLink = (id: string) => {
        onChange({
          ...value,
          links: value.links.filter(
            (link) => link.id !== id
          ),
        });
      };

      return (
        <Section
          icon={<Link2 className="h-5 w-5" />}
          title="Multiple destinations"
          description="Keep several useful links behind one QR code."
        >
          <Field
            label="Title"
            value={value.title ?? ''}
            onChange={(title) =>
              onChange({ ...value, title })
            }
            placeholder="My links"
          />

          <TextareaField
            label="Description"
            value={value.description ?? ''}
            onChange={(description) =>
              onChange({ ...value, description })
            }
            placeholder="A short introduction..."
            rows={3}
          />

          <div className="space-y-3">
            {value.links.map((link, index) => (
              <div
                key={link.id}
                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Link {index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeLink(link.id)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                    aria-label={`Remove link ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <Field
                    label="Label"
                    value={link.label}
                    onChange={(label) =>
                      updateLink(link.id, { label })
                    }
                    placeholder="Instagram"
                  />

                  <Field
                    label="URL"
                    value={link.url}
                    onChange={(url) =>
                      updateLink(link.id, { url })
                    }
                    placeholder="https://example.com"
                    type="url"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addLink}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
          >
            <Plus className="h-4 w-4" />
            Add destination
          </button>

          {!value.links.length && (
            <InfoBox>
              Add at least one destination to generate this QR code.
            </InfoBox>
          )}
        </Section>
      );
    }

    case 'event':
      return (
        <Section
          icon={<CalendarDays className="h-5 w-5" />}
          title="Event"
          description="Create a QR code containing event and calendar information."
        >
          <Field
            label="Event title"
            value={(content as EventContent).title}
            onChange={(title) =>
              onChange({
                ...(content as EventContent),
                title,
              })
            }
            placeholder="Product launch"
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Start"
              value={(content as EventContent).startDate}
              onChange={(startDate) =>
                onChange({
                  ...(content as EventContent),
                  startDate,
                })
              }
              type="datetime-local"
              required
            />

            <Field
              label="End"
              value={(content as EventContent).endDate ?? ''}
              onChange={(endDate) =>
                onChange({
                  ...(content as EventContent),
                  endDate,
                })
              }
              type="datetime-local"
            />
          </div>

          <Field
            label="Location"
            value={(content as EventContent).location ?? ''}
            onChange={(location) =>
              onChange({
                ...(content as EventContent),
                location,
              })
            }
            placeholder="Venue or address"
          />

          <Field
            label="Event URL"
            value={(content as EventContent).url ?? ''}
            onChange={(url) =>
              onChange({
                ...(content as EventContent),
                url,
              })
            }
            placeholder="https://example.com/event"
            type="url"
          />

          <TextareaField
            label="Description"
            value={(content as EventContent).description ?? ''}
            onChange={(description) =>
              onChange({
                ...(content as EventContent),
                description,
              })
            }
            placeholder="Event details..."
            rows={5}
          />
        </Section>
      );

    case 'coupon':
      return (
        <Section
          icon={<Wallet className="h-5 w-5" />}
          title="Coupon"
          description="Share a promotional offer with a scannable QR code."
        >
          <Field
            label="Coupon title"
            value={(content as CouponContent).title}
            onChange={(title) =>
              onChange({
                ...(content as CouponContent),
                title,
              })
            }
            placeholder="20% off your next order"
            required
          />

          <Field
            label="Coupon code"
            value={(content as CouponContent).code}
            onChange={(code) =>
              onChange({
                ...(content as CouponContent),
                code,
              })
            }
            placeholder="SAVE20"
            required
          />

          <TextareaField
            label="Description"
            value={(content as CouponContent).description ?? ''}
            onChange={(description) =>
              onChange({
                ...(content as CouponContent),
                description,
              })
            }
            placeholder="Describe the offer and terms..."
            rows={4}
          />

          <Field
            label="Expiration"
            value={(content as CouponContent).expiresAt ?? ''}
            onChange={(expiresAt) =>
              onChange({
                ...(content as CouponContent),
                expiresAt,
              })
            }
            type="datetime-local"
          />

          <Field
            label="Redemption URL"
            value={(content as CouponContent).url ?? ''}
            onChange={(url) =>
              onChange({
                ...(content as CouponContent),
                url,
              })
            }
            placeholder="https://example.com/redeem"
            type="url"
          />
        </Section>
      );

    case 'upi':
      return (
        <Section
          icon={<Wallet className="h-5 w-5" />}
          title="UPI payment"
          description="Create a payment QR compatible with UPI apps."
        >
          <Field
            label="UPI ID"
            value={(content as UPIContent).upiId}
            onChange={(upiId) =>
              onChange({
                ...(content as UPIContent),
                upiId,
              })
            }
            placeholder="merchant@upi"
            required
          />

          <Field
            label="Payee name"
            value={(content as UPIContent).payeeName ?? ''}
            onChange={(payeeName) =>
              onChange({
                ...(content as UPIContent),
                payeeName,
              })
            }
            placeholder="Business name"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Amount"
              value={(content as UPIContent).amount ?? ''}
              onChange={(amount) =>
                onChange({
                  ...(content as UPIContent),
                  amount,
                })
              }
              placeholder="499"
              type="number"
            />

            <Field
              label="Currency"
              value={(content as UPIContent).currency ?? 'INR'}
              onChange={(currency) =>
                onChange({
                  ...(content as UPIContent),
                  currency,
                })
              }
              placeholder="INR"
            />
          </div>

          <Field
            label="Payment note"
            value={(content as UPIContent).note ?? ''}
            onChange={(note) =>
              onChange({
                ...(content as UPIContent),
                note,
              })
            }
            placeholder="Order payment"
          />

          <InfoBox tone="warning">
            Always test payment QR codes with your own UPI app before
            publishing them publicly.
          </InfoBox>
        </Section>
      );

    case 'business':
      return (
        <Section
          icon={<UserRound className="h-5 w-5" />}
          title="Business profile"
          description="Share essential information about your business."
        >
          <Field
            label="Business name"
            value={(content as BusinessContent).name}
            onChange={(name) =>
              onChange({
                ...(content as BusinessContent),
                name,
              })
            }
            placeholder="Your business name"
            required
          />

          <TextareaField
            label="Description"
            value={(content as BusinessContent).description ?? ''}
            onChange={(description) =>
              onChange({
                ...(content as BusinessContent),
                description,
              })
            }
            placeholder="Tell people what your business does..."
            rows={4}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Phone"
              value={(content as BusinessContent).phone ?? ''}
              onChange={(phone) =>
                onChange({
                  ...(content as BusinessContent),
                  phone,
                })
              }
              placeholder="+91 98765 43210"
              type="tel"
            />

            <Field
              label="Email"
              value={(content as BusinessContent).email ?? ''}
              onChange={(email) =>
                onChange({
                  ...(content as BusinessContent),
                  email,
                })
              }
              placeholder="hello@business.com"
              type="email"
            />
          </div>

          <Field
            label="Website"
            value={(content as BusinessContent).website ?? ''}
            onChange={(website) =>
              onChange({
                ...(content as BusinessContent),
                website,
              })
            }
            placeholder="https://yourbusiness.com"
            type="url"
          />

          <Field
            label="Address"
            value={(content as BusinessContent).address ?? ''}
            onChange={(address) =>
              onChange({
                ...(content as BusinessContent),
                address,
              })
            }
            placeholder="Full business address"
          />

          <Field
            label="Opening hours"
            value={(content as BusinessContent).hours ?? ''}
            onChange={(hours) =>
              onChange({
                ...(content as BusinessContent),
                hours,
              })
            }
            placeholder="Mon–Sat, 9:00 AM–7:00 PM"
          />

          <Field
            label="Logo URL"
            value={(content as BusinessContent).logoUrl ?? ''}
            onChange={(logoUrl) =>
              onChange({
                ...(content as BusinessContent),
                logoUrl,
              })
            }
            placeholder="https://example.com/logo.png"
            type="url"
          />

          <Field
            label="Social profile"
            value={(content as BusinessContent).socialUrl ?? ''}
            onChange={(socialUrl) =>
              onChange({
                ...(content as BusinessContent),
                socialUrl,
              })
            }
            placeholder="https://instagram.com/..."
            type="url"
          />
        </Section>
      );

    default:
      return (
        <InfoBox>
          Select a QR code type to start adding content.
        </InfoBox>
      );
  }
}

export default ContentForm;