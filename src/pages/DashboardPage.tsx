import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { QRCode as QRCodeType } from '../types';
import { PageKey } from '../components/AppLayout';
import {
  QrCode, Eye, MousePointerClick, Link2, TrendingUp, Plus, ArrowRight,
} from 'lucide-react';

interface Stats {
  totalQRCodes: number;
  dynamicCount: number;
  staticCount: number;
  totalScans: number;
  activeCount: number;
  multiLinkCount: number;
}

export default function DashboardPage({ onNavigate }: { onNavigate: (page: PageKey, params?: Record<string, string>) => void }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalQRCodes: 0, dynamicCount: 0, staticCount: 0, totalScans: 0, activeCount: 0, multiLinkCount: 0,
  });
  const [recentQRs, setRecentQRs] = useState<QRCodeType[]>([]);
  const [scanTrend, setScanTrend] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: qrCodes } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const codes = (qrCodes ?? []) as QRCodeType[];
      const totalScans = codes.reduce((sum, q) => sum + (q.scan_count || 0), 0);

      setStats({
        totalQRCodes: codes.length,
        dynamicCount: codes.filter((q) => q.is_dynamic).length,
        staticCount: codes.filter((q) => !q.is_dynamic).length,
        totalScans,
        activeCount: codes.filter((q) => q.is_active).length,
        multiLinkCount: codes.filter((q) => q.type === 'multi_link').length,
      });

      setRecentQRs(codes.slice(0, 5));

      // Get scan trend for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: scans } = await supabase
        .from('scans')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      const trendMap = new Map<string, number>();
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        trendMap.set(d.toISOString().split('T')[0], 0);
      }
      (scans ?? []).forEach((s) => {
        const date = (s as { created_at: string }).created_at.split('T')[0];
        trendMap.set(date, (trendMap.get(date) ?? 0) + 1);
      });
      setScanTrend(Array.from(trendMap.entries()).map(([date, count]) => ({ date, count })));

      setLoading(false);
    })();
  }, [user]);

  const maxTrend = Math.max(...scanTrend.map((t) => t.count), 1);

  const statCards = [
    { label: 'Total QR Codes', value: stats.totalQRCodes, icon: QrCode, color: 'blue' },
    { label: 'Total Scans', value: stats.totalScans, icon: Eye, color: 'emerald' },
    { label: 'Dynamic QRs', value: stats.dynamicCount, icon: MousePointerClick, color: 'amber' },
    { label: 'Multi-Link QRs', value: stats.multiLinkCount, icon: Link2, color: 'violet' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/30',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/30',
    violet: 'from-violet-500 to-violet-600 shadow-violet-500/30',
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back! Here's your QR overview.</p>
        </div>
        <button
          onClick={() => onNavigate('qr-create')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          Create QR Code
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorMap[card.color]} flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{loading ? '—' : card.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan trend chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold text-slate-900">Scan Activity (Last 7 Days)</h2>
          </div>
          <div className="flex items-end justify-between gap-2 h-48">
            {scanTrend.map((t) => (
              <div key={t.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500 group relative"
                    style={{ height: `${(t.count / maxTrend) * 100}%`, minHeight: t.count > 0 ? '8px' : '2px' }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t.count}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(t.date).toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Static QR Codes</span>
              <span className="text-sm font-semibold text-slate-900">{stats.staticCount}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Dynamic QR Codes</span>
              <span className="text-sm font-semibold text-slate-900">{stats.dynamicCount}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Active</span>
              <span className="text-sm font-semibold text-emerald-600">{stats.activeCount}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600">Inactive</span>
              <span className="text-sm font-semibold text-slate-400">{stats.totalQRCodes - stats.activeCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent QR codes */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Recent QR Codes</h2>
          <button
            onClick={() => onNavigate('qr-list')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {recentQRs.length === 0 ? (
          <div className="text-center py-12">
            <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No QR codes yet. Create your first one!</p>
            <button
              onClick={() => onNavigate('qr-create')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Create QR Code
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentQRs.map((qr) => (
              <button
                key={qr.id}
                onClick={() => onNavigate('qr-detail', { id: qr.id })}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{qr.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{qr.type.replace('_', ' ')} · {qr.is_dynamic ? 'Dynamic' : 'Static'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-900">{qr.scan_count}</p>
                  <p className="text-xs text-slate-400">scans</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
