
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pinterest_creatives', 'pinterest_creatives', false);

CREATE POLICY "Org members can view pinterest creative files"
ON storage.objects FOR SELECT
USING (bucket_id = 'pinterest_creatives' AND (
  is_super_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public.organization_members om 
    WHERE om.user_id = auth.uid() 
    AND om.organization_id::text = (storage.foldername(name))[1]
  )
));

CREATE POLICY "Service role can manage pinterest creative files"
ON storage.objects FOR ALL
USING (bucket_id = 'pinterest_creatives')
WITH CHECK (bucket_id = 'pinterest_creatives');

ALTER TABLE public.pinterest_creatives ADD COLUMN storage_path TEXT;
