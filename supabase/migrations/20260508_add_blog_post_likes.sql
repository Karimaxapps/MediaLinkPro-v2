-- Add likes_count to blog_posts
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;

-- Reset all counts to 0 for real tracking
UPDATE public.blog_posts SET views_count = 0, likes_count = 0;

-- Blog post likes junction table
CREATE TABLE IF NOT EXISTS public.blog_post_likes (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid        NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.blog_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON public.blog_post_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like posts"
  ON public.blog_post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON public.blog_post_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_blog_post_likes_post_id ON public.blog_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_likes_user_id ON public.blog_post_likes(user_id);

-- Trigger: keep likes_count in sync automatically
CREATE OR REPLACE FUNCTION public.update_blog_post_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.blog_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.blog_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_blog_post_likes_count ON public.blog_post_likes;
CREATE TRIGGER trg_blog_post_likes_count
  AFTER INSERT OR DELETE ON public.blog_post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_blog_post_likes_count();

-- RPC: atomic view increment (bypasses RLS, safe for server-side use)
CREATE OR REPLACE FUNCTION public.increment_blog_post_view(p_post_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.blog_posts SET views_count = views_count + 1 WHERE id = p_post_id;
END;
$$;
