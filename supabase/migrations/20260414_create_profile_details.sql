-- Enhanced user profile details: work history, education, portfolio

CREATE TABLE IF NOT EXISTS public.profile_experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_experiences_profile ON public.profile_experiences(profile_id);

ALTER TABLE public.profile_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experiences are publicly viewable"
ON public.profile_experiences FOR SELECT USING (true);

CREATE POLICY "Users manage their own experiences"
ON public.profile_experiences FOR ALL USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.profile_education (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution TEXT NOT NULL,
    degree TEXT,
    field TEXT,
    start_year INTEGER,
    end_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_education_profile ON public.profile_education(profile_id);

ALTER TABLE public.profile_education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Education is publicly viewable"
ON public.profile_education FOR SELECT USING (true);

CREATE POLICY "Users manage their own education"
ON public.profile_education FOR ALL USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.profile_portfolio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_portfolio_profile ON public.profile_portfolio(profile_id);

ALTER TABLE public.profile_portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portfolio items are publicly viewable"
ON public.profile_portfolio FOR SELECT USING (true);

CREATE POLICY "Users manage their own portfolio"
ON public.profile_portfolio FOR ALL USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
