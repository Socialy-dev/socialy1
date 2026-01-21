CREATE TABLE public.paid_ad_insights (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.paid_clients(id) ON DELETE CASCADE,
    ad_id TEXT NOT NULL,
    date DATE NOT NULL,
    platform TEXT NOT NULL DEFAULT 'meta',
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    spend NUMERIC(12,2) DEFAULT 0,
    ctr NUMERIC(8,4) DEFAULT 0,
    cpc NUMERIC(12,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    CONSTRAINT paid_ad_insights_unique_ad_date_platform UNIQUE (ad_id, date, platform)
);

ALTER TABLE public.paid_ad_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization ad insights"
ON public.paid_ad_insights
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.paid_clients pc
        JOIN public.organization_members om ON om.organization_id = pc.organization_id
        WHERE pc.id = paid_ad_insights.client_id
        AND om.user_id = auth.uid()
    )
);

CREATE POLICY "Super admins can view all ad insights"
ON public.paid_ad_insights
FOR SELECT
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can insert ad insights for their organization"
ON public.paid_ad_insights
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.paid_clients pc
        JOIN public.organization_members om ON om.organization_id = pc.organization_id
        WHERE pc.id = paid_ad_insights.client_id
        AND om.user_id = auth.uid()
    )
);

CREATE POLICY "Super admins can insert all ad insights"
ON public.paid_ad_insights
FOR INSERT
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can update ad insights for their organization"
ON public.paid_ad_insights
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.paid_clients pc
        JOIN public.organization_members om ON om.organization_id = pc.organization_id
        WHERE pc.id = paid_ad_insights.client_id
        AND om.user_id = auth.uid()
    )
);

CREATE POLICY "Super admins can update all ad insights"
ON public.paid_ad_insights
FOR UPDATE
USING (public.is_super_admin(auth.uid()));

CREATE INDEX idx_paid_ad_insights_ad_id ON public.paid_ad_insights(ad_id);
CREATE INDEX idx_paid_ad_insights_date ON public.paid_ad_insights(date);
CREATE INDEX idx_paid_ad_insights_client_id ON public.paid_ad_insights(client_id);
CREATE INDEX idx_paid_ad_insights_platform ON public.paid_ad_insights(platform);