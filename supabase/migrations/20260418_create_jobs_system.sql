-- Jobs System
-- Organizations (company profiles) can post jobs. Media professionals apply
-- with a resume (link or PDF). Companies review applications, schedule
-- interviews, and reply. A dedicated bucket stores uploaded resumes.

-- Enums -----------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'freelance', 'internship', 'temporary');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('draft', 'open', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE job_application_status AS ENUM (
        'submitted', 'reviewed', 'interview_scheduled', 'rejected', 'accepted', 'withdrawn'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE resume_type AS ENUM ('link', 'pdf');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Jobs -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    posted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 160),
    slug TEXT NOT NULL,
    description TEXT,
    department TEXT,
    job_type job_type NOT NULL DEFAULT 'full_time',
    status job_status NOT NULL DEFAULT 'open',
    location TEXT,
    is_remote BOOLEAN DEFAULT false,
    salary_min NUMERIC,
    salary_max NUMERIC,
    currency TEXT DEFAULT 'USD',
    skills TEXT[] DEFAULT '{}',
    application_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, slug)
);

-- Job applications -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    resume_url TEXT NOT NULL,
    resume_type resume_type NOT NULL DEFAULT 'link',
    cover_letter TEXT,
    phone TEXT,
    status job_application_status NOT NULL DEFAULT 'submitted',
    interview_scheduled_at TIMESTAMPTZ,
    interview_location TEXT,
    interview_notes TEXT,
    reply_message TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(job_id, applicant_id)
);

-- Indexes --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_jobs_org_id ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id ON job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON job_applications(created_at DESC);

-- updated_at trigger ---------------------------------------------------------
CREATE OR REPLACE FUNCTION touch_jobs_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jobs_touch ON jobs;
CREATE TRIGGER trg_jobs_touch BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION touch_jobs_updated_at();

DROP TRIGGER IF EXISTS trg_job_applications_touch ON job_applications;
CREATE TRIGGER trg_job_applications_touch BEFORE UPDATE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION touch_jobs_updated_at();

-- Application count maintenance ---------------------------------------------
CREATE OR REPLACE FUNCTION job_applications_bump_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jobs SET application_count = application_count + 1 WHERE id = NEW.job_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jobs SET application_count = GREATEST(application_count - 1, 0) WHERE id = OLD.job_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_job_applications_count ON job_applications;
CREATE TRIGGER trg_job_applications_count
    AFTER INSERT OR DELETE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION job_applications_bump_count();

-- RLS ------------------------------------------------------------------------
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Jobs: open listings visible to all authenticated users
DROP POLICY IF EXISTS "Open jobs are viewable by everyone" ON jobs;
CREATE POLICY "Open jobs are viewable by everyone"
    ON jobs FOR SELECT
    USING (status = 'open');

-- Jobs: org members can see their own drafts / closed postings
DROP POLICY IF EXISTS "Org members can see all their jobs" ON jobs;
CREATE POLICY "Org members can see all their jobs"
    ON jobs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = jobs.organization_id
            AND om.user_id = auth.uid()
        )
    );

-- Jobs: owners/admins/editors can insert/update/delete
DROP POLICY IF EXISTS "Org editors can create jobs" ON jobs;
CREATE POLICY "Org editors can create jobs"
    ON jobs FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = jobs.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Org editors can update jobs" ON jobs;
CREATE POLICY "Org editors can update jobs"
    ON jobs FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = jobs.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Org admins can delete jobs" ON jobs;
CREATE POLICY "Org admins can delete jobs"
    ON jobs FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = jobs.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
    );

-- Applications: applicants see their own, org editors see all for their jobs
DROP POLICY IF EXISTS "Applicants see their own applications" ON job_applications;
CREATE POLICY "Applicants see their own applications"
    ON job_applications FOR SELECT
    TO authenticated
    USING (applicant_id = auth.uid());

DROP POLICY IF EXISTS "Org members see applications to their jobs" ON job_applications;
CREATE POLICY "Org members see applications to their jobs"
    ON job_applications FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM jobs j
            JOIN organization_members om ON om.organization_id = j.organization_id
            WHERE j.id = job_applications.job_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'editor')
        )
    );

-- Applications: any authenticated user can apply (insert) for themselves
DROP POLICY IF EXISTS "Authenticated users can apply" ON job_applications;
CREATE POLICY "Authenticated users can apply"
    ON job_applications FOR INSERT
    TO authenticated
    WITH CHECK (applicant_id = auth.uid());

-- Applications: applicant can withdraw (update status) on their own row
-- Org editors can update status/interview/reply fields on applications to their jobs
DROP POLICY IF EXISTS "Applicants or org editors can update applications" ON job_applications;
CREATE POLICY "Applicants or org editors can update applications"
    ON job_applications FOR UPDATE
    TO authenticated
    USING (
        applicant_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM jobs j
            JOIN organization_members om ON om.organization_id = j.organization_id
            WHERE j.id = job_applications.job_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'editor')
        )
    );

-- Applicants can withdraw/delete their own application
DROP POLICY IF EXISTS "Applicants can delete their applications" ON job_applications;
CREATE POLICY "Applicants can delete their applications"
    ON job_applications FOR DELETE
    TO authenticated
    USING (applicant_id = auth.uid());

-- Resume storage bucket ------------------------------------------------------
-- Bucket kept public-read so signed URLs are not strictly required. Apps that
-- need tighter privacy should flip `public` to false and serve via signed URLs.
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can upload into their own folder
DROP POLICY IF EXISTS "Authenticated users upload resumes to own folder" ON storage.objects;
CREATE POLICY "Authenticated users upload resumes to own folder"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'resumes'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Resumes are publicly readable" ON storage.objects;
CREATE POLICY "Resumes are publicly readable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
CREATE POLICY "Users can update their own resumes"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
CREATE POLICY "Users can delete their own resumes"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
