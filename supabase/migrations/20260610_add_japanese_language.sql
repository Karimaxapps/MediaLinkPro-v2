-- ─────────────────────────────────────────────────────────────────────────────
-- Add Japanese language
-- Seeds the `ja` locale into the languages table so it appears in the locale
-- switcher and admin language panel.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.languages (code, name, native_name, country_code, is_active, is_default, sort_order)
VALUES
  ('ja', 'Japanese', '日本語', 'JP', true, false, 5)
ON CONFLICT (code) DO NOTHING;
