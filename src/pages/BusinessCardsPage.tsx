import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { BusinessCard as BusinessCardType } from '../types';
import { PageKey } from '../components/AppLayout';
import {
  CreditCard, Plus, ArrowLeft, Loader2, Trash2, Edit3, Mail, Phone, Globe, MapPin,
  Linkedin, Twitter, Instagram, Facebook, Download, Copy, CheckCircle,
} from 'lucide-react';
import { generateQRDataURL, downloadFile } from '../lib/qr';

export default function BusinessCardsPage({ onNavigate }: { onNavigate: (page: PageKey, params?: Record<string, string>) => void }) {
  const { user } = useAuth();
  const [cards, setCards] = useState<BusinessCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<BusinessCardType | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [accentColor, setAccentColor] = useState('#2563EB');
  const [socialLinks, setSocialLinks] = useState({ linkedin: '', twitter: '', instagram: '', facebook: '' });
  const [saving, setSaving] = useState(false);

  const fetchCards = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('business_cards').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setCards((data ?? []) as BusinessCardType[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const resetForm = () => {
    setFullName(''); setJobTitle(''); setCompany(''); setEmail(''); setPhone('');
    setWebsite(''); setAddress(''); setBio(''); setAccentColor('#2563EB');
    setSocialLinks({ linkedin: '', twitter: '', instagram: '', facebook: '' });
    setEditingCard(null);
  };

  const startEdit = (card: BusinessCardType) => {
    setEditingCard(card);
    setFullName(card.full_name);
    setJobTitle(card.job_title ?? '');
    setCompany(card.company ?? '');
    setEmail(card.email ?? '');
    setPhone(card.phone ?? '');
    setWebsite(card.website ?? '');
    setAddress(card.address ?? '');
    setBio(card.bio ?? '');
    setAccentColor(card.accent_color);
    setSocialLinks({
      linkedin: card.social_links?.linkedin ?? '',
      twitter: card.social_links?.twitter ?? '',
      instagram: card.social_links?.instagram ?? '',
      facebook: card.social_links?.facebook ?? '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user || !fullName.trim()) return;
    setSaving(true);

    const cardData = {
      user_id: user.id,
      full_name: fullName.trim(),
      job_title: jobTitle,
      company,
      email,
      phone,
      website,
      address,
      bio,
      accent_color: accentColor,
      social_links: socialLinks,
    };

    if (editingCard) {
      await supabase.from('business_cards').update(cardData).eq('id', editingCard.id);
    } else {
      const { data: newCard } = await supabase.from('business_cards').insert(cardData).select().single();
      if (newCard) {
        // Create a dynamic QR code for this business card
        const cardUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/qr-redirect?card=${(newCard as BusinessCardType).id}`;
        const { data: qrData } = await supabase.from('qr_codes').insert({
          user_id: user.id,
          name: `Business Card - ${fullName}`,
          type: 'business_card',
          is_dynamic: true,
          destination: cardUrl,
          data: { business_card_id: (newCard as BusinessCardType).id },
          foreground_color: '#000000',
          background_color: '#FFFFFF',
        }).select().single();
        if (qrData) {
          await supabase.from('business_cards').update({ qr_code_id: (qrData as { id: string }).id }).eq('id', (newCard as BusinessCardType).id);
        }
      }
    }

    setSaving(false);
    setShowForm(false);
    resetForm();
    fetchCards();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this business card?')) return;
    const card = cards.find((c) => c.id === id);
    if (card?.qr_code_id) {
      await supabase.from('qr_codes').delete().eq('id', card.qr_code_id);
    }
    await supabase.from('business_cards').delete().eq('id', id);
    fetchCards();
  };

  const handleDownloadQR = async (card: BusinessCardType) => {
    if (!card.qr_code_id) return;
    const { data: qr } = await supabase.from('qr_codes').select('*').eq('id', card.qr_code_id).maybeSingle();
    if (!qr) return;
    const qrData = qr as { destination: string; foreground_color: string; background_color: string; error_correction: string; name: string };
    const payload = qrData.destination;
    const dataUrl = await generateQRDataURL(payload, {
      foreground: qrData.foreground_color, background: qrData.background_color,
      errorCorrection: qrData.error_correction as 'L' | 'M' | 'Q' | 'H', size: 400,
    });
    downloadFile(dataUrl, `${card.full_name.replace(/\s+/g, '_')}_QR.png`);
  };

  const handleCopyLink = (card: BusinessCardType) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/qr-redirect?card=${card.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const socialIcons: Record<string, typeof Linkedin> = {
    linkedin: Linkedin, twitter: Twitter, instagram: Instagram, facebook: Facebook,
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <button onClick={() => onNavigate('dashboard')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Digital Business Cards</h1>
          <p className="text-slate-500 text-sm mt-1">Create shareable digital cards with auto-generated QR codes</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> New Business Card
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">{editingCard ? 'Edit Business Card' : 'New Business Card'}</h2>
              <div className="space-y-3">
                <input type="text" placeholder="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputClass} />
                  <input type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                </div>
                <input type="url" placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} />
                <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
                <textarea placeholder="Bio / About" value={bio} onChange={(e) => setBio(e.target.value)} className={inputClass} rows={2} />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                    <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Social Links</label>
                  {Object.entries(socialLinks).map(([key, val]) => {
                    const Icon = socialIcons[key];
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <input type="url" placeholder={key.charAt(0).toUpperCase() + key.slice(1)} value={val} onChange={(e) => setSocialLinks({ ...socialLinks, [key]: e.target.value })} className={inputClass} />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving || !fullName.trim()} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCard ? 'Update' : 'Create'} Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <CreditCard className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No business cards yet</p>
          <p className="text-slate-400 text-sm mt-1">Create a digital card with a QR code</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-shadow">
              {/* Card preview */}
              <div className="p-6" style={{ background: `linear-gradient(135deg, ${card.accent_color}15, ${card.accent_color}05)` }}>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ background: card.accent_color }}>
                    {card.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{card.full_name}</h3>
                    {card.job_title && <p className="text-sm text-slate-600 truncate">{card.job_title}</p>}
                    {card.company && <p className="text-sm text-slate-500 truncate">{card.company}</p>}
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  {card.email && <p className="text-xs text-slate-500 flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {card.email}</p>}
                  {card.phone && <p className="text-xs text-slate-500 flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {card.phone}</p>}
                  {card.website && <p className="text-xs text-slate-500 flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> {card.website}</p>}
                  {card.address && <p className="text-xs text-slate-500 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {card.address}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={() => startEdit(card)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(card.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleCopyLink(card)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                    {copiedId === card.id ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  {card.qr_code_id && (
                    <button onClick={() => handleDownloadQR(card)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm';
