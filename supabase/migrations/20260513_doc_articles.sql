-- Documentation articles table
-- Serves both admin docs hub (/admin/docs) and user support center (/support).
-- category + is_public control which surface each article appears on.

CREATE TABLE doc_articles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  content     TEXT        NOT NULL DEFAULT '',
  excerpt     TEXT,
  category    TEXT        NOT NULL CHECK (category IN ('changelog','admin-guide','feature','user-guide','faq')),
  is_public   BOOLEAN     NOT NULL DEFAULT false,
  sort_order  INT         NOT NULL DEFAULT 0,
  version_tag TEXT,
  author_id   UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE doc_articles ENABLE ROW LEVEL SECURITY;

-- Admins have full access to all articles
CREATE POLICY "admins_all_doc_articles"
  ON doc_articles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Authenticated users can read public articles
CREATE POLICY "users_read_public_doc_articles"
  ON doc_articles FOR SELECT
  USING (is_public = true AND auth.uid() IS NOT NULL);

CREATE INDEX idx_doc_articles_category   ON doc_articles (category);
CREATE INDEX idx_doc_articles_slug       ON doc_articles (slug);
CREATE INDEX idx_doc_articles_is_public  ON doc_articles (is_public);
CREATE INDEX idx_doc_articles_sort_order ON doc_articles (sort_order);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_doc_articles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_doc_articles_updated_at
  BEFORE UPDATE ON doc_articles
  FOR EACH ROW EXECUTE FUNCTION update_doc_articles_updated_at();
