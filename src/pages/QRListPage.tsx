import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { QRCode as QRCodeType } from '../types';
import { PageKey } from '../components/AppLayout';

import {
  QrCode,
  Plus,
  Search,
  Filter,
  Eye,
  MoreVertical,
  Trash2,
  Edit3,
  Download,
  Copy,
} from 'lucide-react';

import {
  generateQRDataURL,
  downloadFile,
  buildQRPayload,
} from '../lib/qr';

const typeLabels: Record<string, string> = {
  url: 'Website URL',
  multi_link: 'Multi-Link',
  business_card: 'Business Card',
  whatsapp: 'WhatsApp',
  phone: 'Phone',
  email: 'Email',
  sms: 'SMS',
  maps: 'Google Maps',
  upi: 'UPI Payment',
  pdf: 'PDF',
  image: 'Image',
  video: 'Video',
  text: 'Plain Text',
};

interface QRListPageProps {
  onNavigate: (
    page: PageKey,
    params?: Record<string, string>
  ) => void;
}

export default function QRListPage({
  onNavigate,
}: QRListPageProps) {
  const { user } = useAuth();

  const [qrCodes, setQRCodes] = useState<QRCodeType[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const [qrPreviews, setQRPreviews] = useState<
    Record<string, string>
  >({});

  // ------------------------------------------
  // FETCH QR CODES
  // ------------------------------------------

  const fetchQRCodes = useCallback(async () => {
    if (!user) {
      setQRCodes([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch QR codes:', error);
      setQRCodes([]);
      setLoading(false);
      return;
    }

    setQRCodes((data ?? []) as QRCodeType[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void fetchQRCodes();
  }, [fetchQRCodes]);

  // ------------------------------------------
  // GENERATE QR PREVIEWS
  // ------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const createPreviews = async () => {
      const previews: Record<string, string> = {};

      for (const qr of qrCodes) {
        try {
          const payload = buildQRPayload(
            qr.type,
            qr.destination,
            qr.data
          );

          if (!payload) {
            continue;
          }

          const dataUrl = await generateQRDataURL(
            payload,
            {
              foreground: qr.foreground_color || '#000000',
              background: qr.background_color || '#ffffff',
              errorCorrection:
                (qr.error_correction || 'M') as
                  | 'L'
                  | 'M'
                  | 'Q'
                  | 'H',
              size: qr.size || 300,
            }
          );

          previews[qr.id] = dataUrl;
        } catch (error) {
          console.error(
            `Failed to generate preview for ${qr.name}:`,
            error
          );
        }
      }

      if (!cancelled) {
        setQRPreviews(previews);
      }
    };

    void createPreviews();

    return () => {
      cancelled = true;
    };
  }, [qrCodes]);

  // ------------------------------------------
  // FILTER
  // ------------------------------------------

  const filtered = qrCodes.filter((qr) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      (qr.name || '').toLowerCase().includes(searchValue) ||
      (qr.type || '').toLowerCase().includes(searchValue);

    const matchesType =
      typeFilter === 'all' ||
      qr.type === typeFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && qr.is_active) ||
      (statusFilter === 'inactive' && !qr.is_active);

    return (
      matchesSearch &&
      matchesType &&
      matchesStatus
    );
  });

  // ------------------------------------------
  // OPEN DETAILS
  // ------------------------------------------

  const handleOpenQR = (id: string) => {
    setMenuOpen(null);

    onNavigate('qr-detail', {
      id,
    });
  };

  // ------------------------------------------
  // DELETE
  // ------------------------------------------

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this QR code? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(
        'Failed to delete QR code:',
        error
      );

      window.alert(
        'Failed to delete QR code.'
      );

      return;
    }

    setQRCodes((current) =>
      current.filter((qr) => qr.id !== id)
    );

    setQRPreviews((current) => {
      const updated = { ...current };
      delete updated[id];
      return updated;
    });

    setMenuOpen(null);
  };

  // ------------------------------------------
  // DOWNLOAD
  // ------------------------------------------

  const handleDownload = async (
    qr: QRCodeType
  ) => {
    try {
      let dataUrl = qrPreviews[qr.id];

      if (!dataUrl) {
        const payload = buildQRPayload(
          qr.type,
          qr.destination,
          qr.data
        );

        if (!payload) {
          window.alert(
            'Unable to generate this QR code.'
          );

          return;
        }

        dataUrl = await generateQRDataURL(
          payload,
          {
            foreground:
              qr.foreground_color || '#000000',
            background:
              qr.background_color || '#ffffff',
            errorCorrection:
              (qr.error_correction || 'M') as
                | 'L'
                | 'M'
                | 'Q'
                | 'H',
            size: qr.size || 300,
          }
        );
      }

      downloadFile(
        dataUrl,
        `${qr.name.replace(/\s+/g, '_')}.png`
      );

      setMenuOpen(null);
    } catch (error) {
      console.error(
        'QR download failed:',
        error
      );

      window.alert(
        'Failed to download QR code.'
      );
    }
  };

  // ------------------------------------------
  // COPY LINK
  // ------------------------------------------

  const handleCopyLink = async (
    qr: QRCodeType
  ) => {
    try {
      if (!qr.destination) {
        window.alert(
          'This QR code does not have a destination link.'
        );

        return;
      }

      await navigator.clipboard.writeText(
        qr.destination
      );

      window.alert('Link copied.');

      setMenuOpen(null);
    } catch (error) {
      console.error(
        'Copy failed:',
        error
      );

      window.alert(
        'Failed to copy link.'
      );
    }
  };

  // ------------------------------------------
  // PAGE
  // ------------------------------------------

  return (
    <div
      className="p-6 lg:p-8 max-w-7xl mx-auto"
      onClick={() => setMenuOpen(null)}
    >
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My QR Codes
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            Manage all your QR codes in one place
          </p>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();

            onNavigate('qr-create');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />

          Create QR Code
        </button>
      </div>

      {/* FILTERS */}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

          <input
            type="text"
            placeholder="Search by name or type..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            onClick={(event) =>
              event.stopPropagation()
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white"
          />
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
              onClick={(event) =>
                event.stopPropagation()
              }
              className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white appearance-none cursor-pointer"
            >
              <option value="all">
                All Types
              </option>

              {Object.entries(typeLabels).map(
                ([key, label]) => (
                  <option
                    key={key}
                    value={key}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            onClick={(event) =>
              event.stopPropagation()
            }
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white cursor-pointer"
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>
      </div>

      {/* CONTENT */}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map(
            (_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse"
              >
                <div className="w-full aspect-square bg-slate-100 rounded-xl mb-4" />

                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />

                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            )
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <QrCode className="w-16 h-16 text-slate-200 mx-auto mb-4" />

          <p className="text-slate-500 font-medium">
            No QR codes found
          </p>

          <p className="text-slate-400 text-sm mt-1">
            {qrCodes.length === 0
              ? 'Create your first QR code to get started'
              : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((qr) => (
            <div
              key={qr.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:border-blue-100 transition-all group"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              {/* QR PREVIEW */}

              <button
                type="button"
                onClick={() =>
                  handleOpenQR(qr.id)
                }
                className="block w-full text-left"
                aria-label={`Open ${qr.name}`}
              >
                <div className="w-full aspect-square bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden">
                  {qrPreviews[qr.id] ? (
                    <img
                      src={qrPreviews[qr.id]}
                      alt={`${qr.name} QR code`}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <QrCode className="w-16 h-16 text-slate-300" />
                  )}
                </div>
              </button>

              {/* INFORMATION */}

              <div className="flex items-start justify-between mt-4">
                <button
                  type="button"
                  onClick={() =>
                    handleOpenQR(qr.id)
                  }
                  className="text-left min-w-0 flex-1"
                >
                  <h3 className="font-semibold text-slate-900 text-sm truncate">
                    {qr.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">
                      {typeLabels[qr.type] ||
                        qr.type}
                    </span>

                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                        qr.is_dynamic
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-slate-50 text-slate-500'
                      }`}
                    >
                      {qr.is_dynamic
                        ? 'Dynamic'
                        : 'Static'}
                    </span>
                  </div>
                </button>

                {/* MENU */}

                <div className="relative ml-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();

                      setMenuOpen(
                        menuOpen === qr.id
                          ? null
                          : qr.id
                      );
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                    aria-label="QR code menu"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {menuOpen === qr.id && (
                    <div
                      className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 min-w-[160px]"
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenQR(qr.id)
                        }
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="w-4 h-4" />

                        View Details
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(null);

                          onNavigate(
                            'qr-create',
                            {
                              id: qr.id,
                            }
                          );
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Edit3 className="w-4 h-4" />

                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void handleDownload(qr)
                        }
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Download className="w-4 h-4" />

                        Download
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void handleCopyLink(qr)
                        }
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Copy className="w-4 h-4" />

                        Copy Link
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void handleDelete(qr.id)
                        }
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />

                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* STATUS */}

              <div className="flex items-center justify-end mt-3 pt-3 border-t border-slate-50">
                <span
                  className={`w-2 h-2 rounded-full ${
                    qr.is_active
                      ? 'bg-emerald-500'
                      : 'bg-slate-300'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}