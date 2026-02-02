
DROP POLICY IF EXISTS "Users can view their own selections" ON public.user_marche_selections;
DROP POLICY IF EXISTS "Users can insert their own selections" ON public.user_marche_selections;
DROP POLICY IF EXISTS "Users can update their own selections" ON public.user_marche_selections;
DROP POLICY IF EXISTS "Users can delete their own selections" ON public.user_marche_selections;

CREATE OR REPLACE FUNCTION public.get_user_organization_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id 
  FROM public.organization_members 
  WHERE user_id = _user_id
$$;

CREATE POLICY "Users can view selections from their organization"
ON public.user_marche_selections
FOR SELECT
USING (
  organization_id IN (SELECT public.get_user_organization_ids(auth.uid()))
);

CREATE POLICY "Users can insert their own selections"
ON public.user_marche_selections
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND organization_id IN (SELECT public.get_user_organization_ids(auth.uid()))
);

CREATE POLICY "Users can update their own selections"
ON public.user_marche_selections
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own selections"
ON public.user_marche_selections
FOR DELETE
USING (auth.uid() = user_id);
