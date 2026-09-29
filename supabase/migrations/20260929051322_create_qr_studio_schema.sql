/*
# QR Studio - Core Schema

Creates the full database schema for QR Studio, a premium QR code management platform.

## New Tables
1. user_profiles - extended user data (onboarding, avatar, use case)
2. qr_codes - main QR code records with design settings, content, status
3. qr_versions - version history for dynamic QR codes
4. qr_scans - scan tracking (device, browser, os, country, referrer)
5. qr_links - multi-link landing page links
6. folders - organization folders
7. tags - user-defined tags
8. qr_tags - junction table QR<->tag
9. templates - reusable design templates + starter templates
10. brand_kits - per-user brand kit (logo, colors, default styles)
11. redirect_rules - smart redirect rules (device, OS, language, time-based)

## Security
- RLS enabled on ALL tables
- Owner-scoped policies using auth.uid()
- Child tables scoped through parent qr_codes ownership
- Starter templates readable by all authenticated users
*/

-- ============ USER PROFILES ============
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  use_case text DEFAULT 'personal',
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON user_profiles;
CREATE POLICY "select_own_profile" ON user_profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON user_profiles;
CREATE POLICY "insert_own_profile" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;
CREATE POLICY "update_own_profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "delete_own_profile" ON user_profiles;
CREATE POLICY "delete_own_profile" ON user_profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- ============ QR CODES ============
CREATE TABLE IF NOT EXISTS qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'url',
  is_dynamic boolean NOT NULL DEFAULT false,
  destination text,
  short_code text UNIQUE,
  status text NOT NULL DEFAULT 'active',
  settings_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  folder_id uuid,
  is_favorite boolean NOT NULL DEFAULT false,
  scan_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  start_at timestamptz,
  end_at timestamptz,
  landing_config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_short_code ON qr_codes(short_code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_folder_id ON qr_codes(folder_id);
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_qr" ON qr_codes;
CREATE POLICY "select_own_qr" ON qr_codes FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_qr" ON qr_codes;
CREATE POLICY "insert_own_qr" ON qr_codes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_qr" ON qr_codes;
CREATE POLICY "update_own_qr" ON qr_codes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_qr" ON qr_codes;
CREATE POLICY "delete_own_qr" ON qr_codes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ QR VERSIONS ============
CREATE TABLE IF NOT EXISTS qr_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id uuid NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  destination text,
  settings_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_qr_versions_qr_id ON qr_versions(qr_id);
ALTER TABLE qr_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_versions" ON qr_versions;
CREATE POLICY "select_own_versions" ON qr_versions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_versions.qr_id AND qr_codes.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_versions" ON qr_versions;
CREATE POLICY "insert_own_versions" ON qr_versions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_versions.qr_id AND qr_codes.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_versions" ON qr_versions;
CREATE POLICY "delete_own_versions" ON qr_versions FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_versions.qr_id AND qr_codes.user_id = auth.uid()));

-- ============ QR SCANS ============
CREATE TABLE IF NOT EXISTS qr_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id uuid NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  scanned_at timestamptz DEFAULT now(),
  device_type text,
  browser text,
  os text,
  country text,
  referrer text,
  ip_hash text
);
CREATE INDEX IF NOT EXISTS idx_qr_scans_qr_id ON qr_scans(qr_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_scanned_at ON qr_scans(scanned_at);
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_scans" ON qr_scans;
CREATE POLICY "select_own_scans" ON qr_scans FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_scans.qr_id AND qr_codes.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_scans" ON qr_scans;
CREATE POLICY "insert_own_scans" ON qr_scans FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_scans.qr_id AND qr_codes.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_scans" ON qr_scans;
CREATE POLICY "delete_own_scans" ON qr_scans FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_scans.qr_id AND qr_codes.user_id = auth.uid()));

-- ============ QR LINKS ============
CREATE TABLE IF NOT EXISTS qr_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id uuid NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  icon text,
  description text,
  position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_qr_links_qr_id ON qr_links(qr_id);
ALTER TABLE qr_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_links" ON qr_links;
CREATE POLICY "select_own_links" ON qr_links FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_links.qr_id AND qr_codes.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_links" ON qr_links;
CREATE POLICY "insert_own_links" ON qr_links FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_links.qr_id AND qr_codes.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_own_links" ON qr_links;
CREATE POLICY "update_own_links" ON qr_links FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_links.qr_id AND qr_codes.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_links.qr_id AND qr_codes.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_links" ON qr_links;
CREATE POLICY "delete_own_links" ON qr_links FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_links.qr_id AND qr_codes.user_id = auth.uid()));

-- ============ FOLDERS ============
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_folders" ON folders;
CREATE POLICY "select_own_folders" ON folders FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_folders" ON folders;
CREATE POLICY "insert_own_folders" ON folders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_folders" ON folders;
CREATE POLICY "update_own_folders" ON folders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_folders" ON folders;
CREATE POLICY "delete_own_folders" ON folders FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ TAGS ============
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tags" ON tags;
CREATE POLICY "select_own_tags" ON tags FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_tags" ON tags;
CREATE POLICY "insert_own_tags" ON tags FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_tags" ON tags;
CREATE POLICY "update_own_tags" ON tags FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_tags" ON tags;
CREATE POLICY "delete_own_tags" ON tags FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ QR TAGS ============
CREATE TABLE IF NOT EXISTS qr_tags (
  qr_id uuid REFERENCES qr_codes(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (qr_id, tag_id)
);
ALTER TABLE qr_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_qr_tags" ON qr_tags;
CREATE POLICY "select_own_qr_tags" ON qr_tags FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_tags.qr_id AND qr_codes.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_qr_tags" ON qr_tags;
CREATE POLICY "insert_own_qr_tags" ON qr_tags FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_tags.qr_id AND qr_codes.user_id = auth.uid()) AND EXISTS (SELECT 1 FROM tags WHERE tags.id = qr_tags.tag_id AND tags.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_qr_tags" ON qr_tags;
CREATE POLICY "delete_own_qr_tags" ON qr_tags FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = qr_tags.qr_id AND qr_codes.user_id = auth.uid()));

-- ============ TEMPLATES ============
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  settings_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_starter boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_templates" ON templates;
CREATE POLICY "select_templates" ON templates FOR SELECT TO authenticated USING (is_starter = true OR auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_templates" ON templates;
CREATE POLICY "insert_own_templates" ON templates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_templates" ON templates;
CREATE POLICY "update_own_templates" ON templates FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_templates" ON templates;
CREATE POLICY "delete_own_templates" ON templates FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ BRAND KITS ============
CREATE TABLE IF NOT EXISTS brand_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  logo_url text,
  primary_color text DEFAULT '#1a1a2e',
  secondary_color text DEFAULT '#e94560',
  accent_color text DEFAULT '#0f3460',
  default_pattern text DEFAULT 'square',
  default_eye text DEFAULT 'square',
  default_foreground text DEFAULT '#1a1a2e',
  default_background text DEFAULT '#ffffff',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_kits_user_id ON brand_kits(user_id);
ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_brand_kit" ON brand_kits;
CREATE POLICY "select_own_brand_kit" ON brand_kits FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_brand_kit" ON brand_kits;
CREATE POLICY "insert_own_brand_kit" ON brand_kits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_brand_kit" ON brand_kits;
CREATE POLICY "update_own_brand_kit" ON brand_kits FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_brand_kit" ON brand_kits;
CREATE POLICY "delete_own_brand_kit" ON brand_kits FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ REDIRECT RULES ============
CREATE TABLE IF NOT EXISTS redirect_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id uuid NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  condition_type text NOT NULL,
  condition_value text NOT NULL,
  redirect_url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_redirect_rules_qr_id ON redirect_rules(qr_id);
ALTER TABLE redirect_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_rules" ON redirect_rules;
CREATE POLICY "select_own_rules" ON redirect_rules FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = redirect_rules.qr_id AND qr_codes.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_rules" ON redirect_rules;
CREATE POLICY "insert_own_rules" ON redirect_rules FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = redirect_rules.qr_id AND qr_codes.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_own_rules" ON redirect_rules;
CREATE POLICY "update_own_rules" ON redirect_rules FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = redirect_rules.qr_id AND qr_codes.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = redirect_rules.qr_id AND qr_codes.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_rules" ON redirect_rules;
CREATE POLICY "delete_own_rules" ON redirect_rules FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = redirect_rules.qr_id AND qr_codes.user_id = auth.uid()));

-- ============ TRIGGERS ============
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_qr_codes_updated ON qr_codes;
CREATE TRIGGER trigger_qr_codes_updated BEFORE UPDATE ON qr_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trigger_user_profiles_updated ON user_profiles;
CREATE TRIGGER trigger_user_profiles_updated BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trigger_brand_kits_updated ON brand_kits;
CREATE TRIGGER trigger_brand_kits_updated BEFORE UPDATE ON brand_kits FOR EACH ROW EXECUTE FUNCTION update_updated_at();
