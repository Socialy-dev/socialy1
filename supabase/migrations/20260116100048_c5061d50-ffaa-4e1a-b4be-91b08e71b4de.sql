CREATE TABLE public.client_agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website TEXT,
  email TEXT,
  linkedin TEXT,
  specialty TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

ALTER TABLE public.client_agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view client agencies in their organization"
ON public.client_agencies FOR SELECT
USING (
  is_super_admin(auth.uid()) OR 
  user_belongs_to_org(organization_id, auth.uid())
);

CREATE POLICY "Admins can insert client agencies"
ON public.client_agencies FOR INSERT
WITH CHECK (
  is_super_admin(auth.uid()) OR 
  user_belongs_to_org(organization_id, auth.uid())
);

CREATE POLICY "Admins can update client agencies"
ON public.client_agencies FOR UPDATE
USING (
  is_super_admin(auth.uid()) OR 
  user_belongs_to_org(organization_id, auth.uid())
);

CREATE POLICY "Admins can delete client agencies"
ON public.client_agencies FOR DELETE
USING (
  is_super_admin(auth.uid()) OR 
  user_belongs_to_org(organization_id, auth.uid())
);

CREATE TABLE public.client_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_agencies(id) ON DELETE CASCADE,
  client_name TEXT,
  link TEXT NOT NULL,
  title TEXT,
  source_name TEXT,
  source_icon TEXT,
  authors TEXT,
  thumbnail TEXT,
  thumbnail_small TEXT,
  article_date TEXT,
  article_iso_date TEXT,
  snippet TEXT,
  position INTEGER,
  hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, client_id, link)
);

ALTER TABLE public.client_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view client articles in their organization"
ON public.client_articles FOR SELECT
USING (
  is_super_admin(auth.uid()) OR 
  user_belongs_to_org(organization_id, auth.uid())
);

CREATE POLICY "Admins can insert client articles"
ON public.client_articles FOR INSERT
WITH CHECK (
  is_super_admin(auth.uid()) OR 
  user_belongs_to_org(organization_id, auth.uid())
);

CREATE POLICY "Admins can update client articles"
ON public.client_articles FOR UPDATE
USING (
  is_super_admin(auth.uid()) OR 
  user_belongs_to_org(organization_id, auth.uid())
);

CREATE POLICY "Admins can delete client articles"
ON public.client_articles FOR DELETE
USING (
  is_super_admin(auth.uid()) OR 
  user_belongs_to_org(organization_id, auth.uid())
);