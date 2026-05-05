-- Expert services and reviews

CREATE TABLE IF NOT EXISTS public.expert_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expert_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2),
    currency TEXT DEFAULT 'USD',
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expert_services_expert ON public.expert_services(expert_id);

ALTER TABLE public.expert_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are publicly viewable"
ON public.expert_services FOR SELECT USING (is_active = true OR expert_id = auth.uid());

CREATE POLICY "Experts manage their own services"
ON public.expert_services FOR ALL USING (expert_id = auth.uid()) WITH CHECK (expert_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.expert_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expert_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (expert_id, reviewer_id),
    CHECK (expert_id <> reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_expert_reviews_expert ON public.expert_reviews(expert_id);

ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Expert reviews are publicly viewable"
ON public.expert_reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON public.expert_reviews FOR INSERT
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews"
ON public.expert_reviews FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews"
ON public.expert_reviews FOR DELETE USING (auth.uid() = reviewer_id);
