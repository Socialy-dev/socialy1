ALTER TABLE public.invitations 
ADD COLUMN page_permissions app_page[] DEFAULT ARRAY['dashboard'::app_page, 'profile'::app_page];

CREATE OR REPLACE FUNCTION public.handle_invitation_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record invitations%ROWTYPE;
  page_permission app_page;
BEGIN
  SELECT * INTO invitation_record FROM invitations 
  WHERE email = NEW.email AND used_at IS NULL 
  ORDER BY created_at DESC LIMIT 1;

  IF invitation_record.id IS NOT NULL THEN
    INSERT INTO organization_members (user_id, organization_id, role)
    VALUES (NEW.id, invitation_record.organization_id, invitation_record.org_role);

    IF invitation_record.org_role IN ('super_admin', 'org_admin') THEN
      INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'admin');
    ELSE
      INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'user');
    END IF;

    IF invitation_record.page_permissions IS NOT NULL THEN
      FOREACH page_permission IN ARRAY invitation_record.page_permissions
      LOOP
        INSERT INTO user_permissions (user_id, page) 
        VALUES (NEW.id, page_permission)
        ON CONFLICT (user_id, page) DO NOTHING;
      END LOOP;
    END IF;

    UPDATE invitations SET used_at = NOW() WHERE id = invitation_record.id;
  END IF;

  RETURN NEW;
END;
$$;