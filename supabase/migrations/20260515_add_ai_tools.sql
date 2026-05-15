-- AI Production Tools feature
-- Admin-curated directory of AI tools/platforms for media production.

-- ── Categories (admin-managed) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_tool_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ai_tool_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI tool categories are publicly readable"
ON ai_tool_categories FOR SELECT
USING (true);

-- ── AI Tools ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_tools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT,
    description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    category_id UUID REFERENCES ai_tool_categories(id) ON DELETE SET NULL,
    main_link TEXT NOT NULL,
    pricing_model TEXT,
    pricing_url TEXT,
    platforms TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    views_count BIGINT DEFAULT 0,
    bookmarks_count BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_tools_category_id_idx ON ai_tools(category_id);
CREATE INDEX IF NOT EXISTS ai_tools_slug_idx ON ai_tools(slug);
CREATE INDEX IF NOT EXISTS ai_tools_status_idx ON ai_tools(status);
CREATE INDEX IF NOT EXISTS ai_tools_is_featured_idx ON ai_tools(is_featured);

ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published AI tools are publicly readable"
ON ai_tools FOR SELECT
USING (status = 'published');

-- ── AI Tool Resources (community resources, repeatable) ──────────────────────
CREATE TABLE IF NOT EXISTS ai_tool_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ai_tool_id UUID REFERENCES ai_tools(id) ON DELETE CASCADE NOT NULL,
    resource_type TEXT NOT NULL CHECK (
        resource_type IN ('documentation', 'tutorial', 'youtube', 'community', 'article', 'official_link')
    ),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_tool_resources_ai_tool_id_idx ON ai_tool_resources(ai_tool_id);

ALTER TABLE ai_tool_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI tool resources are publicly readable"
ON ai_tool_resources FOR SELECT
USING (true);

-- ── AI Tool Bookmarks ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_tool_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ai_tool_id UUID REFERENCES ai_tools(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, ai_tool_id)
);

CREATE INDEX IF NOT EXISTS ai_tool_bookmarks_user_id_idx ON ai_tool_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS ai_tool_bookmarks_ai_tool_id_idx ON ai_tool_bookmarks(ai_tool_id);

ALTER TABLE ai_tool_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI tool bookmarks"
ON ai_tool_bookmarks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI tool bookmarks"
ON ai_tool_bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI tool bookmarks"
ON ai_tool_bookmarks FOR DELETE
USING (auth.uid() = user_id);

-- ── Bookmark count triggers ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_ai_tool_bookmarks_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ai_tools
    SET bookmarks_count = bookmarks_count + 1
    WHERE id = NEW.ai_tool_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_ai_tool_bookmarks_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ai_tools
    SET bookmarks_count = bookmarks_count - 1
    WHERE id = OLD.ai_tool_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_ai_tool_bookmark_created ON ai_tool_bookmarks;
CREATE TRIGGER on_ai_tool_bookmark_created
AFTER INSERT ON ai_tool_bookmarks
FOR EACH ROW
EXECUTE FUNCTION increment_ai_tool_bookmarks_count();

DROP TRIGGER IF EXISTS on_ai_tool_bookmark_deleted ON ai_tool_bookmarks;
CREATE TRIGGER on_ai_tool_bookmark_deleted
AFTER DELETE ON ai_tool_bookmarks
FOR EACH ROW
EXECUTE FUNCTION decrement_ai_tool_bookmarks_count();
