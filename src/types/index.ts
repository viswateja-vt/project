export * from '../lib/qrTypes';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalQRCodes: number;
  activeQRCodes: number;
  totalScans: number;
  scansThisMonth: number;
}

export interface ScanRecord {
  id: string;
  qrCodeId: string;
  scannedAt: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  operatingSystem?: string;
  referrer?: string;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QRTag {
  id: string;
  name: string;
  color?: string;
}

export interface QRVersion {
  id: string;
  qrCodeId: string;
  version: number;
  content: unknown;
  design: unknown;
  createdAt: string;
}

export interface RedirectRule {
  id: string;
  qrCodeId: string;
  name: string;
  type:
    | 'device'
    | 'country'
    | 'browser'
    | 'operating-system'
    | 'time';
  condition: string;
  destination: string;
  priority: number;
  enabled: boolean;
}

export interface BrandKit {
  id: string;
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  foregroundColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface LandingPageConfig {
  id: string;
  qrCodeId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  enabled: boolean;
}

export interface BulkQRItem {
  id: string;
  name: string;
  type: string;
  content: unknown;
  status: 'pending' | 'generated' | 'failed';
  error?: string;
}

export interface TemplateRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  content: unknown;
  design?: unknown;
  isPublic: boolean;
  createdAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}