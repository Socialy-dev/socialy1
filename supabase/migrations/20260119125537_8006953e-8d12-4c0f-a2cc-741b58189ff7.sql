CREATE TABLE public.user_marche_selections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  marche_public_id UUID NOT NULL REFERENCES public.organization_marche_public(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'selected',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id, marche_public_id)
);

ALTER TABLE public.user_marche_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own selections"
ON public.user_marche_selections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own selections"
ON public.user_marche_selections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own selections"
ON public.user_marche_selections
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own selections"
ON public.user_marche_selections
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_user_marche_selections_user_org ON public.user_marche_selections(user_id, organization_id);
CREATE INDEX idx_user_marche_selections_marche ON public.user_marche_selections(marche_public_id);