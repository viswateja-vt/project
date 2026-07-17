import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { QRCode as QRCodeType, QRType, QRLink } from '../types';
import { PageKey } from '../components/AppLayout';
import {
  Link, MessageCircle, Phone, Mail, MessageSquare, MapPin, CreditCard,
  FileText, Image, Video, Type, Link2, QrCode, Save, ArrowLeft, Plus, X,
  Upload, Loader2, Palette, Settings, Eye,
} from 'lucide-react';
import { generateQRDataURL, buildQRPayload } from '../lib/qr';
import { uploadFile } from '../lib/storage';

interface QRCreatePageProps {
  onNavigate: (page: PageKey, params?: Record<string, string>) => void;
  editId?: string;
}

const qrTypes: { type: QRType; label: string; icon: typeof Link; desc: string }[] = [
  { type: 'url', label: 'Website URL', icon: Link, desc: 'Redirect to any website' },
  { type: 'multi_link', label: 'Multi-Link', icon: Link2, desc: 'Multiple destinations in one QR' },
  { type: 'business_card', label: 'Business Card', icon: CreditCard, desc: 'Digital contact card' },
  { type: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, desc: 'Open WhatsApp chat' },
  { type: 'phone', label: 'Phone', icon: Phone, desc: 'Make a phone call' },
  { type: 'email', label: 'Email', icon: Mail, desc: 'Send an email' },
  { type: 'sms', label: 'SMS', icon: MessageSquare, desc: 'Send a text message' },
  { type: 'maps', label: 'Google Maps', icon: MapPin, desc: 'Location on map' },
  { type: 'upi', label: 'UPI Payment', icon: CreditCard, desc: 'Accept UPI payments' },
  { type: 'pdf', label: 'PDF', icon: FileText, desc: 'Link to a PDF file' },
  { type: 'image', label: 'Image', icon: Image, desc: 'Show an image' },
  { type: 'video', label: 'Video', icon: Video, desc: 'Play a video' },
  { type: 'text', label: 'Plain Text', icon: Type, desc: 'Display text content' },
];

const colorPresets = [
  { fg: '#000000', bg: '#FFFFFF' },
  { fg: '#2563EB', bg: '#FFFFFF' },
  { fg: '#059669', bg: '#FFFFFF' },
  { fg: '#DC2626', bg: '#FFFFFF' },
  { fg: '#7C3AED', bg: '#FFFFFF' },
  { fg: '#EA580C', bg: '#FFFFFF' },
  { fg: '#FFFFFF', bg: '#1E293B' },
  { fg: '#FCD34D', bg: '#1E293B' },
];

export default function QRCreatePage({ onNavigate, editId }: QRCreatePageProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'type' | 'content' | 'customize'>('type');
  const [selectedType, setSelectedType] = useState<QRType | null>(null);
  const [name, setName] = useState('');
  const [isDynamic, setIsDynamic] = useState(false);
  const [destination, setDestination] = useState('');
  const [data, setData] = useState<Record<string, unknown>>({});
  const [links, setLinks] = useState<{ label: string; url: string }[]>([{ label: '', url: '' }]);
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [errorCorrection, setErrorCorrection] = useState('M');
  const [size, setSize] = useState(300);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [tags, setTags] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingQR, setEditingQR] = useState<QRCodeType | null>(null);

  useEffect(() => {
    if (editId && user) {
      (async () => {
        const { data: qr } = await supabase.from('qr_codes').select('*').eq('id', editId).eq('user_id', user.id).maybeSingle();
        if (qr) {
          const qrData = qr as QRCodeType;
          setEditingQR(qrData);
          setSelectedType(qrData.type);
          setName(qrData.name);
          setIsDynamic(qrData.is_dynamic);
          setDestination(qrData.destination ?? '');
          setData(qrData.data ?? {});
          setForegroundColor(qrData.foreground_color);
          setBackgroundColor(qrData.background_color);
          setErrorCorrection(qrData.error_correction);
          setSize(qrData.size);
          setLogoUrl(qrData.logo_url);
          setTags(qrData.tags.join(', '));
          setStep('content');

          if (qrData.type === 'multi_link') {
            const { data: qrLinks } = await supabase.from('qr_links').select('*').eq('qr_code_id', qrData.id).order('position', { ascending: true });
            if (qrLinks && qrLinks.length > 0) {
              setLinks(qrLinks.map((l: QRLink) => ({ label: l.label, url: l.url })));
            }
          }
        }
      })();
    }
  }, [editId, user]);

  const generatePreview = useCallback(async () => {
    if (!selectedType) return;
    const payload = buildQRPayload(selectedType, destination || null, data);
    if (!payload) { setPreview(''); return; }
    try {
      const url = await generateQRDataURL(payload, {
        foreground: foregroundColor,
        background: backgroundColor,
        errorCorrection: errorCorrection as 'L' | 'M' | 'Q' | 'H',
        size: 300,
      });
      setPreview(url);
    } catch {
      setPreview('');
    }
  }, [selectedType, destination, data, foregroundColor, backgroundColor, errorCorrection]);

  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  const handleFileUpload = async (file: File, fileType: 'pdf' | 'image' | 'video' | 'logo') => {
    if (!user) return;
    setUploading(true);
    const result = await uploadFile('qr-files', file, user.id);
    setUploading(false);
    if (result) {
      if (fileType === 'logo') {
        setLogoUrl(result.publicUrl);
      } else {
        setDestination(result.publicUrl);
      }
    }
  };

  const handleSave = async () => {
    if (!user || !selectedType || !name.trim()) return;
    setLoading(true);

    const payload = buildQRPayload(selectedType, destination || null, data);

    const qrRecord = {
      user_id: user.id,
      name: name.trim(),
      type: selectedType,
      is_dynamic: isDynamic,
      destination: payload,
      data,
      foreground_color: foregroundColor,
      background_color: backgroundColor,
      error_correction: errorCorrection,
      size,
      logo_url: logoUrl,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      is_active: true,
    };

    let qrId = editingQR?.id;

    if (editingQR) {
      const { error } = await supabase.from('qr_codes').update({
        name: qrRecord.name,
        destination: qrRecord.destination,
        data: qrRecord.data,
        foreground_color: qrRecord.foreground_color,
        background_color: qrRecord.background_color,
        error_correction: qrRecord.error_correction,
        size: qrRecord.size,
        logo_url: qrRecord.logo_url,
        tags: qrRecord.tags,
      }).eq('id', editingQR.id);
      if (error) { console.error(error); setLoading(false); return; }

      if (selectedType === 'multi_link') {
        await supabase.from('qr_links').delete().eq('qr_code_id', editingQR.id);
        const validLinks = links.filter((l) => l.url.trim());
        for (let i = 0; i < validLinks.length; i++) {
          await supabase.from('qr_links').insert({
            qr_code_id: editingQR.id,
            label: validLinks[i].label || `Link ${i + 1}`,
            url: validLinks[i].url,
            position: i,
          });
        }
      }
    } else {
      const { data: newQR, error } = await supabase.from('qr_codes').insert(qrRecord).select().single();
      if (error) { console.error(error); setLoading(false); return; }
      qrId = (newQR as QRCodeType).id;

      if (selectedType === 'multi_link' && qrId) {
        const validLinks = links.filter((l) => l.url.trim());
        for (let i = 0; i < validLinks.length; i++) {
          await supabase.from('qr_links').insert({
            qr_code_id: qrId,
            label: validLinks[i].label || `Link ${i + 1}`,
            url: validLinks[i].url,
            position: i,
          });
        }
      }
    }

    setLoading(false);
    if (qrId) onNavigate('qr-detail', { id: qrId });
  };

  const selectedTypeMeta = qrTypes.find((t) => t.type === selectedType);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <button
        onClick={() => onNavigate('qr-list')}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to QR Codes
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">{editingQR ? 'Edit QR Code' : 'Create QR Code'}</h1>
      <p className="text-slate-500 text-sm mb-6">
        {editingQR ? 'Update your QR code settings' : 'Choose a type and customize your QR code'}
      </p>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(['type', 'content', 'customize'] as const).map((s, i) => {
          const stepNum = i + 1;
          const isActive = step === s || (s === 'type' && selectedType && step !== 'type');
          const isComplete = (step === 'content' && s === 'type') || (step === 'customize' && s !== 'customize');
          return (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-600 text-white' : isComplete ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {isComplete ? '✓' : stepNum}
              </div>
              <span className={`ml-2 text-sm font-medium capitalize ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                {s === 'type' ? 'Select Type' : s}
              </span>
              {i < 2 && <div className="w-8 sm:w-16 h-px bg-slate-200 mx-2 sm:mx-4" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Step 1: Type selection */}
          {step === 'type' && (
            <div>
              <h2 className="font-semibold text-slate-900 mb-4">Select QR Type</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {qrTypes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.type}
                      onClick={() => { setSelectedType(t.type); setStep('content'); }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md ${
                        selectedType === t.type
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                        selectedType === t.type ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{t.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Content */}
          {step === 'content' && selectedType && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Content</h2>
                <button onClick={() => setStep('type')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Change Type
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">QR Code Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer Campaign QR"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                />
              </div>

              {/* Dynamic toggle */}
              {selectedType !== 'multi_link' && selectedType !== 'business_card' && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Dynamic QR Code</p>
                    <p className="text-xs text-slate-500 mt-0.5">Edit destination later without reprinting. Track scans.</p>
                  </div>
                  <button
                    onClick={() => setIsDynamic(!isDynamic)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${isDynamic ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${isDynamic ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              )}

              {/* Type-specific inputs */}
              <TypeSpecificFields
                type={selectedType}
                destination={destination}
                setDestination={setDestination}
                data={data}
                setData={setData}
                links={links}
                setLinks={setLinks}
                onFileUpload={handleFileUpload}
                uploading={uploading}
                fileInputRef={fileInputRef}
              />

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="marketing, campaign, qr-2024"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep('customize')}
                  disabled={!name.trim()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Continue to Customize
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Customize */}
          {step === 'customize' && selectedType && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Customize Design</h2>
                <button onClick={() => setStep('content')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Back to Content
                </button>
              </div>

              {/* Color presets */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                  <Palette className="w-4 h-4" /> Color Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => { setForegroundColor(preset.fg); setBackgroundColor(preset.bg); }}
                      className={`w-12 h-12 rounded-xl border-2 transition-all ${
                        foregroundColor === preset.fg && backgroundColor === preset.bg ? 'border-blue-500 scale-110' : 'border-slate-200'
                      }`}
                      style={{ background: preset.bg }}
                    >
                      <div className="w-full h-full rounded-lg flex items-center justify-center" style={{ color: preset.fg }}>
                        <QrCode className="w-5 h-5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Foreground Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Error correction */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Settings className="w-4 h-4" /> Error Correction Level
                </label>
                <div className="flex gap-2">
                  {(['L', 'M', 'Q', 'H'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setErrorCorrection(level)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        errorCorrection === level ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {level} {level === 'L' ? '(7%)' : level === 'M' ? '(15%)' : level === 'Q' ? '(25%)' : '(30%)'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Higher levels allow more damage while remaining scannable</p>
              </div>

              {/* Logo upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Logo (center of QR)</label>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </button>
                  {logoUrl && (
                    <div className="flex items-center gap-2">
                      <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                      <button onClick={() => setLogoUrl(null)} className="p-1 text-slate-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Use error correction H when adding a logo</p>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Download Size: {size}px</label>
                <input
                  type="range"
                  min="128"
                  max="1024"
                  step="32"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setStep('content')}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !name.trim()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingQR ? 'Update QR Code' : 'Create QR Code'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preview panel */}
        <div className="lg:sticky lg:top-8 h-fit">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-slate-400" />
              <h3 className="font-semibold text-slate-900">Live Preview</h3>
            </div>
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="QR Preview"
                  className="w-full rounded-xl border border-slate-100"
                  style={{ background: backgroundColor }}
                />
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-lg bg-white p-1 object-cover"
                  />
                )}
              </div>
            ) : (
              <div className="aspect-square rounded-xl bg-slate-50 flex items-center justify-center">
                <QrCode className="w-20 h-20 text-slate-200" />
              </div>
            )}
            {selectedTypeMeta && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Type</span>
                  <span className="font-medium text-slate-700">{selectedTypeMeta.label}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Mode</span>
                  <span className="font-medium text-slate-700">{isDynamic ? 'Dynamic' : 'Static'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Type-specific input fields component
function TypeSpecificFields({
  type, destination, setDestination, data, setData, links, setLinks, onFileUpload, uploading, fileInputRef,
}: {
  type: QRType;
  destination: string;
  setDestination: (v: string) => void;
  data: Record<string, unknown>;
  setData: (d: Record<string, unknown>) => void;
  links: { label: string; url: string }[];
  setLinks: (l: { label: string; url: string }[]) => void;
  onFileUpload: (file: File, fileType: 'pdf' | 'image' | 'video' | 'logo') => void;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) {
  const updateData = (key: string, value: unknown) => setData({ ...data, [key]: value });

  switch (type) {
    case 'url':
      return (
        <Field label="Website URL *">
          <input type="url" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="https://example.com" className={inputClass} />
        </Field>
      );
    case 'multi_link':
      return (
        <div>
          <p className="text-sm text-slate-500 mb-3">Add multiple links. Users will see a landing page to choose their destination.</p>
          {links.map((link, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={link.label}
                onChange={(e) => { const n = [...links]; n[i] = { ...n[i], label: e.target.value }; setLinks(n); }}
                placeholder="Label (e.g. Website)"
                className="w-1/3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => { const n = [...links]; n[i] = { ...n[i], url: e.target.value }; setLinks(n); }}
                placeholder="https://..."
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
              {links.length > 1 && (
                <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))} className="p-2 text-slate-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setLinks([...links, { label: '', url: '' }])}
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" /> Add Link
          </button>
        </div>
      );
    case 'whatsapp':
      return (
        <>
          <Field label="Phone Number * (with country code)">
            <input type="tel" value={(data.phone as string) ?? ''} onChange={(e) => updateData('phone', e.target.value)} placeholder="919876543210" className={inputClass} />
          </Field>
          <Field label="Pre-filled Message">
            <textarea value={(data.message as string) ?? ''} onChange={(e) => updateData('message', e.target.value)} placeholder="Hello! I scanned your QR code." className={inputClass} rows={2} />
          </Field>
        </>
      );
    case 'phone':
      return (
        <Field label="Phone Number *">
          <input type="tel" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="+1234567890" className={inputClass} />
        </Field>
      );
    case 'email':
      return (
        <>
          <Field label="Email Address *">
            <input type="email" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="contact@example.com" className={inputClass} />
          </Field>
          <Field label="Subject">
            <input type="text" value={(data.subject as string) ?? ''} onChange={(e) => updateData('subject', e.target.value)} placeholder="Email subject" className={inputClass} />
          </Field>
          <Field label="Body">
            <textarea value={(data.body as string) ?? ''} onChange={(e) => updateData('body', e.target.value)} placeholder="Email body..." className={inputClass} rows={3} />
          </Field>
        </>
      );
    case 'sms':
      return (
        <>
          <Field label="Phone Number *">
            <input type="tel" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="+1234567890" className={inputClass} />
          </Field>
          <Field label="Message">
            <textarea value={(data.message as string) ?? ''} onChange={(e) => updateData('message', e.target.value)} placeholder="Pre-filled SMS text" className={inputClass} rows={2} />
          </Field>
        </>
      );
    case 'maps':
      return (
        <>
          <Field label="Location Query">
            <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Eiffel Tower, Paris" className={inputClass} />
          </Field>
          <div className="text-xs text-slate-400 mb-3">Or use precise coordinates:</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude">
              <input type="text" value={(data.lat as string) ?? ''} onChange={(e) => updateData('lat', e.target.value)} placeholder="48.8584" className={inputClass} />
            </Field>
            <Field label="Longitude">
              <input type="text" value={(data.lng as string) ?? ''} onChange={(e) => updateData('lng', e.target.value)} placeholder="2.2945" className={inputClass} />
            </Field>
          </div>
        </>
      );
    case 'upi':
      return (
        <>
          <Field label="UPI ID / VPA *">
            <input type="text" value={(data.payee as string) ?? ''} onChange={(e) => updateData('payee', e.target.value)} placeholder="merchant@upi" className={inputClass} />
          </Field>
          <Field label="Payee Name">
            <input type="text" value={(data.name as string) ?? ''} onChange={(e) => updateData('name', e.target.value)} placeholder="Merchant Name" className={inputClass} />
          </Field>
          <Field label="Amount (optional)">
            <input type="text" value={(data.amount as string) ?? ''} onChange={(e) => updateData('amount', e.target.value)} placeholder="100.00" className={inputClass} />
          </Field>
        </>
      );
    case 'pdf':
    case 'image':
    case 'video':
      return (
        <Field label={`Upload ${type.toUpperCase()} File`}>
          <input
            ref={fileInputRef}
            type="file"
            accept={type === 'pdf' ? 'application/pdf' : type === 'image' ? 'image/*' : 'video/*'}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0], type)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full px-4 py-8 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-sm text-slate-500 flex flex-col items-center gap-2 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
            {uploading ? 'Uploading...' : `Click to upload ${type.toUpperCase()} file`}
          </button>
          {destination && (
            <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
              <FileText className="w-4 h-4" /> File uploaded successfully
            </div>
          )}
        </Field>
      );
    case 'text':
      return (
        <Field label="Text Content *">
          <textarea value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Enter text to encode..." className={inputClass} rows={4} />
        </Field>
      );
    case 'business_card':
      return (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-700">
          Business card QR codes are managed from the Business Cards page.
          Please create your card there, and a QR code will be generated automatically.
        </div>
      );
    default:
      return null;
  }
}

const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
