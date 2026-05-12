-- ─────────────────────────────────────────────────────────────────────────────
-- Language management
-- Adds a `languages` table for admin-controlled locale visibility and a
-- `preferred_language` column on profiles for per-user language preference.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Languages table
CREATE TABLE IF NOT EXISTS public.languages (
  code         TEXT        PRIMARY KEY,
  name         TEXT        NOT NULL,             -- English name
  native_name  TEXT        NOT NULL,             -- Name in the language itself
  country_code TEXT        NOT NULL,             -- ISO 3166-1 alpha-2 for flag
  is_active    BOOLEAN     NOT NULL DEFAULT true,
  is_default   BOOLEAN     NOT NULL DEFAULT false,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Seed initial languages (all active by default)
INSERT INTO public.languages (code, name, native_name, country_code, is_active, is_default, sort_order)
VALUES
  ('en', 'English',  'English',   'GB', true,  true,  0),
  ('es', 'Spanish',  'Español',   'ES', true,  false, 1),
  ('fr', 'French',   'Français',  'FR', true,  false, 2),
  ('de', 'German',   'Deutsch',   'DE', true,  false, 3),
  ('zh', 'Chinese',  '中文',       'CN', true,  false, 4)
ON CONFLICT (code) DO NOTHING;

-- 3. Preferred language on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en';

-- 4. Row-level security
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

-- Everyone can read languages (needed for public nav, unauthenticated visitors)
DROP POLICY IF EXISTS "Anyone can view languages" ON public.languages;
CREATE POLICY "Anyone can view languages"
  ON public.languages FOR SELECT
  USING (true);

-- Only site admins can insert / update / delete
DROP POLICY IF EXISTS "Admins can manage languages" ON public.languages;
CREATE POLICY "Admins can manage languages"
  ON public.languages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
