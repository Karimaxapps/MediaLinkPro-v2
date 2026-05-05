-- Blog / editorial content system
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    excerpt text,
    content text NOT NULL,
    cover_image_url text,
    category text,
    tags text[] DEFAULT '{}'::text[],
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at timestamptz,
    views_count integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published
    ON public.blog_posts(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published posts" ON public.blog_posts;
CREATE POLICY "Public can read published posts"
    ON public.blog_posts
    FOR SELECT
    USING (status = 'published' OR auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors create own posts" ON public.blog_posts;
CREATE POLICY "Authors create own posts"
    ON public.blog_posts
    FOR INSERT
    WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors update own posts" ON public.blog_posts;
CREATE POLICY "Authors update own posts"
    ON public.blog_posts
    FOR UPDATE
    USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors delete own posts" ON public.blog_posts;
CREATE POLICY "Authors delete own posts"
    ON public.blog_posts
    FOR DELETE
    USING (auth.uid() = author_id);

CREATE OR REPLACE FUNCTION public.touch_blog_posts()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    IF NEW.status = 'published' AND OLD.status <> 'published' THEN
        NEW.published_at = COALESCE(NEW.published_at, now());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_blog_posts ON public.blog_posts;
CREATE TRIGGER trg_touch_blog_posts
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION public.touch_blog_posts();
