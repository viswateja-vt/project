import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { QRCode as QRCodeType, Scan } from '../types';
import { PageKey } from '../components/AppLayout';
import {
  BarChart3, Eye, TrendingUp, Smartphone, Globe, QrCode, Loader2, ArrowRight,
} from 'lucide-react';

export default function AnalyticsPage({ onNavigate }: { onNavigate: (page: PageKey, params?: Record<string, string>) => void }) {
  const { user } = useAuth();
  const [qrCodes, setQRCodes] = useState<QRCodeType[]>([]);
  const [allScans, setAllScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    const { data: qrs } = await supabase.from('qr_codes').select('*').eq('user_id', user.id).order('scan_count', { ascending: false });
    setQRCodes((qrs ?? []) as QRCodeType[]);

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(timeRange));
    const { data: scans } = await supabase
      .from('scans')
      .select(`
        *,
        qr_codes!inner ( user_id )
      `)
      .eq('qr_codes.user_id', user.id)
      .gte('created_at', daysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(500);

    setAllScans((scans ?? []) as Scan[]);
    setLoading(false);
  }, [user, timeRange]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const totalScans = qrCodes.reduce((sum, q) => sum + q.scan_count, 0);
  const topQRs = qrCodes.filter((q) => q.scan_count > 0).slice(0, 5);

  // Time chart data
  const chartDays = Number(timeRange);
  const trendMap = new Map<string, number>();
  const today = new Date();
  for (let i = chartDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    trendMap.set(d.toISOString().split('T')[0], 0);
  }
  allScans.forEach((s) => {
    const date = s.created_at.split('T')[0];
    if (trendMap.has(date)) trendMap.set(date, (trendMap.get(date) ?? 0) + 1);
  });
  const trendData = Array.from(trendMap.entries()).map(([date, count]) => ({ date, count }));
  const maxTrend = Math.max(...trendData.map((t) => t.count), 1);

  // Device & browser breakdown
  const deviceBreakdown = allScans.reduce((acc, s) => {
    const d = s.device_type || 'Unknown';
    acc[d] = (acc[d] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const browserBreakdown = allScans.reduce((acc, s) => {
    const b = s.browser || 'Unknown';
    acc[b] = (acc[b] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countryBreakdown = allScans.reduce((acc, s) => {
    const c = s.country || 'Unknown';
    acc[c] = (acc[c] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Track performance across all your QR codes</p>
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {(['7', '30', '90'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {range} days
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={QrCode} label="Total QR Codes" value={qrCodes.length} color="blue" />
        <StatCard icon={Eye} label="Total Scans" value={totalScans} color="emerald" />
        <StatCard icon={TrendingUp} label={`Scans (${timeRange}d)`} value={allScans.length} color="amber" />
        <StatCard icon={Smartphone} label="Unique Devices" value={Object.keys(deviceBreakdown).length} color="violet" />
      </div>

      {/* Trend chart */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-slate-400" />
          <h2 className="font-semibold text-slate-900">Scan Trend</h2>
        </div>
        <div className="flex items-end justify-between gap-1 h-40">
          {trendData.map(({ date, count }) => (
            <div key={date} className="flex-1 flex flex-col items-center group relative">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md hover:from-blue-600 hover:to-blue-500 transition-colors relative"
                  style={{ height: `${(count / maxTrend) * 100}%`, minHeight: count > 0 ? '4px' : '1px' }}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {count}
                  </span>
                </div>
              </div>
              {chartDays <= 30 && (
                <span className="text-[10px] text-slate-400 mt-1 rotate-0">
                  {new Date(date).toLocaleDateString('en', { day: 'numeric' })}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top QR codes */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Top Performing QR Codes</h2>
          {topQRs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No scan data yet</p>
          ) : (
            <div className="space-y-3">
              {topQRs.map((qr, i) => (
                <button
                  key={qr.id}
                  onClick={() => onNavigate('qr-detail', { id: qr.id })}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                >
                  <span className="text-sm font-bold text-slate-300 w-5">#{i + 1}</span>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{qr.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{qr.type.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900">{qr.scan_count}</p>
                    <p className="text-xs text-slate-400">scans</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Device & Browser breakdown */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Devices</h3>
            {Object.keys(deviceBreakdown).length === 0 ? (
              <p className="text-sm text-slate-400">No data</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(deviceBreakdown).sort((a, b) => b[1] - a[1]).map(([device, count]) => {
                  const pct = (count / allScans.length) * 100;
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
            <h3 className="font-semibold text-slate-900 mb-4">Browsers</h3>
            {Object.keys(browserBreakdown).length === 0 ? (
              <p className="text-sm text-slate-400">No data</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(browserBreakdown).sort((a, b) => b[1] - a[1]).map(([browser, count]) => {
                  const pct = (count / allScans.length) * 100;
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
      </div>

      {/* Countries */}
      {Object.keys(countryBreakdown).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Scan Locations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(countryBreakdown).sort((a, b) => b[1] - a[1]).map(([country, count]) => (
              <div key={country} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-sm text-slate-600">{country}</span>
                <span className="text-sm font-semibold text-slate-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Eye; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/30',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/30',
    violet: 'from-violet-500 to-violet-600 shadow-violet-500/30',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-md mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
