-- Fix the invitations RLS policy that tries to access auth.users directly
DROP POLICY IF EXISTS "Users can only verify their own invitation by token" ON public.invitations;

CREATE POLICY "Users can only verify their own invitation by token" 
ON public.invitations 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR (email = auth.jwt() ->> 'email')
);