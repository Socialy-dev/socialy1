CREATE TABLE public.user_marche_last_visit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  last_visit_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

ALTER TABLE public.user_marche_last_visit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own last visit"
ON public.user_marche_last_visit
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own last visit"
ON public.user_marche_last_visit
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own last visit"
ON public.user_marche_last_visit
FOR UPDATE
USING (auth.uid() = user_id);

CREATE INDEX idx_user_marche_last_visit_user_org ON public.user_marche_last_visit(user_id, organization_id);