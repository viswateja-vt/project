export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  bio: string | null;
  website: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export type QRType =
  | 'url'
  | 'multi_link'
  | 'business_card'
  | 'whatsapp'
  | 'phone'
  | 'email'
  | 'sms'
  | 'maps'
  | 'upi'
  | 'pdf'
  | 'image'
  | 'video'
  | 'text';

export interface QRCode {
  id: string;
  user_id: string;
  name: string;
  type: QRType;
  is_dynamic: boolean;
  short_id: string | null;
  destination: string | null;
  data: Record<string, unknown> | null;
  foreground_color: string;
  background_color: string;
  error_correction: string;
  logo_url: string | null;
  size: number;
  folder: string | null;
  tags: string[];
  is_active: boolean;
  scan_count: number;
  created_at: string;
  updated_at: string;
}

export interface QRLink {
  id: string;
  qr_code_id: string;
  label: string;
  url: string;
  icon: string | null;
  position: number;
  created_at: string;
}

export interface Scan {
  id: string;
  qr_code_id: string;
  user_agent: string | null;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  created_at: string;
}

export interface BusinessCard {
  id: string;
  user_id: string;
  qr_code_id: string | null;
  full_name: string;
  job_title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  photo_url: string | null;
  bio: string | null;
  social_links: Record<string, string>;
  theme: string;
  accent_color: string;
  created_at: string;
  updated_at: string;
}

export interface FileEntry {
  id: string;
  user_id: string;
  qr_code_id: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  public_url: string | null;
  created_at: string;
}
