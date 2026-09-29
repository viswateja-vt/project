```tsx
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { QRCode as QRCodeType, QRLink } from '../types';
import { PageKey } from '../components/AppLayout';

import {
  ArrowLeft,
  QrCode,
  Copy,
  Edit3,
  Trash2,
  Link2,
  Loader2,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';

import {
  generateQRDataURL,
  generateQRSVGString,
  buildQRPayload,
  downloadFile,
  svgToDataURL,
} from '../lib/qr';

import jsPDF from 'jspdf';

interface QRDetailPageProps {
  qrId: string;
  onNavigate: (
    page: PageKey,
    params?: Record<string, string>
  ) => void;
}

export default function QRDetailPage({
  qrId,
  onNavigate,
}: QRDetailPageProps) {
  const { user } = useAuth();

  const [qr, setQR] = useState<QRCodeType | null>(null);
  const [links, setLinks] = useState<QRLink[]>([]);

  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // ------------------------------------------
  // LOAD QR CODE
  // ------------------------------------------

  const loadQR = useCallback(async () => {
    if (!user || !qrId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setPreview('');

    try {
      // --------------------------------------
      // LOAD QR FROM SUPABASE
      // --------------------------------------

      const {
        data,
        error,
      } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', qrId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setQR(null);
        setLinks([]);
        setLoading(false);
        return;
      }

      const qrRecord = data as QRCodeType;

      setQR(qrRecord);

      // --------------------------------------
      // LOAD MULTI-LINKS
      // --------------------------------------

      let loadedLinks: QRLink[] = [];

      if (qrRecord.type === 'multi_link') {
        const {
          data: linkData,
          error: linkError,
        } = await supabase
          .from('qr_links')
          .select('*')
          .eq('qr_code_id', qrRecord.id)
          .order('position', {
            ascending: true,
          });

        if (linkError) {
          console.error(
            'Failed to load QR links:',
            linkError
          );

          setLinks([]);
        } else {
          loadedLinks =
            (linkData ?? []) as QRLink[];

          setLinks(loadedLinks);
        }
      } else {
        setLinks([]);
      }

      // --------------------------------------
      // BUILD QR PAYLOAD
      // --------------------------------------

      let payload = '';

      /*
       * Multi-link QR:
       * Use the first valid URL saved in qr_links.
       */
      if (
        qrRecord.type === 'multi_link' &&
        loadedLinks.length > 0
      ) {
        const firstLink =
          loadedLinks.find(
            (link) =>
              typeof link.url === 'string' &&
              link.url.trim().length > 0
          );

        if (firstLink) {
          payload = firstLink.url.trim();
        }
      }

      /*
       * Normal QR:
       * Use the destination saved in qr_codes directly.
       *
       * This is the important part for your Google QR.
       */
      if (
        !payload &&
        typeof qrRecord.destination === 'string' &&
        qrRecord.destination.trim()
      ) {
        payload =
          qrRecord.destination.trim();
      }

      /*
       * Fallback for QR types where the payload
       * is constructed from destination + data.
       */
      if (!payload) {
        payload = buildQRPayload(
          qrRecord.type,
          qrRecord.destination,
          qrRecord.data
        );
      }

      console.log(
        'QR DETAIL PAYLOAD:',
        payload
      );

      if (!payload) {
        setErrorMessage(
          'This QR code does not have valid content to generate an image.'
        );
        setLoading(false);
        return;
      }

      // --------------------------------------
      // GENERATE QR IMAGE
      // --------------------------------------

      const image =
        await generateQRDataURL(
          payload,
          {
            foreground:
              qrRecord.foreground_color ||
              '#000000',

            background:
              qrRecord.background_color ||
              '#ffffff',

            errorCorrection:
              getErrorCorrection(
                qrRecord.error_correction
              ),

            size:
              qrRecord.size || 400,
          }
        );

      console.log(
        'QR DETAIL IMAGE GENERATED:',
        Boolean(image)
      );

      if (!image) {
        throw new Error(
          'QR generator returned an empty image.'
        );
      }

      setPreview(image);
    } catch (error) {
      console.error(
        'QR DETAIL ERROR:',
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to generate QR code.'
      );
    } finally {
      setLoading(false);
    }
  }, [qrId, user]);

  useEffect(() => {
    void loadQR();
  }, [loadQR]);

  // ------------------------------------------
  // GET PAYLOAD
  // ------------------------------------------

  const getPayload = () => {
    if (!qr) {
      return '';
    }

    if (
      qr.type === 'multi_link' &&
      links.length > 0
    ) {
      const firstLink =
        links.find(
          (link) =>
            typeof link.url === 'string' &&
            link.url.trim().length > 0
        );

      if (firstLink) {
        return firstLink.url.trim();
      }
    }

    if (
      typeof qr.destination === 'string' &&
      qr.destination.trim()
    ) {
      return qr.destination.trim();
    }

    return buildQRPayload(
      qr.type,
      qr.destination,
      qr.data
    );
  };

  // ------------------------------------------
  // DOWNLOAD PNG
  // ------------------------------------------

  const handleDownloadPNG = async () => {
    if (!qr) return;

    try {
      const payload = getPayload();

      if (!payload) {
        window.alert(
          'Unable to generate QR code.'
        );
        return;
      }

      const image =
        await generateQRDataURL(
          payload,
          {
            foreground:
              qr.foreground_color ||
              '#000000',

            background:
              qr.background_color ||
              '#ffffff',

            errorCorrection:
              getErrorCorrection(
                qr.error_correction
              ),

            size:
              qr.size || 400,
          }
        );

      downloadFile(
        image,
        `${safeFileName(qr.name)}.png`
      );
    } catch (error) {
      console.error(
        'PNG download error:',
        error
      );

      window.alert(
        'Failed to download PNG.'
      );
    }
  };

  // ------------------------------------------
  // DOWNLOAD SVG
  // ------------------------------------------

  const handleDownloadSVG = async () => {
    if (!qr) return;

    try {
      const payload = getPayload();

      if (!payload) {
        window.alert(
          'Unable to generate QR code.'
        );
        return;
      }

      const svg =
        await generateQRSVGString(
          payload,
          {
            foreground:
              qr.foreground_color ||
              '#000000',

            background:
              qr.background_color ||
              '#ffffff',

            errorCorrection:
              getErrorCorrection(
                qr.error_correction
              ),

            size:
              qr.size || 400,
          }
        );

      downloadFile(
        svgToDataURL(svg),
        `${safeFileName(qr.name)}.svg`
      );
    } catch (error) {
      console.error(
        'SVG download error:',
        error
      );

      window.alert(
        'Failed to download SVG.'
      );
    }
  };

  // ------------------------------------------
  // DOWNLOAD PDF
  // ------------------------------------------

  const handleDownloadPDF = async () => {
    if (!qr) return;

    try {
      const payload = getPayload();

      if (!payload) {
        window.alert(
          'Unable to generate QR code.'
        );
        return;
      }

      const image =
        await generateQRDataURL(
          payload,
          {
            foreground:
              qr.foreground_color ||
              '#000000',

            background:
              qr.background_color ||
              '#ffffff',

            errorCorrection:
              getErrorCorrection(
                qr.error_correction
              ),

            size: 800,
          }
        );

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      pdf.setFontSize(20);

      pdf.text(
        qr.name,
        105,
        30,
        {
          align: 'center',
        }
      );

      pdf.setFontSize(10);

      pdf.text(
        `Type: ${qr.type}`,
        105,
        40,
        {
          align: 'center',
        }
      );

      pdf.addImage(
        image,
        'PNG',
        65,
        50,
        80,
        80
      );

      if (qr.destination) {
        pdf.setFontSize(8);

        pdf.text(
          qr.destination.substring(
            0,
            80
          ),
          105,
          145,
          {
            align: 'center',
            maxWidth: 180,
          }
        );
      }

      pdf.save(
        `${safeFileName(qr.name)}.pdf`
      );
    } catch (error) {
      console.error(
        'PDF download error:',
        error
      );

      window.alert(
        'Failed to download PDF.'
      );
    }
  };

  // ------------------------------------------
  // COPY LINK
  // ------------------------------------------

  const handleCopy = async () => {
    if (!qr) return;

    const value =
      qr.destination || '';

    if (!value) {
      window.alert(
        'There is no destination link to copy.'
      );

      return;
    }

    try {
      await navigator.clipboard.writeText(
        value
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        'Copy error:',
        error
      );

      window.alert(
        'Failed to copy link.'
      );
    }
  };

  // ------------------------------------------
  // DELETE
  // ------------------------------------------

  const handleDelete = async () => {
    if (!qr) return;

    const confirmed =
      window.confirm(
        'Delete this QR code permanently?'
      );

    if (!confirmed) {
      return;
    }

    const { error } =
      await supabase
        .from('qr_codes')
        .delete()
        .eq('id', qr.id);

    if (error) {
      console.error(
        'Delete error:',
        error
      );

      window.alert(
        'Failed to delete QR code.'
      );

      return;
    }

    onNavigate('qr-list');
  };

  // ------------------------------------------
  // ACTIVATE / DEACTIVATE
  // ------------------------------------------

  const handleToggleActive =
    async () => {
      if (!qr) return;

      const newStatus =
        !qr.is_active;

      const { error } =
        await supabase
          .from('qr_codes')
          .update({
            is_active: newStatus,
          })
          .eq('id', qr.id);

      if (error) {
        console.error(
          'Status update error:',
          error
        );

        window.alert(
          'Failed to update QR status.'
        );

        return;
      }

      setQR({
        ...qr,
        is_active: newStatus,
      });
    };

  // ------------------------------------------
  // LOADING
  // ------------------------------------------

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // ------------------------------------------
  // NOT FOUND
  // ------------------------------------------

  if (!qr) {
    return (
      <div className="p-8 text-center">
        <QrCode className="w-16 h-16 text-slate-200 mx-auto mb-4" />

        <p className="text-slate-500">
          QR code not found.
        </p>

        <button
          type="button"
          onClick={() =>
            onNavigate('qr-list')
          }
          className="mt-4 text-blue-600 font-medium"
        >
          Back to QR Codes
        </button>
      </div>
    );
  }

  // ------------------------------------------
  // PAGE
  // ------------------------------------------

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">

      {/* BACK */}

      <button
        type="button"
        onClick={() =>
          onNavigate('qr-list')
        }
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5"
      >
        <ArrowLeft className="w-4 h-4" />

        Back to QR Codes
      </button>

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {qr.name}
          </h1>

          <div className="flex items-center gap-2 mt-2">

            <span className="text-sm text-slate-500 capitalize">
              {qr.type.replace(
                '_',
                ' '
              )}
            </span>

            <span className="text-slate-300">
              •
            </span>

            <span className="text-sm text-slate-500">
              {qr.is_dynamic
                ? 'Dynamic'
                : 'Static'}
            </span>

            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium ${
                qr.is_active
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {qr.is_active ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}

              {qr.is_active
                ? 'Active'
                : 'Inactive'}
            </span>

          </div>
        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={() =>
              onNavigate(
                'qr-create',
                {
                  id: qr.id,
                }
              )
            }
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl"
          >
            <Edit3 className="w-4 h-4" />

            Edit
          </button>

          <button
            type="button"
            onClick={() =>
              void handleDelete()
            }
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium rounded-xl"
          >
            <Trash2 className="w-4 h-4" />

            Delete
          </button>

        </div>
      </div>

      {/* CONTENT */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* QR IMAGE */}

        <div className="bg-white rounded-2xl border border-slate-100 p-6">

          <div className="aspect-square rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">

            {preview ? (
              <img
                src={preview}
                alt={`${qr.name} QR code`}
                className="w-full h-full object-contain p-5"
              />
            ) : (
              <div className="text-center p-6">

                <QrCode className="w-20 h-20 text-slate-200 mx-auto mb-4" />

                <p className="text-sm font-medium text-red-500">
                  QR image not available
                </p>

                {errorMessage && (
                  <p className="text-xs text-slate-500 mt-2 break-words">
                    {errorMessage}
                  </p>
                )}

              </div>
            )}

          </div>

          {/* DOWNLOAD */}

          <div className="mt-5">

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Download
            </p>

            <div className="grid grid-cols-3 gap-2">

              <button
                type="button"
                onClick={() =>
                  void handleDownloadPNG()
                }
                className="flex flex-col items-center gap-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                <ImageIcon className="w-5 h-5 text-slate-500" />

                <span className="text-xs font-medium text-slate-600">
                  PNG
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleDownloadSVG()
                }
                className="flex flex-col items-center gap-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                <FileText className="w-5 h-5 text-slate-500" />

                <span className="text-xs font-medium text-slate-600">
                  SVG
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleDownloadPDF()
                }
                className="flex flex-col items-center gap-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                <FileText className="w-5 h-5 text-slate-500" />

                <span className="text-xs font-medium text-slate-600">
                  PDF
                </span>
              </button>

            </div>
          </div>

          {/* COPY */}

          <button
            type="button"
            onClick={() =>
              void handleCopy()
            }
            className="w-full mt-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center justify-center gap-2"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}

            {copied
              ? 'Copied'
              : 'Copy Destination'}
          </button>

          {/* ACTIVE */}

          <button
            type="button"
            onClick={() =>
              void handleToggleActive()
            }
            className="w-full mt-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-medium text-slate-700"
          >
            {qr.is_active
              ? 'Deactivate QR Code'
              : 'Activate QR Code'}
          </button>

        </div>

        {/* DETAILS */}

        <div className="lg:col-span-2 space-y-5">

          {/* QR DETAILS */}

          <div className="bg-white rounded-2xl border border-slate-100 p-6">

            <h2 className="font-semibold text-slate-900 mb-5">
              QR Details
            </h2>

            <div className="space-y-4">

              <DetailRow
                label="Name"
                value={qr.name}
              />

              <DetailRow
                label="Type"
                value={qr.type.replace(
                  '_',
                  ' '
                )}
              />

              <DetailRow
                label="Mode"
                value={
                  qr.is_dynamic
                    ? 'Dynamic'
                    : 'Static'
                }
              />

              <DetailRow
                label="Status"
                value={
                  qr.is_active
                    ? 'Active'
                    : 'Inactive'
                }
              />

              {qr.destination && (
                <DetailRow
                  label="Destination"
                  value={
                    qr.destination
                  }
                  mono
                />
              )}

              <DetailRow
                label="Created"
                value={new Date(
                  qr.created_at
                ).toLocaleString()}
              />

            </div>
          </div>

          {/* MULTI-LINK */}

          {links.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">

              <div className="flex items-center gap-2 mb-5">

                <Link2 className="w-5 h-5 text-blue-500" />

                <h2 className="font-semibold text-slate-900">
                  Multi-Link Destinations
                </h2>

              </div>

              <div className="space-y-2">

                {links.map(
                  (link, index) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"
                    >

                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="text-sm font-medium text-slate-900">
                          {link.label}
                        </p>

                        <p className="text-xs text-slate-400 truncate">
                          {link.url}
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>
            </div>
          )}

          {/* DATA */}

          <div className="bg-white rounded-2xl border border-slate-100 p-6">

            <h2 className="font-semibold text-slate-900 mb-4">
              QR Configuration
            </h2>

            <div className="grid grid-cols-2 gap-4">

              <DetailRow
                label="Size"
                value={`${qr.size}px`}
              />

              <DetailRow
                label="Error Correction"
                value={
                  qr.error_correction
                }
              />

              <DetailRow
                label="Foreground"
                value={
                  qr.foreground_color
                }
                mono
              />

              <DetailRow
                label="Background"
                value={
                  qr.background_color
                }
                mono
              />

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ------------------------------------------
// HELPERS
// ------------------------------------------

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-5">

      <span className="text-sm text-slate-400 flex-shrink-0">
        {label}
      </span>

      <span
        className={`text-sm font-medium text-slate-900 text-right break-words ${
          mono
            ? 'font-mono text-xs'
            : ''
        }`}
      >
        {value}
      </span>

    </div>
  );
}

function getErrorCorrection(
  value: string | null | undefined
): 'L' | 'M' | 'Q' | 'H' {
  if (
    value === 'L' ||
    value === 'M' ||
    value === 'Q' ||
    value === 'H'
  ) {
    return value;
  }

  return 'M';
}

function safeFileName(
  name: string
): string {
  const cleaned = name
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return cleaned || 'qr-code';
}
```
