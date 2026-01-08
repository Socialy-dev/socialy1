-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Accès total public" ON public.journalists;

-- Create proper RLS policies for authenticated users only
CREATE POLICY "Authenticated users can view journalists"
ON public.journalists
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert journalists"
ON public.journalists
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update journalists"
ON public.journalists
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete journalists"
ON public.journalists
FOR DELETE
TO authenticated
USING (true);