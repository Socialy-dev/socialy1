
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view profiles of organization members"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id
  OR user_id IN (
    SELECT om2.user_id 
    FROM organization_members om1
    JOIN organization_members om2 ON om1.organization_id = om2.organization_id
    WHERE om1.user_id = auth.uid()
  )
);
