-- Self-serve advertising system
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
    name text NOT NULL,
    title text NOT NULL,
    body text,
    cta_label text,
    cta_url text NOT NULL,
    image_url text,
    placement text NOT NULL DEFAULT 'feed' CHECK (placement IN ('feed', 'sidebar', 'marketplace')),
    target_category text,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'ended')),
    starts_at timestamptz,
    ends_at timestamptz,
    impressions integer NOT NULL DEFAULT 0,
    clicks integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_active
    ON public.ad_campaigns(placement, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_advertiser
    ON public.ad_campaigns(advertiser_id);

ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active ads" ON public.ad_campaigns;
CREATE POLICY "Public can view active ads"
    ON public.ad_campaigns
    FOR SELECT
    USING (status = 'active' OR auth.uid() = advertiser_id);

DROP POLICY IF EXISTS "Advertisers manage own campaigns" ON public.ad_campaigns;
CREATE POLICY "Advertisers manage own campaigns"
    ON public.ad_campaigns
    FOR ALL
    USING (auth.uid() = advertiser_id)
    WITH CHECK (auth.uid() = advertiser_id);

-- Increment counters as a stored function so it works under RLS
CREATE OR REPLACE FUNCTION public.increment_ad_impression(p_campaign_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.ad_campaigns
    SET impressions = impressions + 1
    WHERE id = p_campaign_id AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_ad_click(p_campaign_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.ad_campaigns
    SET clicks = clicks + 1
    WHERE id = p_campaign_id AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
