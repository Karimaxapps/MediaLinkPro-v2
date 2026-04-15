-- Product Reviews & Ratings System
-- Allows authenticated users to rate and review products (one review per user per product)

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
    body TEXT CHECK (char_length(body) <= 2000),
    is_helpful_count INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(product_id, user_id)
);

-- Create helpful votes tracking table
CREATE TABLE IF NOT EXISTS review_helpful_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(review_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review_id ON review_helpful_votes(review_id);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_reviews
-- Anyone can read visible reviews
CREATE POLICY "Reviews are viewable by everyone"
    ON product_reviews FOR SELECT
    USING (is_visible = true);

-- Authenticated users can create reviews (one per product)
CREATE POLICY "Authenticated users can create reviews"
    ON product_reviews FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
    ON product_reviews FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
    ON product_reviews FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Org admins can moderate (update visibility) any review on their products
CREATE POLICY "Org admins can moderate reviews"
    ON product_reviews FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM products p
            JOIN organization_members om ON om.organization_id = p.organization_id
            WHERE p.id = product_reviews.product_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
    );

-- RLS Policies for review_helpful_votes
CREATE POLICY "Helpful votes are viewable by everyone"
    ON review_helpful_votes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can vote helpful"
    ON review_helpful_votes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their helpful vote"
    ON review_helpful_votes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
