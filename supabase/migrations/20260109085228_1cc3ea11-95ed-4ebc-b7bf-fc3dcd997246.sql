
-- Ajouter le rôle admin pour av@socialy.fr
INSERT INTO public.user_roles (user_id, role)
VALUES ('0f7b0948-1144-43fd-828c-c512d46db7bd', 'admin');

-- Ajouter toutes les permissions pour av@socialy.fr
INSERT INTO public.user_permissions (user_id, page)
VALUES 
  ('0f7b0948-1144-43fd-828c-c512d46db7bd', 'dashboard'),
  ('0f7b0948-1144-43fd-828c-c512d46db7bd', 'relations-presse'),
  ('0f7b0948-1144-43fd-828c-c512d46db7bd', 'social-media'),
  ('0f7b0948-1144-43fd-828c-c512d46db7bd', 'profile');
