CREATE TABLE public.market_watch_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_org_period UNIQUE (organization_id, period_start, period_end)
);

ALTER TABLE public.market_watch_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view market watch documents"
  ON public.market_watch_documents
  FOR SELECT
  USING (
    is_super_admin(auth.uid()) 
    OR organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can insert market watch documents"
  ON public.market_watch_documents
  FOR INSERT
  WITH CHECK (
    is_super_admin(auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM organization_members 
      WHERE user_id = auth.uid() 
      AND organization_id = market_watch_documents.organization_id 
      AND role IN ('super_admin', 'org_admin')
    )
  );

CREATE POLICY "Org admins can update market watch documents"
  ON public.market_watch_documents
  FOR UPDATE
  USING (
    is_super_admin(auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM organization_members 
      WHERE user_id = auth.uid() 
      AND organization_id = market_watch_documents.organization_id 
      AND role IN ('super_admin', 'org_admin')
    )
  );

CREATE POLICY "Org admins can delete market watch documents"
  ON public.market_watch_documents
  FOR DELETE
  USING (
    is_super_admin(auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM organization_members 
      WHERE user_id = auth.uid() 
      AND organization_id = market_watch_documents.organization_id 
      AND role IN ('super_admin', 'org_admin')
    )
  );

CREATE TRIGGER update_market_watch_documents_updated_at
  BEFORE UPDATE ON public.market_watch_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();