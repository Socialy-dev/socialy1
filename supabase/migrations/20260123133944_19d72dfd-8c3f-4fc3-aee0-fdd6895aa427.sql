
CREATE TABLE public.gmail_connections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
    email TEXT NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT ARRAY['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/userinfo.email'],
    connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_synced_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organization_id, email)
);

ALTER TABLE public.gmail_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization gmail connections"
ON public.gmail_connections
FOR SELECT
USING (
    public.is_super_admin(auth.uid())
    OR public.user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Users can insert gmail connections for their organization"
ON public.gmail_connections
FOR INSERT
WITH CHECK (
    auth.uid() = user_id
    AND public.user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Users can update their own gmail connections"
ON public.gmail_connections
FOR UPDATE
USING (
    auth.uid() = user_id
    OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Users can delete their own gmail connections"
ON public.gmail_connections
FOR DELETE
USING (
    auth.uid() = user_id
    OR public.is_super_admin(auth.uid())
);

CREATE TRIGGER update_gmail_connections_updated_at
BEFORE UPDATE ON public.gmail_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_gmail_connections_org_id ON public.gmail_connections(organization_id);
CREATE INDEX idx_gmail_connections_user_id ON public.gmail_connections(user_id);
CREATE INDEX idx_gmail_connections_email ON public.gmail_connections(email);
