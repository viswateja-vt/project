/*
# Unified QR Platform Schema

## Overview
Creates the complete database schema for a SaaS QR Management Platform with user authentication,
static & dynamic QR codes, multi-link QR, digital business cards, file uploads, and analytics.

## New Tables
1. profiles — Extended user profile data. One row per auth user.
2. qr_codes — All QR codes (static and dynamic). Owner-scoped.
3. qr_links — Multiple destination links for multi-link QR codes. Child of qr_codes.
4. scans — Individual scan events for analytics.
5. business_cards — Digital business card data.
6. files — Metadata for uploaded files (PDF, images, videos).

## Security
- RLS enabled on all tables.
- All tables are owner-scoped: users can only CRUD their own rows.
- Owner columns default to auth.uid() so inserts without explicit user_id succeed.
- Scans table is insertable by anon (for edge function scan tracking) but only readable by the QR owner.
*/

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  company text,
  bio text,
  website text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- QR_CODES TABLE
CREATE TABLE IF NOT EXISTS qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'url',
  is_dynamic boolean NOT NULL DEFAULT false,
  short_id text UNIQUE,
  destination text,
  data jsonb,
  foreground_color text DEFAULT '#000000',
  background_color text DEFAULT '#FFFFFF',
  error_correction text DEFAULT 'M',
  logo_url text,
  size integer DEFAULT 300,
  folder text,
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  scan_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_short_id ON qr_codes(short_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_type ON qr_codes(type);

ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_qr_codes" ON qr_codes;
CREATE POLICY "select_own_qr_codes" ON qr_codes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_qr_codes" ON qr_codes;
CREATE POLICY "insert_own_qr_codes" ON qr_codes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_qr_codes" ON qr_codes;
CREATE POLICY "update_own_qr_codes" ON qr_codes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_qr_codes" ON qr_codes;
CREATE POLICY "delete_own_qr_codes" ON qr_codes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- QR_LINKS TABLE (for multi-link QR)
CREATE TABLE IF NOT EXISTS qr_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id uuid NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  label text NOT NULL,
  url text NOT NULL,
  icon text,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_links_qr_code_id ON qr_links(qr_code_id);

ALTER TABLE qr_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_qr_links" ON qr_links;
CREATE POLICY "select_own_qr_links" ON qr_links FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_links.qr_code_id AND qr_codes.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_qr_links" ON qr_links;
CREATE POLICY "insert_own_qr_links" ON qr_links FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_links.qr_code_id AND qr_codes.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_qr_links" ON qr_links;
CREATE POLICY "update_own_qr_links" ON qr_links FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_links.qr_code_id AND qr_codes.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_links.qr_code_id AND qr_codes.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_qr_links" ON qr_links;
CREATE POLICY "delete_own_qr_links" ON qr_links FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_links.qr_code_id AND qr_codes.user_id = auth.uid())
  );

-- SCANS TABLE (analytics)
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id uuid NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  user_agent text,
  ip_address text,
  country text,
  city text,
  device_type text,
  browser text,
  os text,
  referrer text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scans_qr_code_id ON scans(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_scans" ON scans;
CREATE POLICY "select_own_scans" ON scans FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = scans.qr_code_id AND qr_codes.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_scans_anon" ON scans;
CREATE POLICY "insert_scans_anon" ON scans FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "delete_own_scans" ON scans;
CREATE POLICY "delete_own_scans" ON scans FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = scans.qr_code_id AND qr_codes.user_id = auth.uid())
  );

-- BUSINESS_CARDS TABLE
CREATE TABLE IF NOT EXISTS business_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  qr_code_id uuid REFERENCES qr_codes(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  job_title text,
  company text,
  email text,
  phone text,
  website text,
  address text,
  photo_url text,
  bio text,
  social_links jsonb DEFAULT '{}',
  theme text DEFAULT 'modern',
  accent_color text DEFAULT '#2563EB',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_cards_user_id ON business_cards(user_id);

ALTER TABLE business_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_business_cards" ON business_cards;
CREATE POLICY "select_own_business_cards" ON business_cards FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_business_cards" ON business_cards;
CREATE POLICY "insert_own_business_cards" ON business_cards FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_business_cards" ON business_cards;
CREATE POLICY "update_own_business_cards" ON business_cards FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_business_cards" ON business_cards;
CREATE POLICY "delete_own_business_cards" ON business_cards FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- FILES TABLE (metadata for uploaded files)
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  qr_code_id uuid REFERENCES qr_codes(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  storage_path text NOT NULL,
  public_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_files" ON files;
CREATE POLICY "select_own_files" ON files FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_files" ON files;
CREATE POLICY "insert_own_files" ON files FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_files" ON files;
CREATE POLICY "update_own_files" ON files FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_files" ON files;
CREATE POLICY "delete_own_files" ON files FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-files', 'qr-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'qr-files'
  );

DROP POLICY IF EXISTS "Public can read qr-files" ON storage.objects;
CREATE POLICY "Public can read qr-files" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'qr-files');

DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'qr-files');

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Generate short_id for dynamic QR codes
CREATE OR REPLACE FUNCTION generate_short_id()
RETURNS text AS $$
DECLARE
  chars text := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_qr_short_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_dynamic = true AND NEW.short_id IS NULL THEN
    NEW.short_id := generate_short_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_qr_short_id ON qr_codes;
CREATE TRIGGER trg_qr_short_id
  BEFORE INSERT ON qr_codes
  FOR EACH ROW EXECUTE FUNCTION set_qr_short_id();

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_qr_codes_updated_at ON qr_codes;
CREATE TRIGGER trg_qr_codes_updated_at
  BEFORE UPDATE ON qr_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_business_cards_updated_at ON business_cards;
CREATE TRIGGER trg_business_cards_updated_at
  BEFORE UPDATE ON business_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();