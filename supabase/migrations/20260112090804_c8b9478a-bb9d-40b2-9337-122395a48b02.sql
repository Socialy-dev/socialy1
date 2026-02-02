-- 1. Fix current user manually - add admin role and permissions
INSERT INTO public.user_roles (user_id, role) 
VALUES ('f3075ce3-1f56-4cc3-b800-ad7b843fe78f', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

INSERT INTO public.user_permissions (user_id, page) VALUES 
  ('f3075ce3-1f56-4cc3-b800-ad7b843fe78f', 'dashboard'),
  ('f3075ce3-1f56-4cc3-b800-ad7b843fe78f', 'relations-presse'),
  ('f3075ce3-1f56-4cc3-b800-ad7b843fe78f', 'social-media'),
  ('f3075ce3-1f56-4cc3-b800-ad7b843fe78f', 'profile')
ON CONFLICT (user_id, page) DO NOTHING;

-- 2. Mark the invitation as used
UPDATE public.invitations 
SET used_at = now() 
WHERE email = 'catellierbenjamin@gmail.com' AND used_at IS NULL;

-- 3. Create function to auto-assign role and permissions from invitation on user signup
CREATE OR REPLACE FUNCTION public.handle_invitation_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv RECORD;
  p app_page;
BEGIN
  SELECT * INTO inv 
  FROM public.invitations 
  WHERE email = NEW.email 
    AND used_at IS NULL 
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, inv.role)
    ON CONFLICT (user_id) DO UPDATE SET role = inv.role;

    FOREACH p IN ARRAY inv.pages
    LOOP
      INSERT INTO public.user_permissions (user_id, page)
      VALUES (NEW.id, p)
      ON CONFLICT (user_id, page) DO NOTHING;
    END LOOP;

    UPDATE public.invitations 
    SET used_at = now() 
    WHERE id = inv.id;
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_invitation ON auth.users;
CREATE TRIGGER on_auth_user_created_invitation
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_invitation_signup();