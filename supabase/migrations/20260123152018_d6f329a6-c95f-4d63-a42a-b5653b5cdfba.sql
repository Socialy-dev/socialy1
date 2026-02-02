UPDATE storage.buckets 
SET public = false 
WHERE id = 'communique_presse';

DROP POLICY IF EXISTS "Public access to communique_presse files" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload to communique_presse" ON storage.objects;
DROP POLICY IF EXISTS "Users can view communique_presse files from their org" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own communique_presse files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own communique_presse files" ON storage.objects;

CREATE POLICY "Users can upload to communique_presse for their org" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'communique_presse' 
  AND EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view communique_presse files from their org" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'communique_presse'
  AND EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update communique_presse files" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'communique_presse'
  AND EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete communique_presse files" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'communique_presse'
  AND EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid()
  )
);