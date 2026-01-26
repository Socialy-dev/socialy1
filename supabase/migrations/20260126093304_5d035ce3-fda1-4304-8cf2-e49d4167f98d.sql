CREATE TABLE public.meta_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  token_expiry TIMESTAMP WITH TIME ZONE,
  ad_account_ids TEXT[],
  business_id TEXT,
  user_name TEXT,
  email TEXT,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

ALTER TABLE public.meta_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org meta connections"
ON public.meta_connections FOR SELECT
USING (
  public.is_super_admin(auth.uid()) 
  OR public.user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Users can insert their own meta connections"
ON public.meta_connections FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND public.user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Users can update their own meta connections"
ON public.meta_connections FOR UPDATE
USING (
  auth.uid() = user_id 
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Users can delete their own meta connections"
ON public.meta_connections FOR DELETE
USING (
  auth.uid() = user_id 
  OR public.is_super_admin(auth.uid())
);

CREATE TRIGGER update_meta_connections_updated_at
BEFORE UPDATE ON public.meta_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_meta_connections_org ON public.meta_connections(organization_id);
CREATE INDEX idx_meta_connections_active ON public.meta_connections(is_active) WHERE is_active = true;