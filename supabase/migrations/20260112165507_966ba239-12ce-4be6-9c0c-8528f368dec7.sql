-- Créer les policies pour le bucket communique_presse
CREATE POLICY "Users can view communique files"
ON storage.objects FOR SELECT
USING (bucket_id = 'communique_presse' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload communique files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'communique_presse' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update communique files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'communique_presse' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete communique files"
ON storage.objects FOR DELETE
USING (bucket_id = 'communique_presse' AND auth.role() = 'authenticated');

-- Rendre le bucket public pour que les liens directs fonctionnent
UPDATE storage.buckets SET public = true WHERE id = 'communique_presse';