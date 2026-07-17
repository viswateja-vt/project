import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  User, Mail, Building2, Globe, Phone, Save, Loader2, QrCode, Eye, Calendar,
  Lock, EyeOff,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ totalQRs: 0, totalScans: 0 });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setCompany(profile.company ?? '');
      setWebsite(profile.website ?? '');
      setPhone(profile.phone ?? '');
      setBio(profile.bio ?? '');
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      (async () => {
        const { data: qrs } = await supabase.from('qr_codes').select('scan_count').eq('user_id', user.id);
        const totalScans = (qrs ?? []).reduce((sum: number, q) => sum + (q.scan_count || 0), 0);
        setStats({ totalQRs: qrs?.length ?? 0, totalScans });
      })();
    }
  }, [user]);

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      company,
      website,
      phone,
      bio,
    });
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Profile Settings</h1>
      <p className="text-slate-500 text-sm mb-6">Manage your account information</p>

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
            {(fullName || user?.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900">{fullName || 'User'}</h2>
            <p className="text-sm text-slate-500 truncate">{user?.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5" /> {stats.totalQRs} QR Codes
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {stats.totalScans} Scans
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Since {new Date(profile?.created_at ?? Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Personal Information</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <User className="w-4 h-4 text-slate-400" /> Full Name
            </label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className={inputClass} />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Mail className="w-4 h-4 text-slate-400" /> Email
            </label>
            <input type="email" value={user?.email ?? ''} disabled className={`${inputClass} bg-slate-50 text-slate-400 cursor-not-allowed`} />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Building2 className="w-4 h-4 text-slate-400" /> Company
            </label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                <Globe className="w-4 h-4 text-slate-400" /> Website
              </label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                <Phone className="w-4 h-4 text-slate-400" /> Phone
              </label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1234567890" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." className={inputClass} rows={3} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          {saved && <span className="text-sm text-emerald-600 font-medium">Saved successfully!</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mt-6">
        <h3 className="font-semibold text-slate-900 mb-1">Change Password</h3>
        <p className="text-sm text-slate-500 mb-4">Set a new password for your account</p>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Lock className="w-4 h-4 text-slate-400" /> New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Lock className="w-4 h-4 text-slate-400" /> Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {passwordError && (
            <div className="text-sm rounded-xl px-4 py-3 bg-red-50 text-red-600 border border-red-200">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="text-sm rounded-xl px-4 py-3 bg-emerald-50 text-emerald-600 border border-emerald-200">
              Password updated successfully!
            </div>
          )}
          <div className="flex items-center justify-end">
            <button
              onClick={handleChangePassword}
              disabled={passwordSaving || (!newPassword && !confirmPassword)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm';
