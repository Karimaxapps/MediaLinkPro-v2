-- Public bucket for event cover images.
-- Files are scoped to the uploader's user ID folder so RLS keeps writes
-- isolated per user, while reads remain public (covers are public on
-- published event pages).

INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users may upload anywhere in the bucket; the client always
-- writes to `<auth.uid()>/...` so update/delete policies below stay scoped.
CREATE POLICY "Allow authenticated users to upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'events');

CREATE POLICY "Allow authenticated users to update their event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'events' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow authenticated users to delete their event images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'events' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow public to view event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'events');
