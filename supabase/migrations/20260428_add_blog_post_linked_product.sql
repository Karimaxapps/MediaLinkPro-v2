-- Lets a blog post optionally link to one of the author's products/services.
-- Used to surface the linked product on the blog post page and the related
-- posts on the product details page.

ALTER TABLE public.blog_posts
    ADD COLUMN IF NOT EXISTS linked_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_linked_product
    ON public.blog_posts(linked_product_id) WHERE linked_product_id IS NOT NULL;
