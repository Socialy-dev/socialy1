DROP POLICY IF EXISTS "Anyone can verify invitation by token" ON public.invitations;

CREATE POLICY "Users can only verify their own invitation by token" 
ON public.invitations 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);