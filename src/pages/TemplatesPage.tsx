import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  ExternalLink,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Smartphone,
  Sparkles,
  Utensils,
  Wifi,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';

import { DashboardLayout } from '../components/DashboardLayout';
import type { QRType } from '../lib/qrTypes';

interface Template {
  id: string;
  name: string;
  description: string;
  type: QRType;
  category: string;
  icon: typeof ExternalLink;
  popular?: boolean;
}

const templates: Template[] = [
  {
    id: 'website',
    name: 'Website',
    description: 'Send visitors directly to any website or landing page.',
    type: 'url',
    category: 'Marketing',
    icon: ExternalLink,
    popular: true,
  },
  {
    id: 'digital-menu',
    name: 'Digital Menu',
    description: 'Let customers open your restaurant menu instantly.',
    type: 'url',
    category: 'Business',
    icon: Utensils,
    popular: true,
  },
  {
    id: 'wifi',
    name: 'Wi-Fi Access',
    description: 'Share Wi-Fi credentials without typing passwords.',
    type: 'wifi',
    category: 'Business',
    icon: Wifi,
    popular: true,
  },
  {
    id: 'business-card',
    name: 'Digital Business Card',
    description: 'Share contact information with a single scan.',
    type: 'vcard',
    category: 'Business',
    icon: BriefcaseBusiness,
  },
  {
    id: 'event',
    name: 'Event',
    description: 'Share event details and make calendar saves easier.',
    type: 'event',
    category: 'Events',
    icon: CalendarDays,
  },
  {
    id: 'location',
    name: 'Location',
    description: 'Open a precise location or venue in maps.',
    type: 'location',
    category: 'Business',
    icon: MapPin,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Start a WhatsApp conversation from a QR scan.',
    type: 'whatsapp',
    category: 'Social',
    icon: MessageCircle,
  },
  {
    id: 'payment',
    name: 'UPI Payment',
    description: 'Make digital payments easier at checkout.',
    type: 'upi',
    category: 'Payments',
    icon: CreditCard,
  },
  {
    id: 'app',
    name: 'App Download',
    description: 'Route customers to your mobile app download page.',
    type: 'app',
    category: 'Marketing',
    icon: Smartphone,
  },
  {
    id: 'social',
    name: 'Social Profile',
    description: 'Bring multiple social profiles together.',
    type: 'social',
    category: 'Social',
    icon: Heart,
  },
];

const categories = [
  'All',
  'Marketing',
  'Business',
  'Events',
  'Social',
  'Payments',
];

export function TemplatesPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const filteredTemplates = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesCategory =
        category === 'All' || template.category === category;

      const matchesQuery =
        !normalized ||
        template.name.toLowerCase().includes(normalized) ||
        template.description.toLowerCase().includes(normalized) ||
        template.category.toLowerCase().includes(normalized);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  function useTemplate(template: Template) {
    navigate(`/create?type=${template.type}`);
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 dark:border-indigo-950 dark:from-indigo-950/40 dark:via-slate-900 dark:to-violet-950/30 sm:p-8">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles size={17} />

              <span className="text-xs font-bold uppercase tracking-[0.15em]">
                QR templates
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Start with a ready-made QR experience.
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Choose a template, add your content and customize the
              design. You can change everything before publishing.
            </p>

            <Link
              to="/create"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
            >
              <Plus size={16} />
              Start from scratch
            </Link>
          </div>

          <div className="pointer-events-none absolute -right-12 -top-16 hidden h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-600/10 sm:block" />
          <div className="pointer-events-none absolute -bottom-20 right-24 hidden h-48 w-48 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-600/10 sm:block" />
        </section>

        <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-md">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search templates..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setShowCategoryMenu((value) => !value)
              }
              className="inline-flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-52"
            >
              {category}
              <span className="text-slate-400">⌄</span>
            </button>

            {showCategoryMenu && (
              <div className="absolute right-0 top-12 z-20 w-full rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:w-52">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setCategory(item);
                      setShowCategoryMenu(false);
                    }}
                    className={[
                      'w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition',
                      category === item
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800',
                    ].join(' ')}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {filteredTemplates.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Search size={20} />
            </div>

            <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              No templates found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Try a different search term or select another category.
            </p>
          </div>
        ) : (
          <>
            {category === 'All' && !query && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-950 dark:text-white">
                      Popular templates
                    </h2>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Common QR experiences to get started quickly.
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    {templates.filter((item) => item.popular).length}{' '}
                    templates
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {templates
                    .filter((template) => template.popular)
                    .map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        featured
                        onUse={() => useTemplate(template)}
                      />
                    ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">
                    {category === 'All'
                      ? 'All templates'
                      : `${category} templates`}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {filteredTemplates.length} available template
                    {filteredTemplates.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={() => useTemplate(template)}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Need something custom?
              </p>

              <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                Build a QR code from scratch.
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Access every QR type and all design controls from the
                full creator.
              </p>
            </div>

            <Link
              to="/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
            >
              Open QR builder
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function TemplateCard({
  template,
  featured = false,
  onUse,
}: {
  template: Template;
  featured?: boolean;
  onUse: () => void;
}) {
  const Icon = template.icon;

  return (
    <article
      className={[
        'group relative flex flex-col rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900',
        featured
          ? 'border-indigo-100 hover:border-indigo-200 dark:border-indigo-950 dark:hover:border-indigo-900'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
          <Icon size={20} />
        </div>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label={`More options for ${template.name}`}
        >
          <MoreHorizontal size={17} />
        </button>
      </div>

      <div className="mt-5 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white">
            {template.name}
          </h3>

          {template.popular && (
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
              Popular
            </span>
          )}
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {template.description}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {template.category}
        </span>

        <button
          type="button"
          onClick={onUse}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-400"
        >
          Use template
          <ArrowRight size={12} />
        </button>
      </div>
    </article>
  );
}