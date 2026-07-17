import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { QRCode as QRCodeType } from '../types';
import { PageKey } from '../components/AppLayout';
import {
  QrCode, Plus, Search, Filter, Eye, MoreVertical, Trash2, Edit3, Download, Copy,
} from 'lucide-react';
import { generateQRDataURL, downloadFile } from '../lib/qr';

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

export default function QRListPage({ onNavigate }: { onNavigate: (page: PageKey, params?: Record<string, string>) => void }) {
  const { user } = useAuth();
  const [qrCodes, setQRCodes] = useState<QRCodeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const fetchQRCodes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setQRCodes((data ?? []) as QRCodeType[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchQRCodes();
  }, [fetchQRCodes]);

  const filtered = qrCodes.filter((qr) => {
    const matchSearch = qr.name.toLowerCase().includes(search.toLowerCase()) || qr.type.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || qr.type === typeFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' && qr.is_active) || (statusFilter === 'inactive' && !qr.is_active);
    return matchSearch && matchType && matchStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this QR code? This cannot be undone.')) return;
    await supabase.from('qr_codes').delete().eq('id', id);
    setQRCodes(qrCodes.filter((q) => q.id !== id));
    setMenuOpen(null);
  };

  const handleDownload = async (qr: QRCodeType) => {
    const payload = qr.destination ?? qr.short_id ?? qr.id;
    const dataUrl = await generateQRDataURL(payload, {
      foreground: qr.foreground_color,
      background: qr.background_color,
      errorCorrection: qr.error_correction as 'L' | 'M' | 'Q' | 'H',
      size: qr.size,
    });
    downloadFile(dataUrl, `${qr.name.replace(/\s+/g, '_')}.png`);
    setMenuOpen(null);
  };

  const handleCopyLink = (qr: QRCodeType) => {
    if (qr.is_dynamic && qr.short_id) {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/qr-redirect?id=${qr.short_id}`;
      navigator.clipboard.writeText(url);
    } else if (qr.destination) {
      navigator.clipboard.writeText(qr.destination);
    }
    setMenuOpen(null);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto" onClick={() => setMenuOpen(null)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My QR Codes</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all your QR codes in one place</p>
        </div>
        <button
          onClick={() => onNavigate('qr-create')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Create QR Code
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
              <div className="w-full aspect-square bg-slate-100 rounded-xl mb-4" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <QrCode className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No QR codes found</p>
          <p className="text-slate-400 text-sm mt-1">
            {qrCodes.length === 0 ? 'Create your first QR code to get started' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((qr) => (
            <div
              key={qr.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:border-blue-100 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-full aspect-square bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden">
                  <QrCode className="w-16 h-16 text-slate-300 group-hover:scale-110 transition-transform" />
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === qr.id ? null : qr.id); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuOpen === qr.id && (
                    <div
                      className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 min-w-[160px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onNavigate('qr-detail', { id: qr.id })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="w-4 h-4" /> View Details
                      </button>
                      <button
                        onClick={() => onNavigate('qr-create', { id: qr.id })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDownload(qr)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                      <button
                        onClick={() => handleCopyLink(qr)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Copy className="w-4 h-4" /> Copy Link
                      </button>
                      <button
                        onClick={() => handleDelete(qr.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => onNavigate('qr-detail', { id: qr.id })} className="block text-left w-full">
                <h3 className="font-semibold text-slate-900 text-sm truncate">{qr.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{typeLabels[qr.type] ?? qr.type}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                    qr.is_dynamic ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {qr.is_dynamic ? 'Dynamic' : 'Static'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Eye className="w-3.5 h-3.5" /> {qr.scan_count} scans
                  </span>
                  <span className={`w-2 h-2 rounded-full ${qr.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
