
CREATE OR REPLACE FUNCTION public.handle_invitation_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv RECORD;
BEGIN
  SELECT * INTO inv 
  FROM public.invitations 
  WHERE email = NEW.email 
    AND used_at IS NULL 
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (inv.organization_id, NEW.id, inv.org_role)
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = inv.org_role;

    UPDATE public.invitations 
    SET used_at = now() 
    WHERE id = inv.id;
  END IF;

  RETURN NEW;
END;
$$;
