
-- Ajouter une contrainte unique sur user_permissions pour éviter les doublons
ALTER TABLE public.user_permissions 
ADD CONSTRAINT user_permissions_user_page_unique UNIQUE (user_id, page);
