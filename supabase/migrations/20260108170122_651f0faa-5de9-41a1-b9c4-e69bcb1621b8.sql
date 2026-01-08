-- Assigner le rôle admin à ben.catellier@socialy.fr
INSERT INTO public.user_roles (user_id, role)
VALUES ('38c9e769-b623-43bd-a8ab-b59eb5646447', 'admin');

-- Assigner toutes les permissions de pages
INSERT INTO public.user_permissions (user_id, page)
SELECT '38c9e769-b623-43bd-a8ab-b59eb5646447', unnest(enum_range(NULL::app_page))
ON CONFLICT (user_id, page) DO NOTHING;