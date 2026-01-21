
CREATE TABLE public.paid_clients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo_url TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organization_id, name)
);

CREATE TABLE public.paid_ad_accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.paid_clients(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('meta', 'google', 'linkedin', 'pinterest', 'tiktok')),
    account_id TEXT NOT NULL,
    account_name TEXT,
    currency TEXT DEFAULT 'EUR',
    timezone TEXT DEFAULT 'Europe/Paris',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organization_id, platform, account_id)
);

CREATE TABLE public.paid_campaigns (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    ad_account_id UUID NOT NULL REFERENCES public.paid_ad_accounts(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.paid_clients(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    campaign_id TEXT NOT NULL,
    campaign_name TEXT,
    objective TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'deleted', 'archived')),
    daily_budget DECIMAL(12,2),
    lifetime_budget DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organization_id, platform, campaign_id)
);

CREATE TABLE public.paid_insights (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    ad_account_id UUID NOT NULL REFERENCES public.paid_ad_accounts(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.paid_clients(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.paid_campaigns(id) ON DELETE SET NULL,
    platform TEXT NOT NULL,
    date DATE NOT NULL,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    spend DECIMAL(12,2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_value DECIMAL(12,2) DEFAULT 0,
    reach BIGINT DEFAULT 0,
    frequency DECIMAL(6,2) DEFAULT 0,
    cpm DECIMAL(10,4) DEFAULT 0,
    cpc DECIMAL(10,4) DEFAULT 0,
    ctr DECIMAL(8,4) DEFAULT 0,
    cpa DECIMAL(10,4) DEFAULT 0,
    roas DECIMAL(10,4) DEFAULT 0,
    video_views BIGINT DEFAULT 0,
    video_views_25 BIGINT DEFAULT 0,
    video_views_50 BIGINT DEFAULT 0,
    video_views_75 BIGINT DEFAULT 0,
    video_views_100 BIGINT DEFAULT 0,
    link_clicks BIGINT DEFAULT 0,
    landing_page_views BIGINT DEFAULT 0,
    add_to_cart INTEGER DEFAULT 0,
    purchases INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organization_id, ad_account_id, campaign_id, date)
);

CREATE TABLE public.paid_ad_creatives (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    ad_account_id UUID NOT NULL REFERENCES public.paid_ad_accounts(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.paid_clients(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.paid_campaigns(id) ON DELETE SET NULL,
    platform TEXT NOT NULL,
    creative_id TEXT NOT NULL,
    creative_name TEXT,
    format TEXT CHECK (format IN ('image', 'video', 'carousel', 'collection', 'stories', 'reels')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'deleted', 'archived')),
    thumbnail_url TEXT,
    media_url TEXT,
    headline TEXT,
    body_text TEXT,
    call_to_action TEXT,
    destination_url TEXT,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    spend DECIMAL(12,2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    ctr DECIMAL(8,4) DEFAULT 0,
    cpc DECIMAL(10,4) DEFAULT 0,
    cpm DECIMAL(10,4) DEFAULT 0,
    roas DECIMAL(10,4) DEFAULT 0,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organization_id, platform, creative_id)
);

CREATE TABLE public.paid_account_snapshots (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    ad_account_id UUID NOT NULL REFERENCES public.paid_ad_accounts(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.paid_clients(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_impressions BIGINT DEFAULT 0,
    total_clicks BIGINT DEFAULT 0,
    total_spend DECIMAL(12,2) DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    total_conversion_value DECIMAL(12,2) DEFAULT 0,
    avg_cpc DECIMAL(10,4) DEFAULT 0,
    avg_ctr DECIMAL(8,4) DEFAULT 0,
    avg_cpm DECIMAL(10,4) DEFAULT 0,
    avg_roas DECIMAL(10,4) DEFAULT 0,
    active_campaigns INTEGER DEFAULT 0,
    active_creatives INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organization_id, ad_account_id, period_start, period_end)
);

ALTER TABLE public.paid_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paid_ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paid_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paid_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paid_ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paid_account_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view paid_clients in their organization" ON public.paid_clients
    FOR SELECT USING (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can insert paid_clients in their organization" ON public.paid_clients
    FOR INSERT WITH CHECK (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can update paid_clients in their organization" ON public.paid_clients
    FOR UPDATE USING (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can delete paid_clients in their organization" ON public.paid_clients
    FOR DELETE USING (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can view paid_ad_accounts in their organization" ON public.paid_ad_accounts
    FOR SELECT USING (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can insert paid_ad_accounts in their organization" ON public.paid_ad_accounts
    FOR INSERT WITH CHECK (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can update paid_ad_accounts in their organization" ON public.paid_ad_accounts
    FOR UPDATE USING (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can delete paid_ad_accounts in their organization" ON public.paid_ad_accounts
    FOR DELETE USING (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can view paid_campaigns in their organization" ON public.paid_campaigns
    FOR SELECT USING (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can insert paid_campaigns in their organization" ON public.paid_campaigns
    FOR INSERT WITH CHECK (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can update paid_campaigns in their organization" ON public.paid_campaigns
    FOR UPDATE USING (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can delete paid_campaigns in their organization" ON public.paid_campaigns
    FOR DELETE USING (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can view paid_insights in their organization" ON public.paid_insights
    FOR SELECT USING (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can insert paid_insights in their organization" ON public.paid_insights
    FOR INSERT WITH CHECK (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can view paid_ad_creatives in their organization" ON public.paid_ad_creatives
    FOR SELECT USING (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can insert paid_ad_creatives in their organization" ON public.paid_ad_creatives
    FOR INSERT WITH CHECK (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can update paid_ad_creatives in their organization" ON public.paid_ad_creatives
    FOR UPDATE USING (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can delete paid_ad_creatives in their organization" ON public.paid_ad_creatives
    FOR DELETE USING (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can view paid_account_snapshots in their organization" ON public.paid_account_snapshots
    FOR SELECT USING (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE POLICY "Users can insert paid_account_snapshots in their organization" ON public.paid_account_snapshots
    FOR INSERT WITH CHECK (
        public.is_super_admin(auth.uid()) OR 
        public.user_belongs_to_org(auth.uid(), organization_id)
    );

CREATE INDEX idx_paid_clients_org ON public.paid_clients(organization_id);
CREATE INDEX idx_paid_ad_accounts_org ON public.paid_ad_accounts(organization_id);
CREATE INDEX idx_paid_ad_accounts_client ON public.paid_ad_accounts(client_id);
CREATE INDEX idx_paid_campaigns_org ON public.paid_campaigns(organization_id);
CREATE INDEX idx_paid_campaigns_account ON public.paid_campaigns(ad_account_id);
CREATE INDEX idx_paid_campaigns_client ON public.paid_campaigns(client_id);
CREATE INDEX idx_paid_insights_org ON public.paid_insights(organization_id);
CREATE INDEX idx_paid_insights_date ON public.paid_insights(date);
CREATE INDEX idx_paid_insights_account ON public.paid_insights(ad_account_id);
CREATE INDEX idx_paid_insights_client ON public.paid_insights(client_id);
CREATE INDEX idx_paid_creatives_org ON public.paid_ad_creatives(organization_id);
CREATE INDEX idx_paid_creatives_account ON public.paid_ad_creatives(ad_account_id);
CREATE INDEX idx_paid_creatives_client ON public.paid_ad_creatives(client_id);
CREATE INDEX idx_paid_snapshots_org ON public.paid_account_snapshots(organization_id);

CREATE TRIGGER update_paid_clients_updated_at
    BEFORE UPDATE ON public.paid_clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_paid_ad_accounts_updated_at
    BEFORE UPDATE ON public.paid_ad_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_paid_campaigns_updated_at
    BEFORE UPDATE ON public.paid_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_paid_ad_creatives_updated_at
    BEFORE UPDATE ON public.paid_ad_creatives
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
