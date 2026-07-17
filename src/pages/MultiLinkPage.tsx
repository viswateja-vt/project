import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { QRCode as QRCodeType, QRLink } from '../types';
import { PageKey } from '../components/AppLayout';
import {
  Link2, Plus, ArrowLeft, QrCode, Eye, Copy, CheckCircle, Loader2, ExternalLink,
} from 'lucide-react';

export default function MultiLinkPage({ onNavigate }: { onNavigate: (page: PageKey, params?: Record<string, string>) => void }) {
  const { user } = useAuth();
  const [multiLinkQRs, setMultiLinkQRs] = useState<QRCodeType[]>([]);
  const [linksMap, setLinksMap] = useState<Record<string, QRLink[]>>({});
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMultiLinks = useCallback(async () => {
    if (!user) return;
    const { data: qrs } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'multi_link')
      .order('created_at', { ascending: false });
    const codes = (qrs ?? []) as QRCodeType[];
    setMultiLinkQRs(codes);

    const map: Record<string, QRLink[]> = {};
    for (const qr of codes) {
      const { data: links } = await supabase.from('qr_links').select('*').eq('qr_code_id', qr.id).order('position', { ascending: true });
      map[qr.id] = (links ?? []) as QRLink[];
    }
    setLinksMap(map);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchMultiLinks(); }, [fetchMultiLinks]);

  const handleCopy = (qr: QRCodeType) => {
    if (qr.short_id) {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/qr-redirect?id=${qr.short_id}`;
      navigator.clipboard.writeText(url);
      setCopiedId(qr.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <button onClick={() => onNavigate('qr-list')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Multi-Link QR Codes</h1>
          <p className="text-slate-500 text-sm mt-1">One QR code that redirects to a landing page with multiple destinations</p>
        </div>
        <button
          onClick={() => onNavigate('qr-create')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Create Multi-Link QR
        </button>
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-100 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">How Multi-Link QR Works</h3>
            <p className="text-sm text-slate-600">
              When scanned, the QR opens a landing page showing all your links. Users tap their preferred destination.
              Perfect for social media, portfolios, or multiple contact options. Edit links anytime without reprinting.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : multiLinkQRs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Link2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No multi-link QR codes yet</p>
          <p className="text-slate-400 text-sm mt-1">Create one to bundle multiple destinations in a single QR</p>
        </div>
      ) : (
        <div className="space-y-4">
          {multiLinkQRs.map((qr) => {
            const qrLinks = linksMap[qr.id] ?? [];
            const dynamicUrl = qr.short_id ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/qr-redirect?id=${qr.short_id}` : null;
            return (
              <div key={qr.id} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{qr.name}</h3>
                      <p className="text-xs text-slate-400">{qr.scan_count} scans · {qrLinks.length} links</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onNavigate('qr-detail', { id: qr.id })} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                      <Eye className="w-4 h-4" />
                    </button>
                    {dynamicUrl && (
                      <button onClick={() => handleCopy(qr)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                        {copiedId === qr.id ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {qrLinks.map((link) => (
                    <div key={link.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-xs font-bold text-blue-600 border border-slate-200">
                        {link.position + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{link.label}</p>
                        <p className="text-xs text-slate-400 truncate">{link.url}</p>
                      </div>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>

                {dynamicUrl && (
                  <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <code className="flex-1 text-xs text-blue-700 truncate">{dynamicUrl}</code>
                    <button onClick={() => handleCopy(qr)} className="p-1.5 text-blue-600">
                      {copiedId === qr.id ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
