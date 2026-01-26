INSERT INTO storage.buckets (id, name, public) VALUES ('creative_inspirations', 'creative_inspirations', false);

CREATE POLICY "Org members can view inspirations" ON storage.objects FOR SELECT USING (
  bucket_id = 'creative_inspirations' AND
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid()
    AND om.organization_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Org admins can upload inspirations" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'creative_inspirations' AND
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid()
    AND om.organization_id::text = (storage.foldername(name))[1]
    AND om.role IN ('super_admin', 'org_admin')
  )
);

CREATE POLICY "Org admins can delete inspirations" ON storage.objects FOR DELETE USING (
  bucket_id = 'creative_inspirations' AND
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid()
    AND om.organization_id::text = (storage.foldername(name))[1]
    AND om.role IN ('super_admin', 'org_admin')
  )
);

ALTER TABLE public.creative_library_inspirations 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS original_url TEXT;