CREATE TABLE public.market_watch_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  link TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

ALTER TABLE public.market_watch_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view topics from their organization"
ON public.market_watch_topics
FOR SELECT
USING (
  public.is_super_admin(auth.uid()) OR
  public.user_belongs_to_org(organization_id, auth.uid())
);

CREATE POLICY "Org admins can insert topics"
ON public.market_watch_topics
FOR INSERT
WITH CHECK (
  public.is_super_admin(auth.uid()) OR
  public.user_belongs_to_org(organization_id, auth.uid())
);

CREATE POLICY "Org admins can update topics"
ON public.market_watch_topics
FOR UPDATE
USING (
  public.is_super_admin(auth.uid()) OR
  public.user_belongs_to_org(organization_id, auth.uid())
);

CREATE POLICY "Org admins can delete topics"
ON public.market_watch_topics
FOR DELETE
USING (
  public.is_super_admin(auth.uid()) OR
  public.user_belongs_to_org(organization_id, auth.uid())
);

CREATE OR REPLACE FUNCTION public.update_market_watch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_market_watch_topics_updated_at
BEFORE UPDATE ON public.market_watch_topics
FOR EACH ROW
EXECUTE FUNCTION public.update_market_watch_updated_at();