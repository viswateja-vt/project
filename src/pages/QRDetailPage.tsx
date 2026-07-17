import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { QRCode as QRCodeType, Scan, QRLink } from '../types';
import { PageKey } from '../components/AppLayout';
import {
  ArrowLeft, QrCode, Eye, Copy, Edit3, Trash2, Link2, Smartphone, Globe, Calendar,
  Loader2, CheckCircle, XCircle, Image as ImageIcon, FileText,
} from 'lucide-react';
import { generateQRDataURL, generateQRSVGString, buildQRPayload, downloadFile, svgToDataURL } from '../lib/qr';
import jsPDF from 'jspdf';

interface QRDetailPageProps {
  qrId: string;
  onNavigate: (page: PageKey, params?: Record<string, string>) => void;
}

export default function QRDetailPage({ qrId, onNavigate }: QRDetailPageProps) {
  const { user } = useAuth();
  const [qr, setQR] = useState<QRCodeType | null>(null);
  const [links, setLinks] = useState<QRLink[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'scans'>('overview');

  const fetchQR = useCallback(async () => {
    if (!user) return;
    const { data: qrData } = await supabase.from('qr_codes').select('*').eq('id', qrId).eq('user_id', user.id).maybeSingle();
    if (!qrData) { setLoading(false); return; }
    const qr = qrData as QRCodeType;
    setQR(qr);

    const { data: qrLinks } = await supabase.from('qr_links').select('*').eq('qr_code_id', qrId).order('position', { ascending: true });
    setLinks((qrLinks ?? []) as QRLink[]);

    const { data: scanData } = await supabase.from('scans').select('*').eq('qr_code_id', qrId).order('created_at', { ascending: false }).limit(100);
    setScans((scanData ?? []) as Scan[]);

    const payload = buildQRPayload(qr.type, qr.destination, qr.data);
    if (payload) {
      const url = await generateQRDataURL(payload, {
        foreground: qr.foreground_color,
        background: qr.background_color,
        errorCorrection: qr.error_correction as 'L' | 'M' | 'Q' | 'H',
        size: 400,
      });
      setPreview(url);
    }
    setLoading(false);
  }, [qrId, user]);

  useEffect(() => { fetchQR(); }, [fetchQR]);

  const handleDownloadPNG = async () => {
    if (!qr) return;
    const payload = buildQRPayload(qr.type, qr.destination, qr.data);
    const dataUrl = await generateQRDataURL(payload, {
      foreground: qr.foreground_color, background: qr.background_color,
      errorCorrection: qr.error_correction as 'L' | 'M' | 'Q' | 'H', size: qr.size,
    });
    downloadFile(dataUrl, `${qr.name.replace(/\s+/g, '_')}.png`);
  };

  const handleDownloadSVG = async () => {
    if (!qr) return;
    const payload = buildQRPayload(qr.type, qr.destination, qr.data);
    const svg = await generateQRSVGString(payload, {
      foreground: qr.foreground_color, background: qr.background_color,
      errorCorrection: qr.error_correction as 'L' | 'M' | 'Q' | 'H', size: qr.size,
    });
    downloadFile(svgToDataURL(svg), `${qr.name.replace(/\s+/g, '_')}.svg`);
  };

  const handleDownloadPDF = async () => {
    if (!qr) return;
    const payload = buildQRPayload(qr.type, qr.destination, qr.data);
    const dataUrl = await generateQRDataURL(payload, {
      foreground: qr.foreground_color, background: qr.background_color,
      errorCorrection: qr.error_correction as 'L' | 'M' | 'Q' | 'H', size: 800,
    });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.setFontSize(20);
    pdf.text(qr.name, 105, 30, { align: 'center' });
    pdf.setFontSize(10);
    pdf.text(`Type: ${qr.type} | ${qr.is_dynamic ? 'Dynamic' : 'Static'}`, 105, 40, { align: 'center' });
    pdf.addImage(dataUrl, 'PNG', 65, 50, 80, 80);
    if (qr.destination) {
      pdf.setFontSize(8);
      pdf.text(`Destination: ${qr.destination.substring(0, 80)}`, 105, 145, { align: 'center', maxWidth: 180 });
    }
    pdf.setFontSize(8);
    pdf.text(`Created: ${new Date(qr.created_at).toLocaleDateString()}`, 105, 160, { align: 'center' });
    pdf.save(`${qr.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleCopyLink = () => {
    if (!qr) return;
    const url = qr.is_dynamic && qr.short_id
      ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/qr-redirect?id=${qr.short_id}`
      : qr.destination ?? '';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!qr || !confirm('Delete this QR code permanently?')) return;
    await supabase.from('qr_codes').delete().eq('id', qr.id);
    onNavigate('qr-list');
  };

  const handleToggleActive = async () => {
    if (!qr) return;
    await supabase.from('qr_codes').update({ is_active: !qr.is_active }).eq('id', qr.id);
    setQR({ ...qr, is_active: !qr.is_active });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!qr) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">QR code not found.</p>
        <button onClick={() => onNavigate('qr-list')} className="mt-4 text-blue-600 font-medium">Back to list</button>
      </div>
    );
  }

  const dynamicUrl = qr.is_dynamic && qr.short_id
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/qr-redirect?id=${qr.short_id}`
    : null;

  // Analytics
  const deviceBreakdown = scans.reduce((acc, s) => {
    const d = s.device_type || 'Unknown';
    acc[d] = (acc[d] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const browserBreakdown = scans.reduce((acc, s) => {
    const b = s.browser || 'Unknown';
    acc[b] = (acc[b] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const recentScans = scans.filter((s) => new Date(s.created_at) >= last7Days);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <button onClick={() => onNavigate('qr-list')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to QR Codes
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{qr.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-slate-500 capitalize">{qr.type.replace('_', ' ')}</span>
            <span className="text-slate-300">·</span>
            <span className="text-sm text-slate-500">{qr.is_dynamic ? 'Dynamic' : 'Static'}</span>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium ${
              qr.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
            }`}>
              {qr.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {qr.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate('qr-create', { id: qr.id })} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors">
            <Edit3 className="w-4 h-4" /> Edit
          </button>
          <button onClick={handleDelete} className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium rounded-xl transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Preview */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="aspect-square rounded-xl bg-slate-50 flex items-center justify-center mb-4 overflow-hidden">
            {preview ? (
              <img src={preview} alt={qr.name} className="w-full h-full object-contain" />
            ) : (
              <QrCode className="w-20 h-20 text-slate-200" />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Download</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={handleDownloadPNG} className="flex flex-col items-center gap-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                <ImageIcon className="w-5 h-5 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">PNG</span>
              </button>
              <button onClick={handleDownloadSVG} className="flex flex-col items-center gap-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                <FileText className="w-5 h-5 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">SVG</span>
              </button>
              <button onClick={handleDownloadPDF} className="flex flex-col items-center gap-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                <FileText className="w-5 h-5 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">PDF</span>
              </button>
            </div>
          </div>

          {dynamicUrl && (
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Dynamic Link</p>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <code className="flex-1 text-xs text-slate-600 truncate">{dynamicUrl}</code>
                <button onClick={handleCopyLink} className="p-1.5 text-slate-400 hover:text-blue-600">
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button onClick={handleToggleActive} className="w-full mt-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700">
            {qr.is_active ? 'Deactivate' : 'Activate'} QR Code
          </button>
        </div>

        {/* Tabs */}
        <div className="lg:col-span-2">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-4">
            {(['overview', 'analytics', 'scans'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'scans' ? `Scans (${scans.length})` : tab}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">QR Details</h3>
                <div className="space-y-3">
                  <DetailRow label="Name" value={qr.name} />
                  <DetailRow label="Type" value={qr.type.replace('_', ' ')} capitalize />
                  <DetailRow label="Mode" value={qr.is_dynamic ? 'Dynamic' : 'Static'} />
                  {qr.destination && <DetailRow label="Destination" value={qr.destination} mono />}
                  {qr.short_id && <DetailRow label="Short ID" value={qr.short_id} mono />}
                  <DetailRow label="Created" value={new Date(qr.created_at).toLocaleString()} />
                  <DetailRow label="Last Updated" value={new Date(qr.updated_at).toLocaleString()} />
                  {qr.tags.length > 0 && (
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-sm text-slate-400">Tags:</span>
                      {qr.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-600 font-medium">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {links.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Link2 className="w-5 h-5 text-slate-400" />
                    <h3 className="font-semibold text-slate-900">Multi-Link Destinations</h3>
                  </div>
                  <div className="space-y-2">
                    {links.map((link) => (
                      <div key={link.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                          {link.position + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{link.label}</p>
                          <p className="text-xs text-slate-400 truncate">{link.url}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-slate-500">Total Scans</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{qr.scan_count}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-slate-500">Last 7 Days</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{recentScans.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Device Breakdown</h3>
                {Object.keys(deviceBreakdown).length === 0 ? (
                  <p className="text-sm text-slate-400">No scan data yet</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(deviceBreakdown).map(([device, count]) => {
                      const pct = (count / scans.length) * 100;
                      return (
                        <div key={device}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-600 flex items-center gap-2">
                              <Smartphone className="w-4 h-4 text-slate-400" /> {device}
                            </span>
                            <span className="text-sm font-medium text-slate-900">{count}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Browser Breakdown</h3>
                {Object.keys(browserBreakdown).length === 0 ? (
                  <p className="text-sm text-slate-400">No scan data yet</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(browserBreakdown).map(([browser, count]) => {
                      const pct = (count / scans.length) * 100;
                      return (
                        <div key={browser}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-600 flex items-center gap-2">
                              <Globe className="w-4 h-4 text-slate-400" /> {browser}
                            </span>
                            <span className="text-sm font-medium text-slate-900">{count}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'scans' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Recent Scans</h3>
              {scans.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No scans recorded yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {scans.map((scan) => (
                    <div key={scan.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {scan.device_type || 'Unknown'} · {scan.browser || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {scan.country || 'Unknown location'} · {new Date(scan.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, capitalize }: { label: string; value: string; mono?: boolean; capitalize?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-slate-400 flex-shrink-0">{label}</span>
      <span className={`text-sm font-medium text-slate-900 text-right ${mono ? 'font-mono text-xs' : ''} ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </span>
    </div>
  );
}
